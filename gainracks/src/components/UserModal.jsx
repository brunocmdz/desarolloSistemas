import './styles/UserModal.css';
import UserModalEdit from './UserModalEdit';
import { useState } from 'react';

function UserModal({ userName, userLastName, userEmail, onClose }) {
  const [modo, setModo] = useState("ver"); // "ver" o "editar"

  const cerrarSesion = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userLastName");
    localStorage.removeItem("userEmail");
    window.location.reload();
  };

  return (
    <>
      {modo === "ver" && (
        <div className="modal-overlay" onClick={onClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Datos del usuario</h2>
            <p><strong>Nombre:</strong> {userName}</p>
            <p><strong>Apellido:</strong> {userLastName}</p>
            <p><strong>Email:</strong> {userEmail}</p>
            <button className="btn-editar" onClick={() => setModo("editar")}>Editar</button>
            <button className="btn-cerrar-sesion" onClick={cerrarSesion}>Cerrar sesión</button>
          </div>
        </div>
      )}

      {modo === "editar" && (
        <UserModalEdit
          userName={userName}
          userLastName={userLastName}
          userEmail={userEmail}
          onClose={() => setModo("ver")}
        />
      )}
    </>
  );
}

export default UserModal;
