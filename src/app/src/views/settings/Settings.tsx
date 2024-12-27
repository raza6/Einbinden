import React, { ReactNode, useContext, useEffect, useState } from 'react';
import { Badge, Button, Col, Image, InputGroup } from 'react-bootstrap';
import './Settings.scss';
import { GenProps } from '../../types/generic';
import { User, EAuthOrigin } from '../../types/user';
import AuthContext from '../../components/AuthContext';
import AuthService from '../../services/authService';
import { FiLock, FiPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import TagService from '../../services/tagService';
import { AiOutlineClose } from 'react-icons/ai';

function Settings(props: GenProps) {
  // State
  const [user, setUser] = useState<User | undefined>(undefined);
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState<Array<string>>([]);

  // Circumstancial
  const loggedIn = useContext(AuthContext);

  const initUser = async () => {
    const authResult = await AuthService.checkAuth();
    if (authResult.success) {
      setUser(authResult.user);
      const tags = await TagService.getTags();
      setTags(tags);
    }
  };

  useEffect(() => {
    initUser();
    props.pageName('Paramètres');
  }, []);

  const handleTagSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newTag && !tags.includes(newTag)) {
      const res = await TagService.addTag(newTag);
      if (res) {
        setTags([...tags, newTag]);
        setNewTag('');
      }
    }
  };
  
  const handleTagInput = (e: React.FormEvent<HTMLInputElement>) => {
    setNewTag(e.currentTarget.value);
  };

  const handleTagDelete = async (tag: string) => {
    const res = await TagService.deleteTag(tag);
    if (res) {
      setTags(tags.filter(t => t !== tag));
    }
  };

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
          <div id="loggedWrapper">
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
            </div>
            <div id="tagWrapper">
              <h2>Your tags :</h2>
              <Form className="m-3" onSubmit={handleTagSubmit}>
                <InputGroup id="isbnWrapper">
                  <Form.Control
                    type="text" maxLength={64} placeholder="New tag" onInput={handleTagInput} value={newTag}
                  />
                  <Button variant="outline-secondary" id="bookSearchInput" type="submit">
                    <FiPlus />
                  </Button>
                </InputGroup>
              </Form>
              <ul>
                {tags.map(tag => <li key={tag}>
                  <Badge bg="secondary">{tag} <AiOutlineClose onClick={() => handleTagDelete(tag)}/></Badge>
                </li>)}
              </ul>
            </div>
          </div>
          :
          <h2>You are in read-only mode</h2>
      }
    </Col>
  );
}

export default Settings;