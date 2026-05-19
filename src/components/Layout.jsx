import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Layout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const navItems = [
        { path: "/dashboard", label: "Tablero principal", roles: ["admin", "marketing", "viewer"] },
        { path: "/contents", label: "Contenidos", roles: ["admin", "marketing", "viewer"] },
        { path: "/playlists", label: "Playlists", roles: ["admin", "marketing", "viewer"] },
        { path: "/screens", label: "Pantallas", roles: ["admin", "marketing"] },
        { path: "/users", label: "Usuarios", roles: ["admin"] },
    ];

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    }

    return (
        <div className="app-shell" style={pageStyle}>
            <aside className="app-sidebar" style={sidebarStyle}>
                <div style={brandStyle}>
                    <h2 style={{ margin: 0, fontSize: 21 }}>Carteleria Digital</h2>
                    <p style={{ margin: "6px 0 0", opacity: 0.8, fontSize: 13, lineHeight: 1.35 }}>
                        Instituto General Manuel Belgrano
                    </p>
                </div>

                <nav className="app-nav" style={navStyle}>
                    {navItems
                        .filter((item) => item.roles.includes(user.role))
                        .map((item) => {
                            const active = location.pathname === item.path;

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    style={{
                                        ...navLinkStyle,
                                        ...(active ? activeNavLinkStyle : {}),
                                    }}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                </nav>

                <div className="user-summary" style={userSummaryStyle}>
                    <strong>{user.name || "Usuario"}</strong>
                    <div style={{ fontSize: 13, opacity: 0.8 }}>{user.role || "Sin rol"}</div>
                </div>

                <button onClick={logout} style={logoutButtonStyle}>
                    Cerrar sesion
                </button>
            </aside>

            <main className="app-main" style={mainStyle}>{children}</main>
        </div>
    );
}

const pageStyle = {
    minHeight: "100vh",
    background: "#f8fafc",
    display: "grid",
    gridTemplateColumns: "260px minmax(0, 1fr)",
};

const sidebarStyle = {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #003366 0%, #004B8C 100%)",
    color: "white",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 20,
    boxShadow: "4px 0 14px rgba(0,0,0,0.12)",
};

const brandStyle = {
    paddingBottom: 18,
    borderBottom: "1px solid rgba(255,255,255,0.18)",
};

const navStyle = {
    display: "grid",
    gap: 8,
};

const navLinkStyle = {
    color: "white",
    padding: "11px 12px",
    borderRadius: 8,
    fontWeight: 600,
    whiteSpace: "nowrap",
    background: "rgba(255,255,255,0.08)",
};

const activeNavLinkStyle = {
    background: "white",
    color: "#003366",
};

const userSummaryStyle = {
    marginTop: "auto",
    paddingTop: 18,
    borderTop: "1px solid rgba(255,255,255,0.18)",
};

const logoutButtonStyle = {
    background: "#E63946",
    color: "white",
    border: "none",
    padding: "11px 14px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 700,
    whiteSpace: "nowrap",
    textAlign: "center",
};

const mainStyle = {
    padding: "clamp(16px, 3vw, 28px)",
    width: "100%",
    maxWidth: 1440,
    margin: "0 auto",
    minWidth: 0,
};
