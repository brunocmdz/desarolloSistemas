import './styles/home.css';
import img from '../assets/gymfoto.jpg'

function HomePublic({ onRegisterClick }) {
    return (
        <div className="home-public-root">
            <section className="hero">
                <div className="hero-text">
                    <div className="card-red">
                        <h3>¡Transformá tu rutina con GYM APP!</h3>
                        <p>
                            Accedé a entrenamientos personalizados, seguí tu progreso en tiempo real y alcanzá tus objetivos fitness desde cualquier lugar.
                            Desde rutinas de fuerza y musculación hasta cardio y planes de nutrición, todo en una sola plataforma diseñada para potenciar tu rendimiento.
                        </p>
                        <p>
                            Sumate hoy a la comunidad de personas que decidieron cambiar su estilo de vida y llevá tu entrenamiento al siguiente nivel.
                        </p>
                    </div>
                </div>
                <div className="hero-image">
                    <img src={img} alt="hero" />
                </div>
            </section>

            <section className="cta">
                <div className="cta-inner">
                    <div className="cta-content">
                        <p className="cta-text">
                            Con una interfaz moderna, seguimiento de resultados y desafíos motivadores, GYM APP te acompaña en cada repetición para que entrenes de
                            manera más inteligente y efectiva. Sumate hoy a la comunidad de personas que decidieron cambiar su estilo de vida y llevá tu entrenamiento al siguiente nivel.
                        </p>
                        <button className="cta-btn" onClick={onRegisterClick}>REGISTRATE</button>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default HomePublic;