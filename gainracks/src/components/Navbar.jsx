import './styles/navbar.css';

function Navbar({ onRegisterClick, onLoginClick, onHomeClick, onExercisesClick, onRoutinesClick, onHistoryClick, onProfileClick, onAdminClick, isLoggedIn, isAdmin, userName }) {
  return (
    <div className="container">
      <nav className='navbar'>
        <div className="brand-logo">
          <a onClick={onHomeClick} className="menu-item">GAINRACKS</a>
        </div>
        <div className='auth-buttons'>
          <div className="member-links">
            <button className="menu-item" onClick={onExercisesClick}>Ejercicios</button>
            {isLoggedIn && <>
              <button className="menu-item" onClick={onRoutinesClick}>Rutinas</button>
              <button className="menu-item" onClick={onHistoryClick}>Historial</button>
              <button className="menu-item" onClick={onProfileClick}>Mi perfil</button>
              {isAdmin && <button className="menu-item admin-link" onClick={onAdminClick}>Admin</button>}
            </>}
          </div>
          <div id='login_btns'>
            {isLoggedIn ? (
              <span className="estado-logeado">Hola, {userName}</span>
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
