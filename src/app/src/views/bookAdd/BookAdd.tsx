import React, { useEffect, useState } from 'react';
import './BookAdd.scss';
import { GenProps } from '../../types/generic';
import { Col, Toast, ToastContainer } from 'react-bootstrap';
import { BarcodeScanner, DetectedBarcode } from 'react-barcode-scanner';
import 'react-barcode-scanner/polyfill';
import BookService from '../../services/bookService';
import { Book } from '../../types/book';

function BookAdd(props: GenProps) {
  const [showToast, setShowToast] = useState(false);
  const [addBookResult, setAddBookResult] = useState(false);
  const [lastAddedBook, setLastAddedBook] = useState<Book>();
  const [usedBarcodes, setUsedBarcodes] = useState<Array<string>>([]);

  useEffect(() => {
    props.pageName('Einbinden - Add a book');
  }, []);
 
  const addBook = async (barcodes: (DetectedBarcode & { quality?: number})[]): Promise<void> => {
    console.log('Barcode detected');
    // @ts-ignore
    const barcode = barcodes.filter(code => code.quality ? code.quality > 10 : true).sort((a, b) => a.quality - b.quality)?.[0];
    if (barcode && !usedBarcodes.includes(barcode.rawValue)) {
      setUsedBarcodes([...usedBarcodes, barcode.rawValue]);
      console.log(`Barcode read : ${barcode.rawValue}`);
      const result = await BookService.add(barcode.rawValue);
      if (result) {
        setLastAddedBook(result);
        setAddBookResult(true);
        setShowToast(true);
      } else {
        setAddBookResult(false);
        setShowToast(true);
      }
    }
  };

  return (
    <Col className="bookAddWrapper">
      <div className="titleWrapper">
        <h1>Add a book</h1>
        <span>Scan an ISBN (if you can see the gap between the black and white stripe it should work)</span>
      </div>
      <div className="videoWrapper">
        <BarcodeScanner options={{ formats: ['ean_13'] }} onCapture={addBook}/>
      </div>
      <ToastContainer position="bottom-end">
        <Toast onClose={() => setShowToast(false)} bg={addBookResult ? 'success' : 'danger'} autohide delay={3000} show={showToast}>
          <Toast.Header>
            <strong>{addBookResult ? 'Book added' : 'Book not added'}</strong>
          </Toast.Header>
          <Toast.Body>{addBookResult ? lastAddedBook?.title : 'Try again'}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Col>
  );
}

export default BookAdd;