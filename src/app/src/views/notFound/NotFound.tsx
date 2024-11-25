import React, { useEffect } from 'react';
import { getRandomOfList } from '../../utils';
import { Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './NotFound.scss';
import { GenProps } from '../../types/generic';

function NotFound(props: GenProps) {
  useEffect(() => {
    props.pageName('');
  }, []);

  return (
    <Col id="notFoundWrapper">
      <h1>Page introuvable {getRandomOfList(['😥', '😲', '🤯', '😠', '🥴', '😓'])}</h1>
      <Link to="/app">
        Revenir à l&apos;accueil
      </Link>
    </Col>
  );
}

export default NotFound;