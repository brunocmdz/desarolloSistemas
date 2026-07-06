import './styles/navbar.css';
import { useEffect, useState } from 'react';

function Navbar({ onRegisterClick, onLoginClick, onHomeClick, onLogoutClick, isLoggedIn, userName }) {
  return (
    <div className="container">
      <nav className='navbar'>
        <div className="brand-logo">
          <a onClick={onHomeClick} className="menu-item">GAINRACKS</a>
        </div>
        <div className='auth-buttons'>
          <div id='login_btns'>
            {isLoggedIn ? (
              <>
                <span className="estado-logeado">Hola, {userName}</span>
                <button className='menu-item' onClick={onLogoutClick} id='logout'>Cerrar sesión</button>
              </>
            ) : (
              <>
                <button className='menu-item' onClick={onLoginClick} id='login'>Iniciar Sesión</button>
                <button className='menu-item' onClick={onRegisterClick} id='register'>Registrarse</button>
              </>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
