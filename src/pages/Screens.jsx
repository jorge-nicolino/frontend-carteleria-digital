import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/client";
import AlertMessage from "../components/AlertMessage";

function formatDateArgentina(dateString) {
    if (!dateString) return "Sin conexion";

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
    const [playlistId, setPlaylistId] = useState("");
    const [alert, setAlert] = useState({ type: "", message: "" });
    const [selectedPlaylists, setSelectedPlaylists] = useState({});
    const [screenVideoDownloads, setScreenVideoDownloads] = useState({});
    const [editingId, setEditingId] = useState(null);
    const [editScreen, setEditScreen] = useState({
        name: "",
        location: "",
        playlist_id: "",
    });

    const playerBaseUrl = import.meta.env.VITE_PLAYER_URL || window.location.origin.replace(/\/$/, "");

    async function loadData() {
        const [screensRes, playlistsRes] = await Promise.all([
            api.get("/screens"),
            api.get("/playlists"),
        ]);

        const screensData = screensRes.data;

        setScreens(screensData);
        setPlaylists(playlistsRes.data);

        const initialSelected = {};
        screensData.forEach((screen) => {
            initialSelected[screen.id] = screen.playlist_id || "";
        });
        setSelectedPlaylists(initialSelected);

        const videoDownloadEntries = await Promise.all(
            screensData.map(async (screen) => {
                if (!screen.playlist_id) {
                    return [screen.id, []];
                }

                try {
                    const { data } = await api.get(`/player/${encodeURIComponent(screen.device_id)}`);
                    const videos = (data.items || [])
                        .map((item) => item.contents)
                        .filter((content) => content?.type === "video" && /\.mp4$/i.test(content.file_name || ""))
                        .map((content) => ({
                            id: content.id,
                            title: content.title || "Video",
                            file_name: content.file_name || "",
                        }));

                    return [screen.id, videos];
                } catch {
                    return [screen.id, []];
                }
            })
        );

        setScreenVideoDownloads(Object.fromEntries(videoDownloadEntries));
    }

    useEffect(() => {
        loadData();
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();

        if (!name) {
            setAlert({ type: "warning", message: "El nombre es obligatorio." });
            return;
        }

        try {
            await api.post("/screens", {
                name,
                location,
                playlist_id: playlistId || null,
            });

            setName("");
            setLocation("");
            setPlaylistId("");
            setAlert({ type: "success", message: "Pantalla creada correctamente." });
            loadData();
        } catch (error) {
            setAlert({ type: "error", message: error.response?.data?.message || "Error creando pantalla." });
        }
    }

    async function handleUpdatePlaylist(screenId) {
        const playlist_id = selectedPlaylists[screenId];

        if (!playlist_id) {
            setAlert({ type: "warning", message: "Selecciona una playlist antes de actualizar." });
            return;
        }

        try {
            await api.patch(`/screens/${screenId}/assign-playlist`, { playlist_id });
            setAlert({ type: "success", message: "Playlist actualizada correctamente." });
            loadData();
        } catch (error) {
            setAlert({
                type: "error",
                message: error.response?.data?.message || "Error actualizando playlist de la pantalla.",
            });
        }
    }

    function startEdit(screen) {
        setEditingId(screen.id);
        setEditScreen({
            name: screen.name || "",
            location: screen.location || "",
            playlist_id: screen.playlist_id || "",
        });
    }

    async function handleUpdateScreen(e) {
        e.preventDefault();

        if (!editScreen.name) {
            setAlert({ type: "warning", message: "El nombre es obligatorio." });
            return;
        }

        try {
            await api.patch(`/screens/${editingId}`, {
                name: editScreen.name,
                location: editScreen.location,
                playlist_id: editScreen.playlist_id || null,
            });

            setEditingId(null);
            setEditScreen({ name: "", location: "", playlist_id: "" });
            setAlert({ type: "success", message: "Pantalla actualizada correctamente." });
            loadData();
        } catch (error) {
            setAlert({
                type: "error",
                message: error.response?.data?.message || "Error actualizando pantalla.",
            });
        }
    }

    async function handleDeleteScreen(screen) {
        const confirmDelete = confirm(`Seguro que queres eliminar la pantalla "${screen.name}"?`);
        if (!confirmDelete) return;

        try {
            await api.delete(`/screens/${screen.id}`);
            setAlert({ type: "success", message: "Pantalla eliminada correctamente." });
            loadData();
        } catch (error) {
            setAlert({
                type: "error",
                message: error.response?.data?.message || "Error eliminando pantalla.",
            });
        }
    }

    function getPlayerDownloadUrl(screen, videoIndex) {
        return `${playerBaseUrl}/player?deviceId=${encodeURIComponent(screen.device_id)}&download=1&video=${videoIndex + 1}`;
    }

    function getDownloadableVideos(screen) {
        return screenVideoDownloads[screen.id] || [];
    }

    return (
        <Layout>
            <h1 style={{ color: "#003366", marginBottom: 8 }}>Pantallas</h1>
            <p style={{ color: "#64748b", marginBottom: 24 }}>
                Registra televisores o Raspberry Pi y asignales playlists.
            </p>

            <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert({ type: "", message: "" })} />

            <div style={containerStyle}>
                <form onSubmit={handleSubmit} style={formStyle}>
                    <h2 style={{ color: "#003366", fontSize: 20, marginBottom: 20 }}>Nueva pantalla</h2>

                    <label>Nombre</label>
                    <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Entrada principal" />

                    <label>Ubicacion</label>
                    <input style={inputStyle} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ej: Hall central" />

                    <label>Playlist</label>
                    <select style={inputStyle} value={playlistId} onChange={(e) => setPlaylistId(e.target.value)}>
                        <option value="">Sin playlist</option>
                        {playlists.map((playlist) => (
                            <option key={playlist.id} value={playlist.id}>{playlist.name}</option>
                        ))}
                    </select>

                    <button style={buttonStyle}>Registrar pantalla</button>
                </form>

                <div style={listStyle}>
                    <h2 style={{ color: "#003366", fontSize: 20, marginBottom: 20 }}>Pantallas registradas</h2>

                    {screens.length === 0 ? (
                        <p style={{ color: "#94a3b8", textAlign: "center", padding: 40 }}>No hay pantallas registradas aun</p>
                    ) : (
                        screens.map((screen) => (
                            <div key={screen.id} style={cardStyle}>
                                {editingId === screen.id ? (
                                    <form onSubmit={handleUpdateScreen}>
                                        <label>Nombre</label>
                                        <input
                                            style={inputStyle}
                                            value={editScreen.name}
                                            onChange={(e) => setEditScreen({ ...editScreen, name: e.target.value })}
                                        />

                                        <label>Ubicacion</label>
                                        <input
                                            style={inputStyle}
                                            value={editScreen.location}
                                            onChange={(e) => setEditScreen({ ...editScreen, location: e.target.value })}
                                        />

                                        <label>Playlist</label>
                                        <select
                                            style={inputStyle}
                                            value={editScreen.playlist_id}
                                            onChange={(e) => setEditScreen({ ...editScreen, playlist_id: e.target.value })}
                                        >
                                            <option value="">Sin playlist</option>
                                            {playlists.map((playlist) => (
                                                <option key={playlist.id} value={playlist.id}>{playlist.name}</option>
                                            ))}
                                        </select>

                                        <div style={buttonRowStyle}>
                                            <button style={buttonStyle}>Guardar</button>
                                            <button
                                                type="button"
                                                onClick={() => setEditingId(null)}
                                                style={secondaryButtonStyle}
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <h3 style={{ color: "#003366", fontSize: 16, margin: "0 0 12px" }}>{screen.name}</h3>
                                        <p style={metaStyle}><strong>Ubicacion:</strong> {screen.location || <em>Sin ubicacion</em>}</p>
                                        <p style={metaStyle}><strong>Playlist:</strong> {screen.playlists?.name || <em>Sin playlist</em>}</p>

                                        <label style={labelStyle}>Cambiar playlist</label>
                                        <select
                                            style={inputStyle}
                                            value={selectedPlaylists[screen.id] || ""}
                                            onChange={(e) => setSelectedPlaylists({ ...selectedPlaylists, [screen.id]: e.target.value })}
                                        >
                                            <option value="">Seleccionar playlist</option>
                                            {playlists.map((playlist) => (
                                                <option key={playlist.id} value={playlist.id}>{playlist.name}</option>
                                            ))}
                                        </select>

                                        <button onClick={() => handleUpdatePlaylist(screen.id)} style={buttonStyle}>
                                            Actualizar playlist
                                        </button>

                                        <div style={buttonRowStyle}>
                                            <button onClick={() => startEdit(screen)} style={secondaryButtonStyle}>
                                                Modificar pantalla
                                            </button>
                                            <button onClick={() => handleDeleteScreen(screen)} style={dangerButtonStyle}>
                                                Eliminar pantalla
                                            </button>
                                        </div>

                                        <p style={{ ...metaStyle, marginTop: 12 }}>
                                            <strong>Ultima conexion:</strong> {formatDateArgentina(screen.last_connection)}
                                        </p>

                                        <p style={metaStyle}><strong>URL Player web:</strong></p>
                                        <code style={codeBlockStyle}>
                                            {playerBaseUrl}/player?deviceId={screen.device_id}
                                        </code>

                                        <p style={{ ...metaStyle, marginTop: 10 }}><strong>URLs Player MP4:</strong></p>
                                        {getDownloadableVideos(screen).length === 0 ? (
                                            <p style={metaStyle}>Sin videos MP4 descargables</p>
                                        ) : (
                                            getDownloadableVideos(screen).map((video, index) => (
                                                <div key={`${video.id}-${index}`} style={downloadUrlStyle}>
                                                    <p style={metaStyle}>
                                                        <strong>{index + 1}. {video.title}</strong>
                                                    </p>
                                                    <code style={codeBlockStyle}>
                                                        {getPlayerDownloadUrl(screen, index)}
                                                    </code>
                                                </div>
                                            ))
                                        )}
                                    </>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </Layout>
    );
}

const containerStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 330px), 1fr))",
    gap: 30,
    alignItems: "start",
};

const formStyle = {
    background: "white",
    padding: "clamp(18px, 4vw, 24px)",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
};

const listStyle = {
    display: "grid",
    gap: 16,
};

const cardStyle = {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: 18,
    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
};

const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: 12,
    marginTop: 6,
    marginBottom: 14,
    border: "2px solid #e5e7eb",
    borderRadius: 8,
    fontSize: 15,
    fontFamily: "inherit",
};

const buttonStyle = {
    width: "100%",
    padding: 12,
    background: "linear-gradient(135deg, #003366 0%, #004B8C 100%)",
    color: "white",
    border: "none",
    borderRadius: 8,
    fontWeight: "bold",
    fontSize: 14,
    cursor: "pointer",
};

const secondaryButtonStyle = {
    ...buttonStyle,
    background: "#6b7280",
};

const dangerButtonStyle = {
    ...buttonStyle,
    background: "#ef4444",
};

const buttonRowStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
    gap: 10,
    marginTop: 10,
};

const metaStyle = {
    color: "#64748b",
    fontSize: 13,
    margin: "0 0 8px",
};

const labelStyle = {
    fontWeight: "600",
    color: "#003366",
    fontSize: 13,
    display: "block",
    marginBottom: 8,
};

const codeBlockStyle = {
    display: "block",
    background: "#f3f4f6",
    padding: 10,
    borderRadius: 8,
    overflowWrap: "break-word",
    fontSize: 12,
    color: "#003366",
    fontWeight: "500",
};

const downloadUrlStyle = {
    marginBottom: 10,
};
