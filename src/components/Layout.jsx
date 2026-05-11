export default function Layout({ children }) {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#f8fafc",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <header
                style={{
                    background: "linear-gradient(135deg, #003366 0%, #004B8C 100%)",
                    color: "white",
                    padding: "16px 24px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
            >
                <div>
                    <h2 style={{ margin: 0, fontSize: 22 }}>
                        Cartelería Digital
                    </h2>

                    <p style={{ margin: "4px 0 0", opacity: 0.8, fontSize: 14 }}>
                        Instituto General Manuel Belgrano
                    </p>
                </div>

                <div style={{ textAlign: "right" }}>
                    <strong>{user.name || "Usuario"}</strong>

                    <div style={{ fontSize: 13, opacity: 0.8 }}>
                        {user.role || "Sin rol"}
                    </div>
                </div>
            </header>

            <main
                style={{
                    flex: 1,
                    padding: 24,
                    width: "100%",
                    maxWidth: 1400,
                    margin: "0 auto",
                }}
            >
                {children}
            </main>
        </div>
    );
}