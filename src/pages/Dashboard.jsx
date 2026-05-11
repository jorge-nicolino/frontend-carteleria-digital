import { useEffect, useState } from "react";
import api from "../api/client";
import Layout from "../components/Layout";

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

export default function Dashboard() {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const isAdmin = user.role === "admin";

    const [contents, setContents] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [screens, setScreens] = useState([]);

    async function loadData() {
        try {
            if (isAdmin) {
                const [contentsRes, playlistsRes, screensRes] = await Promise.all([
                    api.get("/contents"),
                    api.get("/playlists"),
                    api.get("/screens"),
                ]);

                setContents(contentsRes.data);
                setPlaylists(playlistsRes.data);
                setScreens(screensRes.data);
            } else {
                const [contentsRes, playlistsRes] = await Promise.all([
                    api.get("/contents"),
                    api.get("/playlists"),
                ]);

                setContents(contentsRes.data);
                setPlaylists(playlistsRes.data);
                setScreens([]);
            }
        } catch (error) {
            console.error("Error cargando dashboard:", error);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/";
    }

    const onlineScreens = screens.filter((screen) => screen.last_connection).length;

    return (
        <Layout>
            <h1>Panel de Cartelería Digital</h1>
            <p>Bienvenido, {user.name}</p>

            <hr />

            <div style={{ display: "flex", gap: 20, marginTop: 30, flexWrap: "wrap" }}>
                <div style={cardStyle}>
                    <h2 style={numberStyle}>{contents.length}</h2>
                    <p style={labelStyle}>Contenidos cargados</p>
                </div>

                <div style={cardStyle}>
                    <h2 style={numberStyle}>{playlists.length}</h2>
                    <p style={labelStyle}>Playlists</p>
                </div>

                <div style={cardStyle}>
                    <h2 style={numberStyle}>{screens.length}</h2>
                    <p style={labelStyle}>Pantallas registradas</p>
                </div>

                <div style={cardStyle}>
                    <h2 style={numberStyle}>{onlineScreens}/{screens.length}</h2>
                    <p style={labelStyle}>Pantallas con conexión</p>
                </div>
            </div>

            {isAdmin && (
                <>
                    <h2 style={{ marginTop: 40 }}>Pantallas</h2>

                    <table
                        border="1"
                        cellPadding="10"
                        style={{
                            borderCollapse: "collapse",
                            width: "100%",
                        }}
                    >
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Ubicación</th>
                                <th>Device ID</th>
                                <th>Playlist</th>
                                <th>Última conexión</th>
                            </tr>
                        </thead>

                        <tbody>
                            {screens.map((screen) => (
                                <tr key={screen.id}>
                                    <td>{screen.name}</td>
                                    <td>{screen.location}</td>
                                    <td>{screen.device_id}</td>
                                    <td>{screen.playlists?.name || "Sin playlist"}</td>
                                    <td>{formatDateArgentina(screen.last_connection)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </Layout>
    );
}

const cardStyle = {
    background: "#ffffff",
    padding: 24,
    borderRadius: 14,
    minWidth: 190,
    border: "1px solid #e5e7eb",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
};

const numberStyle = {
    color: "#2563eb",
    fontSize: 38,
    margin: 0,
    fontWeight: "bold",
};

const labelStyle = {
    color: "#374151",
    margin: "8px 0 0",
    fontWeight: "500",
};