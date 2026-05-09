import React, { useContext, useEffect, useState } from 'react';
import { Container, Col, InputGroup, Form, Button, Pagination, Toast, ToastContainer } from 'react-bootstrap';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import './Home.scss';
import { GenProps } from '../../types/generic';
import AuthContext from '../../components/AuthContext';
import { Book } from '../../types/book';
import BookCard from '../../components/BookCard/BookCard';
import BookService from '../../services/bookService';
import { FiSearch, FiShare2, FiPlus } from 'react-icons/fi';
import { useDebounce, useHasChanged } from '../../utils';
import { AiFillLock } from 'react-icons/ai';
import { EAuthOrigin, User } from '../../types/user';
import ShareService from '../../services/shareService';

type HomeProps = GenProps & {
  user?: User | undefined
}

const SKELETON_COUNT = 12;

function Home(props: HomeProps) {
  const [searchParams] = useSearchParams();
  const [books, setBooks] = useState<Array<Book>>([]);
  const [booksCount, setBooksCount] = useState(0);
  const [currentPage, setCurrentPage] = useState<number | undefined>(undefined);
  const [currentPageChangedPending, setCurrentPageChangedPending] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [userNameShare, setUserNameShare] = useState<string | undefined>(undefined);
  
  // Constant
  const _listSize = 100;
  const _paginationReach = 2;
  
  // Context
  const loggedIn = useContext(AuthContext);
  
  // Circumstancial
  const { currentPage: currentPageInit, shareId: shareIdRaw } = useParams();
  const searchInit = useSearchParams()[0].get('search') ?? '';
  const currentPageChanged = useHasChanged(currentPage);
  const navigate = useNavigate();

  const shareId = shareIdRaw ?? '';
  const shareMode = !!shareId;

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
    if ((currentPageChanged || currentPageChangedPending) && (loggedIn || shareMode)) {
      updateBookList(currentPage, search);
      setCurrentPageChangedPending(false);
    }
  }, [currentPage, loggedIn]);

  useEffect(() => {
    const searchValueFromUrl = searchParams.get('search') ?? '';
    if (searchValueFromUrl !== search) {
      updateBookList(0, searchValueFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    updateShare();
  }, [shareId]);

  const updateShare = async () => {
    if (shareId) {
      const userName = await ShareService.get(shareId);
      setUserNameShare(`${userName}'s shelf`);
    } else {
      setUserNameShare(undefined);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await updateBookList();
  };

  const updateSearchUrl = (upcomingPage: number, upcomingSearch: string) => {
    if (currentPage !== undefined) {
      const currentSearchParam = searchParams.get('search') ?? '';
      const needUrlUpdate = upcomingSearch !== currentSearchParam || upcomingPage !== currentPage;

      if (needUrlUpdate) {
        navigate(buildPaginationUrl(upcomingPage, upcomingSearch));
      }
    }
  };

  const updateBookList = async (requestedPage: number = 0, requestedSearch: string = ''): Promise<void> => {
    setLoading(true);

    const result = shareMode ?
      await ShareService.search(shareId, requestedSearch, requestedPage, _listSize)
      : await BookService.search(requestedSearch, requestedPage, _listSize);
    const maxPage = Math.floor((result.count-1)/_listSize);

    let upcomingPage = requestedPage;
    if (upcomingPage === undefined || upcomingPage > maxPage || upcomingPage < 0) {
      upcomingPage = 0;
    }
    updateSearchUrl(upcomingPage, requestedSearch);

    setSearch(requestedSearch);
    setCurrentPage(upcomingPage);
    setBooks(result.books);
    setBooksCount(result.count);
    setLoading(false);
  };

  const updateBookListDebounced = useDebounce(updateBookList);
  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    const search = e.currentTarget.value;
    setSearch(search);
    if (search.length >= 3 || search.length === 0) {
      updateBookListDebounced(0, search);
    }
  };

  const buildPaginationUrl = (index: number = 0, search: string = '') => {
    return `/app/${shareMode ? `share/${shareId}/` : ''}${index}${search !== '' ? `?search=${encodeURI(search)}` : ''}`;
  };

  const shareUrl = () => {
    if (props.user !== undefined) {
      const user = props.user as User;
      const shareUrl = `${window.location.origin}/app/share/${user.origin === EAuthOrigin.Github ? '00' : 'xx'}${parseInt(user.id, 10).toString(16)}`;
      navigator.clipboard.writeText(shareUrl);
      setShowToast(true);
    }
  };

  const renderPagination = () => {
    const maxPage = Math.floor((booksCount-1)/_listSize);
    const currentPageFromState = currentPage ?? 0;

    let hasEllipsis = false;
    const paginationStart = [];
    for (let i = currentPageFromState - 1; i >= 0; i--) { // Scan to the left
      if (i > currentPageFromState - 1 - _paginationReach) { // Between first page and min reach
        paginationStart.push(<Pagination.Item key={`p_${i}`} href={buildPaginationUrl(i, search)}>{i+1}</Pagination.Item>);
      } else if (i === 0) { // First page
        paginationStart.push(<Pagination.Item key={`p_${i}`} href={buildPaginationUrl(i, search)}>{i+1}</Pagination.Item>);
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
        paginationEnd.push(<Pagination.Item key={`p_${i}`} href={buildPaginationUrl(i, search)}>{i+1}</Pagination.Item>);
      } else if (i === maxPage) { // Last page
        paginationEnd.push(<Pagination.Item key={`p_${i}`} href={buildPaginationUrl(i, search)}>{i+1}</Pagination.Item>);
      } else if (!hasEllipsis) {
        hasEllipsis = true;
        paginationEnd.push(<Pagination.Ellipsis key={`p_${i}`}></Pagination.Ellipsis>);
      }
    }
    return (
      <Pagination>
        {currentPageFromState !== 0 && <Pagination.First href={buildPaginationUrl(0, search)} />}
        {currentPageFromState !== 0 && <Pagination.Prev href={buildPaginationUrl(currentPageFromState - 1, search)} />}
        {paginationStart.map(v => v)}
        <Pagination.Item active>{currentPageFromState + 1}</Pagination.Item>
        {paginationEnd.map(v => v)}
        {currentPageFromState !== maxPage && <Pagination.Next href={buildPaginationUrl(currentPageFromState + 1, search)} />}
        {currentPageFromState !== maxPage && <Pagination.Last href={buildPaginationUrl(maxPage, search)} />}
      </Pagination>
    );
  };

  const renderGrid = () => {
    if (loading) {
      return (
        <ul className="book-grid" aria-hidden="true">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <li key={i} className="skeleton-card"></li>
          ))}
        </ul>
      );
    }

    if (books.length === 0 && search !== '') {
      return (
        <p className="empty-state">No books for <em>{search}</em>.</p>
      );
    }

    return (
      <ul className="book-grid">
        {books.map(book => (
          shareMode
            ? <li key={book.isbn}><BookCard book={book} /></li>
            : <li key={book.isbn}>
                <Link to={`/app/bookEdit/${book.isbn}?origin=${window.location.pathname + window.location.search}`}>
                  <BookCard book={book} />
                </Link>
              </li>
        ))}
      </ul>
    );
  };

  if (!loggedIn && !shareMode) {
    return (
      <Col>
        <Container id="homeWrapper">
          <div className="login-prompt">
            <Link to="/app/login">
              <Button size="lg"><AiFillLock /> Login</Button>
            </Link>
          </div>
        </Container>
      </Col>
    );
  }

  return (
    <Col>
      <Container id="homeWrapper">
        <div className="toolbar">
          {!shareMode && (
            <Link to="/app/bookAdd">
              <Button className="add-btn" title="Add a book">
                <FiPlus aria-hidden="true" />
              </Button>
            </Link>
          )}
          <Form onSubmit={handleSubmit} className="search-form">
            <InputGroup>
              <Form.Control
                type="text"
                value={search}
                onInput={handleInput}
                maxLength={50}
                placeholder="Title, author..."
              />
              <Button variant="outline-secondary" type="submit">
                <FiSearch />
              </Button>
            </InputGroup>
          </Form>
          {!shareMode && (
            <Button className="share-btn" onClick={shareUrl} title="Copy share link">
              <FiShare2 aria-hidden="true" />
            </Button>
          )}
        </div>
        {shareMode && userNameShare && (
          <p className="share-owner">{userNameShare}</p>
        )}
        {renderGrid()}
        {booksCount > _listSize && renderPagination()}
        <ToastContainer position="bottom-end">
          <Toast onClose={() => setShowToast(false)} autohide delay={3000} show={showToast} bg="success">
            <Toast.Header>
              <strong>Share URL copied to clipboard</strong>
            </Toast.Header>
          </Toast>
        </ToastContainer>
      </Container>
    </Col>
  );
}

export default Home;
