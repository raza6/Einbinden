import './BookManualForm.scss';
import { Book } from '../../types/book';
import BookService from '../../services/bookService';
import BookForm from '../../components/BookForm/BookForm';
import type { BookFormData } from '../../types/bookForm';
import { FiCheck } from 'react-icons/fi';
import { useState } from 'react';

interface BookManualFormProps {
  onBookAdded: (book: Book) => void;
}

function BookManualForm({ onBookAdded }: BookManualFormProps) {
  const [formResetKey, setFormResetKey] = useState(0);

  const handleSave = async (isbn: string, data: BookFormData) => {
    const book: Book = {
      isbn,
      title: data.title,
      subtitle: data.subtitle || undefined,
      authors: data.authors,
      publisher: data.publisher || undefined,
      cover: '',
      tags: [],
    };
    const { error } = await BookService.addRaw(book);
    if (error) {
      return { error: error.description }
    };
    return { success: `"${data.title}" added` };
  };

  const handleSaveSuccess = (isbn: string, data: BookFormData) => {
    setFormResetKey(k => k + 1);
    onBookAdded({
      isbn,
      title: data.title,
      subtitle: data.subtitle || undefined,
      authors: data.authors,
      publisher: data.publisher || undefined,
      cover: '',
      tags: [],
    });
  };

  return (
    <div className="bookManualForm">
      <BookForm
        key={formResetKey}
        isbnEditable
        onSave={handleSave}
        onSaveSuccess={handleSaveSuccess}
        submitLabel="Add book"
        submitIcon={<FiCheck />}
      />
    </div>
  );
}

export default BookManualForm;
