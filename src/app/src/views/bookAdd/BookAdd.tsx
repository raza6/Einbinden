import React, { useEffect, useState } from 'react';
import './BookAdd.scss';
import { GenProps } from '../../types/generic';
import { Badge, Button, Col, Form, InputGroup, OverlayTrigger, Tab, Tabs, Toast, ToastContainer, Tooltip, TooltipProps } from 'react-bootstrap';
import { BarcodeScanner, DetectedBarcode } from 'react-barcode-scanner';
import BookService from '../../services/bookService';
import { Book } from '../../types/book';
import { FiHelpCircle, FiPlus, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import { JSX } from 'react/jsx-runtime';

function BookAdd(props: GenProps) {
  const [showToast, setShowToast] = useState(false);
  const [toastIsError, setToastIsError] = useState(false);
  const [toastTitle, setToastTitle] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [usedBarcodes, setUsedBarcodes] = useState<Array<string>>([]);
  const [manualISBN, setManualISBN] = useState('');
  const [addedBooks, setAddedBooks] = useState<Book[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingAuthors, setEditingAuthors] = useState<string[]>([]);

  useEffect(() => {
    props.pageName('Einbinden - Add a book');
  }, []);

  const addBook = async (isbn: string): Promise<void> => {
    const { book, error } = await BookService.add(isbn);
    if (book) {
      setToastIsError(false);
      setToastTitle('Book added');
      setToastMessage(book.title);
      setAddedBooks(prev => [book, ...prev]);
    } else {
      setToastIsError(true);
      setToastTitle('Book not added');
      setToastMessage(error?.description ?? 'Unknown error');
    }
    setShowToast(true);
  };

  const scanBarcode = async (barcodes: (DetectedBarcode & { quality?: number})[]): Promise<void> => {
    console.log('Barcode detected');
    // @ts-ignore
    const barcode = barcodes.filter(code => code.quality ? code.quality > 10 : true).sort((a, b) => a.quality - b.quality)?.[0];
    if (barcode && !usedBarcodes.includes(barcode.rawValue)) {
      setUsedBarcodes([...usedBarcodes, barcode.rawValue]);
      console.log(`Barcode read : ${barcode.rawValue}`);
      addBook(barcode.rawValue);
    }
  };

  const handleISBNSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addBook(manualISBN.replaceAll('-', ''));
  };

  const handleISBNInput = (e: React.FormEvent<HTMLInputElement>) => {
    setManualISBN(e.currentTarget.value);
  };

  const startEdit = (idx: number) => {
    setEditingIndex(idx);
    setEditingTitle(addedBooks[idx].title);
  };

  const saveEdit = async () => {
    if (editingIndex === null || !editingTitle.trim()) {
      setEditingIndex(null);
      return;
    }
    const book = addedBooks[editingIndex];
    const updated = { ...book, title: editingTitle.trim(), authors: editingAuthors.filter(a => a.trim()) };
    const ok = await BookService.edit(updated);
    if (ok) {
      setAddedBooks(addedBooks.map((b, i) => i === editingIndex ? updated : b));
    }
    setEditingIndex(null);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
  };

  const updateEditAuthor = (i: number, author: string) => {
    setEditingAuthors(editingAuthors.map((a, j) => j === i ? author : a));
  };

  const addEditAuthor = () => {
    setEditingAuthors([...editingAuthors, '']);
  };

  const removeEditAuthor = (i: number) => {
    setEditingAuthors(editingAuthors.filter((_, j) => j !== i));
  };

  const renderHistoryItem = (book: Book, idx: number) => (
    <li key={book.isbn}>
      {editingIndex === idx ? (
        <div className="history-item-edit">
          <InputGroup size="sm">
            <InputGroup.Text>Title</InputGroup.Text>
          <Form.Control
            className="history-title-input"
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') cancelEdit(); }}
            autoFocus
            maxLength={256}
          />
          </InputGroup>
          {editingAuthors.map((author, i) => (
            <div className="history-author-row" key={i}>
              <InputGroup size="sm">
                <InputGroup.Text>Author</InputGroup.Text>
                <Form.Control
                  value={author}
                  onChange={(e) => updateEditAuthor(i, e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Escape') cancelEdit(); }}
                  maxLength={256}
                />
              </InputGroup>
              {i === editingAuthors.length - 1 && (
                <Button variant="secondary" size="sm" onClick={addEditAuthor}><FiPlus /></Button>
              )}
              {editingAuthors.length > 1 && (
                <Button variant="secondary" size="sm" onClick={() => removeEditAuthor(i)}><FiX /></Button>
              )}
            </div>
          ))}
          <div className="history-item-edit-footer">
            <span className="history-meta">{book.isbn}</span>
            <div className="history-item-edit-actions">
              <Button variant="success" size="sm" className="history-edit-action" onClick={saveEdit} title="Save"><FiCheck /></Button>
              <Button variant="secondary" size="sm" className="history-edit-action" onClick={cancelEdit} title="Cancel"><FiX /></Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="history-title-row">
          <span className="history-title">{book.title}</span>
          <Button variant="link" size="sm" className="history-edit-btn" onClick={() => startEdit(idx)} title="Edit"><FiEdit2 /></Button>
        </div>
      )}
      {editingIndex !== idx && (
        <span className="history-meta">{book.isbn}{book.authors.length > 0 ? ` - ${book.authors.join(', ')}` : ''}</span>
      )}
    </li>
  );

  const renderHelpScanTooltip = (props: JSX.IntrinsicAttributes & TooltipProps & React.RefAttributes<HTMLDivElement>) => (
    <Tooltip className="helpTooltip" {...props}>
      If you can see the gaps between the stripes, it should scan successfuly
    </Tooltip>
  );

  return (
    <Col className="bookAddWrapper">
      <Tabs
        defaultActiveKey="scan"
        fill
      >
        <Tab eventKey="scan" title="Scan an ISBN" className="scan-pane">
          <BarcodeScanner id="scannerTab" options={{ formats: ['ean_13'] }} onCapture={scanBarcode}/>
          <OverlayTrigger
            placement="left-start"
            trigger={['hover', 'focus']}
            overlay={renderHelpScanTooltip}
          >
            <Badge pill bg="dark">
              <FiHelpCircle />
            </Badge>
          </OverlayTrigger>
        </Tab>
        <Tab eventKey="form" title="Manually input an ISBN">
          <Form className="m-3" onSubmit={handleISBNSubmit}>
            <InputGroup id="isbnWrapper">
              <Form.Control
                type="text" pattern="^(?:\d+-?)+X?$" inputMode="numeric" maxLength={50} placeholder="ISBN" onInput={handleISBNInput}
              />
              <Button variant="outline-secondary" id="bookSearchInput" type="submit">
                <FiPlus />
              </Button>
            </InputGroup>
          </Form>
        </Tab>
      </Tabs>
      {addedBooks.length > 0 && (
        <ul className="history-list">
          {addedBooks.map(renderHistoryItem)}
        </ul>
      )}
      <ToastContainer position="bottom-end">
        <Toast onClose={() => setShowToast(false)} bg={toastIsError ? 'danger' : 'success'} autohide={!toastIsError} delay={3000} show={showToast}>
          <Toast.Header>
            <strong>{toastTitle}</strong>
          </Toast.Header>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Col>
  );
}

export default BookAdd;
