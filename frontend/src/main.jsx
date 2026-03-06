import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

/* ─── CAMBIO: se eliminó StrictMode ─────────────────────────────────────────
   StrictMode ejecuta los efectos DOS VECES en desarrollo, lo que provoca
   que Google Maps se inicialice dos veces y genere errores de "mapa ya
   renderizado" y setIntervals duplicados.                               ───── */
createRoot(document.getElementById('root')).render(
  <App />
)
