import './styles/UserModal.css';
import { useState, useEffect} from 'react';
import axios from 'axios';

function UserModalEdit({userName, userLastName, onClose}) {
    const [firstName, setFirstName] = useState(''); 
    const [lastName, setLastName] = useState(''); 
    useEffect(() => {
    setFirstName(userName);
    setLastName(userLastName);
    }, [userName, userLastName]);
    const id = localStorage.getItem("userId");
    
  const editarDatos = async () => {
    const confirmar = window.confirm("¿Seguro que querés guardar los cambios?");
    if (!confirmar) return; 

    try {
      await axios.post(`http://localhost:3000/users/editUser/?firstName=${firstName}&lastName=${lastName}&id_usuario=${id}`);
      localStorage.setItem("userName", firstName);
      localStorage.setItem("userLastName", lastName);
      alert("Datos actualizados");
      window.location.reload(); 
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" >
        <h2>Editar usuario</h2>
        <p>Nombre: <input onChange={(e) => setFirstName(e.target.value)} value={firstName} /></p>
        <p>Apellido: <input onChange={(e) => setLastName(e.target.value)} value={lastName} /></p>
        <button className="btn-guardar" onClick={editarDatos}>Guardar</button>
        <button style={{backgroundColor: 'red'}} onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
}

export default UserModalEdit;
