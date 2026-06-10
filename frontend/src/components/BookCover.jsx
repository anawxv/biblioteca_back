import { useEffect, useRef, useState } from "react";
import {
  buildCoverCandidates,
  fetchGoogleBooksCover,
  getSlugCoverPath,
  isValidCoverDimensions,
} from "../utils/coverResolver";

export function BookCover({ book, large = false, compact = false }) {
  const rootRef = useRef(null);
  const [candidates, setCandidates] = useState(() => buildCoverCandidates(book));
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [readyToLoad, setReadyToLoad] = useState(false);
  const [start, end] = book.coverColors || ["#FF66B3", "#FF4DA6"];

  const coverUrl = readyToLoad ? candidates[candidateIndex] || null : null;
  const showCoverImage = Boolean(coverUrl) && imageLoaded;
  const showFallbackText = !showCoverImage && !compact;

  useEffect(() => {
    const syncCandidates = buildCoverCandidates(book);
    setCandidates(syncCandidates);
    setCandidateIndex(0);
    setImageLoaded(false);

    let cancelled = false;
    fetchGoogleBooksCover(book).then((googleUrl) => {
      if (cancelled || !googleUrl) return;

      setCandidates((current) => {
        if (current.includes(googleUrl)) return current;
        const next = [...current];
        const slug = getSlugCoverPath(book);
        const slugIndex = next.indexOf(slug);
        if (slugIndex >= 0) {
          next.splice(slugIndex, 0, googleUrl);
        } else {
          next.push(googleUrl);
        }
        return next;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [book.id, book.coverImage, book.isbn, book.title, book.author]);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return undefined;

    let observer;

    function startLoading() {
      setReadyToLoad(true);
    }

    if (typeof IntersectionObserver === "undefined") {
      startLoading();
      return undefined;
    }

    observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) {
          return;
        }
        observer?.disconnect();
        startLoading();
      },
      { rootMargin: "120px 0px", threshold: 0.01 },
    );

    observer.observe(node);

    return () => {
      observer?.disconnect();
    };
  }, [book.id]);

  function handleImageError() {
    setImageLoaded(false);
    setCandidateIndex((current) => {
      if (current + 1 < candidates.length) {
        return current + 1;
      }
      return current;
    });
  }

  function handleImageLoad(event) {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    if (!isValidCoverDimensions(naturalWidth, naturalHeight)) {
      handleImageError();
      return;
    }
    setImageLoaded(true);
  }

  return (
    <div
      ref={rootRef}
      className={`book-cover${large ? " book-cover--large" : ""}${compact ? " book-cover--compact" : ""}${showCoverImage ? " book-cover--has-image" : " book-cover--fallback"}`}
      style={{
        backgroundImage: `linear-gradient(155deg, ${start}, ${end})`,
      }}
    >
      {coverUrl ? (
        <img
          key={`${coverUrl}-${candidateIndex}`}
          className={`book-cover__image${imageLoaded ? " book-cover__image--loaded" : ""}`}
          src={coverUrl}
          alt=""
          loading="lazy"
          decoding="async"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      ) : null}
      <div className="book-cover__shine" />
      {showFallbackText ? <span className="book-cover__title">{book.title}</span> : null}
      {showFallbackText ? <span className="book-cover__author">{book.author}</span> : null}
    </div>
  );
}
