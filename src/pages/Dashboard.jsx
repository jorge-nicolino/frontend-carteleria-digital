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
            <h1 style={{ color: "#003366", marginBottom: 8 }}>Panel de Cartelería Digital</h1>
            <p style={{ color: "#64748b", marginBottom: 24 }}>Bienvenido, <strong>{user.name}</strong></p>

            <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "24px 0" }} />

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
                    <h2 style={{ color: "#003366", fontSize: 20, marginTop: 40, marginBottom: 20 }}>Pantallas</h2>

                    <div style={{ background: "white", borderRadius: 14, overflow: "hidden", boxShadow: "0 8px 20px rgba(0,0,0,0.08)" }}>
                        <table
                            style={{
                                borderCollapse: "collapse",
                                width: "100%",
                            }}
                        >
                            <thead>
                                <tr style={{ background: "linear-gradient(135deg, #003366 0%, #004B8C 100%)" }}>
                                    <th style={tableHeaderStyle}>Nombre</th>
                                    <th style={tableHeaderStyle}>Ubicación</th>
                                    <th style={tableHeaderStyle}>Device ID</th>
                                    <th style={tableHeaderStyle}>Playlist</th>
                                    <th style={tableHeaderStyle}>Última conexión</th>
                                </tr>
                            </thead>

                            <tbody>
                                {screens.map((screen) => (
                                    <tr key={screen.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                                        <td style={tableCellStyle}>{screen.name}</td>
                                        <td style={tableCellStyle}>{screen.location}</td>
                                        <td style={tableCellStyle}><code style={{ background: "#f3f4f6", padding: "4px 8px", borderRadius: 4, fontSize: 12 }}>{screen.device_id}</code></td>
                                        <td style={tableCellStyle}>{screen.playlists?.name || <em style={{ color: "#94a3b8" }}>Sin playlist</em>}</td>
                                        <td style={tableCellStyle}>{formatDateArgentina(screen.last_connection)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
    transition: "all 0.3s ease",
};

const numberStyle = {
    color: "#003366",
    fontSize: 38,
    margin: 0,
    fontWeight: "bold",
};

const labelStyle = {
    color: "#64748b",
    margin: "8px 0 0",
    fontWeight: "500",
    fontSize: 14,
};

const tableHeaderStyle = {
    color: "white",
    padding: "14px 16px",
    textAlign: "left",
    fontWeight: "600",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
};

const tableCellStyle = {
    padding: "14px 16px",
    color: "#374151",
    fontSize: 14,
};