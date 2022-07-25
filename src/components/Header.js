import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../images/logo__image.svg';

function Header({ email, loggedIn, onSignOut }) {
  const { pathname } = useLocation();

  return (
    <header className="header">
      <a className="logo" href="#">
      <img className="logo__image" src={logo} alt="логотип Mesto"/>
      </a>
      <div className='header__userbar'>
        <p className='header__email'>{email}</p>
        { loggedIn ?
          (<Link
            to="/"
            className="header__link"
            onClick={onSignOut}>Выйти</Link>
          ) : ('')
        }
        { pathname === '/sign-in' ?
          (<Link
            to='/sign-up'
            className="header__link">Регистрация</Link>
          ) : ('')
        }
        { pathname === '/sign-up' ?
          (<Link
            to='/sign-in'
            className="header__link">Войти</Link>
          ) : ('')
        }
      </div>
    </header>
  );
}

export default Header;
