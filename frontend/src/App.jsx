import { BrowserRouter, Routes, Route } from "react-router-dom"
import Inicio from "./pages/Inicio"
import PanelControl from "./pages/PanelControl"
import PanelAmbulancia from "./pages/PanelAmbulancia"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/control" element={<PanelControl />} />
        {/* ─── CAMBIO: ruta con :id obligatorio ─── */}
        <Route path="/ambulancia/:id" element={<PanelAmbulancia />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
