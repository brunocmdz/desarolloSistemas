import './styles/footer.css';
import facebookIcon from '../assets/facebook-icon.png';
import instagramIcon from '../assets/instagram-icon.png';
import twitterIcon from '../assets/twitter-icon.png';

function Footer({ onNavigate, isLoggedIn }) {
  return (
        <footer className="footer">
            <div className="footer-main">
                <div className="footer-brand">
                    <button className="footer-wordmark" onClick={() => onNavigate('home')}>GAINRACKS<span>.</span></button>
                    <p>Entrená con intención.<br />Medí tu progreso.</p>
                </div>

                <nav className="footer-navigation" aria-label="Navegación del pie de página">
                    <h2>Explorar</h2>
                    {isLoggedIn ? <>
                        <button onClick={() => onNavigate('exercises')}>Ejercicios</button>
                        <button onClick={() => onNavigate('routines')}>Mis rutinas</button>
                        <button onClick={() => onNavigate('history')}>Historial</button>
                        <button onClick={() => onNavigate('profile')}>Mi perfil</button>
                    </> : <>
                        <button onClick={() => onNavigate('login')}>Iniciar sesión</button>
                        <button onClick={() => onNavigate('register')}>Crear cuenta</button>
                    </>}
                </nav>

                <div className="footer-social">
                    <h2>Comunidad</h2>
                    <p>Encontranos en redes</p>
                    <div className="social-icons">
                        <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook">
                            <img src={facebookIcon} alt="" />
                        </a>
                        <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram">
                            <img src={instagramIcon} alt="" />
                        </a>
                        <a href="https://x.com/" target="_blank" rel="noreferrer" aria-label="X">
                            <img src={twitterIcon} alt="" />
                        </a>
                    </div>
        </div>

                <aside className="footer-safety">
                    <div>
                        <h2>Entrená con cuidado</h2>
                        <p>El contenido es informativo y no reemplaza el consejo de un profesional. Si sentís dolor, detené el ejercicio.</p>
                    </div>
                </aside>
            </div>
            <div className="footer-bottom">
                <span>© {new Date().getFullYear()} GAINRACKS</span>
                <span>Fuerza, constancia y progreso.</span>
            </div>
        </footer>
    );
}

export default Footer;