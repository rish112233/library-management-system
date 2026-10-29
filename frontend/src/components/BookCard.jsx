import { Link } from "react-router-dom";

function BookCard({ book, onIssue, onRead, isIssued = false, issuing = false }) {
  const isAvailable = (book.quantity || 0) > 0;
  const coverColor = book.coverColor || "#6366f1";

  return (
    <div className="book-card-item">
      {/* Book Cover Visual with dynamic accent border */}
      <div className="book-cover-wrapper" style={{ "--cover-tint": coverColor }}>
        <div className="book-cover-spine" />
        <div className="book-cover-art" style={{ backgroundColor: coverColor }}>
          <div className="book-cover-pattern" />
          <div className="book-cover-content">
            <span className="book-cover-genre">{book.category}</span>
            <h4 className="book-cover-title">{book.title}</h4>
            <span className="book-cover-author">{book.author}</span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="book-badge-container">
          {isAvailable ? (
            <span className="stock-badge in-stock">
              <span className="dot" /> {book.quantity} Available
            </span>
          ) : (
            <span className="stock-badge out-of-stock">
              <span className="dot" /> Checked Out
            </span>
          )}
          {book.publishedYear && (
            <span className="year-pill">{book.publishedYear}</span>
          )}
        </div>
      </div>

      {/* Book Details */}
      <div className="book-card-body">
        <div className="book-meta-top">
          <span className="category-tag">{book.category}</span>
          {book.issueCount > 0 && (
            <span className="popularity-tag" title="Total times circulated">
              🔥 {book.issueCount} loans
            </span>
          )}
        </div>

        <h3 className="book-title">
          <Link to={`/books/${book._id}`} title={book.title}>
            {book.title}
          </Link>
        </h3>
        <p className="book-author">by {book.author}</p>

        {book.description && (
          <p className="book-description-snippet">
            {book.description.length > 80
              ? `${book.description.substring(0, 80)}...`
              : book.description}
          </p>
        )}

        {/* Action Buttons */}
        <div className="book-card-actions">
          <Link to={`/books/${book._id}`} className="btn-action-outline">
            Details
          </Link>

          {onRead && (
            <button
              onClick={() => onRead(book)}
              className="btn-action-read"
              title="Read digital preview"
            >
              📖 Read
            </button>
          )}

          {onIssue && (
            <button
              onClick={() => onIssue(book._id)}
              disabled={!isAvailable || isIssued || issuing}
              className={`btn-action-borrow ${isIssued ? "issued" : ""}`}
            >
              {issuing
                ? "Issuing..."
                : isIssued
                ? "✓ Issued"
                : isAvailable
                ? "Borrow"
                : "Unavailable"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookCard;
