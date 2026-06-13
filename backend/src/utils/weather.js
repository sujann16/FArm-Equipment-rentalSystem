const axios = require('axios');

const mapCondition = (cond) => {
  if (cond === 'Clear') return 'Clear';
  if (cond === 'Clouds') return 'Clouds';
  if (cond === 'Rain' || cond === 'Drizzle') return 'Rain';
  if (cond === 'Thunderstorm') return 'Thunderstorm';
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
  } else if (windSpeed > 20) {
    score = 55;
    suggestions.push('High wind speeds detected. Avoid pesticide or liquid fertilizer spraying to prevent spray drift.');
    suggestions.push('Suitable for tractor operations, ploughing, and heavy tillage.');
    suggestions.push('Harvesting grain crops is possible, but check for lodging.');
  } else if (condition === 'Clouds' || rainProbability > 30) {
    score = 80;
    suggestions.push('Overcast sky. Favorable conditions for transplanting seedlings.');
    suggestions.push('Good for rotavator, cultivator, and seeder operations.');
    suggestions.push('Proceed with weeding and inter-cultivation.');
  } else {
    // Clear / Sunny
    score = 95;
    suggestions.push('Clear sunny day. Perfect for all harvesting activities using Harvesters or Threshers.');
    suggestions.push('Ideal conditions for deep ploughing to sun-dry soil pathogens.');
    suggestions.push('Great day for spraying and irrigation operations.');
  }

  return { score, suggestions };
};

const getWeatherForecast = async (lat, lon) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (apiKey) {
    try {
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
      const response = await axios.get(url);
      
      const list = response.data.list;
      const dailyForecasts = [];
      const seenDates = new Set();

      for (const item of list) {
        const dateStr = item.dt_txt.split(' ')[0]; // YYYY-MM-DD
        if (seenDates.has(dateStr) || dailyForecasts.length >= 5) continue;
        
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
    } catch (error) {
      console.warn('Error fetching weather from OpenWeather, falling back to simulation:', error.message);
    }
  }

  // Dynamic Fallback Simulation based on resolved coordinates
  const simulatedForecast = [];
  const today = new Date();
  
  // Use a hash of coordinates as a seed for local variation
  const coordHash = Math.abs(Math.round((lat * 1000) + (lon * 100)));
  const baseTemp = 24 + (coordHash % 14); // base temperature ranges from 24°C to 37°C
  const rainSeedIndicator = coordHash % 4; // regional rain probability index

  for (let i = 0; i < 5; i++) {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + i);
    const dateStr = nextDate.toISOString().split('T')[0];

    const daySeed = (coordHash + (i * 13)) % 100;
    
    let condition = 'Clear';
    let description = 'clear sky';
    let temp = baseTemp + (daySeed % 5) - 2; // minor daily fluctuations
    let windSpeed = 5 + (daySeed % 18); // wind speed in km/h
    let rainProbability = 5 + (daySeed % 10);

    // Weather condition distribution based on region seed and day offset
    if ((rainSeedIndicator >= 2 && daySeed % 2 === 0) || (daySeed % 4 === 0)) {
      condition = 'Rain';
      description = daySeed % 2 === 0 ? 'heavy monsoon rain' : 'moderate passing showers';
      temp = baseTemp - 4; // drop temperature slightly during rains
      rainProbability = 65 + (daySeed % 30); // 65% to 95%
      windSpeed = 12 + (daySeed % 15);
    } else if (daySeed % 3 === 0) {
      condition = 'Clouds';
      description = 'scattered clouds';
      rainProbability = 20 + (daySeed % 20);
    } else if (windSpeed > 18) {
      condition = 'Windy';
      description = 'breezy conditions';
    }

    const { score, suggestions } = computeFarmingSuggestions(condition, windSpeed, rainProbability);

    simulatedForecast.push({
      date: dateStr,
      temp: Math.round(temp),
      condition,
      description,
      rainProbability,
      windSpeed: Math.round(windSpeed),
      farmingScore: score,
      suggestions
    });
  }

  return simulatedForecast;
};

module.exports = { getWeatherForecast };
