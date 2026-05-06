import { useRef } from "react";
import { BookCard } from "./BookCard";

export function BookCarousel({ title, books, onBookClick, emptyMessage }) {
  const rowRef = useRef(null);

  function scroll(direction) {
    const row = rowRef.current;
    if (!row) {
      return;
    }

    row.scrollBy({
      left: direction * Math.max(240, row.clientWidth * 0.78),
      behavior: "smooth",
    });
  }

  return (
    <section className="section-block carousel-section">
      <div className="section-heading carousel-heading">
        <h2>{title}</h2>
        <div className="carousel-controls" aria-label={`Navegar em ${title}`}>
          <button className="icon-button carousel-arrow" onClick={() => scroll(-1)} type="button" aria-label="Rolar para esquerda">
            ‹
          </button>
          <button className="icon-button carousel-arrow" onClick={() => scroll(1)} type="button" aria-label="Rolar para direita">
            ›
          </button>
        </div>
      </div>

      {books.length ? (
        <div className="carousel-row carousel-row--snap" ref={rowRef}>
          {books.map((book) => (
            <BookCard key={book.id} book={book} compact onClick={onBookClick} />
          ))}
        </div>
      ) : (
        <div className="panel panel--soft">{emptyMessage || "Nenhum livro encontrado."}</div>
      )}
    </section>
  );
}
