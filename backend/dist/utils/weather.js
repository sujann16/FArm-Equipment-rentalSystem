"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeatherForecast = void 0;
const axios_1 = __importDefault(require("axios"));
const getWeatherForecast = async (lat, lon) => {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (apiKey) {
        try {
            // Fetch 5-day forecast from OpenWeather API
            const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
            const response = await axios_1.default.get(url);
            // Parse OpenWeather 3-hour list to a 5-day summary
            const list = response.data.list;
            const dailyForecasts = [];
            const seenDates = new Set();
            for (const item of list) {
                const dateStr = item.dt_txt.split(' ')[0]; // YYYY-MM-DD
                if (seenDates.has(dateStr) || dailyForecasts.length >= 5)
                    continue;
                seenDates.add(dateStr);
                const condition = item.weather[0].main;
                const description = item.weather[0].description;
                const temp = Math.round(item.main.temp);
                const windSpeed = item.wind.speed;
                const rainProbability = item.pop ? Math.round(item.pop * 100) : (condition === 'Rain' ? 80 : 0);
                const { score, suggestions } = computeFarmingSuggestions(condition, windSpeed, rainProbability);
                dailyForecasts.push({
                    date: dateStr,
                    temp,
                    condition: mapCondition(condition),
                    description,
                    rainProbability,
                    windSpeed,
                    farmingScore: score,
                    suggestions
                });
            }
            return dailyForecasts;
        }
        catch (error) {
            console.warn('Error fetching weather from OpenWeather, falling back to simulation:', error.message);
        }
    }
    // Fallback Simulation (dynamic based on current day)
    const simulatedForecast = [];
    const today = new Date();
    // Set up a consistent simulated cycle (e.g. Day 3 is rain, Day 1 is clear)
    const conditions = ['Clear', 'Clouds', 'Rain', 'Clouds', 'Clear'];
    const descriptions = [
        'clear sky',
        'scattered clouds',
        'heavy monsoon rain',
        'overcast clouds',
        'sunny day'
    ];
    const temps = [32, 30, 27, 29, 33];
    const winds = [8, 12, 22, 10, 6];
    const rainProbs = [5, 20, 95, 40, 10];
    for (let i = 0; i < 5; i++) {
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + i);
        const dateStr = nextDate.toISOString().split('T')[0];
        const condition = conditions[i];
        const { score, suggestions } = computeFarmingSuggestions(condition, winds[i], rainProbs[i]);
        simulatedForecast.push({
            date: dateStr,
            temp: temps[i],
            condition,
            description: descriptions[i],
            rainProbability: rainProbs[i],
            windSpeed: winds[i],
            farmingScore: score,
            suggestions
        });
    }
    return simulatedForecast;
};
exports.getWeatherForecast = getWeatherForecast;
const mapCondition = (cond) => {
    if (cond === 'Clear')
        return 'Clear';
    if (cond === 'Clouds')
        return 'Clouds';
    if (cond === 'Rain' || cond === 'Drizzle')
        return 'Rain';
    if (cond === 'Thunderstorm')
        return 'Thunderstorm';
    return 'Windy';
};
const computeFarmingSuggestions = (condition, windSpeed, rainProbability) => {
    let score = 90;
    const suggestions = [];
    if (condition === 'Rain' || rainProbability > 70) {
        score = 25;
        suggestions.push('Heavy rain expected. Delay soil preparation (ploughing, tilling) as wet soil causes severe compaction.');
        suggestions.push('Not recommended for harvesting. Moisture will degrade crop quality.');
        suggestions.push('Excellent time for organic fertilizer application if rain is light; avoid if heavy downpour.');
        suggestions.push('Keep seeders and grain harvesters parked to protect machinery and seeds.');
    }
    else if (windSpeed > 20) {
        score = 55;
        suggestions.push('High wind speeds detected. Avoid pesticide or liquid fertilizer spraying to prevent spray drift.');
        suggestions.push('Suitable for tractor operations, ploughing, and heavy tillage.');
        suggestions.push('Harvesting grain crops is possible, but check for lodging.');
    }
    else if (condition === 'Clouds' || rainProbability > 30) {
        score = 80;
        suggestions.push('Overcast sky. Favorable conditions for transplanting seedlings.');
        suggestions.push('Good for rotavator, cultivator, and seeder operations.');
        suggestions.push('Proceed with weeding and inter-cultivation.');
    }
    else {
        // Clear / Sunny
        score = 95;
        suggestions.push('Clear sunny day. Perfect for all harvesting activities using Harvesters or Threshers.');
        suggestions.push('Ideal conditions for deep ploughing to sun-dry soil pathogens.');
        suggestions.push('Great day for spraying and irrigation operations.');
    }
    return { score, suggestions };
};
