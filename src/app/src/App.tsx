import React, { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.scss';
import { Container, Image, Row } from 'react-bootstrap';
import { User } from './types/user';
import AuthService from './services/authService';
import AuthContext from './components/AuthContext';
import { Link } from 'react-router-dom';
import NotFound from './views/notFound/NotFound';
import Logout from './views/auth/logout/Logout';
import Login from './views/auth/login/Login';
import Home from './views/home/Home';
import Settings from './views/settings/Settings';
import BookAdd from './views/bookAdd/BookAdd';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<User | undefined>(undefined);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setPageName] = useState('Einbinden');
  const [appName] = useState(process.env.REACT_APP_NAME ?? '');
  const [appVersion] = useState(process.env.REACT_APP_VERSION ?? 'x.x.x');

  const handleLoginCheck = async () => {
    const authResult = await AuthService.checkAuth();
    setLoggedIn(authResult?.success);
    setUser(authResult?.user);
  };

  useEffect(() => {
    handleLoginCheck();
  }, []);

  return (
    <AuthContext.Provider value={loggedIn}>
      <Container fluid className="app" id="mainWrapper">
        <Row id="navbar">
          <Link to="/app" className="laptop mainTitleWrapper">
            <Image alt="Einbinden" src={`${process.env.PUBLIC_URL}/einbinden.png`}></Image>
            <div className="titleWrapper">
              <h1>Einbinden</h1>
              <span>All yours books, right there, right now</span>
            </div>
          </Link>
          <div className="laptop" id="laptopMenuWrapper">
            <span className="metaWrapper">
              {loggedIn ? <Row className="userWrapper">
                <Link to="/app/settings">
                  <Image alt="Photo de l'utilisateur" src={user?.avatar}></Image>
                </Link>
              </Row>
                : <span>Déconnecté</span>}
              <a href="https://github.com/raza6/Einbinden">{appName} v{appVersion}</a>
            </span>
          </div>
        </Row>
        <div id="appWrapper">
          <Routes>
            <Route index path="/app" element={<Home pageName={setPageName}/>}></Route>
            <Route path="/app/:currentPage" element={<Home pageName={setPageName}/>}></Route>
            <Route path="/app/bookAdd" element={<BookAdd pageName={setPageName}/>}></Route>
            <Route path="/app/settings" element={<Settings pageName={setPageName}/>}></Route>
            <Route path="/app/login" element={<Login pageName={setPageName}/>}></Route>
            <Route path="/app/logout" element={<Logout pageName={setPageName} logoutCallback={handleLoginCheck}/>}></Route>
            <Route path="/app/*" element={<NotFound pageName={setPageName}/>} />
          </Routes>
        </div>
      </Container>
    </AuthContext.Provider>
  );
}

export default App;
