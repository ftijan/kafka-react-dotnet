import { useState, useEffect } from 'react';
import aspireLogo from '/Aspire.png';
import './App.css';

// Revert back to camelCase properties
interface WeatherForecast {
    date: string;
    temperatureC: number;
    temperatureF: number;
    summary: string;
}

function App() {
    const [currentView, setCurrentView] = useState<'live' | 'history'>('live');

    // Live forecast state
    const [weatherData, setWeatherData] = useState<WeatherForecast[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [useCelsius, setUseCelsius] = useState(false);

    // Kafka history state
    const [historyData, setHistoryData] = useState<WeatherForecast[][]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState<string | null>(null);

    const fetchWeatherForecast = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/weatherforecast');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data: WeatherForecast[] = await response.json();
            setWeatherData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
        } finally {
            setLoading(false);
        }
    };

    const fetchKafkaHistory = async () => {
        setHistoryLoading(true);
        setHistoryError(null);
        try {
            const response = await fetch('/api/weatherforecast/all');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data: WeatherForecast[][] = await response.json();
            setHistoryData(data);
        } catch (err) {
            setHistoryError(err instanceof Error ? err.message : 'Failed to fetch Kafka history');
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        fetchWeatherForecast();
    }, []);

    useEffect(() => {
        if (currentView === 'history') {
            fetchKafkaHistory();
        }
    }, [currentView]);

    const formatDate = (dateString: string) => {
        if (!dateString) return 'INVALID DATE';
        return new Date(dateString).toLocaleDateString(undefined, {
            weekday: 'short', month: 'short', day: 'numeric'
        });
    };

    return (
        <div className="app-container">
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

            <main className="main-content">
                {currentView === 'live' ? (
                    <section className="weather-section">
                        <div className="card">
                            <div className="section-header">
                                <h2 className="section-title">Live Weather Forecast (Triggers Kafka Push)</h2>
                                <div className="header-actions">
                                    <fieldset className="toggle-switch" aria-label="Temperature unit selection">
                                        <legend className="visually-hidden">Temperature unit</legend>
                                        <button
                                            className={`toggle-option ${!useCelsius ? 'active' : ''}`}
                                            onClick={() => setUseCelsius(false)}
                                            aria-pressed={!useCelsius}
                                            type="button"
                                        >
                                            <span aria-hidden="true">°F</span>
                                            <span className="visually-hidden">Fahrenheit</span>
                                        </button>
                                        <button
                                            className={`toggle-option ${useCelsius ? 'active' : ''}`}
                                            onClick={() => setUseCelsius(true)}
                                            aria-pressed={useCelsius}
                                            type="button"
                                        >
                                            <span aria-hidden="true">°C</span>
                                            <span className="visually-hidden">Celsius</span>
                                        </button>
                                    </fieldset>
                                    <button className="refresh-button" onClick={fetchWeatherForecast} disabled={loading}>
                                        <span>{loading ? 'Loading...' : 'Refresh & Push'}</span>
                                    </button>
                                </div>
                            </div>

                            {error && <div className="error-message"><span>{error}</span></div>}

                            {weatherData.length > 0 && (
                                <div className="weather-grid">
                                    {weatherData.map((forecast, index) => (
                                        <article key={index} className="weather-card">
                                            <h3 className="weather-date"><time>{formatDate(forecast.date)}</time></h3>
                                            <p className="weather-summary">{forecast.summary}</p>
                                            <div className="temp-group">
                                                <span className="temp-value">{useCelsius ? forecast.temperatureC : forecast.temperatureF}°</span>
                                                <span className="temp-unit">{useCelsius ? 'Celsius' : 'Fahrenheit'}</span>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                ) : (
                    <section className="weather-section">
                        <div className="card">
                            <div className="section-header">
                                <h2 className="section-title">Kafka Event Log History</h2>
                                <button className="refresh-button" onClick={fetchKafkaHistory} disabled={historyLoading}>
                                    <span>{historyLoading ? 'Loading...' : 'Refresh Log'}</span>
                                </button>
                            </div>

                            {historyError && <div className="error-message"><span>{historyError}</span></div>}

                            {historyData.length === 0 && !historyLoading && (
                                <p style={{ textAlign: 'center', padding: '2rem' }}>No messages found in Kafka topic yet. Try hitting the live view a few times!</p>
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '1rem' }}>
                                {historyData.map((batch, batchIndex) => (
                                    <div key={batchIndex} style={{ border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px' }}>
                                        <h4 style={{ marginBottom: '0.75rem', opacity: 0.8 }}>Batch #{batchIndex + 1}</h4>
                                        <div className="weather-grid">
                                            {batch.map((forecast, index) => (
                                                <article key={index} className="weather-card">
                                                    <h3 className="weather-date"><time>{formatDate(forecast.date)}</time></h3>
                                                    <p className="weather-summary">{forecast.summary}</p>
                                                    <div className="temp-group">
                                                        <span className="temp-value">{useCelsius ? forecast.temperatureC : forecast.temperatureF}°</span>
                                                        <span className="temp-unit">{useCelsius ? 'Celsius' : 'Fahrenheit'}</span>
                                                    </div>
                                                </article>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}

export default App;