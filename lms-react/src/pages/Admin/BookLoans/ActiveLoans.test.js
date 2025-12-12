// src/pages/Admin/BookLoans/ActiveLoans.test.js

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ActiveLoans from "./ActiveLoans";
import { useBorrows } from "../../../hooks/useBorrows";
import Swal from "sweetalert2";

jest.mock("../../../hooks/useBorrows");

Swal.fire.mockResolvedValue({ isConfirmed: true });

const mockReturnBook = jest.fn();
const mockRenewBook = jest.fn();

const mockLoans = [
  {
    id: 1,
    member: { memberId: "MEM-0001", user: { id: 101, fullName: "John Doe" } },
    book: { isbn: "9783161484100", title: "The Great Gatsby" },
    borrowDate: "2025-12-08",
    dueDate: "2025-12-30",
    fineAmount: 0,
    timesRenew: 0,
  },
  {
    id: 2,
    member: { memberId: "MEM-0001", user: { id: 101, fullName: "John Doe" } },
    book: { isbn: "9780140283334", title: "1984" },
    borrowDate: "2025-12-10",
    dueDate: "2025-11-20",
    fineAmount: 5.5,
    timesRenew: 1,
  },
  {
    id: 3,
    member: { memberId: "MEM-0002", user: { id: 102, fullName: "Jane Smith" } },
    book: { isbn: "9780452284234", title: "Animal Farm" },
    borrowDate: "2025-12-05",
    dueDate: "2026-01-19",
    fineAmount: 0,
    timesRenew: 0,
  },
];

const renderActiveLoans = (loans = mockLoans, isLoading = false) => {
  useBorrows.mockReturnValue({
    activeBorrows: loans,
    isLoadingActive: isLoading,
    returnBook: mockReturnBook,
    renewBook: mockRenewBook,
  });

  return render(<ActiveLoans />);
};

describe("ActiveLoans (Admin View)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("shows loading state", () => {
    renderActiveLoans([], true);
    expect(screen.getByText("Loading active loans...")).toBeInTheDocument();
  });

  test("renders active loans grouped by member", () => {
    renderActiveLoans();

    expect(screen.getByText("MEM-0001 - John Doe")).toBeInTheDocument();
    expect(screen.getByText("MEM-0002 - Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("The Great Gatsby")).toBeInTheDocument();
    expect(screen.getByText("1984")).toBeInTheDocument();
    expect(screen.getByText("Animal Farm")).toBeInTheDocument();

    // Fixed: use queryAllByText + length check — no custom function needed
    const totalTextElements = screen.queryAllByText(/total active books borrowed/i);
    expect(totalTextElements).toHaveLength(1);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  test("shows fine badge only when member has fine", () => {
    renderActiveLoans();

    expect(screen.getByText("Fine: $5.50")).toBeInTheDocument();
    expect(screen.queryByText("Fine: $0.00")).not.toBeInTheDocument();
  });

  test("calls returnBook with confirmation", async () => {
    renderActiveLoans();

    Swal.fire.mockResolvedValueOnce({ isConfirmed: true });

    const returnButtons = screen.getAllByTitle("Return Book");
    userEvent.click(returnButtons[0]);

    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Return Book?",
        text: "This will return the book for the member.",
        showCancelButton: true,
      })
    );

    await waitFor(() => expect(mockReturnBook).toHaveBeenCalledWith(1));
  });

  test("calls renewBook directly", async () => {
    renderActiveLoans();

    const renewButtons = screen.getAllByTitle("Renew (+14 days)");
    userEvent.click(renewButtons[0]);
    await waitFor(() => expect(mockRenewBook).toHaveBeenCalledWith(1));
  });
});
