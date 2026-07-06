import './styles/Register.css';
import axios from 'axios';
import { useState } from 'react';
export default function Register() {
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState(''); 
  const [firstName, setFirstName] = useState(''); 
  const [lastName, setLastName] = useState(''); 

  const register = async () => {
      try {
          const response = await axios.post(`http://localhost:3000/users/regist/?email=${email}&password=${password}&firstName=${firstName}&lastName=${lastName}`)
          alert("Usuario creado")
      }
      catch (error){
          alert(error.message)
      }
  }
  return (
    <div>
      {/* ===== Formulario ===== */}
      <div className="register-container">
        <h2>¡Regístrese para poder ingresar ahora!</h2>

        <form className="form-box">
          <div className="form-row">
            <input type="text" placeholder="Nombre" onChange={(event) => setFirstName(event.target.value)}/>
            <input type="text" placeholder="Apellido" onChange={(event) => setLastName(event.target.value)}/>
          </div>
          <input type="email" placeholder="Correo Electrónico" onChange={(event) => setEmail(event.target.value)}/>
          <input type="password" placeholder="Contraseña" onChange={(event) => setPassword(event.target.value)}/>
          <button onClick={register} type="button">Siguiente</button>
          <p className="form-terms">
            Creando una cuenta, acepta nuestra{' '}
            <a href="#">política de privacidad</a> y{' '}
            <a href="#">términos de servicio</a>.
          </p>
        </form>
      </div>

      {/* ===== Footer ===== */}
      <footer className="footer">
      </footer>
    </div>
  );
}
