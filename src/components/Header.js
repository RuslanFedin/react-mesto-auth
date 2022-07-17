import React from 'react';
import logo from '../images/logo__image.svg';

function Header() {
  return (
    <header className="header">
      <a className="logo" href="#">
      <img className="logo__image" src={logo} alt="логотип Mesto"/>
      </a>
    </header>
  );
}

export default Header;
