import React, { useEffect, useState } from 'react';
import './BookEdit.scss';
import { GenProps } from '../../types/generic';
import { Col, Form, Image, Row, Button, ToastContainer, Toast, Modal } from 'react-bootstrap';
import { Book } from '../../types/book';
import BookService from '../../services/bookService';
import { Navigate, useParams } from 'react-router-dom';
import { FiCornerUpLeft, FiEdit, FiTrash2 } from 'react-icons/fi';

function BookEdit(props: GenProps) {
  const [book, setBook] = useState<Book | undefined>(undefined);
  const [navigate, setNavigate] = useState<string | undefined>(undefined);
  const [showToast, setShowToast] = useState(false);
  const [editBookResult, setEditBookResult] = useState(false);
  const [editBookResultDetail, setEditBookResultDetail] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { isbn } = useParams();
  
  useEffect(() => {
    initBook();
    props.pageName('Einbinden - Edit a book');
  }, []);
  
  const initBook = async () => {
    const bookRes = await BookService.get(isbn ?? '');
    setBook(bookRes);
  };

  const saveBook = async () => {
    if (!book?.title || book.authors.length === 0 || book.authors.some(a => !a) || !book.cover) {
      setShowToast(true);
      setEditBookResult(false);
      setEditBookResultDetail('Fields title, authors and cover are required');
    } else {
      const res = await BookService.edit(book);
      setShowToast(true);
      setEditBookResult(res);
      setEditBookResultDetail(res ? 'Book edited' : 'Book not edited');
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
  
  return (
    <Col className="bookEditWrapper">
      {navigate && <Navigate to={navigate}/>}
      <div className="titleWrapper">
        <h1>Edit a book</h1>
      </div>
      <Row className="bookEditFormWrapper">
        <div className="coverWrapper">
          <Image src={book?.cover === '' ? 'https://upload.wikimedia.org/wikipedia/commons/b/b9/No_Cover.jpg' : book?.cover} alt="Book cover"></Image>
        </div>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control required maxLength={256} value={book?.title ?? ''} type="text" placeholder="Title" 
              onChange={(e) => setBook({ ...book, title: e.currentTarget.value } as Book)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Subtitle</Form.Label>
            <Form.Control value={book?.subtitle ?? ''} maxLength={256} size="sm" type="text" placeholder="Subtitle" 
              onChange={(e) => setBook({ ...book, subtitle: e.currentTarget.value } as Book)}
            />
          </Form.Group>
          <Form.Group title="(Comma separated field)" className="mb-3">
            <Form.Label>Authors</Form.Label>
            <Form.Control required value={book?.authors?.join(', ') ?? ''} maxLength={512} type="text" placeholder="Authors" 
              onChange={(e) => setBook({ ...book, authors: e.currentTarget.value.split(', ').map(v => v.trim()) } as Book)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Publisher</Form.Label>
            <Form.Control value={book?.publisher ?? ''} maxLength={512} type="text" placeholder="Publisher" 
              onChange={(e) => setBook({ ...book, publisher: e.currentTarget.value } as Book)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Cover URL</Form.Label>
            <Form.Control value={book?.cover ?? ''} maxLength={1024} type="text" placeholder="https://..." 
              onChange={(e) => setBook({ ...book, cover: e.currentTarget.value } as Book)}
            />
          </Form.Group>
          <br />
          <div className="buttonWrapper">
            <Button variant="success" onClick={() => saveBook()}><FiEdit />Save</Button>
            <Button variant="warning" onClick={() => setNavigate('/app')}><FiCornerUpLeft />Back to list</Button>
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