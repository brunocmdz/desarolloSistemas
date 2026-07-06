import './styles/home.css';
import img from '../assets/imagenmuimportante.png'
function HomePublic({ onRegisterClick}) {
  return (
    <div className="container">
        <div className="card1">
        <div className="text-container">
            <p>
            Con V-S-M-B comparar archivos nunca fue tan fácil: descubrí las diferencias,
             detectá los cambios y mantené tus proyectos siempre organizados.
            Empezá ahora y dejá que V-S-M-B haga el trabajo pesado por vos.
            Tu tiempo vale, y nosotros te ayudamos a aprovecharlo al máximo.
            </p>
        </div>

        <div className="img-container">
            <div className="img"><img src={img} /></div>
        </div>
        </div>

        <div className="card2">
        <div className="container">
            <div className="text-container2">
            <p>
                ¿Tenés varios archivos parecidos y no sabés cuál es la versión más reciente o cuál cambió?
                Comparador de Archivos es la herramienta ideal para detectar diferencias entre documentos,
                carpetas o códigos de manera rápida y precisa.
                Con una interfaz simple e intuitiva, 
                la aplicación analiza el contenido línea por línea, resalta los cambios y te permite visualizar exactamente qué fue modificado,
                añadido o eliminado. Ya sea que trabajes con texto, código fuente, reportes o archivos de configuración,
                podrás ahorrar tiempo y evitar errores al comparar versiones.
            </p>
            </div>
            <button onClick={onRegisterClick}> Descargar </button>
        </div>
        </div>
    </div>
  )}

export default HomePublic;  