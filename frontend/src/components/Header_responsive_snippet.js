// ⚠️ Ajoute cet état en haut du composant, avec les autres useState :
// const [menuOpen, setMenuOpen] = useState(false);

const Header = () => (
  <>
    <header className="mmi-pill-header">
      <div className="mmi-admin-brand" onClick={() => { setActiveTab('catalogue'); setMenuOpen(false); }}>
        <img src="/ecampus.svg" alt="logo" className="mmi-logo-img" />
      </div>

      {/* NAV DESKTOP */}
      <nav className="mmi-nav-links cursive-font">
        {['dashboard','catalogue', 'sae', 'etudiant', 'annonces', 'profil'].map(tab => (
          <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </nav>

      <div className="mmi-header-actions">
        {/* CLOCHE NOTIFICATIONS */}
        <div className="notif-wrapper" onClick={() => setShowAnnonces(!showAnnonces)}>
          <span className="mmi-bell">🔔</span>
          {annonces.length > 0 && <span className="mmi-badge">{annonces.length}</span>}
          <AnimatePresence>
            {showAnnonces && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mmi-notif-dropdown">
                <h4 className="cursive-font">Dernières Alertes</h4>
                {recentAnnonces.map(a => (
                  <div key={a.id} className="mmi-notif-item">
                    <strong>{a.titre}</strong>
                    <p>{a.contenu.substring(0, 30)}...</p>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* AVATAR + INFO (desktop) */}
        <div className="mmi-user-profile-pill">
          <div className="avatar-circle">A</div>
          <div className="mmi-user-info">
            <span className="mmi-user-role bordeaux-text">ADMINISTRATEUR</span>
            <button onClick={onLogout} className="mmi-logout-link cursive-font">Fermer la session</button>
          </div>
        </div>

        {/* BURGER (mobile) */}
        <button
          className={`mmi-burger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>

    {/* MENU MOBILE OVERLAY */}
    <div className={`mmi-mobile-menu ${menuOpen ? 'open' : ''}`}>
      {['dashboard','catalogue', 'sae', 'etudiant', 'annonces', 'profil'].map(tab => (
        <button
          key={tab}
          className={`cursive-font ${activeTab === tab ? 'active' : ''}`}
          onClick={() => { setActiveTab(tab); setMenuOpen(false); }}
        >
          {tab}
        </button>
      ))}
      <div className="mobile-user-info">
        <div className="avatar-circle" style={{ width: '55px', height: '55px', fontSize: '1.4rem', margin: '0 auto' }}>A</div>
        <span className="mmi-user-role bordeaux-text" style={{ marginTop: '8px' }}>ADMINISTRATEUR</span>
        <button onClick={onLogout} className="mmi-logout-link cursive-font" style={{ marginTop: '5px' }}>
          Fermer la session
        </button>
      </div>
    </div>
  </>
);
