import { useEffect, useState, ChangeEvent } from 'react';
import './BookForm.scss';
import { Button, Form, Image, Toast, ToastContainer } from 'react-bootstrap';
import { FiImage, FiLoader, FiPlus, FiX } from 'react-icons/fi';
import Select, { MultiValue, StylesConfig } from 'react-select';
import BookService from '../../services/bookService';
import TagService from '../../services/tagService';
import { selectCover } from '../../utils';
import type { BookFormData, BookFormProps } from '../../types/bookForm';

const SELECT_STYLES: StylesConfig<{ value: string; label: string }, true> = {
  control: (base, state) => ({
    ...base,
    backgroundColor: 'var(--ebd-dark-lighter)',
    borderColor: state.isFocused ? 'var(--ebd-theme)' : 'var(--ebd-dark-darker)',
    color: 'var(--ebd-light-base)',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(107, 66, 38, 0.28)' : 'none',
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: 'var(--ebd-dark-lighter)',
    borderColor: 'var(--ebd-dark-darker)',
    color: 'var(--ebd-light-base)',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? 'var(--ebd-dark-lighter2)' : 'var(--ebd-dark-lighter)',
    color: 'var(--ebd-light-base)',
    cursor: 'pointer',
  }),
  multiValue: (base) => ({
    ...base,
    borderRadius: '8px',
    backgroundColor: 'var(--ebd-light-lighter)',
    color: 'var(--ebd-light-base)',
    fontSize: '18px',
  }),
  multiValueRemove: (base) => ({ ...base, borderRadius: '8px' }),
  clearIndicator: (base) => ({ ...base, color: 'var(--ebd-light-darker)', cursor: 'pointer' }),
  dropdownIndicator: (base) => ({ ...base, color: 'var(--ebd-light-darker)', cursor: 'pointer' }),
};

