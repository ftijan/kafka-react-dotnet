import type { WeatherForecast } from '../types/weather';
import { formatDate } from '../utils/formatters';

interface WeatherCardProps {
    forecast: WeatherForecast;
    useCelsius: boolean;
}

export function WeatherCard({ forecast, useCelsius }: WeatherCardProps) {
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