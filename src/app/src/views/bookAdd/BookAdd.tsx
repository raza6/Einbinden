import React, { useEffect } from 'react';
import './BookAdd.scss';
import { GenProps } from '../../types/generic';
import { Col } from 'react-bootstrap';

function BookAdd(props: GenProps) {
  useEffect(() => {
    props.pageName('Einbinden - Add a book');
  }, []);

  return (
    <Col>
      <h1>Add a book</h1>
    
    </Col>
  );
}

export default BookAdd;