import React from 'react';
import { Card } from 'react-bootstrap';
import { Book } from '../types/book';
import './BookCard.scss';

interface BookCardProps {
  book: Book;
}

function BookCard(props: BookCardProps) {
  return (
    <li>
      <Card>
        <Card.Img variant="top" src={props.book.cover === '' ? 'https://upload.wikimedia.org/wikipedia/commons/b/b9/No_Cover.jpg' : props.book.cover} />
        <Card.ImgOverlay>
          <Card.Body className="bookTitle">
            <Card.Title title={`${props.book.title} (${[props.book.subtitle, props.book.publisher, props.book.publishedDate].filter(v => !!v).join(', ')})`}>
              {props.book.title}{props.book.subtitle ? ` (${props.book.subtitle})` : ''}
            </Card.Title>
            <Card.Subtitle>{props.book.authors.join(', ')}</Card.Subtitle>
          </Card.Body>
        </Card.ImgOverlay>
      </Card>
    </li>
  );
}

export default BookCard;