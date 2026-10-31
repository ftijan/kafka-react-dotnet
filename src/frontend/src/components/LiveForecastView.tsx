import type { WeatherForecast } from '../types/weather';
import { WeatherCard } from './WeatherCard';
import { TemperatureToggle } from './TemperatureToggle';

interface LiveForecastViewProps {
    weatherData: WeatherForecast[];
    loading: boolean;
    error: string | null;
    useCelsius: boolean;
    setUseCelsius: (value: boolean) => void;
    onRefresh: () => void;
}

export function LiveForecastView({ weatherData, loading, error, useCelsius, setUseCelsius, onRefresh }: LiveForecastViewProps) {
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