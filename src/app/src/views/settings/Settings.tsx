import React, { ReactNode, useContext, useEffect, useState } from 'react';
import { Button, Col, Image } from 'react-bootstrap';
import './Settings.scss';
import { GenProps } from '../../types/generic';
import { User, EAuthOrigin } from '../../types/user';
import AuthContext from '../../components/AuthContext';
import AuthService from '../../services/authService';
import { FiLock } from 'react-icons/fi';
import { Link } from 'react-router-dom';

function Settings(props: GenProps) {
  // State
  const [user, setUser] = useState<User | undefined>(undefined);

  // Circumstancial
  const loggedIn = useContext(AuthContext);

  const initUser = async () => {
    const authResult = await AuthService.checkAuth();
    if (authResult.success) {
      setUser(authResult.user);
    }
  };

  useEffect(() => {
    initUser();
    props.pageName('Paramètres');
  }, []);

  const renderOrigin = (origin: EAuthOrigin | undefined): ReactNode => {
    switch(origin) {
    case EAuthOrigin.Github:
      return 'Github';
    default:
      return 'service inconnu';
    }
  };

  return (
    <Col id="settingsWrapper">
      <h1>Settings</h1>
      {
        loggedIn ?
          <div id="infoWrapper">
            <div id="userWrapper">
              <Image alt="User avatar" src={user?.avatar}></Image>
              <h2>Hi {user?.name} 😀</h2>
            </div>
            <div id="loginStatus">
              <span>You&apos;re logged-in through {renderOrigin(user?.origin)}</span>
              <Link to="/app/logout" className="d-flex flex-column align-items-center">
                <Button>
                  Logout
                  <FiLock/>
                </Button>
              </Link>
            </div>
          </div> :
          <h2>You are in read-only mode</h2>
      }
    </Col>
  );
}

export default Settings;