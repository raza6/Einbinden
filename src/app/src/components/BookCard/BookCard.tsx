import React from 'react';
import { Book } from '../../types/book';
import './BookCard.scss';
import { selectCover } from '../../utils';

interface BookCardProps {
  book: Book;
}

function BookCard({ book }: BookCardProps) {
  const tooltip = [book.subtitle, book.publisher, book.publishedDate].filter(Boolean).join(', ');
  return (
    <div className="book-card" title={tooltip ? `${book.title} (${tooltip})` : book.title}>
      <img
        src={selectCover(book.cover)}
        alt={book.title}
        loading="lazy"
      />
      <div className="book-card-fence">
        <span className="book-card-title">{book.title}{book.subtitle ? ` (${book.subtitle})` : ''}</span>
        <span className="book-card-author">{book.authors.join(', ')}</span>
      </div>
    </div>
  );
}

export default BookCard;
