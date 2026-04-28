import { BookCover } from "./BookCover";

export function BookCard({ book, onClick, compact = false }) {
  return (
    <button
      className={`book-card${compact ? " book-card--compact" : ""}`}
      onClick={() => onClick?.(book)}
      type="button"
    >
      <BookCover book={book} />
      <div className="book-card__content">
        <strong>{book.title}</strong>
        <span>{book.author}</span>
        <small>{book.category}</small>
      </div>
    </button>
  );
}
