import './styles/Register.css';
import axios from 'axios';
import { useState } from 'react';
export default function Register() {
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState(''); 
  const [firstName, setFirstName] = useState(''); 
  const [lastName, setLastName] = useState(''); 
  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [goal, setGoal] = useState('');
  const [message, setMessage] = useState('');

  const register = async (event) => {
      event.preventDefault();
      try {
        await axios.post('http://localhost:3000/users/regist', {
          email, password, firstName, lastName,
          weightKg: weightKg === '' ? null : Number(weightKg),
          heightCm: heightCm === '' ? null : Number(heightCm),
          goal
        });
        setMessage('Cuenta creada. Ya puedes iniciar sesión.');
      }
      catch (error){
        setMessage(error.response?.data?.message || 'No se pudo crear la cuenta.');
      }
  }
  return (
    <div>
      {/* ===== Formulario ===== */}
      <div className="register-container">
        <h2>¡Regístrese para poder ingresar ahora!</h2>

        <form className="form-box" onSubmit={register}>
          <div className="form-row">
            <input required type="text" maxLength="80" placeholder="Nombre" onChange={(event) => setFirstName(event.target.value)}/>
            <input required type="text" maxLength="80" placeholder="Apellido" onChange={(event) => setLastName(event.target.value)}/>
          </div>
          <input required type="email" placeholder="Correo Electrónico" onChange={(event) => setEmail(event.target.value)}/>
          <input required type="password" minLength="8" placeholder="Contraseña (mínimo 8 caracteres)" onChange={(event) => setPassword(event.target.value)}/>
          <div className="form-row biometric-row">
            <label>Peso (kg)<input type="number" min="1" max="500" step="0.1" placeholder="Opcional" value={weightKg} onChange={(event) => setWeightKg(event.target.value)} /></label>
            <label>Altura (cm)<input type="number" min="50" max="300" step="0.5" placeholder="Opcional" value={heightCm} onChange={(event) => setHeightCm(event.target.value)} /></label>
          </div>
          <label className="goal-field">Objetivo<select value={goal} onChange={(event) => setGoal(event.target.value)}>
            <option value="">Selecciona un objetivo (opcional)</option>
            <option value="Ganar fuerza">Ganar fuerza</option>
            <option value="Aumentar masa muscular">Aumentar masa muscular</option>
            <option value="Perder grasa">Perder grasa</option>
            <option value="Mejorar resistencia">Mejorar resistencia</option>
            <option value="Mantenerme activo">Mantenerme activo</option>
          </select></label>
          <button type="submit">Crear cuenta</button>
          {message && <p role="status">{message}</p>}
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
