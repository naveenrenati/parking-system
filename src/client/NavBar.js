// NavBar.js
import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = () => {
  return (
    <nav style={{ width: '200px', background: '#f0f0f0', padding: '20px', position: 'fixed', height: '100%', boxSizing: 'border-box' }}>
      <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
        <li>
          <Link to="/profile">Profile</Link>
        </li>
        <li>
          <Link to="/home">Home</Link>
        </li>
        <li>
          <Link to="/logout">Logout</Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
