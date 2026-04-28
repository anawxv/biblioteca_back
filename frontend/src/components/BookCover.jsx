export function BookCover({ book, large = false }) {
  const [start, end] = book.coverColors || ["#FF66B3", "#FF4DA6"];
  const backgroundImage = book.coverImage
    ? `linear-gradient(155deg, rgba(255, 102, 179, 0.35), rgba(255, 77, 166, 0.2)), url(${book.coverImage})`
    : `linear-gradient(155deg, ${start}, ${end})`;

  return (
    <div
      className={`book-cover${large ? " book-cover--large" : ""}`}
      style={{
        backgroundImage,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="book-cover__shine" />
      <span className="book-cover__title">{book.title}</span>
      <span className="book-cover__author">{book.author}</span>
    </div>
  );
}
