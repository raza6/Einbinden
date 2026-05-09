import { useEffect, useState } from 'react';
import './BookEdit.scss';
import { GenProps } from '../../types/generic';
import { Col, Row, Button, ToastContainer, Toast } from 'react-bootstrap';
import { Book } from '../../types/book';
import BookService from '../../services/bookService';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import { FiCornerUpLeft, FiEdit, FiTrash2 } from 'react-icons/fi';
import BookForm from '../../components/BookForm/BookForm';
import type { BookFormData } from '../../types/bookForm';

function BookEdit(props: GenProps) {
  const [book, setBook] = useState<Book | undefined>(undefined);
  const [navigate, setNavigate] = useState<string | undefined>(undefined);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | undefined>(undefined);

  const { isbn } = useParams();
  const origin = useSearchParams()[0].get('origin') ?? '/app';

  useEffect(() => {
    BookService.get(isbn ?? '').then(setBook);
    props.pageName('Einbinden - Edit a book');
  }, []);

  const handleSave = async (_isbn: string, data: BookFormData) => {
    const updatedBook: Book = {
      ...book!,
      title: data.title,
      subtitle: data.subtitle || undefined,
      authors: data.authors,
      publisher: data.publisher || undefined,
    };
    const res = await BookService.edit(updatedBook);
    return res ? { success: 'Book edited' } : { error: 'Book not edited' };
  };

  const deleteBook = async () => {
    const res = await BookService.delete((book as Book).isbn);
    if (res) {
      setNavigate('/app');
    } else {
      setDeleteError(`${book?.title} has not been deleted`);
    }
  };

  const extraActions = confirmDelete ? (
    <div className="extraActions">
      <span className="deleteConfirmText">Remove &quot;{book?.title}&quot; from collection permanently?</span>
      <Button variant="secondary" onClick={() => setConfirmDelete(false)}>Cancel</Button>
      <Button variant="danger" onClick={deleteBook}><FiTrash2 />Confirm delete</Button>
    </div>
  ) : (
    <div className="extraActions">
      <Button variant="secondary" onClick={() => setNavigate(origin)}><FiCornerUpLeft />Back to list</Button>
      <Button className="deleteButton" variant="danger" onClick={() => setConfirmDelete(true)}><FiTrash2 />Delete permanently</Button>
    </div>
  );

  return (
    <Col className="bookEditWrapper">
      {navigate && <Navigate to={navigate} />}
      <Row className="bookEditFormWrapper">
        {book && (
          <BookForm
            key={book.isbn}
            isbn={book.isbn}
            book={{
              title: book.title,
              subtitle: book.subtitle ?? '',
              authors: book.authors,
              publisher: book.publisher ?? '',
              tags: book.tags,
              coverSrc: book.cover,
            }}
            onSave={handleSave}
            submitLabel="Save"
            submitIcon={<FiEdit />}
            hideSubmit={confirmDelete}
            extraActions={extraActions}
          />
        )}
      </Row>
      {deleteError && (
        <ToastContainer position="bottom-end">
          <Toast onClose={() => setDeleteError(undefined)} bg="danger" autohide delay={3000} show>
            <Toast.Header><strong>{deleteError}</strong></Toast.Header>
            <Toast.Body>Try again</Toast.Body>
          </Toast>
        </ToastContainer>
      )}
    </Col>
  );
}

export default BookEdit;
