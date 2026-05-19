import { useCallback, useEffect, useState } from "react";
import api from "../api/client";
import Layout from "../components/Layout";

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

export default function Dashboard() {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const canManageScreens = ["admin", "marketing"].includes(user.role);
    const [contents, setContents] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [screens, setScreens] = useState([]);

    const loadData = useCallback(async function loadData() {
        try {
            if (canManageScreens) {
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
            console.error("Error cargando tablero:", error);
        }
    }, [canManageScreens]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const onlineScreens = screens.filter((screen) => screen.last_connection).length;

    return (
        <Layout>
            <div style={headingRowStyle}>
                <div>
                    <h1 style={{ color: "#003366", marginBottom: 8 }}>Tablero principal</h1>
                    <p style={{ color: "#64748b", marginBottom: 24 }}>
                        Bienvenido, <strong>{user.name || "Usuario"}</strong>
                    </p>
                </div>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "24px 0" }} />

            <div style={statsGridStyle}>
                <div style={cardStyle}>
                    <h2 style={numberStyle}>{contents.length}</h2>
                    <p style={labelStyle}>Contenidos cargados</p>
                </div>

                <div style={cardStyle}>
                    <h2 style={numberStyle}>{playlists.length}</h2>
                    <p style={labelStyle}>Playlists</p>
                </div>

                {canManageScreens && (
                    <>
                        <div style={cardStyle}>
                            <h2 style={numberStyle}>{screens.length}</h2>
                            <p style={labelStyle}>Pantallas registradas</p>
                        </div>

                        <div style={cardStyle}>
                            <h2 style={numberStyle}>{onlineScreens}/{screens.length}</h2>
                            <p style={labelStyle}>Pantallas con conexion</p>
                        </div>
                    </>
                )}
            </div>

            {canManageScreens && (
                <>
                    <h2 style={{ color: "#003366", fontSize: 20, marginTop: 40, marginBottom: 20 }}>Pantallas</h2>

                    <div style={tableWrapStyle}>
                        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 680 }}>
                            <thead>
                                <tr style={{ background: "linear-gradient(135deg, #003366 0%, #004B8C 100%)" }}>
                                    <th style={tableHeaderStyle}>Nombre</th>
                                    <th style={tableHeaderStyle}>Ubicacion</th>
                                    <th style={tableHeaderStyle}>Playlist</th>
                                    <th style={tableHeaderStyle}>Ultima conexion</th>
                                </tr>
                            </thead>
                            <tbody>
                                {screens.map((screen) => (
                                    <tr key={screen.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                                        <td style={tableCellStyle}>{screen.name}</td>
                                        <td style={tableCellStyle}>{screen.location || <em style={{ color: "#94a3b8" }}>Sin ubicacion</em>}</td>
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

const headingRowStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
};

const statsGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 190px), 1fr))",
    gap: 20,
    marginTop: 30,
};

const cardStyle = {
    background: "#ffffff",
    padding: 24,
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
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

const tableWrapStyle = {
    background: "white",
    borderRadius: 8,
    overflowX: "auto",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
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
