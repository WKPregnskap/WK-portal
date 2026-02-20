import './App.css'

function App() {
  return (
    <div className="portal-shell">
      <header className="portal-header">
        <p className="portal-badge">WK Portal</p>
        <h1>Portal baseline is ready</h1>
        <p className="portal-copy">
          This is the standalone WK Portal project. Next step is building features
          inside <code>src/features</code>.
        </p>
      </header>

      <main className="portal-grid">
        <section className="portal-card">
          <h2>Current status</h2>
          <ul>
            <li>React + Vite + TypeScript configured</li>
            <li>Repo connected to GitHub</li>
            <li>Folder structure prepared for feature development</li>
          </ul>
        </section>

        <section className="portal-card">
          <h2>Suggested next features</h2>
          <ul>
            <li>Authentication flow</li>
            <li>Dashboard layout</li>
            <li>API service layer</li>
          </ul>
        </section>
      </main>
    </div>
  )
}

export default App
