import React, { useContext, useEffect, useState } from 'react';
import { Container, Col, Card, InputGroup, Form, Button, Spinner, Pagination } from 'react-bootstrap';
import { useParams, useSearchParams } from 'react-router-dom';
import './Home.scss';
import { GenProps } from '../../types/generic';
import AuthContext from '../../components/AuthContext';
import { Book } from '../../types/book';
import BookCard from '../../components/BookCard';
import BookService from '../../services/bookService';
import { Link } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import { useDebounce, useHasChanged } from '../../utils';

function Home(props: GenProps) {
  // State
  const [, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState<Array<Book>>([]);
  const [booksCount, setBooksCount] = useState(0);
  const [currentPage, setCurrentPage] = useState<number | undefined>(undefined);
  const [currentPageChangedPending, setCurrentPageChangedPending] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Constant
  const _listSize = 100;
  const _paginationReach = 2;

  // Context
  const loggedIn = useContext(AuthContext);

  // Circumstancial
  const { currentPage: currentPageInit } = useParams();
  const searchInit = useSearchParams()[0].get('search') ?? '';
  const currentPageChanged = useHasChanged(currentPage);

  useEffect(() => {
    const currentPageClean = currentPageInit !== undefined ? parseInt(currentPageInit, 10) : 0;
    setCurrentPage(currentPageClean);
    setSearch(searchInit);
    props.pageName('Einbinden');
  }, []);
  
  useEffect(() => {
    if (currentPageChanged) {
      setCurrentPageChangedPending(true);
    }
    if ((currentPageChanged || currentPageChangedPending) && loggedIn) {
      updateBookList(currentPage);
      setCurrentPageChangedPending(false);
    }
  }, [currentPage, loggedIn]);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await updateBookList();
  };
  
  const updateBookList = async (requestedPage: number = 0): Promise<void> => {
    setLoading(true);
    setSearchParams({ search });
    
    const result = await BookService.search(search, requestedPage, _listSize);
    const maxPage = Math.floor((result.count-1)/_listSize);
    let currentPage = requestedPage;
    if (currentPage === undefined || currentPage > maxPage || currentPage < 0) {
      currentPage = 0;
    }
    setBooks(result.books);
    setBooksCount(result.count);
    setCurrentPage(currentPage);
    setLoading(false);
  };

  const updateBookListDebounced = useDebounce(updateBookList);
  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    const search = e.currentTarget.value;
    setSearch(search);
    if (search.length >= 3 || search.length === 0) {
      updateBookListDebounced();
    }
  };

  const buildUrl = (index: number = 0, search: string = '') => {
    return `/app/${index}${search !== '' ? `?search=${encodeURI(search)}` : ''}`;
  };

  const renderPagination = () => {
    const maxPage = Math.floor((booksCount-1)/_listSize);
    const currentPageFromState = currentPage ?? 0;
    
    let hasEllipsis = false;
    const paginationStart = [];
    for (let i = currentPageFromState - 1; i >= 0; i--) { // Scan to the left
      if (i > currentPageFromState - 1 - _paginationReach) { // Between first page and min reach
        paginationStart.push(<Pagination.Item key={`p_${i}`} href={buildUrl(i, search)}>{i+1}</Pagination.Item>);
      } else if (i === 0) { // First page
        paginationStart.push(<Pagination.Item key={`p_${i}`} href={buildUrl(i, search)}>{i+1}</Pagination.Item>);
      } else if (!hasEllipsis) {
        hasEllipsis = true;
        paginationStart.push(<Pagination.Ellipsis key={`p_${i}`}></Pagination.Ellipsis>);
      }
    }
    paginationStart.reverse();
    hasEllipsis = false;
    const paginationEnd = [];
    for (let i = currentPageFromState + 1; i <= maxPage; i++) { // Scan to the right
      if (i < currentPageFromState + 1 + _paginationReach) { // Between last page and max reach
        paginationEnd.push(<Pagination.Item key={`p_${i}`} href={buildUrl(i, search)}>{i+1}</Pagination.Item>);
      } else if (i === maxPage) { // Last page
        paginationEnd.push(<Pagination.Item key={`p_${i}`} href={buildUrl(i, search)}>{i+1}</Pagination.Item>);
      } else if (!hasEllipsis) {
        hasEllipsis = true;
        paginationEnd.push(<Pagination.Ellipsis key={`p_${i}`}></Pagination.Ellipsis>);
      }
    }
    return (
      <Pagination>
        {currentPageFromState !== 0 && <Pagination.First href={buildUrl(0, search)} />}
        {currentPageFromState !== 0 && <Pagination.Prev href={buildUrl(currentPageFromState - 1, search)} />}
        {paginationStart.map(v => v)}
        <Pagination.Item active>{currentPageFromState + 1}</Pagination.Item>
        {paginationEnd.map(v => v)}
        {currentPageFromState !== maxPage && <Pagination.Next href={buildUrl(currentPageFromState + 1, search)} />}
        {currentPageFromState !== maxPage && <Pagination.Last href={buildUrl(maxPage, search)} />}
      </Pagination>
    );
  };

  const renderBookList = () => {
    return (
      books.map(book => 
        <BookCard book={book} key={book.isbn}></BookCard>)
    );
  };

  return (
    <Col>
      <h1 className="laptop">Book list</h1>
      <Container id="homeWrapper">
        <Form onSubmit={handleSubmit}>
          <InputGroup id="searchBarWrapper">
            <Form.Control
              type="text" value={search} onInput={handleInput} maxLength={50} placeholder="Title, author..."
            />
            <Button variant="outline-secondary" id="bookSearchInput" type="submit">
              <FiSearch />
            </Button>
          </InputGroup>
        </Form>
        { loading ? 
          <Col className="d-flex justify-content-center mt-5">
            <Spinner animation="border" />
          </Col> :
          <div id="bookListOuterWrapper">
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
            { books.length <= _listSize ? '' : renderPagination() }
          </div>
        }
      </Container>
    </Col>
  );
}

export default Home;