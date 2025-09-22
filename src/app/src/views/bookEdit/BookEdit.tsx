import React, { useEffect, useState } from 'react';
import './BookEdit.scss';
import { GenProps } from '../../types/generic';
import { Col, Form, Image, Row, Button, ToastContainer, Toast, Modal } from 'react-bootstrap';
import { Book } from '../../types/book';
import BookService from '../../services/bookService';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import { FiCornerUpLeft, FiEdit, FiTrash2, FiImage } from 'react-icons/fi';
import Select from 'react-select';
import TagService from '../../services/tagService';
import { selectCover } from '../../utils';

function BookEdit(props: GenProps) {
  const [book, setBook] = useState<Book | undefined>(undefined);
  const [userTags, setUserTags] = useState<Array<string>>([]);
  const [bookTags, setBookTags] = useState<Array<string>>([]);
  const [bookCover, setBookCover] = useState<File | undefined>(undefined);
  const [bookCoverUrl, setBookCoverUrl] = useState<string | undefined>(undefined);
  const [navigate, setNavigate] = useState<string | undefined>(undefined);
  const [showToast, setShowToast] = useState(false);
  const [editBookResult, setEditBookResult] = useState(false);
  const [editBookResultDetail, setEditBookResultDetail] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { isbn } = useParams();
  const origin = useSearchParams()[0].get('origin') ?? '/app';
  
  useEffect(() => {
    initBook();
    props.pageName('Einbinden - Edit a book');
  }, []);
  
  const initBook = async () => {
    const userTagsRes = await TagService.getTags();
    setUserTags(userTagsRes);
    const bookRes = await BookService.get(isbn ?? '');
    setBook(bookRes);
    setBookTags(bookRes.tags);
  };

  const saveBook = async () => {
    if (!book?.title || book.authors.length === 0 || book.authors.some(a => !a)) {
      setShowToast(true);
      setEditBookResult(false);
      setEditBookResultDetail('Fields title and authors are required');
    } else {
      const res = await BookService.edit(book);
      await TagService.updateBookTags(book.isbn, bookTags);
      
      let coverMsg = '';
      if (bookCover !== undefined) {
        const coverRes = await BookService.editCover(book.isbn, bookCover);
        coverMsg = coverRes ? ' with cover' : ' without cover'; 
      }

      setShowToast(true);
      setEditBookResult(res);
      setEditBookResultDetail(res ? `Book edited${coverMsg}` : 'Book not edited');
    }
  };

  const deleteBook = async () => {
    const res = await BookService.delete((book as Book).isbn);
    if (res) {
      setNavigate('/app');
    } else {
      setShowToast(true);
      setEditBookResult(res);
      setEditBookResultDetail(`${book?.title} have not been deleted`);
    }
  };

  // @ts-ignore
  const handleTagChange = async (e) => {
    if (e.action === 'remove-value') {
      setBookTags(bookTags.filter(t => t === e.value))
    } else {
      // @ts-ignore
      setBookTags(e.map(t => t.value));
    }
  }

  const handleImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file !== undefined) {
      if (file.size > 4 * 1024 * 1024) {
        console.error('L\'image est trop volumineuse');
      } else {
        const fileUrl = window.URL.createObjectURL(file);
        setBookCover(file);
        setBookCoverUrl(fileUrl);
      }
    }
  };
  
  return (
    <Col className="bookEditWrapper">
      {navigate && <Navigate to={navigate}/>}
      <div className="titleWrapper">
        <h1>Edit a book</h1>
      </div>
      <Row className="bookEditFormWrapper">
        <div className="coverWrapper">
          <Image src={bookCoverUrl ?? selectCover(book?.cover ?? '')} alt="Book cover"></Image>
        </div>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="bookTitleInput">Title</Form.Label>
            <Form.Control required maxLength={256} value={book?.title ?? ''} type="text" placeholder="Title" name="Title" id="bookTitleInput"
              onChange={(e) => setBook({ ...book, title: e.currentTarget.value } as Book)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="bookSubtitleInput">Subtitle</Form.Label>
            <Form.Control value={book?.subtitle ?? ''} maxLength={256} size="sm" type="text" placeholder="Subtitle" name="Subtitle" id="bookSubtitleInput"
              onChange={(e) => setBook({ ...book, subtitle: e.currentTarget.value } as Book)}
            />
          </Form.Group>
          <Form.Group title="(Comma separated field)" className="mb-3">
            <Form.Label htmlFor="bookAuthorsInput">Authors</Form.Label>
            <Form.Control required value={book?.authors?.join(', ') ?? ''} maxLength={512} type="text" placeholder="Authors" name="Authors" id="bookAuthorsInput"
              onChange={(e) => setBook({ ...book, authors: e.currentTarget.value.split(', ').map(v => v.trim()) } as Book)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="bookPublisherInput">Publisher</Form.Label>
            <Form.Control value={book?.publisher ?? ''} maxLength={512} type="text" placeholder="Publisher" name="Publisher" id="bookPublisherInput"
              onChange={(e) => setBook({ ...book, publisher: e.currentTarget.value } as Book)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="bookCoverInput">Cover</Form.Label>
            <Button variant="primary" id="bookCoverButton" onClick={() => document.getElementById('bookCoverInput')?.click()}>
                <Form.Label>
                  <FiImage />
                  {book?.cover ? 'Edit' : 'Select'}
                </Form.Label>
                <input type="file" accept=".jpeg,.jpg,.png,image/jpeg,image/png" name="Cover" id="bookCoverInput" onChange={handleImgChange}/>
              </Button>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="bookTagsInput">Tags</Form.Label>
            <Select
              isMulti
              styles={{
                control: (baseStyles, state) => ({
                  ...baseStyles,
                  backgroundColor: 'var(--ebd-dark-lighter)',
                  borderColor: 'var(--ebd-dark-lighter)',
                  color: 'var(--ebd-light-base)',
                  boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(44, 44, 44, 0.25)' : 'none',
                  '&:hover': 'none'
                }),
                menu: (baseStyles) => ({
                  ...baseStyles,
                  backgroundColor: 'var(--ebd-dark-lighter)',
                  borderColor: 'var(--ebd-dark-lighter)',
                  color: 'var(--ebd-light-base)'
                }),
                option: (baseStyles, state) => ({
                  ...baseStyles,
                  backgroundColor: state.isFocused ? 'var(--ebd-dark-lighter2)' : 'var(--ebd-dark-lighter)',
                  cursor: 'pointer'
                }),
                multiValue: (baseStyles) => ({
                  ...baseStyles,
                  borderRadius: '8px',
                  backgroundColor: 'var(--ebd-light-base)',
                  color: 'var(--ebd-dark-base)',
                  fontSize: '18px'
                }),
                multiValueRemove: (baseStyles) => ({
                  ...baseStyles,
                  borderRadius: '8px'
                }),
                clearIndicator: (baseStyles) => ({
                  ...baseStyles,
                  color: 'var(--ebd-light-base)',
                  cursor: 'pointer',
                  '&:hover': {
                    color: 'var(--ebd-light-base2)'
                  }
                }),
                dropdownIndicator: (baseStyles, state) => ({
                  ...baseStyles,
                  color: 'var(--ebd-light-base)',
                  cursor: 'pointer',
                  '&:hover': {
                    color: 'var(--ebd-light-base2)'
                  }
                }),
              }}
              options={userTags.map(tag => ({ value: tag, label: tag }))}
              value={bookTags.map(tag => ({ value: tag, label: tag }))}
              name="tags"
              id="bookTagsInput"
              onChange={handleTagChange}/>
          </Form.Group>
          <br />
          <div className="buttonWrapper">
            <Button variant="success" onClick={() => saveBook()}><FiEdit />Save</Button>
            <Button variant="warning" onClick={() => setNavigate(origin)}><FiCornerUpLeft />Back to list</Button>
            <Button className="deleteButton" variant="danger" onClick={() => setShowDeleteModal(true)}><FiTrash2 /> Delete permanently</Button>
          </div>
        </Form>
      </Row>
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header>
          <Modal.Title>Delete &quot;{book?.title}&quot; permanently ?</Modal.Title>
        </Modal.Header>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            No, go back
          </Button>
          <Button variant="danger" onClick={deleteBook}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
      <ToastContainer position="bottom-end">
        <Toast onClose={() => setShowToast(false)} bg={editBookResult ? 'success' : 'danger'} autohide delay={3000} show={showToast}>
          <Toast.Header>
            <strong>{editBookResultDetail}</strong>
          </Toast.Header>
          <Toast.Body>{editBookResult ? book?.title : 'Try again'}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Col>
  );
}

export default BookEdit;