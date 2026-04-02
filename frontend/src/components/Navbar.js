function Navbar({ user, onLogout }) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Golf Charity Portal</p>
        <h1>Welcome back, {user.name}</h1>
      </div>

      <div className="topbar-actions">
        <div className="identity-chip">
          <span>{user.email}</span>
          <strong>{user.charity || "No charity selected"}</strong>
        </div>
        <button className="button secondary-button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;
