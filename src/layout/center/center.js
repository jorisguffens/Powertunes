export default function Center({text, children}) {
    return (
        <div style={{
            display: 'flex',
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            textAlign: text ? "center" : "inherit"
        }}>
            {children}
        </div>
    )
}