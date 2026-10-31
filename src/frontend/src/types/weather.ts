export interface WeatherForecast {
    date: string;
    temperatureC: number;
    temperatureF: number;
    summary: string;
}

// Runtime export to prevent empty module errors in Vite/browser ESM
export const WEATHER_TYPE_VERSION = '1.0.0';