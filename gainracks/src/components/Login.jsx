import './styles/Login.css';
import { useState } from "react";
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const login = async () => {
    try {
      const response = await axios.post(`http://localhost:3000/users/login/?email=${email}&password=${password}`);

      alert("Inicio de sesión exitoso");

      const { id, firstName, lastName, isAdmin } = response.data;
      localStorage.setItem("userId", id);
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userName", firstName);
      localStorage.setItem("userLastName", lastName);
      localStorage.setItem("isAdmin", isAdmin);
      console.log("Usuario logueado:", firstName, lastName);    
      window.location.reload();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>¡Inicie sesión para poder descargar<br />el comparador ahora!</h1>
        <input type="email" placeholder="Correo electrónico" onChange={(event) => setEmail(event.target.value)} />
        <input type="password" placeholder="Contraseña" onChange={(event) => setPassword(event.target.value)} />
        <div className="checkbox">
          <label>
            <input type="checkbox" /> Recuérdame
          </label>
          <a href="#">¿Olvidé mi contraseña?</a>
        </div>
        <button className="btn-siguiente" onClick={login}>Siguiente</button>
        <div className="registro">
          <span>¿No tiene cuenta?</span>
          <a href="#" className="registrar-link">Registrar</a>
        </div>
      </div>
    </div>
  );
}

export default Login;
