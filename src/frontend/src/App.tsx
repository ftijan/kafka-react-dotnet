import { useState, useEffect } from 'react';
import aspireLogo from '/Aspire.png';
import './App.css';

interface WeatherForecast {
    date: string;
    temperatureC: number;
    temperatureF: number;
    summary: string;
}

// --- Helper Functions ---
const formatDate = (dateString: string) => {
    if (!dateString) return 'INVALID DATE';
    return new Date(dateString).toLocaleDateString(undefined, {
        weekday: 'short', month: 'short', day: 'numeric'
    });
};

// --- Sub-components ---

interface HeaderProps {
    currentView: 'live' | 'history';
    setCurrentView: (view: 'live' | 'history') => void;
}

function Header({ currentView, setCurrentView }: HeaderProps) {
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

interface TemperatureToggleProps {
    useCelsius: boolean;
    setUseCelsius: (value: boolean) => void;
}

function TemperatureToggle({ useCelsius, setUseCelsius }: TemperatureToggleProps) {
    return (
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
    );
}

interface WeatherCardProps {
    forecast: WeatherForecast;
    useCelsius: boolean;
}

function WeatherCard({ forecast, useCelsius }: WeatherCardProps) {
    return (
        <article className="weather-card">
            <h3 className="weather-date"><time>{formatDate(forecast.date)}</time></h3>
            <p className="weather-summary">{forecast.summary}</p>
            <div className="temp-group">
                <span className="temp-value">{useCelsius ? forecast.temperatureC : forecast.temperatureF}°</span>
                <span className="temp-unit">{useCelsius ? 'Celsius' : 'Fahrenheit'}</span>
            </div>
        </article>
    );
}

interface LiveForecastViewProps {
    weatherData: WeatherForecast[];
    loading: boolean;
    error: string | null;
    useCelsius: boolean;
    setUseCelsius: (value: boolean) => void;
    onRefresh: () => void;
}

function LiveForecastView({ weatherData, loading, error, useCelsius, setUseCelsius, onRefresh }: LiveForecastViewProps) {
    return (
        <section className="weather-section">
            <div className="card">
                <div className="section-header">
                    <h2 className="section-title">Live Weather Forecast (Triggers Kafka Push)</h2>
                    <div className="header-actions">
                        <TemperatureToggle useCelsius={useCelsius} setUseCelsius={setUseCelsius} />
                        <button className="refresh-button" onClick={onRefresh} disabled={loading}>
                            <span>{loading ? 'Loading...' : 'Refresh & Push'}</span>
                        </button>
                    </div>
                </div>

                {error && <div className="error-message"><span>{error}</span></div>}

                {weatherData.length > 0 && (
                    <div className="weather-grid">
                        {weatherData.map((forecast, index) => (
                            <WeatherCard key={index} forecast={forecast} useCelsius={useCelsius} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

interface KafkaHistoryViewProps {
    historyData: WeatherForecast[][];
    historyLoading: boolean;
    historyError: string | null;
    useCelsius: boolean;
    setUseCelsius: (value: boolean) => void;
    onRefresh: () => void;
}

function KafkaHistoryView({ historyData, historyLoading, historyError, useCelsius, setUseCelsius, onRefresh }: KafkaHistoryViewProps) {
    return (
        <section className="weather-section">
            <div className="card">
                <div className="section-header">
                    <h2 className="section-title">Kafka Event Log History</h2>
                    <div className="header-actions">
                        <TemperatureToggle useCelsius={useCelsius} setUseCelsius={setUseCelsius} />
                        <button className="refresh-button" onClick={onRefresh} disabled={historyLoading}>
                            <span>{historyLoading ? 'Loading...' : 'Refresh Log'}</span>
                        </button>
                    </div>
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
                                    <WeatherCard key={index} forecast={forecast} useCelsius={useCelsius} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// --- Main App Component ---

function App() {
    const [currentView, setCurrentView] = useState<'live' | 'history'>('live');

    // Shared temperature unit state across both views
    const [useCelsius, setUseCelsius] = useState(false);

    // Live forecast state
    const [weatherData, setWeatherData] = useState<WeatherForecast[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    return (
        <div className="app-container">
            <Header currentView={currentView} setCurrentView={setCurrentView} />

            <main className="main-content">
                {currentView === 'live' ? (
                    <LiveForecastView
                        weatherData={weatherData}
                        loading={loading}
                        error={error}
                        useCelsius={useCelsius}
                        setUseCelsius={setUseCelsius}
                        onRefresh={fetchWeatherForecast}
                    />
                ) : (
                    <KafkaHistoryView
                        historyData={historyData}
                        historyLoading={historyLoading}
                        historyError={historyError}
                        useCelsius={useCelsius}
                        setUseCelsius={setUseCelsius}
                        onRefresh={fetchKafkaHistory}
                    />
                )}
            </main>
        </div>
    );
}

export default App;