function BookForm({
  isbn,
  isbnEditable,
  book,
  onSave,
  onSaveSuccess,
  submitLabel,
  submitIcon,
  hideSubmit,
  extraActions,
}: BookFormProps) {
  const [isbnValue, setIsbnValue] = useState('');
  const [title, setTitle] = useState(book?.title ?? '');
  const [subtitle, setSubtitle] = useState(book?.subtitle ?? '');
  const [authors, setAuthors] = useState<string[]>(book?.authors?.length ? book.authors : ['']);
  const [publisher, setPublisher] = useState(book?.publisher ?? '');
  const [bookTags, setBookTags] = useState<string[]>(book?.tags ?? []);
  const [userTags, setUserTags] = useState<string[]>([]);
  const [bookCover, setBookCover] = useState<File | undefined>(undefined);
  const [bookCoverUrl, setBookCoverUrl] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastIsError, setToastIsError] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    TagService.getTags().then(setUserTags);
  }, []);

  const handleAddAuthor = () => setAuthors([...authors, '']);
  const handleRemoveAuthor = (i: number) => setAuthors(authors.filter((_, j) => j !== i));
  const handleAuthorChange = (i: number, value: string) => {
    const updated = [...authors];
    updated[i] = value;
    setAuthors(updated);
  };

  const handleImgChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 4 * 1024 * 1024) {
      setBookCover(file);
      setBookCoverUrl(window.URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    const cleanIsbn = isbnEditable ? isbnValue.replaceAll('-', '') : (isbn ?? '');
    const cleanAuthors = authors.filter(a => a.trim());

    if ((isbnEditable && !cleanIsbn) || !title.trim() || cleanAuthors.length === 0) {
      setToastIsError(true);
      setToastMessage(isbnEditable ? 'Fields ISBN, title and authors are required' : 'Fields title and authors are required');
      setShowToast(true);
      return;
    }

    const data: BookFormData = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      authors: cleanAuthors,
      publisher: publisher.trim(),
    };

    setIsSaving(true);
    const result = await onSave(cleanIsbn, data);

    if (result.error) {
      setToastIsError(true);
      setToastMessage(result.error);
      setShowToast(true);
      setIsSaving(false);
      return;
    }

    await TagService.updateBookTags(cleanIsbn, bookTags);
    if (bookCover) { 
      await BookService.editCover(cleanIsbn, bookCover);
    }

    setIsSaving(false);
    setToastIsError(false);
    setToastMessage(result.success ?? 'Saved');
    setShowToast(true);
    onSaveSuccess?.(cleanIsbn, data);
  };

  return (
    <>
      <div className="coverWrapper">
        <Image src={bookCoverUrl ?? selectCover(book?.coverSrc ?? '')} alt="Book cover" />
        {isbn && !isbnEditable && (
          <p className="isbnRef">
            <a href={`https://isbnsearch.org/isbn/${isbn}`} target="_blank" rel="noopener noreferrer">{isbn}</a>
          </p>
        )}
      </div>
      <Form className="bookFormMain">
        {isbnEditable && (
          <Form.Group className="mb-3">
            <Form.Label htmlFor="bookFormIsbnInput">ISBN</Form.Label>
            <Form.Control
              required
              id="bookFormIsbnInput"
              type="text"
              inputMode="numeric"
              pattern="^(?:\d+-?)+X?$"
              placeholder="ISBN"
              maxLength={50}
              value={isbnValue}
              onChange={(e) => setIsbnValue(e.currentTarget.value)}
            />
          </Form.Group>
        )}
        <Form.Group className="mb-3">
          <Form.Label htmlFor="bookFormTitleInput">Title</Form.Label>
          <Form.Control
            required
            id="bookFormTitleInput"
            type="text"
            placeholder="Title"
            maxLength={256}
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label htmlFor="bookFormSubtitleInput">Subtitle</Form.Label>
          <Form.Control
            id="bookFormSubtitleInput"
            size="sm"
            type="text"
            placeholder="Subtitle"
            maxLength={256}
            value={subtitle}
            onChange={(e) => setSubtitle(e.currentTarget.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Authors</Form.Label>
          {authors.map((author, i) => (
            <div key={i} className="authorRow">
              <Form.Control
                required
                type="text"
                placeholder="Author"
                maxLength={256}
                value={author}
                onChange={(e) => handleAuthorChange(i, e.currentTarget.value)}
              />
              {i === authors.length - 1 && (
                <Button variant="secondary" className="authorAdd" type="button" onClick={handleAddAuthor}><FiPlus /></Button>
              )}
              {authors.length > 1 && (
                <Button variant="secondary" className="authorRemove" type="button" onClick={() => handleRemoveAuthor(i)}><FiX /></Button>
              )}
            </div>
          ))}
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label htmlFor="bookFormPublisherInput">Publisher</Form.Label>
          <Form.Control
            id="bookFormPublisherInput"
            type="text"
            placeholder="Publisher"
            maxLength={512}
            value={publisher}
            onChange={(e) => setPublisher(e.currentTarget.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Tags</Form.Label>
          <Select
            isMulti
            name="tags"
            styles={SELECT_STYLES}
            options={userTags.map(tag => ({ value: tag, label: tag }))}
            value={bookTags.map(tag => ({ value: tag, label: tag }))}
            onChange={newValue => setBookTags(newValue.map(t => t.value))}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Cover</Form.Label>
          <Button variant="secondary" className="bookFormCoverButton" type="button" onClick={() => document.getElementById('bookFormCoverInput')?.click()}>
            <Form.Label>
              <FiImage />
              {(book?.coverSrc || bookCover) ? 'Edit' : 'Select'}
            </Form.Label>
            <input type="file" accept=".jpeg,.jpg,.png,image/jpeg,image/png" id="bookFormCoverInput" onChange={handleImgChange} />
          </Button>
        </Form.Group>
        <br />
        <div className="buttonWrapper">
          {!hideSubmit && (
            <Button variant="success" disabled={isSaving} onClick={handleSubmit}>
              {isSaving ? <FiLoader className="spinIcon" /> : submitIcon}{submitLabel}
            </Button>
          )}
          {extraActions}
        </div>
      </Form>
      <ToastContainer position="bottom-end">
        <Toast onClose={() => setShowToast(false)} bg={toastIsError ? 'danger' : 'success'} autohide={!toastIsError} delay={3000} show={showToast}>
          <Toast.Header>
            <strong>{toastIsError ? 'Error' : 'Success'}</strong>
          </Toast.Header>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}

export default BookForm;
