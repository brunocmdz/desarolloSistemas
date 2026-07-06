import './styles/navbar.css';
import { useEffect, useState } from 'react';
import UserModal from './UserModal'; 
import NotificationsModal from './NotificationsModal';
import notificacionImg from '../assets/campana.png';

function Navbar({ onRegisterClick, onLoginClick, onHomeClick, onAdminClick }) {
  const [userName, setUserName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarNotificacionModal, setMostrarNotificacionModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem("userName");
    const lastName = localStorage.getItem("userLastName");
    const id = localStorage.getItem("userId");
    const email = localStorage.getItem("userEmail");
    const adminFlag = localStorage.getItem("isAdmin");
    if (name) setUserName(name);
    if (lastName) setLastName(lastName);
    if (id) setUserId(id);
    if (email) setUserEmail(email);
    if (adminFlag === 'true' || adminFlag === '1') setIsAdmin(true);
  }, []);

  return (
    <div className="container">
      <nav className='navbar'>
        <div className="brand-logo">
          <a onClick={onHomeClick} className="menu-item">V S M B</a>
        </div>
        <div className='auth-buttons'>
          <div id='login_btns'>
            {userName ? (
              <>
                <button onClick={() => setMostrarNotificacionModal(true)}><img className="notificacion-img" src={notificacionImg} alt="not" /></button>
                <span className="estado-logeado" onClick={() => setMostrarModal(true)}>
                   Hola, {userName} {lastName}
                </span>
                {isAdmin && (
                  <button className='menu-item' onClick={onAdminClick} id='admin'>Panel Admin</button>
                )}
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

      {mostrarModal && (
        <UserModal
          userName={userName}
          userLastName={lastName}
          userId={userId}
          userEmail={userEmail}
          onClose={() => setMostrarModal(false)}
        />
      )}
      {mostrarNotificacionModal && (
        <NotificationsModal
          onClose={() => setMostrarNotificacionModal(false)}
        />
      )}
    </div>
  );
}

export default Navbar;
