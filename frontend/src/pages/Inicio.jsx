import { useEffect } from "react"
import { Link } from "react-router-dom"
import "../styles/inicio.css"

function Inicio() {

  useEffect(() => {
    document.body.classList.add("inicio")
    return () => document.body.classList.remove("inicio")
  }, [])

  return (
    <main className="inicio-container">

      <header>
        <h1>SISTEMA DE GESTIÓN DE ACCIDENTES</h1>
        <p>Selecciona el panel de control al cual deseas acceder</p>
      </header>

      <section className="cards">

        <article className="card red">
          <div className="icon-box">
            <img src="/Imagenes/ambulancia.png" alt="Ambulancia" />
          </div>
          <h2>PANEL DE AMBULANCIA</h2>
          <p>Auxilia a un paciente con nosotros</p>
          {/* ─── CAMBIO: link con ID de ambulancia (antes iba a /ambulancia sin id) */}
          <Link to="/ambulancia/1">
            <button>ACCEDER</button>
          </Link>
        </article>

        <article className="card blue">
          <div className="icon-box">
            <img src="/Imagenes/centro.png" alt="Centro de control" />
          </div>
          <h2>CENTRO DE CONTROL</h2>
          <p>Monitorea las emergencias</p>
          <Link to="/control">
            <button>ACCEDER</button>
          </Link>
        </article>

      </section>

    </main>
  )
}

export default Inicio
