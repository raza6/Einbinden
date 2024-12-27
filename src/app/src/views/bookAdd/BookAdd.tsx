import React, { useEffect, useState } from 'react';
import './BookAdd.scss';
import { GenProps } from '../../types/generic';
import { Badge, Button, Col, Form, InputGroup, OverlayTrigger, Tab, Tabs, Toast, ToastContainer, Tooltip, TooltipProps } from 'react-bootstrap';
import { BarcodeScanner, DetectedBarcode } from 'react-barcode-scanner';
import 'react-barcode-scanner/polyfill';
import BookService from '../../services/bookService';
import { FiHelpCircle, FiPlus } from 'react-icons/fi';
import { JSX } from 'react/jsx-runtime';

function BookAdd(props: GenProps) {
  const [showToast, setShowToast] = useState(false);
  const [toastTitle, setToastTitle] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [usedBarcodes, setUsedBarcodes] = useState<Array<string>>([]);
  const [manualISBN, setManualISBN] = useState('');

  useEffect(() => {
    props.pageName('Einbinden - Add a book');
  }, []);

  const addBook = async (isbn: string): Promise<void> => {
    const result = await BookService.add(isbn);
    if (result) {
      setToastTitle('Book added');
      setToastMessage(result?.title);
      setShowToast(true);
    } else {
      setToastTitle('Book not added');
      setToastMessage('Try again');
      setShowToast(true);
    }
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
    if (manualISBN.length >= 10 && /\d[0-9-]+X?/.test(manualISBN)) {
      addBook(manualISBN);
    } else {
      setShowToast(true);
      setToastTitle('Wrong ISBN format');
      setToastMessage('Try again');
    }
  };

  const handleISBNInput = (e: React.FormEvent<HTMLInputElement>) => {
    setManualISBN(e.currentTarget.value);
  };

  const renderHelpScanTooltip = (props: JSX.IntrinsicAttributes & TooltipProps & React.RefAttributes<HTMLDivElement>) => (
    <Tooltip className="helpTooltip" {...props}>
      If you can see the gaps between the stripes, it should scan successfuly
    </Tooltip>
  );

  return (
    <Col className="bookAddWrapper">
      <div className="titleWrapper">
        <h1>Add a book</h1>
      </div>
      <Tabs
        defaultActiveKey="scan"
        fill
      >
        <Tab eventKey="scan" title="Scan an ISBN">
          <BarcodeScanner options={{ formats: ['ean_13'] }} onCapture={scanBarcode}/>
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
                type="text" pattern="\d*X?" inputMode="numeric" maxLength={50} placeholder="ISBN" onInput={handleISBNInput}
              />
              <Button variant="outline-secondary" id="bookSearchInput" type="submit">
                <FiPlus />
              </Button>
            </InputGroup>
          </Form>
        </Tab>
      </Tabs>
      <ToastContainer position="bottom-end">
        <Toast onClose={() => setShowToast(false)} bg={toastMessage === 'Try again' ? 'danger' : 'success'} autohide delay={3000} show={showToast}>
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