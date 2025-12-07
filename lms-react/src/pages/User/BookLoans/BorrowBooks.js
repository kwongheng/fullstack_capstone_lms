// src/pages/User/BookLoans/BorrowBooks.js
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { borrowApi } from "../../../api/borrowApi";
import { bookApi } from "../../../api/bookApi";
import Swal from "sweetalert2";
import { ShoppingCart, AlertCircle } from "lucide-react";

const MAX_BORROWS = 3;
const FINE_THRESHOLD = 10.00; // Block borrowing if total fine ≥ $10

export default function BorrowBooks() {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const [searchField, setSearchField] = useState("title");
  const [searchValue, setSearchValue] = useState("");
  const [queryValue, setQueryValue] = useState("");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  // Get active borrows (with fines)
  const { data: activeBorrows = [], isLoading: loadingActive } = useQuery({
    queryKey: ["borrows", "user", user?.id, "active"],
    queryFn: () => borrowApi.getMyActiveBorrows(user.id).then((res) => res.data),
    enabled: !!user?.id,
    staleTime: 1000 * 30,
  });

  // Get all books
  const { data: books = [], isLoading: loadingBooks } = useQuery({
    queryKey: ["books"],
    queryFn: () => bookApi.getAll().then((res) => res.data),
    staleTime: 1000 * 60 * 5,
  });

  // Calculate total fine from active loans
  const totalFine = activeBorrows.reduce((sum, b) => sum + (b.fineAmount || 0), 0);
  const hasHighFine = totalFine >= FINE_THRESHOLD;

  const currentLoans = activeBorrows.length;
  const remainingSlots = MAX_BORROWS - currentLoans;
  const canBorrowMore = currentLoans + cart.length < MAX_BORROWS && !hasHighFine;

  const isAlreadyBorrowed = (bookId) =>
    activeBorrows.some((b) => b.book.id === bookId);
  const isInCart = (bookId) => cart.some((item) => item.bookId === bookId);

  const addToCart = (book) => {
    if (hasHighFine) {
      Swal.fire("Blocked", `You have $${totalFine.toFixed(2)} in fines. Pay fines below $10 to borrow again.`, "warning");
      return;
    }
    if (!canBorrowMore) {
      Swal.fire("Limit Reached", `You can only borrow up to ${MAX_BORROWS} books at a time.`, "warning");
      return;
    }
    if (isInCart(book.id)) return;

    setCart((prev) => [
      ...prev,
      { bookId: book.id, title: book.title, author: book.author, isbn: book.isbn },
    ]);
  };

  const removeFromCart = (bookId) => {
    setCart((prev) => prev.filter((item) => item.bookId !== bookId));
  };

  const checkoutMutation = useMutation({
    mutationFn: () =>
      Promise.all(cart.map((item) => borrowApi.borrowBook(user.id, item.bookId))),
    onSuccess: () => {
      queryClient.invalidateQueries(["borrows", "user", user.id]);
      queryClient.invalidateQueries(["books"]);
      setCart([]);
      setShowCart(false);
      Swal.fire("Success!", `You have successfully borrowed ${cart.length} book(s)!`, "success");
    },
    onError: (err) => {
      const msg = err.response?.data || "Failed to borrow books";
      Swal.fire("Error", msg, "error");
    },
  });

  const filteredBooks = useMemo(() => {
    if (!queryValue.trim()) return books;

    const value = queryValue.trim();
    const lowerValue = value.toLowerCase();

    return books.filter((book) => {
      switch (searchField) {
        case "isbn":
          return book.isbn.toLowerCase().includes(lowerValue);
        case "title":
          return book.title.toLowerCase().includes(lowerValue);
        case "author":
          return book.author.toLowerCase().includes(lowerValue);
        case "category":
          return book.category?.toLowerCase().includes(lowerValue);
        case "publisher":
          return book.publisher?.toLowerCase().includes(lowerValue);
        case "year":
          // Support: 2023 → exact year
          //         2015-2020 → range
          //         2010- → from 2010 onwards
          if (value.includes("-")) {
            const [startStr, endStr] = value.split("-").map(s => s.trim());
            const start = startStr ? parseInt(startStr, 10) : null;
            const end = endStr && endStr !== "" ? parseInt(endStr, 10) : null;
            const year = book.publicationYear;

            if (!start && !end) return true;
            if (start && !end) return year >= start; // e.g. "2010-"
            if (!start && end) return year <= end;   // unlikely, but safe
            if (start && end) return year >= start && year <= end;
          } else {
            const searchYear = parseInt(value, 10);
            if (!isNaN(searchYear)) {
              return book.publicationYear === searchYear;
            }
          }
          return false;
        default:
          return true;
      }
    });
  }, [books, queryValue, searchField]);

  const handleQuery = () => {
    setQueryValue(searchValue);
  };

  const handleClear = () => {
    setSearchValue("");
    setQueryValue("");
    setSearchField("title");
  };

  if (loadingBooks || loadingActive) {
    return <div className="p-4 text-center">Loading books and your loans...</div>;
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Borrow Books</h2>
        <button className="btn btn-primary position-relative" onClick={() => setShowCart(true)}>
          <ShoppingCart size={20} className="me-2" />
          Book Cart
          {cart.length > 0 && (
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              {cart.length}
            </span>
          )}
        </button>
      </div>

      {/* HIGH FINE WARNING — BLOCKS BORROWING */}
      {hasHighFine && (
        <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
          <AlertCircle size={24} className="me-3 flex-shrink-0" />
          <div>
            <strong>Borrowing Blocked:</strong> You have <strong>${totalFine.toFixed(2)}</strong> in outstanding fines.
            Please pay your fines in <strong>My Current Loans</strong> before borrowing more books.
          </div>
        </div>
      )}

      {/* Loan Status Card */}
      <div className="card mb-4 shadow-sm bg-info bg-opacity-10 border-info">
        <div className="card-body">
          <h5 className="card-title text-info mb-2">
            You currently have <strong>{currentLoans}</strong> book(s) on loan
          </h5>
          <p className="card-text mb-0">
            You can borrow <strong>{hasHighFine ? 0 : remainingSlots}</strong> more (Max {MAX_BORROWS})
            {totalFine > 0 && (
              <span className={hasHighFine ? "text-danger" : "text-warning"}>
                {" "}• Total Fine: <strong>${totalFine.toFixed(2)}</strong>
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Search Panel */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label fw-bold">Search By</label>
              <select className="form-select" value={searchField} onChange={(e) => setSearchField(e.target.value)}>
                <option value="title">Title</option>
                <option value="author">Author</option>
                <option value="isbn">ISBN</option>
                <option value="category">Category</option>
                <option value="publisher">Publisher</option>
                <option value="year">Publication Year</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">
                {searchField === "year" ? "Year (e.g. 2023 or 2015-2020)" : "Search Term"}
              </label>
              <input
                type="text"
                className="form-control"
                placeholder={
                  searchField === "year"
                    ? "e.g. 2023 or 2015-2020"
                    : `Enter ${searchField}...`
                }
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              {searchField === "year" && (
                <small className="text-muted d-block mt-1">
                  Use <code>2015-2020</code> for range • <code>2023</code> for exact
                </small>
              )}
            </div>
            <div className="col-md-3">
              <button className="btn btn-primary me-2" onClick={handleQuery}>
                Query
              </button>
              <button className="btn btn-outline-secondary" onClick={handleClear}>
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <h4>{queryValue ? "No books found" : "No books available"}</h4>
        </div>
      ) : (
        <div className="row g-4">
          {filteredBooks.map((book) => {
            const disabled =
              book.availableCopies === 0 ||
              isAlreadyBorrowed(book.id) ||
              isInCart(book.id) ||
              !canBorrowMore;

            const buttonText = hasHighFine
              ? "Fine ≥ $10 — Pay First"
              : isAlreadyBorrowed(book.id)
              ? "Already Borrowed"
              : isInCart(book.id)
              ? "In Cart"
              : book.availableCopies === 0
              ? "Not Available"
              : "Add to Cart";

            const buttonClass = disabled
              ? "btn btn-secondary btn-sm"
              : isInCart(book.id)
              ? "btn btn-success btn-sm"
              : "btn btn-primary btn-sm";

            return (
              <div key={book.id} className="col-md-6 col-lg-4">
                <div className="card h-100 shadow-sm hover-shadow">
                  <div className="card-body">
                    <h5 className="card-title text-primary">{book.title}</h5>
                    <p className="card-text small">
                      <strong>ISBN:</strong> {book.isbn}<br />
                      <strong>Author:</strong> {book.author}<br />
                      <strong>Publisher:</strong> {book.publisher || "—"}<br />
                      <strong>Year:</strong> {book.publicationYear}<br />
                      <strong>Category:</strong> {book.category || "—"}<br />
                      <strong>Copies:</strong>{" "}
                      <span className={book.availableCopies > 0 ? "text-success" : "text-danger"}>
                        {book.availableCopies}
                      </span>{" "} / {book.totalCopies}
                    </p>
                  </div>
                  <div className="card-footer bg-white">
                    <button
                      className={`w-100 ${buttonClass}`}
                      onClick={() => addToCart(book)}
                      disabled={disabled}
                    >
                      {buttonText}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <ShoppingCart size={20} className="me-2" />
                  Your Book Cart ({cart.length} item{cart.length !== 1 ? "s" : ""})
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowCart(false)} />
              </div>
              <div className="modal-body">
                {cart.length === 0 ? (
                  <p className="text-center text-muted py-4">Your cart is empty</p>
                ) : (
                  <div className="list-group">
                    {cart.map((item) => (
                      <div key={item.bookId} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{item.title}</strong><br />
                          <small className="text-muted">by {item.author} • ISBN: {item.isbn}</small>
                        </div>
                        <button className="btn btn-outline-danger btn-sm" onClick={() => removeFromCart(item.bookId)}>
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {cart.length > 0 && (
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowCart(false)}>
                    Close
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={() => checkoutMutation.mutate()}
                    disabled={checkoutMutation.isPending || hasHighFine}
                  >
                    {checkoutMutation.isPending ? "Processing..." : `Checkout (${cart.length})`}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}