import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/client";
import AlertMessage from "../components/AlertMessage";

function formatDateArgentina(dateString) {
    if (!dateString) return "Sin conexión";

    return new Date(dateString).toLocaleString("es-AR", {
        timeZone: "America/Argentina/Cordoba",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function Screens() {
    const [screens, setScreens] = useState([]);
    const [playlists, setPlaylists] = useState([]);

    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [deviceId, setDeviceId] = useState("");
    const [playlistId, setPlaylistId] = useState("");

    const [alert, setAlert] = useState({
        type: "",
        message: "",
    });

    const [selectedPlaylists, setSelectedPlaylists] = useState({});

    async function loadData() {
        const [screensRes, playlistsRes] = await Promise.all([
            api.get("/screens"),
            api.get("/playlists"),
        ]);

        setScreens(screensRes.data);
        setPlaylists(playlistsRes.data);

        const initialSelected = {};

        screensRes.data.forEach((screen) => {
            initialSelected[screen.id] = screen.playlist_id || "";
        });

        setSelectedPlaylists(initialSelected);
    }

    async function handleUpdatePlaylist(screenId) {
        const playlist_id = selectedPlaylists[screenId];

        if (!playlist_id) {
            setAlert({
                type: "warning",
                message: "Seleccioná una playlist antes de actualizar.",
            });

            return;
        }

        try {
            await api.patch(`/screens/${screenId}/assign-playlist`, {
                playlist_id,
            });

            setAlert({
                type: "success",
                message: "Playlist actualizada correctamente.",
            });

            loadData();
        } catch (error) {
            setAlert({
                type: "error",
                message:
                    error.response?.data?.message ||
                    "Error actualizando playlist de la pantalla.",
            });
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();

        if (!name || !deviceId) {
            setAlert({
                type: "warning",
                message: "Nombre y Device ID son obligatorios.",
            });

            return;
        }

        try {
            await api.post("/screens", {
                name,
                location,
                device_id: deviceId,
                playlist_id: playlistId || null,
            });

            setName("");
            setLocation("");
            setDeviceId("");
            setPlaylistId("");

            setAlert({
                type: "success",
                message: "Pantalla creada correctamente.",
            });

            loadData();
        } catch (error) {
            setAlert({
                type: "error",
                message: error.response?.data?.message || "Error creando pantalla.",
            });
        }
    }

    return (
        <Layout>
            <h1>Pantallas</h1>

            <p>
                Registrá televisores o Raspberry Pi y asignales playlists.
            </p>

            <AlertMessage
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert({ type: "", message: "" })}
            />

            <div style={containerStyle}>
                <form onSubmit={handleSubmit} style={formStyle}>
                    <h2>Nueva pantalla</h2>

                    <label>Nombre</label>

                    <input
                        style={inputStyle}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej: Entrada principal"
                    />

                    <label>Ubicación</label>

                    <input
                        style={inputStyle}
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Ej: Hall central"
                    />

                    <label>Device ID</label>

                    <input
                        style={inputStyle}
                        value={deviceId}
                        onChange={(e) => setDeviceId(e.target.value)}
                        placeholder="Ej: entrada-principal"
                    />

                    <label>Playlist</label>

                    <select
                        style={inputStyle}
                        value={playlistId}
                        onChange={(e) => setPlaylistId(e.target.value)}
                    >
                        <option value="">Sin playlist</option>

                        {playlists.map((playlist) => (
                            <option key={playlist.id} value={playlist.id}>
                                {playlist.name}
                            </option>
                        ))}
                    </select>

                    <button style={buttonStyle}>
                        Registrar pantalla
                    </button>
                </form>

                <div style={listStyle}>
                    <h2>Pantallas registradas</h2>

                    {screens.map((screen) => (
                        <div key={screen.id} style={cardStyle}>
                            <h3>{screen.name}</h3>

                            <p>
                                <strong>Ubicación:</strong> {screen.location}
                            </p>

                            <p>
                                <strong>Device ID:</strong> {screen.device_id}
                            </p>

                            <p>
                                <strong>Playlist:</strong>{" "}
                                {screen.playlists?.name || "Sin playlist"}
                            </p>

                            <label>
                                <strong>Cambiar playlist</strong>
                            </label>

                            <select
                                style={inputStyle}
                                value={selectedPlaylists[screen.id] || ""}
                                onChange={(e) =>
                                    setSelectedPlaylists({
                                        ...selectedPlaylists,
                                        [screen.id]: e.target.value,
                                    })
                                }
                            >
                                <option value="">Seleccionar playlist</option>

                                {playlists.map((playlist) => (
                                    <option key={playlist.id} value={playlist.id}>
                                        {playlist.name}
                                    </option>
                                ))}
                            </select>

                            <button
                                onClick={() => handleUpdatePlaylist(screen.id)}
                                style={{
                                    width: "100%",
                                    padding: 10,
                                    background: "var(--color-primary)",
                                    color: "white",
                                    border: "none",
                                    borderRadius: 8,
                                    fontWeight: "bold",
                                    marginBottom: 12,
                                }}
                            >
                                Actualizar playlist
                            </button>

                            <p>
                                <strong>Última conexión:</strong>{" "}
                                {formatDateArgentina(screen.last_connection)}
                            </p>

                            <p>
                                <strong>URL Player:</strong>
                            </p>

                            <code
                                style={{
                                    display: "block",
                                    background: "#f3f4f6",
                                    padding: 10,
                                    borderRadius: 8,
                                    overflowWrap: "break-word",
                                }}
                            >
                                http://IP-SERVIDOR/player?deviceId={screen.device_id}
                            </code>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
}

const containerStyle = {
    display: "grid",
    gridTemplateColumns: "350px 1fr",
    gap: 30,
    alignItems: "start",
};

const formStyle = {
    background: "white",
    padding: 24,
    borderRadius: 14,
    border: "1px solid var(--color-border)",
    boxShadow: "var(--shadow)",
};

const listStyle = {
    display: "grid",
    gap: 16,
};

const cardStyle = {
    background: "white",
    border: "1px solid var(--color-border)",
    borderRadius: 14,
    padding: 18,
    boxShadow: "var(--shadow)",
};

const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: 12,
    marginTop: 6,
    marginBottom: 14,
    border: "1px solid var(--color-border)",
    borderRadius: 10,
};

const buttonStyle = {
    width: "100%",
    padding: 13,
    background: "var(--color-primary)",
    color: "white",
    border: "none",
    borderRadius: 10,
    fontWeight: "bold",
};