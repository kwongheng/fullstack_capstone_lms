// src/pages/User/BookLoans/BorrowBooks.test.js
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Swal from "sweetalert2";
import BorrowBooks from "./BorrowBooks";
import { AuthContext } from "../../../context/AuthContext";

// Mock SweetAlert2
Swal.fire = jest.fn().mockResolvedValue({ isConfirmed: true });

// Mock hooks
jest.mock("../../../hooks/useBooks", () => ({
  useBooks: jest.fn(),
}));

jest.mock("../../../hooks/useBorrows", () => ({
  useBorrows: jest.fn(),
}));

// Mock borrowApi (static import in BorrowBooks.js)
jest.mock("../../../api/borrowApi", () => ({
  borrowApi: {
    borrowBook: jest.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <AuthContext.Provider value={{ user: { id: 123 } }}>{children}</AuthContext.Provider>
  </QueryClientProvider>
);

describe("BorrowBooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();

    require("../../../hooks/useBooks").useBooks.mockReturnValue({
      books: [],
      isLoading: false,
      isError: false,
      error: null,
    });

    require("../../../hooks/useBorrows").useBorrows.mockReturnValue({
      myActiveBorrows: [],
      isLoading: false,
    });

    require("../../../api/borrowApi").borrowApi.borrowBook.mockResolvedValue({});
  });

  const waitForLoadingToFinish = () =>
    waitFor(() => expect(screen.queryByText("Loading books and your loans...")).not.toBeInTheDocument());

  it("member can borrow 1 book where available copies >= 1", async () => {
    require("../../../hooks/useBooks").useBooks.mockReturnValue({
      books: [
        {
          id: 1,
          title: "Test Book",
          author: "Author",
          isbn: "123",
          publicationYear: 2020,
          category: "Fiction",
          availableCopies: 2,
          totalCopies: 5,
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<BorrowBooks />, { wrapper });
    await waitForLoadingToFinish();

    expect(screen.getByRole("heading", { name: "Test Book" })).toBeInTheDocument();
    const button = screen.getByRole("button", { name: /Add to Cart/i });
    expect(button).toBeEnabled();
    expect(button).toHaveTextContent("Add to Cart");
  });

  it("member borrows 1 book, button says 'In Cart'", async () => {
    require("../../../hooks/useBooks").useBooks.mockReturnValue({
      books: [
        {
          id: 1,
          title: "Test Book",
          author: "Author",
          isbn: "123",
          availableCopies: 1,
          totalCopies: 1,
        },
      ],
      isLoading: false,
    });

    render(<BorrowBooks />, { wrapper });
    await waitForLoadingToFinish();

    const addButton = screen.getByRole("button", { name: "Add to Cart" });
    await userEvent.click(addButton);

    expect(screen.getByRole("button", { name: "In Cart" })).toBeInTheDocument();
  });

  it("member cannot borrow a book where the button says 'Not Available'", async () => {
    require("../../../hooks/useBooks").useBooks.mockReturnValue({
      books: [
        {
          id: 1,
          title: "Unavailable Book",
          author: "Author",
          isbn: "123",
          availableCopies: 0,
          totalCopies: 5,
        },
      ],
      isLoading: false,
    });

    render(<BorrowBooks />, { wrapper });
    await waitForLoadingToFinish();

    const button = screen.getByRole("button", { name: "Not Available" });
    expect(button).toBeDisabled();
  });

  it("member borrows 1 book and checks out successfully from cart", async () => {
    require("../../../hooks/useBooks").useBooks.mockReturnValue({
      books: [
        {
          id: 1,
          title: "Book One",
          author: "A",
          isbn: "111",
          availableCopies: 1,
          totalCopies: 1,
        },
      ],
      isLoading: false,
    });

    render(<BorrowBooks />, { wrapper });
    await waitForLoadingToFinish();

    // Add to cart
    userEvent.click(await screen.findByRole("button", { name: "Add to Cart" }));

    // Confirm added
    await screen.findByRole("button", { name: "In Cart" });

    // Open cart
    userEvent.click(screen.getByRole("button", { name: "Book Cart 1" }));

    // Checkout
    userEvent.click(await screen.findByRole("button", { name: /Checkout/i }));

    // Wait for API call
    await waitFor(() => {
      expect(require("../../../api/borrowApi").borrowApi.borrowBook).toHaveBeenCalledWith(123, 1);
    });

    // Wait for cart to be cleared (proves onSuccess ran)
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Book Cart" })).toBeInTheDocument();
    });

    // Optional: extra safety to confirm badge is gone
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Book Cart 1" })).not.toBeInTheDocument();
    });

    // Now assert Swal
    expect(Swal.fire).toHaveBeenCalledWith("Success!", "You borrowed 1 book(s)!", "success");
  });

  it("member has 1 active book with fine = $3, can still borrow and checkout", async () => {
    // Mock available books
    require("../../../hooks/useBooks").useBooks.mockReturnValue({
      books: [
        {
          id: 5,
          title: "New Book",
          author: "Z",
          isbn: "555",
          availableCopies: 1,
          totalCopies: 1,
        },
      ],
      isLoading: false,
    });

    // Mock active borrows with fine = $3 (allowed)
    require("../../../hooks/useBorrows").useBorrows.mockReturnValue({
      myActiveBorrows: [
        {
          id: 10,
          book: { id: 1 },
          dueDate: "2025-11-01",
          fineAmount: 3.0, // < 10, allowed to continue borrowing
        },
      ],
      isLoading: false,
    });

    render(<BorrowBooks />, { wrapper });
    await waitFor(() => {
      expect(screen.queryByText("Loading books and your loans...")).not.toBeInTheDocument();
    });

    // Add book to cart
    await userEvent.click(screen.getByRole("button", { name: "Add to Cart" }));

    // Badge shows 1 item in cart
    const cartButton = await screen.findByRole("button", { name: "Book Cart 1" });
    await userEvent.click(cartButton);

    // Checkout
    const checkoutButton = await screen.findByRole("button", { name: /Checkout/i });
    await userEvent.click(checkoutButton);

    // Assert the API was called correctly
    await waitFor(() => {
      expect(require("../../../api/borrowApi").borrowApi.borrowBook).toHaveBeenCalledWith(123, 5);
    });

    // Cart should be cleared
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Book Cart" })).toBeInTheDocument();
    });

    // Badge gone
    expect(screen.queryByRole("button", { name: "Book Cart 1" })).not.toBeInTheDocument();

    // Swal success called
    expect(Swal.fire).toHaveBeenCalledWith("Success!", "You borrowed 1 book(s)!", "success");
  });

  it("member borrows 2 books and removes 1 successfully from cart", async () => {
    require("../../../hooks/useBooks").useBooks.mockReturnValue({
      books: [
        {
          id: 1,
          title: "Book A",
          author: "X",
          isbn: "111",
          availableCopies: 1,
          totalCopies: 1,
        },
        {
          id: 2,
          title: "Book B",
          author: "Y",
          isbn: "222",
          availableCopies: 1,
          totalCopies: 1,
        },
      ],
      isLoading: false,
    });

    render(<BorrowBooks />, { wrapper });
    await waitForLoadingToFinish();

    // Add both books
    const addButtons = screen.getAllByRole("button", { name: "Add to Cart" });
    await userEvent.click(addButtons[0]); // Book A
    await userEvent.click(addButtons[1]); // Book B

    // Open cart
    await userEvent.click(screen.getByRole("button", { name: "Book Cart 2" }));

    // Count "Book A" before removal — should be 2 (main card + cart)
    expect(screen.getAllByText("Book A")).toHaveLength(2);

    // Remove Book A (first in cart)
    const removeButtons = screen.getAllByRole("button", { name: "Remove" });
    await userEvent.click(removeButtons[0]);

    // Wait for removal
    await waitFor(() => {
      // After removal, only 1 "Book A" remains (the main card)
      expect(screen.getAllByText("Book A")).toHaveLength(1);
    });

    // "Book B" should still have 2 occurrences (main + cart)
    expect(screen.getAllByText("Book B")).toHaveLength(2);

    // Cart shows 1 item
    expect(screen.getByRole("button", { name: "Book Cart 1" })).toBeInTheDocument();
  });

  it("member has cumulative fine >= $10, cannot borrow any book", async () => {
    require("../../../hooks/useBooks").useBooks.mockReturnValue({
      books: [
        {
          id: 1,
          title: "Book 1",
          author: "A",
          isbn: "111",
          availableCopies: 1,
          totalCopies: 1,
        },
        {
          id: 2,
          title: "Book 2",
          author: "B",
          isbn: "222",
          availableCopies: 1,
          totalCopies: 1,
        },
      ],
      isLoading: false,
    });

    require("../../../hooks/useBorrows").useBorrows.mockReturnValue({
      myActiveBorrows: [
        { id: 10, book: { id: 3 }, fineAmount: 5.0 },
        { id: 11, book: { id: 4 }, fineAmount: 6.0 },
      ],
      isLoading: false,
    });

    render(<BorrowBooks />, { wrapper });
    await waitForLoadingToFinish();

    const buttons = screen.getAllByRole("button", { name: /Fine ≥ \$10/i });
    buttons.forEach((btn) => {
      expect(btn).toBeDisabled();
      expect(btn).toHaveTextContent("Fine ≥ $10 — Pay First");
    });
  });

  it("member cannot exceed max borrows (3 books) - buttons disabled when limit reached", async () => {
    require("../../../hooks/useBooks").useBooks.mockReturnValue({
      books: [
        { id: 1, title: "Book 1", author: "A", isbn: "111", availableCopies: 1, totalCopies: 1 },
        { id: 2, title: "Book 2", author: "B", isbn: "222", availableCopies: 1, totalCopies: 1 },
        { id: 3, title: "Book 3", author: "C", isbn: "333", availableCopies: 1, totalCopies: 1 },
        { id: 4, title: "Book 4", author: "D", isbn: "444", availableCopies: 1, totalCopies: 1 },
      ],
      isLoading: false,
    });

    require("../../../hooks/useBorrows").useBorrows.mockReturnValue({
      myActiveBorrows: [
        { id: 10, book: { id: 5 }, fineAmount: 0 },
        { id: 11, book: { id: 6 }, fineAmount: 0 },
        { id: 12, book: { id: 7 }, fineAmount: 0 },
      ],
      isLoading: false,
    });

    render(<BorrowBooks />, { wrapper });
    await waitForLoadingToFinish();

    const addButtons = screen.queryAllByRole("button", { name: "Add to Cart" });
    expect(addButtons).toHaveLength(0);

    const disabledButtons = screen.getAllByRole("button", { name: "Max Borrows Reached" });
    expect(disabledButtons).toHaveLength(4);
    disabledButtons.forEach((btn) => expect(btn).toBeDisabled());
  });

  it("member with 2 active + 1 in cart cannot add more books (limit reached)", async () => {
    require("../../../hooks/useBooks").useBooks.mockReturnValue({
      books: [
        { id: 1, title: "Book A", author: "X", isbn: "111", availableCopies: 1, totalCopies: 1 },
        { id: 2, title: "Book B", author: "Y", isbn: "222", availableCopies: 1, totalCopies: 1 },
        { id: 3, title: "Book C", author: "Z", isbn: "333", availableCopies: 1, totalCopies: 1 },
      ],
      isLoading: false,
    });

    require("../../../hooks/useBorrows").useBorrows.mockReturnValue({
      myActiveBorrows: [
        { id: 10, book: { id: 4 }, fineAmount: 0 },
        { id: 11, book: { id: 5 }, fineAmount: 0 },
      ],
      isLoading: false,
    });

    render(<BorrowBooks />, { wrapper });
    await waitForLoadingToFinish();

    const addButtons = screen.getAllByRole("button", { name: "Add to Cart" });
    expect(addButtons).toHaveLength(3);

    await userEvent.click(addButtons[0]);

    const remainingAddButtons = screen.queryAllByRole("button", { name: "Add to Cart" });
    expect(remainingAddButtons).toHaveLength(0);

    const maxLimitButtons = screen.getAllByRole("button", { name: "Max Borrows Reached" });
    expect(maxLimitButtons).toHaveLength(3);
    maxLimitButtons.forEach((btn) => expect(btn).toBeDisabled());
  });
});
