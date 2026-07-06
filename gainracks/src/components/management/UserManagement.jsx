import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/AdminPanel.css';
import NotificationInputModal from '../NotificationInputModal';

/*
  UserManagement
  - Encapsula la lógica de administración de usuarios:
    * Listado de usuarios desde el backend
    * Acción para activar / desactivar usuarios
    * Enviar notificaciones a usuarios específicos
  - Comentarios: las llamadas usan el mismo header `Authorization` guardado en localStorage.
*/
function UserManagement() {
  // Estado: lista de usuarios y flags de carga/errores
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado para el modal de notificaciones
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Efecto: obtener usuarios al montar el componente
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const res = await axios.get('http://localhost:3000/users', { headers: { Authorization: userId } });
        setUsers(res.data || []);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('No se pudieron obtener los usuarios');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // toggleState: activa o desactiva un usuario.
  // - pide confirmación
  // - llama al endpoint PUT /users/state con params { id, state }
  // - actualiza la lista local con la respuesta del servidor
  const toggleState = async (u) => {
    const id = u.id_usuario || u.id;
    const current = u.state === true || u.state === 'true';
    const confirmMsg = current
      ? `Confirmá que querés DESACTIVAR al usuario ${u.email}`
      : `Confirmá que querés ACTIVAR al usuario ${u.email}`;
    if (!window.confirm(confirmMsg)) return;
    try {
      const userId = localStorage.getItem('userId');
      const res = await axios.put('http://localhost:3000/users/state', null, {
        params: { id, state: !current },
        headers: { Authorization: userId }
      });
      setUsers((prev) => prev.map((p) => (p.id_usuario === id || p.id === id ? res.data.user : p)));
      alert(res.data.message || 'Estado actualizado');
    } catch (err) {
      console.error('Error cambiando estado:', err);
      alert('No se pudo cambiar el estado');
    }
  };

  // handleSendNotification: envía una notificación a un usuario
  // - recibe { userId, title, message } del modal
  // - hace POST /notifications para guardar la notificación
  // - cierra el modal después de enviar
  const handleSendNotification = async ({ userId, title, message }) => {
    try {
      const token = localStorage.getItem('userId');
      await axios.post(
        'http://localhost:3000/notifications',
        { userId, title, message },
        { headers: { Authorization: token } }
      );
      alert('Notificación enviada correctamente');
      setShowNotificationModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Error al enviar notificación:', err);
      alert('Error al enviar notificación');
    }
  };

  if (loading) return <div>Cargando usuarios...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Gestión de Usuarios</h2>
      <table className="admin-users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Email</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
            {users.map((u) => (
            <tr key={u.id_usuario || u.id || u.id}>
              <td>{u.id_usuario || u.id}</td>
              <td>{u.firstName}</td>
              <td>{u.lastName}</td>
              <td>{u.email}</td>
              <td>{String(u.state === true || u.state === 'true' ? 'Activo' : 'Inactivo')}</td>
              <td>
                <button onClick={() => toggleState(u)}>
                  {u.state === true || u.state === 'true' ? 'Desactivar' : 'Activar'}
                </button>
                <button onClick={() => {
                  setSelectedUser(u);
                  setShowNotificationModal(true);
                }}>
                  Notificar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showNotificationModal && selectedUser && (
        <NotificationInputModal
          userId={selectedUser.id_usuario || selectedUser.id}
          userName={`${selectedUser.firstName} ${selectedUser.lastName}`}
          onClose={() => {
            setShowNotificationModal(false);
            setSelectedUser(null);
          }}
          onSend={handleSendNotification}
        />
      )}
    </div>
  );
}

export default UserManagement;
