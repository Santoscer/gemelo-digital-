import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import "../styles/panel_ambulancia.css"

// ─── CAMBIO: URL centralizada del backend ───────────────────────────────────
const API = "http://localhost:8000"

function PanelAmbulancia() {

  const { id } = useParams()
  const idAmbulancia = parseInt(id)

  const mapRef = useRef(null)
  const mapObj = useRef(null)
  const markerObj = useRef(null)
  const directionsService = useRef(null)
  const directionsRenderer = useRef(null)
  const heatmapObj = useRef(null)

  // ─── CAMBIO: Todos los valores usados en setInterval/callbacks van en refs ──
  // En React, los closures dentro de setInterval capturan el valor INICIAL
  // del state y nunca lo actualizan. Los refs sí se actualizan en tiempo real.
  const horaActual = useRef(0)
  const heatmapActivo = useRef(false)
  const rutaActiva = useRef(false)
  const estadoRef = useRef("DISPONIBLE")   // espejo de 'estado' para closures
  const destinoRef = useRef("ACCIDENTE")   // "ACCIDENTE" | "HOSPITAL"

  const [hora, setHora] = useState("")
  const [riesgo, setRiesgo] = useState("")
  const [cantidad, setCantidad] = useState("")
  const [estado, setEstado] = useState("DISPONIBLE")
  const [mostrarSelector, setMostrarSelector] = useState(false)

  // ─── CAMBIO: Función centralizada para cambiar estado ────────────────────
  // Actualiza tanto el ref (para closures) como el state (para el render)
  function cambiarEstado(nuevoEstado) {
    estadoRef.current = nuevoEstado
    setEstado(nuevoEstado)
  }

  // ─── sin cambios: añadir clase body ──────────────────────────────────────
  useEffect(() => {
    document.body.classList.add("ambulancia")
    return () => document.body.classList.remove("ambulancia")
  }, [])

  // ─── CAMBIO: cargar Google Maps sin duplicar el script ───────────────────
  useEffect(() => {
    if (window.google && window.google.maps) {
      initMap()
      return
    }
    // Si ya existe el script (ej. hot-reload), solo esperar el load
    if (document.getElementById("gmap-script")) {
      document.getElementById("gmap-script").addEventListener("load", initMap)
      return
    }
    const script = document.createElement("script")
    script.id = "gmap-script"
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDDw8L-waHF1HsTWJvCHjgaPGv5DPzrbJI&libraries=visualization`
    script.async = true
    script.onload = initMap
    document.body.appendChild(script)
  }, [])

  // ─── sin cambios: icono por estado ───────────────────────────────────────
  function obtenerIcono(est) {
    let color = "verde"
    if (est === "EN_RUTA") color = "amarilla"
    if (est === "FUERA_SERVICIO") color = "roja"
    return {
      url: `/icons/ambulancia_${color}.png`,
      scaledSize: new window.google.maps.Size(28, 35)
    }
  }

  // ─── sin cambios: initMap ─────────────────────────────────────────────────
  function initMap() {
    mapObj.current = new window.google.maps.Map(mapRef.current, {
      zoom: 13,
      center: { lat: 4.6097, lng: -74.0817 }
    })

    directionsService.current = new window.google.maps.DirectionsService()
    directionsRenderer.current = new window.google.maps.DirectionsRenderer()
    directionsRenderer.current.setMap(mapObj.current)

    fetch(`${API}/api/ambulancias`)
      .then(r => r.json())
      .then(data => {
        const amb = data.find(a => a.id === idAmbulancia)
        if (!amb) return
        markerObj.current = new window.google.maps.Marker({
          position: { lat: amb.lat, lng: amb.lng },
          map: mapObj.current,
          icon: obtenerIcono(amb.estado),
          title: amb.placa
        })
        mapObj.current.setCenter({ lat: amb.lat, lng: amb.lng })
      })

    setInterval(verificarEmergencia, 2000)
    simularHora()
  }

  function simularHora() {
    actualizarInfo()
    setInterval(() => {
      horaActual.current = (horaActual.current + 1) % 24
      actualizarInfo()
      if (heatmapActivo.current) cargarHeatmap()
    }, 10000)
  }

  function cargarHeatmap() {
    fetch(`${API}/api/incidentes?hora=${horaActual.current}`)
      .then(r => r.json())
      .then(data => {
        if (heatmapObj.current) heatmapObj.current.setMap(null)
        heatmapObj.current = new window.google.maps.visualization.HeatmapLayer({
          data: data.map(p => new window.google.maps.LatLng(p[0], p[1])),
          radius: 25
        })
        heatmapObj.current.setMap(mapObj.current)
      })
  }

  function toggleHeatmap() {
    heatmapActivo.current = !heatmapActivo.current
    if (heatmapActivo.current) {
      cargarHeatmap()
    } else {
      if (heatmapObj.current) heatmapObj.current.setMap(null)
    }
  }

  // ─── CAMBIO CRÍTICO: verificarEmergencia usa estadoRef, no state ─────────
  // Bug anterior: el setInterval capturaba estado="DISPONIBLE" para siempre,
  // nunca veía los cambios. Ahora lee estadoRef.current que sí se actualiza.
  function verificarEmergencia() {
    if (rutaActiva.current) return
    if (estadoRef.current !== "DISPONIBLE") return

    fetch(`${API}/api/emergencia/${idAmbulancia}`)
      .then(r => r.json())
      .then(data => {
        if (!data.activa) return
        rutaActiva.current = true
        destinoRef.current = "ACCIDENTE"
        cambiarEstado("EN_RUTA")
        calcularRuta(data.lat, data.lng)
      })
  }

  function calcularRuta(latDestino, lngDestino) {
    if (!markerObj.current) return
    directionsService.current.route({
      origin: markerObj.current.getPosition(),
      destination: { lat: latDestino, lng: lngDestino },
      travelMode: window.google.maps.TravelMode.DRIVING,
      drivingOptions: {
        departureTime: new Date(),
        trafficModel: "bestguess"
      }
    }, (result, status) => {
      if (status === "OK") {
        directionsRenderer.current.setDirections(result)
        animarRuta(result.routes[0].overview_path)
      }
    })
  }

  // ─── CAMBIO CRÍTICO: animarRuta ───────────────────────────────────────────
  // Bug anterior: usaba `mostrarSelector` (state) dentro del setInterval.
  // Como es un closure, siempre leía false (el valor inicial).
  // Por eso NUNCA detectaba que había llegado al accidente primero.
  //
  // Solución: capturar destinoRef.current en una variable local ANTES del
  // intervalo. Así el interval usa esa captura local, no el state de React.
function animarRuta(ruta) {
  let step = 0
  const eraAccidente = destinoRef.current === "ACCIDENTE"

  const intervalo = setInterval(() => {
    if (step < ruta.length) {
      markerObj.current.setPosition(ruta[step])
      fetch(`${API}/api/update/${idAmbulancia}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: ruta[step].lat(),
          lng: ruta[step].lng(),
          estado: "EN_RUTA"
        })
      })
      step++
    } else {
      clearInterval(intervalo)
      rutaActiva.current = false

      if (eraAccidente) {
        // 🚑 Llegó al accidente → avisar backend + semáforo rojo + botones
        fetch(`${API}/api/update/${idAmbulancia}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lat: ruta[ruta.length - 1].lat(),
            lng: ruta[ruta.length - 1].lng(),
            estado: "FUERA_SERVICIO"
          })
        })
        cambiarEstado("FUERA_SERVICIO")
        setMostrarSelector(true)
      } else {
        // 🏥 Llegó al hospital → finalizar servicio y volver a disponible
        fetch(`${API}/api/finalizar/${idAmbulancia}?hora=${horaActual.current}`, {
          method: "POST"
        })
        cambiarEstado("DISPONIBLE")
        setMostrarSelector(false)
        directionsRenderer.current.setMap(null)
        directionsRenderer.current = new window.google.maps.DirectionsRenderer()
        directionsRenderer.current.setMap(mapObj.current)
        if (markerObj.current) {
          markerObj.current.setIcon(obtenerIcono("DISPONIBLE"))
        }
      }
    }
  }, 50)
}

  // ─── CAMBIO: irHospital ahora setea destinoRef antes de calcularRuta ─────
  // Bug anterior: no seteaba destinoRef, entonces animarRuta creía que iba
  // al accidente de nuevo y mostraba el selector otra vez.
  function irHospital(nivel) {
    if (!markerObj.current) return
    const pos = markerObj.current.getPosition()

    fetch(`${API}/api/hospital/${nivel}?lat=${pos.lat()}&lng=${pos.lng()}`)
      .then(r => r.json())
      .then(hospital => {
        if (!hospital || hospital.error) {
          alert(hospital?.error || "No se encontró hospital disponible")
          return
        }
        setMostrarSelector(false)
        destinoRef.current = "HOSPITAL"   // ← CRÍTICO: marcar que va al hospital
        rutaActiva.current = true
        cambiarEstado("EN_RUTA")
        calcularRuta(hospital.lat, hospital.lng)
      })
      .catch(() => alert("Error al consultar el hospital"))
  }

  function actualizarInfo() {
    fetch(`${API}/api/riesgo/${horaActual.current}`)
      .then(r => r.json())
      .then(info => {
        setHora(horaActual.current + ":00")
        setRiesgo(info.nivel)
        setCantidad(info.cantidad)
      })
  }

  function colorRiesgo(nivel) {
    if (nivel === "BAJO") return "#22c55e"
    if (nivel === "MEDIO") return "#facc15"
    if (nivel === "ALTO") return "#ef4444"
    return "white"
  }

  return (
    <main>
      <header className="header">PANEL DE AMBULANCIA</header>

      <div className="container">

        <div className="map-card">
          <div ref={mapRef} id="map"></div>
        </div>

        <aside className="panel">

          <h2 className="panel-title">Centro Ambulancia</h2>

          <div className="info-box">
            <span>Hora simulada</span>
            <span>{hora}</span>
          </div>

          <div className="info-box">
            <span>Nivel de riesgo</span>
            <span style={{ color: colorRiesgo(riesgo), fontWeight: "bold" }}>
              {riesgo}
            </span>
          </div>

          <div className="info-box">
            <span>Accidentes históricos</span>
            <span>{cantidad}</span>
          </div>

          <button onClick={toggleHeatmap} className="btn-blue">
            Heatmap
          </button>

          <hr />

          <h3>Estado</h3>

          <div className="semaforo">
            <div className={`luz verde ${estado === "DISPONIBLE" ? "activa" : ""}`}></div>
            <div className={`luz amarillo ${estado === "EN_RUTA" ? "activa" : ""}`}></div>
            <div className={`luz rojo ${estado === "FUERA_SERVICIO" ? "activa" : ""}`}></div>
          </div>

          {/* ─── CAMBIO: selector de nivel con estilos de la clase .niveles ── */}
          {mostrarSelector && (
            <div>
              <h3 style={{ textAlign: "center", marginBottom: "8px" }}>
                Nivel de complejidad
              </h3>
              <div className="niveles">
                <button onClick={() => irHospital(1)} className="nivel n1">1</button>
                <button onClick={() => irHospital(2)} className="nivel n2">2</button>
                <button onClick={() => irHospital(3)} className="nivel n3">3</button>
              </div>
            </div>
          )}

        </aside>

      </div>
    </main>
  )
}

export default PanelAmbulancia
