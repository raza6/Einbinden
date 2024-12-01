import React, { useContext, useEffect, useState } from 'react';
import { Container, Col, Card } from 'react-bootstrap';
import { Navigate } from 'react-router-dom';
import './Home.scss';
import { GenProps } from '../../types/generic';
import AuthContext from '../../components/AuthContext';
import { Book } from '../../types/book';
import BookCard from '../../components/BookCard';
import BookService from '../../services/bookService';
import { Link } from 'react-router-dom';

function Home(props: GenProps) {
  // State
  const [navigate, setNavigate] = useState<string | undefined>(undefined);
  const [books, setBooks] = useState<Array<Book>>([]);

  // Context
  const loggedIn = useContext(AuthContext);

  useEffect(() => {
    props.pageName('Einbinden');
    if (!loggedIn) {
      setNavigate('/app/login');
    } else {
      updateBookList();
    }
  }, [loggedIn]);

  const updateBookList = async (): Promise<void> => {
    const result = await BookService.search('');
    setBooks(result.books);
  };

  const renderBookList = () => {
    return (
      books.map(book => 
        <BookCard book={book} key={book.isbn}></BookCard>)
    );
  };

  return (
    <Col>
      {navigate && <Navigate to={navigate}/>}
      <h1 className="laptop">Book list</h1>
      <Container id="homeWrapper">
        <ul id="bookListWrapper">
          <li>
            <Link to="/app/bookAdd">
              <Card>
                <Card.Img variant="top" src={`${process.env.PUBLIC_URL}/addBook.png`} />
                <Card.ImgOverlay>
                  <Card.Body>
                    <Card.Title>Add a book</Card.Title>
                  </Card.Body>
                </Card.ImgOverlay>
              </Card>
            </Link>
          </li>
          { renderBookList() }
        </ul>
      </Container>
    </Col>
  );
}

export default Home;