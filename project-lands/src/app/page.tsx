"use client";

export default function Home() {
  return (
    <>
      <main style={styles.main as React.CSSProperties}>
        <h1 style={styles.title as React.CSSProperties}>lands.lt</h1>
        <p style={styles.subtitle}>🌿 Our project is growing. Stay tuned!</p>
        <div style={styles.loader}>
          <span style={{ ...styles.dot, animationDelay: "0s" }}></span>
          <span style={{ ...styles.dot, animationDelay: "0.25s" }}></span>
          <span style={{ ...styles.dot, animationDelay: "0.5s" }}></span>
        </div>
        <footer style={styles.footer as React.CSSProperties}>© {new Date().getFullYear()} lands.lt</footer>
      </main>

      <style jsx>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: translateY(0);
            opacity: 0.7;
          }
          40% {
            transform: translateY(-12px);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}

const styles = {
  main: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background:
      "linear-gradient(135deg, #3a5a40 0%, #d9e4dd 100%)", // deep forest green to soft beige
    color: "#2c3e2f", // dark olive green text
    fontFamily: "'Georgia', serif",
    textAlign: "center",
    padding: "0 1rem",
    position: "relative",
    overflow: "hidden",
  },
  title: {
    fontSize: "4rem",
    fontWeight: "700",
    margin: "0 0 0.5rem",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    userSelect: "none",
    textShadow: "1px 1px 4px rgba(0,0,0,0.15)",
  },
  subtitle: {
    fontSize: "1.75rem",
    marginBottom: "2rem",
    fontWeight: "400",
    opacity: 0.85,
  },
  loader: {
    display: "flex",
    gap: "0.6rem",
  },
  dot: {
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    backgroundColor: "rgba(44, 62, 47, 0.85)", // darker olive green dots
    animationName: "bounce",
    animationDuration: "1.1s",
    animationIterationCount: "infinite",
    animationTimingFunction: "ease-in-out",
  },
  footer: {
    position: "absolute",
    bottom: "1rem",
    fontSize: "0.9rem",
    opacity: 0.6,
    color: "#2c3e2f",
  },
};
