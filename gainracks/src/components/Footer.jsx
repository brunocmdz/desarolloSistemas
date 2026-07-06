import './styles/Footer.css';
import facebookIcon from '../assets/facebook-icon.png';
import instagramIcon from '../assets/instagram-icon.png';
import twitterIcon from '../assets/twitter-icon.png';

function Footer() {
  return (
    <div className="container">
        <footer className="footer">
        <div className="footer-top">
            <div className="footer-social">
                <p>Seguinos en nuestras redes:</p>
                <div className="social-icons">
                    <a href="#"><img src={facebookIcon} alt="Facebook" /></a>
                    <a href="#"><img src={instagramIcon} alt="Instagram" /></a>
                    <a href="#"><img src={twitterIcon} alt="Twitter" /></a>
                </div>
            </div>
            <div className="footer-warning">
                <p>
                    DISCLAIMER: NUESTRO SISTEMA NO SE HACE CARGO DE LESIONES MEDICAS
                    IDEALMENTE SE DEBE HACER UNA DIETA” <br/>
                </p>
            </div>
        </div>
    </footer>
    </div>
  )}

export default Footer;  