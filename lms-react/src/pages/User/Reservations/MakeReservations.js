// src/pages/User/Reservations/MakeReservations.js
import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../context/AuthContext";
import { reservationApi } from "../../../api/reservationApi";
import { bookApi } from "../../../api/bookApi";
import Swal from "sweetalert2";
import { ShoppingCart } from "lucide-react";

const MAX_RESERVATIONS = 3;

export default function MakeReservations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Search states — now matches BorrowBooks & ManageBooks exactly
  const [searchField, setSearchField] = useState("title");
  const [searchValue, setSearchValue] = useState("");
  const [queryValue, setQueryValue] = useState(""); // triggers actual filter

  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  // User's active reservations
  const { data: activeReservations = [] } = useQuery({
    queryKey: ["reservations", "user", user?.id, "active"],
    queryFn: () =>
      reservationApi.getActiveReservations().then(res =>
        res.data.filter(r => r.member.user.id === user.id)
      ),
    enabled: !!user?.id,
    staleTime: 1000 * 30,
  });

  // All books
  const { data: books = [], isLoading } = useQuery({
    queryKey: ["books"],
    queryFn: () => bookApi.getAll().then(res => res.data),
    staleTime: 1000 * 60 * 5,
  });

  const currentCount = activeReservations.length;
  const canReserveMore = currentCount + cart.length < MAX_RESERVATIONS;

  const reservedBookIds = new Set(activeReservations.map(r => r.book.id));

  // Only books with 0 copies available AND not already reserved by this user
  const reservableBooks = books.filter(
    book => book.availableCopies === 0 && !reservedBookIds.has(book.id)
  );

  // Filtering — now based on queryValue (clicked Query), not live typing
  const filteredBooks = useMemo(() => {
    if (!queryValue.trim()) return reservableBooks;

    const value = queryValue.trim();
    const lowerValue = value.toLowerCase();

    return reservableBooks.filter(book => {
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
          if (value.includes("-")) {
            const [startStr, endStr] = value.split("-").map(s => s.trim());
            const start = startStr ? parseInt(startStr, 10) : null;
            const end = endStr && endStr !== "" ? parseInt(endStr, 10) : null;
            const year = book.publicationYear;

            if (start && !end) return year >= start;        // e.g. "2010-"
            if (!start && end) return year <= end;          // e.g. "-2020"
            if (start && end) return year >= start && year <= end;
            return true;
          } else {
            const searchYear = parseInt(value, 10);
            return !isNaN(searchYear) && book.publicationYear === searchYear;
          }
        default:
          return true;
      }
    });
  }, [reservableBooks, queryValue, searchField]);

  const handleQuery = () => setQueryValue(searchValue);
  const handleClear = () => {
    setSearchValue("");
    setQueryValue("");
    setSearchField("title");
  };

  const addToCart = (book) => {
    if (!canReserveMore) {
      Swal.fire("Limit Reached", `Maximum ${MAX_RESERVATIONS} active reservations allowed.`, "warning");
      return;
    }
    if (cart.some(item => item.bookId === book.id)) return;

    setCart(prev => [...prev, {
      bookId: book.id,
      title: book.title,
      author: book.author,
      isbn: book.isbn
    }]);
  };

  const removeFromCart = (bookId) => {
    setCart(prev => prev.filter(item => item.bookId !== bookId));
  };

  const reserveMutation = useMutation({
    mutationFn: () =>
      Promise.all(cart.map(item => reservationApi.reserveBook(user.id, item.bookId))),
    onSuccess: () => {
      queryClient.invalidateQueries(["reservations", "user", user.id]);
      setCart([]);
      setShowCart(false);
      Swal.fire("Success!", `Successfully reserved ${cart.length} book(s)!`, "success");
    },
    onError: (err) => {
      const msg = err.response?.data || "Failed to reserve books";
      Swal.fire("Error", msg, "error");
    },
  });

  if (isLoading) {
    return <div className="p-4 text-center">Loading books and reservations...</div>;
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Make Reservations</h2>
        <button
          className="btn btn-primary position-relative"
          onClick={() => setShowCart(true)}
        >
          <ShoppingCart size={20} className="me-2" />
          Reservation Cart
          {cart.length > 0 && (
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              {cart.length}
            </span>
          )}
        </button>
      </div>

      {/* Reservation Status Card */}
      <div className="card mb-4 shadow-sm bg-info bg-opacity-10 border-info">
        <div className="card-body">
          <h5 className="card-title text-info mb-2">
            You have <strong>{currentCount}</strong> active reservation(s)
          </h5>
          <p className="card-text mb-0">
            You can reserve <strong>{MAX_RESERVATIONS - currentCount}</strong> more (Maximum {MAX_RESERVATIONS})
          </p>
        </div>
      </div>

      {/* Search Panel — now matches BorrowBooks & ManageBooks */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label fw-bold">Search By</label>
              <select
                className="form-select"
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
              >
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
          <h4>
            {queryValue
              ? "No books found matching your search"
              : "No books available for reservation"}
          </h4>
          <p>Only books with 0 available copies can be reserved.</p>
        </div>
      ) : (
        <div className="row g-4">
          {filteredBooks.map((book) => {
            const inCart = cart.some(item => item.bookId === book.id);
            const disabled = !canReserveMore;

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
                      <strong>Copies:</strong> <span className="text-danger">0</span> / {book.totalCopies}
                    </p>
                  </div>
                  <div className="card-footer bg-white">
                    <button
                      className={`w-100 ${disabled ? "btn btn-secondary" : inCart ? "btn btn-success" : "btn btn-primary"} btn-sm`}
                      onClick={() => addToCart(book)}
                      disabled={disabled}
                    >
                      {disabled ? "Max Reached" : inCart ? "In Cart" : "Reserve"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cart Modal — unchanged */}
      {showCart && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <ShoppingCart size={20} className="me-2" />
                  Your Reservation Cart ({cart.length} item{cart.length !== 1 ? "s" : ""})
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
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => removeFromCart(item.bookId)}
                        >
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
                    onClick={() => reserveMutation.mutate()}
                    disabled={reserveMutation.isPending}
                  >
                    {reserveMutation.isPending ? "Processing..." : `Reserve (${cart.length})`}
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