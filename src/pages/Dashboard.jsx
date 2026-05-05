import Header from "../components/Header.jsx";

export default function Dashboard() {
  return (
    <>
      <Header />
      <main className="page">
        <div className="container">
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ margin: 0 }}>Dashboard</h2>
            <p className="muted" style={{ margin: "10px 0 0" }}>
              Em construção.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
