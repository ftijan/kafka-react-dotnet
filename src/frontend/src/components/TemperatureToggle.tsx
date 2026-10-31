interface TemperatureToggleProps {
    useCelsius: boolean;
    setUseCelsius: (value: boolean) => void;
}

export function TemperatureToggle({ useCelsius, setUseCelsius }: TemperatureToggleProps) {
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