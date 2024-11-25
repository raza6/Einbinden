import React, { useEffect, useState } from 'react';
import { Container, Col } from 'react-bootstrap';
import { Navigate } from 'react-router-dom';
import './Home.scss';
import { GenProps } from '../../types/generic';

function Home(props: GenProps) {
  // State
  const [navigate] = useState<string | undefined>(undefined);

  useEffect(() => {
    props.pageName('Einbinden');
  }, []);

  return (
    <Col>
      {navigate && <Navigate to={navigate}/>}
      <h1 className="laptop">Book list</h1>
      <Container id="homeWrapper">

      </Container>
    </Col>
  );
}

export default Home;