import React, { useEffect, useState } from 'react';
import './BookEdit.scss';
import { GenProps } from '../../types/generic';
import { Col, Form, Image, Row, Button, ToastContainer, Toast } from 'react-bootstrap';
import { Book } from '../../types/book';
import BookService from '../../services/bookService';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import { FiCornerUpLeft, FiEdit, FiTrash2, FiImage, FiLoader, FiX, FiPlus } from 'react-icons/fi';
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
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);

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
      setSaving(true);
      const res = await BookService.edit(book);
      await TagService.updateBookTags(book.isbn, bookTags);

      let coverMsg = '';
      if (bookCover !== undefined) {
        const coverRes = await BookService.editCover(book.isbn, bookCover);
        coverMsg = coverRes ? ' with cover' : ' without cover';
      }

      setSaving(false);
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
      setBookTags(bookTags.filter(t => t !== e.value))
    } else {
      // @ts-ignore
      setBookTags(e.map(t => t.value));
    }
  }

  const handleAddAuthor = () => {
    setBook({ ...book, authors: [...(book?.authors ?? []), ''] } as Book);
  };

  const handleRemoveAuthor = (index: number) => {
    setBook({ ...book, authors: book!.authors.filter((_, j) => j !== index) } as Book);
  };

  const handleAuthorChange = (idx: number, author: string) => {
    const authors = [...(book?.authors ?? [])];
    authors[idx] = author;
    setBook({ ...book, authors } as Book);
  };

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
      <Row className="bookEditFormWrapper">
        <div className="coverWrapper">
          <Image src={bookCoverUrl ?? selectCover(book?.cover ?? '')} alt="Book cover" />
          <p className="coverIsbn">
            <a href={`https://isbnsearch.org/isbn/${book?.isbn}`} target="_blank" rel="noopener noreferrer">{book?.isbn}</a>
          </p>
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
          <Form.Group className="mb-3">
            <Form.Label>Authors</Form.Label>
            {(book?.authors ?? ['']).map((author, i, arr) => (
              <div key={i} className="authorRow">
                <Form.Control
                  required
                  maxLength={256}
                  type="text"
                  placeholder="Author"
                  value={author}
                  onChange={(e) => handleAuthorChange(i, e.currentTarget.value)}
                />
                {arr.length > 1 && (
                  <Button variant="secondary" className="authorRemove" onClick={() => handleRemoveAuthor(i)}><FiX /></Button>
                )}
                {i === arr.length - 1 && (
                  <Button variant="secondary" className="authorAdd" onClick={handleAddAuthor}><FiPlus /></Button>
                )}
              </div>
            ))}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="bookPublisherInput">Publisher</Form.Label>
            <Form.Control value={book?.publisher ?? ''} maxLength={512} type="text" placeholder="Publisher" name="Publisher" id="bookPublisherInput"
              onChange={(e) => setBook({ ...book, publisher: e.currentTarget.value } as Book)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="bookTagsInput">Tags</Form.Label>
            <Select
              isMulti
              styles={{
                control: (baseStyles, state) => ({
                  ...baseStyles,
                  backgroundColor: 'var(--ebd-dark-lighter)',
                  borderColor: state.isFocused ? 'var(--ebd-theme)' : 'var(--ebd-dark-darker)',
                  color: 'var(--ebd-light-base)',
                  boxShadow: state.isFocused ? '0 0 0 3px rgba(107, 66, 38, 0.28)' : 'none',
                }),
                menu: (baseStyles) => ({
                  ...baseStyles,
                  backgroundColor: 'var(--ebd-dark-lighter)',
                  borderColor: 'var(--ebd-dark-darker)',
                  color: 'var(--ebd-light-base)'
                }),
                option: (baseStyles, state) => ({
                  ...baseStyles,
                  backgroundColor: state.isFocused ? 'var(--ebd-dark-lighter2)' : 'var(--ebd-dark-lighter)',
                  color: 'var(--ebd-light-base)',
                  cursor: 'pointer'
                }),
                multiValue: (baseStyles) => ({
                  ...baseStyles,
                  borderRadius: '8px',
                  backgroundColor: 'var(--ebd-light-lighter)',
                  color: 'var(--ebd-light-base)',
                  fontSize: '18px'
                }),
                multiValueRemove: (baseStyles) => ({
                  ...baseStyles,
                  borderRadius: '8px'
                }),
                clearIndicator: (baseStyles) => ({
                  ...baseStyles,
                  color: 'var(--ebd-light-darker)',
                  cursor: 'pointer',
                }),
                dropdownIndicator: (baseStyles) => ({
                  ...baseStyles,
                  color: 'var(--ebd-light-darker)',
                  cursor: 'pointer',
                }),
              }}
              options={userTags.map(tag => ({ value: tag, label: tag }))}
              value={bookTags.map(tag => ({ value: tag, label: tag }))}
              name="tags"
              id="bookTagsInput"
              onChange={handleTagChange}/>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="bookCoverInput">Cover</Form.Label>
            <Button variant="secondary" id="bookCoverButton" onClick={() => document.getElementById('bookCoverInput')?.click()}>
                <Form.Label>
                  <FiImage />
                  {book?.cover ? 'Edit' : 'Select'}
                </Form.Label>
                <input type="file" accept=".jpeg,.jpg,.png,image/jpeg,image/png" name="Cover" id="bookCoverInput" onChange={handleImgChange}/>
              </Button>
          </Form.Group>
          <br />
          {!confirmDelete && (
            <div className="buttonWrapper">
              <Button variant="success" disabled={saving} onClick={() => saveBook()}>
                {saving ? <FiLoader className="spinIcon" /> : <FiEdit />}Save
              </Button>
              <Button variant="secondary" onClick={() => setNavigate(origin)}><FiCornerUpLeft />Back to list</Button>
              <Button className="deleteButton" variant="danger" onClick={() => setConfirmDelete(true)}><FiTrash2 />Delete permanently</Button>
            </div>
          )}
          {confirmDelete && (
            <div className="buttonWrapper">
              <span className="deleteConfirmText">Remove &quot;{book?.title}&quot; from collection permanently?</span>
              <Button variant="secondary" onClick={() => setConfirmDelete(false)}>Cancel</Button>
              <Button variant="danger" onClick={deleteBook}><FiTrash2 />Confirm delete</Button>
            </div>
          )}
        </Form>
      </Row>
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