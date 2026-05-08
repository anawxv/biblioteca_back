import { BookCover } from "./BookCover";
import { getBookGenres } from "../utils/search";

export function BookCard({ book, onClick, compact = false }) {
  const genres = getBookGenres(book);

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
        <div className="genre-chip-row">
          {genres.map((genre) => (
            <small className="genre-chip" key={genre}>{genre}</small>
          ))}
        </div>
      </div>
    </button>
  );
}
