// src/pages/Admin/Books/ManageBooks.js
import { useState, useMemo } from "react";
import { useBooks } from "../../../hooks/useBooks";
import Swal from "sweetalert2";

export default function ManageBooks() {
  const { books, isLoading, createBook, updateBook, deleteBook } = useBooks();

  const [searchField, setSearchField] = useState("title");
  const [searchValue, setSearchValue] = useState("");
  const [queryValue, setQueryValue] = useState("");

  const [modal, setModal] = useState({ open: false, mode: "", book: null });
  const openModal = (mode, book = null) => setModal({ open: true, mode, book });
  const closeModal = () => setModal({ open: false, mode: "", book: null });

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
          if (value.includes("-")) {
            const [startStr, endStr] = value.split("-").map(s => s.trim());
            const start = startStr ? parseInt(startStr, 10) : null;
            const end = endStr && endStr !== "" ? parseInt(endStr, 10) : null;
            const year = book.publicationYear;

            if (!start && !end) return true;
            if (start && !end) return year >= start;
            if (!start && end) return year <= end;
            if (start && end) return year >= start && year <= end;
          } else {
            const searchYear = parseInt(value, 10);
            if (!isNaN(searchYear)) return book.publicationYear === searchYear;
          }
          return false;
        default:
          return true;
      }
    });
  }, [books, queryValue, searchField]);

  const handleQuery = () => setQueryValue(searchValue);
  const handleClear = () => {
    setSearchValue("");
    setQueryValue("");
    setSearchField("title");
  };

  if (isLoading) return <div className="p-4">Loading books...</div>;

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Manage Books</h2>
        <button className="btn btn-success" onClick={() => openModal("add")}>
          + Add Book
        </button>
      </div>

      {/* Search UI unchanged */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label fw-bold">Search By</label>
              <select className="form-select" value={searchField} onChange={(e) => setSearchField(e.target.value)}>
                <option value="title">Title</option>
                <option value="isbn">ISBN</option>
                <option value="author">Author</option>
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
                placeholder={searchField === "year" ? "e.g. 2023 or 2015-2020" : `Enter ${searchField}...`}
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
              <button className="btn btn-primary me-2" onClick={handleQuery}>Query</button>
              <button className="btn btn-outline-secondary" onClick={handleClear}>Clear</button>
            </div>
          </div>
        </div>
      </div>

      {filteredBooks.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <h4>{queryValue ? "Nothing found" : "No books yet"}</h4>
        </div>
      ) : (
        <div className="row g-4">
          {filteredBooks.map((book) => (
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
                    <span className="text-success">{book.availableCopies}</span> / {book.totalCopies}
                  </p>
                </div>
                <div className="card-footer bg-white d-flex gap-2">
                  <button className="btn btn-warning btn-sm flex-fill" onClick={() => openModal("edit", book)}>
                    Edit
                  </button>
                  <button className="btn btn-danger btn-sm flex-fill" onClick={() => openModal("delete", book)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {modal.open && (modal.mode === "add" || modal.mode === "edit") && (
        <BookForm
          book={modal.book}
          isAdd={modal.mode === "add"}
          onSubmit={(data) => {
            if (modal.mode === "add") createBook(data);
            else updateBook({ id: modal.book.id, data });
            closeModal();
          }}
          onCancel={closeModal}
        />
      )}

      {modal.mode === "delete" && modal.book && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-danger">Confirm Delete</h5>
                <button type="button" className="btn-close" onClick={closeModal} />
              </div>
              <div className="modal-body">
                <p>Permanently delete this book?</p>
                <strong>{modal.book.title}</strong><br />
                <small>ISBN: {modal.book.isbn}</small>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button className="btn btn-danger" onClick={() => { deleteBook(modal.book.id); closeModal(); }}>
                  Delete Book
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Updated BookForm with full ISBN validation + clean payload
// ──────────────────────────────────────────────────────────────────────
function BookForm({ book, isAdd, onSubmit, onCancel }) {
  const currentYear = new Date().getFullYear();
  const borrowedCopies = isAdd ? 0 : (book.totalCopies - book.availableCopies);

  const [form, setForm] = useState({
    isbn: book?.isbn || "",
    title: book?.title || "",
    author: book?.author || "",
    publisher: book?.publisher || "",
    publicationYear: book?.publicationYear || "",
    category: book?.category || "",
    totalCopies: book?.totalCopies || 1,
  });

  const [errors, setErrors] = useState({});

  // ISBN validation (accepts hyphens/spaces, but stores only digits)
  const validateIsbn = (value) => {
    if (!value.trim()) return "ISBN is required";
    const cleaned = value.replace(/[- ]/g, "");
    if (cleaned.length === 10 && /^[0-9]{9}[0-9X]$/i.test(cleaned)) return "";
    if (cleaned.length === 13 && /^[0-9]{13}$/.test(cleaned)) return "";
    return "ISBN must be 10 or 13 digits (hyphens allowed)";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "isbn") {
      setForm(prev => ({ ...prev, isbn: value }));
      setErrors(prev => ({ ...prev, isbn: validateIsbn(value) }));
    }
    else if (name === "totalCopies") {
      const num = parseInt(value, 10);
      if (isNaN(num) || num < 0) return;
      if (!isAdd && num < borrowedCopies) {
        Swal.fire({
          icon: "warning",
          title: "Cannot Reduce Total Copies",
          text: `There are ${borrowedCopies} book(s) currently borrowed. Minimum is ${borrowedCopies}.`,
        });
        return;
      }
      setForm(prev => ({ ...prev, totalCopies: num }));
    }
    else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    // Required fields
    if (!form.isbn || !form.title || !form.author || !form.publicationYear || !form.category) {
      Swal.fire("Error", "Please fill all required fields", "error");
      return;
    }

    // Year range
    const year = parseInt(form.publicationYear, 10);
    if (year < 1901 || year > currentYear) {
      Swal.fire("Error", `Year must be between 1901 and ${currentYear}`, "error");
      return;
    }

    // ISBN format
    const isbnError = validateIsbn(form.isbn);
    if (isbnError) {
      setErrors(prev => ({ ...prev, isbn: isbnError }));
      Swal.fire("Invalid ISBN", isbnError, "error");
      return;
    }

    const newTotal = parseInt(form.totalCopies, 10);

    // Build clean payload – never send availableCopies on add
    const payload = {
      isbn: form.isbn.replace(/[- ]/g, ""),   // send only digits
      title: form.title.trim(),
      author: form.author.trim(),
      publisher: form.publisher.trim() || null,
      publicationYear: year,
      category: form.category.trim(),
      totalCopies: newTotal,
    };

    if (!isAdd) {
      payload.availableCopies = newTotal - borrowedCopies;
    }

    onSubmit(payload);
  };

  return (
    <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{isAdd ? "Add New Book" : "Edit Book"}</h5>
            <button type="button" className="btn-close" onClick={onCancel} aria-label="Close" />
          </div>

          <div className="modal-body">
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label">ISBN *</label>
                <input
                  name="isbn"
                  className={`form-control ${errors.isbn ? "is-invalid" : ""}`}
                  value={form.isbn}
                  onChange={handleChange}
                  disabled={!isAdd}
                  placeholder="e.g. 978-3-16-148410-0 or 0131103628"
                />
                {errors.isbn ? (
                  <div className="invalid-feedback">{errors.isbn}</div>
                ) : (
                  <small className="text-muted">ISBN-10 or ISBN-13 • hyphens allowed</small>
                )}
              </div>

              <div className="col-12">
                <label className="form-label">Title *</label>
                <input name="title" className="form-control" value={form.title} onChange={handleChange} />
              </div>

              <div className="col-12">
                <label className="form-label">Author *</label>
                <input name="author" className="form-control" value={form.author} onChange={handleChange} />
              </div>

              <div className="col-md-6">
                <label className="form-label">Publisher</label>
                <input name="publisher" className="form-control" value={form.publisher} onChange={handleChange} />
              </div>

              <div className="col-md-6">
                <label className="form-label">Publication Year *</label>
                <input
                  type="number"
                  name="publicationYear"
                  className="form-control"
                  value={form.publicationYear}
                  onChange={handleChange}
                  min="1901"
                  max={currentYear}
                />
              </div>

              <div className="col-12">
                <label className="form-label">Category *</label>
                <input name="category" className="form-control" value={form.category} onChange={handleChange} />
              </div>

              <div className="col-md-6">
                <label className="form-label">Total Copies *</label>
                <input
                  type="number"
                  name="totalCopies"
                  className="form-control"
                  value={form.totalCopies}
                  onChange={handleChange}
                  min={borrowedCopies}
                  step="1"
                />
                {!isAdd && borrowedCopies > 0 && (
                  <small className="text-warning d-block mt-1">
                    Minimum: {borrowedCopies} ({borrowedCopies} currently borrowed)
                  </small>
                )}
              </div>

              <div className="col-md-6">
                <label className="form-label">Available Copies (After Save)</label>
                <input
                  type="text"
                  className="form-control"
                  value={isAdd ? form.totalCopies : (form.totalCopies - borrowedCopies)}
                  readOnly
                  style={{ backgroundColor: "#e9ecef" }}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
            <button type="button" className="btn btn-primary" onClick={handleSubmit}>
              {isAdd ? "Add Book" : "Update Book"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}