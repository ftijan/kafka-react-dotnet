import type { WeatherForecast } from '../types/weather';
import { WeatherCard } from './WeatherCard';
import { TemperatureToggle } from './TemperatureToggle';

interface KafkaHistoryViewProps {
    historyData: WeatherForecast[][];
    historyLoading: boolean;
    historyError: string | null;
    useCelsius: boolean;
    setUseCelsius: (value: boolean) => void;
    onRefresh: () => void;
}

export function KafkaHistoryView({ historyData, historyLoading, historyError, useCelsius, setUseCelsius, onRefresh }: KafkaHistoryViewProps) {
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
                    <p style={{ textAlign: 'center', padding: '2rem' }}>No messages found in Kafka topic yet. Try hitting the live view a few times (or wait and click "Refresh Log" if already done so)!</p>
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