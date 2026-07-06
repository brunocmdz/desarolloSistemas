import React, { useState } from 'react';
import '../components/styles/NotificationInputModal.css';

/*
  NotificationInputModal
  - Modal para crear una nueva notificación para un usuario específico
  - Inputs: título y contenido
  - Guarda en variables locales y permite enviar
*/
function NotificationInputModal({ userId, userName, onClose, onSend }) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!title.trim() || !message.trim()) {
      alert('Por favor completá título y mensaje');
      return;
    }
    // Llamar callback con los datos
    onSend({ userId, title, message });
  };

  return (
    <div className="notification-modal-overlay" onClick={onClose}>
      <div className="notification-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="notification-modal-header">
          <h3>Enviar Notificación</h3>
          <button className="notification-modal-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="notification-modal-body">
          <p className="notification-target-user">Usuario: <strong>{userName}</strong> (ID: {userId})</p>
          
          <div className="notification-field">
            <label htmlFor="notif-title">Título</label>
            <input
              id="notif-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ingresá el título de la notificación"
            />
          </div>

          <div className="notification-field">
            <label htmlFor="notif-message">Contenido</label>
            <textarea
              id="notif-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ingresá el contenido de la notificación"
              rows={5}
            />
          </div>
        </div>

        <div className="notification-modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSend}>Enviar</button>
        </div>
      </div>
    </div>
  );
}

export default NotificationInputModal;
