import { useState, useEffect } from 'react';
import type { WeatherForecast } from './types/weather';
import { Header } from './components/Header';
import { LiveForecastView } from './components/LiveForecastView';
import { KafkaHistoryView } from './components/KafkaHistoryView';
import './App.css';

export function App() {
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