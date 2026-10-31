import aspireLogo from '/Aspire.png';

interface HeaderProps {
    currentView: 'live' | 'history';
    setCurrentView: (view: 'live' | 'history') => void;
}

export function Header({ currentView, setCurrentView }: HeaderProps) {
    return (
        <header className="app-header">
            <a href="https://aspire.dev" target="_blank" rel="noopener noreferrer" className="logo-link">
                <img src={aspireLogo} className="logo" alt="Aspire logo" />
            </a>
            <h1 className="app-title">Aspire Kafka Explorer</h1>

            <nav className="view-switcher" style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button
                    onClick={() => setCurrentView('live')}
                    style={{ fontWeight: currentView === 'live' ? 'bold' : 'normal', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textDecoration: currentView === 'live' ? 'underline' : 'none' }}
                >
                    Live Forecast
                </button>
                <span>|</span>
                <button
                    onClick={() => setCurrentView('history')}
                    style={{ fontWeight: currentView === 'history' ? 'bold' : 'normal', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textDecoration: currentView === 'history' ? 'underline' : 'none' }}
                >
                    Kafka History Log
                </button>
            </nav>
        </header>
    );
}