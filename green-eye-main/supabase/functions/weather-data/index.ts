import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lng } = await req.json();

    console.log('Fetching weather data for coordinates:', lat, lng);

    // Using OpenWeatherMap API (free tier) - in production you'd need an API key
    // For now, we'll return mock weather data
    const weatherData = {
      current: {
        temperature: Math.round(20 + Math.random() * 15), // 20-35°C
        humidity: Math.round(40 + Math.random() * 40), // 40-80%
        pressure: Math.round(1010 + Math.random() * 20), // 1010-1030 hPa
        windSpeed: Math.round(Math.random() * 15), // 0-15 m/s
        windDirection: Math.round(Math.random() * 360), // 0-360°
        visibility: Math.round(8 + Math.random() * 7), // 8-15 km
        uvIndex: Math.round(Math.random() * 11), // 0-11
        cloudCover: Math.round(Math.random() * 100), // 0-100%
        condition: ['sunny', 'cloudy', 'partly-cloudy', 'overcast', 'light-rain'][Math.floor(Math.random() * 5)],
        timestamp: new Date().toISOString()
      },
      forecast: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tempMax: Math.round(22 + Math.random() * 18),
        tempMin: Math.round(8 + Math.random() * 12),
        humidity: Math.round(35 + Math.random() * 45),
        precipitation: Math.round(Math.random() * 20 * 100) / 100,
        condition: ['sunny', 'cloudy', 'partly-cloudy', 'overcast', 'light-rain', 'rain'][Math.floor(Math.random() * 6)]
      })),
      agricultural: {
        evapotranspiration: Math.round(Math.random() * 8 * 100) / 100, // mm/day
        soilTemperature: Math.round(15 + Math.random() * 10), // °C
        growingDegreeDays: Math.round(Math.random() * 25),
        frostRisk: Math.random() > 0.8 ? 'high' : Math.random() > 0.6 ? 'medium' : 'low',
        irrigationRecommendation: Math.random() > 0.5 ? 'recommended' : 'not-needed',
        pestPressure: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
      },
      alerts: []
    };

    // Add weather alerts based on conditions
    if (weatherData.current.temperature > 35) {
      weatherData.alerts.push({
        type: 'heat_warning',
        severity: 'high',
        message: 'Extremely high temperatures detected. Monitor crop stress and increase irrigation.',
        timestamp: new Date().toISOString()
      });
    }

    if (weatherData.forecast.some(day => day.precipitation > 15)) {
      weatherData.alerts.push({
        type: 'heavy_rain',
        severity: 'medium',
        message: 'Heavy rainfall expected in the next 7 days. Prepare drainage systems.',
        timestamp: new Date().toISOString()
      });
    }

    if (weatherData.agricultural.frostRisk === 'high') {
      weatherData.alerts.push({
        type: 'frost_warning',
        severity: 'critical',
        message: 'High frost risk detected. Protect sensitive crops and consider frost protection measures.',
        timestamp: new Date().toISOString()
      });
    }

    return new Response(JSON.stringify(weatherData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in weather-data function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});