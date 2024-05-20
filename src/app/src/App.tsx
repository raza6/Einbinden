import React from 'react';
import { Routes } from 'react-router-dom';
import './App.scss';
import { Container } from 'react-bootstrap';

function App() {
  return (
    <Container fluid className="app" id="mainWrapper">
      <div id="appWrapper">
        <Routes>
        </Routes>
      </div>
    </Container>
  );
}

export default App;
