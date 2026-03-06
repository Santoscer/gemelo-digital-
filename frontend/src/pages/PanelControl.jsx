import { useEffect, useRef, useState } from "react"
import "../styles/panel_control.css"

// ─── CAMBIO: URL centralizada ────────────────────────────────────────────────
const API = "http://localhost:8000"

function PanelControl() {

  const mapRef = useRef(null)
  const mapObj = useRef(null)
  const heatmapObj = useRef(null)
  const horaSimulada = useRef(0)
  const ambulanciaMarkers = useRef({})
  const heatmapActivo = useRef(true)

  const [hora, setHora] = useState("")
  const [riesgo, setRiesgo] = useState("")
  const [cantidad, setCantidad] = useState("")
  const [total, setTotal] = useState("")

  // ─── CAMBIO: lista de ambulancias como state para render correcto ─────────
  // Bug anterior: se manipulaba el DOM directamente con lista.innerHTML
  // dentro de un componente React, lo cual genera conflictos con el virtual DOM.
  const [ambulancias, setAmbulancias] = useState([])

  useEffect(() => {
    document.body.classList.add("control")
    return () => document.body.classList.remove("control")
  }, [])

  // ─── CAMBIO: cargar Google Maps sin duplicar script ───────────────────────
  useEffect(() => {
    if (window.google && window.google.maps) {
      initMap()
      return
    }
    if (document.getElementById("gmap-script")) {
      document.getElementById("gmap-script").addEventListener("load", initMap)
      return
    }
    const script = document.createElement("script")
    script.id = "gmap-script"
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDDw8L-waHF1HsTWJvCHjgaPGv5DPzrbJI&libraries=visualization`
    script.async = true
    script.defer = true
    script.onload = initMap
    document.body.appendChild(script)
  }, [])

  function initMap() {
    mapObj.current = new window.google.maps.Map(mapRef.current, {
      zoom: 12,
      center: { lat: 4.6097, lng: -74.0817 }
    })

    simularHora()
    setInterval(simularHora, 10000)
    setInterval(actualizarAmbulancias, 2000)
    setInterval(actualizarMetricas, 3000)
    actualizarAmbulancias()
    actualizarMetricas()
  }

  function simularHora() {
    horaSimulada.current = (horaSimulada.current + 1) % 24
    setHora(horaSimulada.current + ":00")

    fetch(`${API}/api/incidentes?hora=${horaSimulada.current}`)
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) return
        if (heatmapObj.current) heatmapObj.current.setMap(null)
        heatmapObj.current = new window.google.maps.visualization.HeatmapLayer({
          data: data.map(p => new window.google.maps.LatLng(p[0], p[1])),
          radius: 25
        })
        if (heatmapActivo.current) heatmapObj.current.setMap(mapObj.current)
      })

    fetch(`${API}/api/riesgo/${horaSimulada.current}`)
      .then(r => r.json())
      .then(info => {
        if (!info) return
        setRiesgo(info.nivel)
        setCantidad(info.cantidad)
      })
  }

  function toggleHeatmap() {
    heatmapActivo.current = !heatmapActivo.current
    if (!heatmapActivo.current && heatmapObj.current) heatmapObj.current.setMap(null)
    if (heatmapActivo.current && heatmapObj.current) heatmapObj.current.setMap(mapObj.current)
  }

  function obtenerIcono(est) {
    let color = "verde"
    if (est === "EN_RUTA") color = "amarilla"
    if (est === "FUERA_SERVICIO") color = "roja"
    return {
      url: `/icons/ambulancia_${color}.png`,
      scaledSize: new window.google.maps.Size(28, 35)
    }
  }

  // ─── CAMBIO: actualizarAmbulancias usa setAmbulancias en vez de innerHTML ─
  function actualizarAmbulancias() {
    fetch(`${API}/api/ambulancias`)
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) return

        // Actualizar o crear markers en el mapa
        data.forEach(a => {
          if (ambulanciaMarkers.current[a.id]) {
            ambulanciaMarkers.current[a.id].setPosition({ lat: a.lat, lng: a.lng })
            ambulanciaMarkers.current[a.id].setIcon(obtenerIcono(a.estado))
          } else {
            const infoWindow = new window.google.maps.InfoWindow()
            const marker = new window.google.maps.Marker({
              position: { lat: a.lat, lng: a.lng },
              map: mapObj.current,
              icon: obtenerIcono(a.estado),
              title: a.placa
            })
            marker.addListener("mouseover", () => {
              infoWindow.setContent(`
                <div style="color:black">
                  <b>${a.placa}</b><br>
                  Estado: ${a.estado}<br>
                  Lat: ${a.lat.toFixed(4)}<br>
                  Lng: ${a.lng.toFixed(4)}
                </div>
              `)
              infoWindow.open(mapObj.current, marker)
            })
            marker.addListener("mouseout", () => infoWindow.close())
            ambulanciaMarkers.current[a.id] = marker
          }
        })

        // Actualizar state para re-render de la lista
        setAmbulancias(data)
      })
  }

  function generarEmergencia() {
    fetch(`${API}/api/generar`, { method: "POST" })
      .then(r => r.json())
      .then(data => {
        console.log("Emergencia generada:", data)
        actualizarAmbulancias()
      })
      .catch(err => console.error("Error generando emergencia:", err))
  }

  function actualizarMetricas() {
    fetch(`${API}/api/metricas`)
      .then(r => r.json())
      .then(data => {
        if (!data) return
        setTotal(data.total)
      })
  }

  function colorRiesgo(nivel) {
    if (nivel === "BAJO") return "#22c55e"
    if (nivel === "MEDIO") return "#facc15"
    if (nivel === "ALTO") return "#ef4444"
    return "white"
  }

  // Colores de fondo para cada estado de ambulancia
  function coloresAmbulancia(estado) {
    if (estado === "EN_RUTA") return { bg: "#92400e", punto: "#facc15" }
    if (estado === "FUERA_SERVICIO") return { bg: "#7f1d1d", punto: "#ef4444" }
    return { bg: "#0f6d4a", punto: "#22c55e" }
  }

  return (
    <main className="panel">

      <header className="panel__header">
        <h1 className="panel__title">PANEL DE CONTROL</h1>
      </header>

      <section className="panel__body">
        <div className="content-grid">

          <div className="map-container">
            <div ref={mapRef} id="map"></div>
          </div>

          <aside className="ambulancias-panel">

            <div className="ambulancias-header">Centro de Control</div>

            <div className="control-info">

              <div className="metricas">
                <div className="metrica">
                  <span className="label">Hora simulada</span>
                  <span className="valor">{hora}</span>
                </div>
                <div className="metrica">
                  <span className="label">Nivel de riesgo</span>
                  <span className="valor" style={{ color: colorRiesgo(riesgo), fontWeight: "bold" }}>
                    {riesgo}
                  </span>
                </div>
                <div className="metrica">
                  <span className="label">Accidentes históricos</span>
                  <span className="valor">{cantidad}</span>
                </div>
              </div>

              <div className="acciones">
                <button onClick={toggleHeatmap} className="boton heat">Heatmap</button>
                <button onClick={generarEmergencia} className="boton alerta">Generar Emergencia</button>
              </div>

              <hr style={{ margin: "20px 0" }} />

              <h3>Ambulancias</h3>

              {/* ─── CAMBIO: lista renderizada en JSX, no con innerHTML ─── */}
              <div>
                {ambulancias.map(a => {
                  const { bg, punto } = coloresAmbulancia(a.estado)
                  return (
                    <div key={a.id} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      margin: "8px 0",
                      padding: "14px",
                      background: bg,
                      borderRadius: "12px",
                      fontWeight: "bold",
                      color: "white"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                          width: "12px", height: "12px",
                          borderRadius: "50%",
                          background: punto,
                          boxShadow: `0 0 10px ${punto}`
                        }}></div>
                        <span>{a.placa}</span>
                      </div>
                      <span style={{ fontSize: "13px" }}>{a.estado}</span>
                    </div>
                  )
                })}
              </div>

              <hr style={{ margin: "20px 0" }} />

              <h3>Servicios</h3>
              <p>Total servicios: <span>{total}</span></p>

            </div>
          </aside>

        </div>
      </section>

    </main>
  )
}

export default PanelControl
