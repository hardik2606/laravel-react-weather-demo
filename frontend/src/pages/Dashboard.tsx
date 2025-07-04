import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DateTime } from 'luxon';

const WEATHER_API_KEY = '35e87dc48724e712b1167e3ee717d57a'; // <-- Your key

// Default cities (Surat, Ahmedabad)
const DEFAULT_CITIES = [
  { city: "Surat", country: "IN" },
  { city: "Ahmedabad", country: "IN" }
];

const Dashboard: React.FC = () => {
  const { user, logout, loading, isAuthenticated } = useAuth();
  const [cityInput, setCityInput] = useState('');
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0]);
  const [weather, setWeather] = useState<any>(null);
  const [localTime, setLocalTime] = useState('');
  const [festival, setFestival] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  // Fetch weather when selectedCity changes
  useEffect(() => {
    if (selectedCity) {
      fetchCityWeather(selectedCity.city, selectedCity.country);
    }
    // eslint-disable-next-line
  }, [selectedCity]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Fetch weather and related info for a city
  const fetchCityWeather = async (city: string, country?: string) => {
    setError('');
    setWeather(null);
    setAiSummary('');
    setFestival('');
    setLocalTime('');
    setSearching(true);
    try {
      const q = country ? `${city},${country}` : city;
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(q)}&appid=${WEATHER_API_KEY}&units=metric`
      );
      if (!res.ok) {
        throw new Error('City not found or API error.');
      }
      const data = await res.json();
      setWeather(data);

      // Local time
      const timezoneOffset = data.timezone; // in seconds
      const local = DateTime.utc().plus({ seconds: timezoneOffset });
      setLocalTime(local.toFormat("cccc, dd LLL yyyy • hh:mm a"));

      // Festival (placeholder)
      setFestival('No major festival today');

      // AI summary
      fetchAISummary({
        city: data.name,
        country: data.sys.country,
        temp: data.main.temp,
        humidity: data.main.humidity,
        condition: data.weather[0].main,
        windSpeed: data.wind.speed,
        datetime: local.toISO(),
      });
    } catch (err: any) {
      setError(err.message || 'Could not fetch weather.');
    } finally {
      setSearching(false);
    }
  };

  // Search for any city
  const handleCitySearch = () => {
    if (!cityInput.trim()) {
      setError('Please enter a city name.');
      return;
    }
    setSelectedCity({ city: cityInput.trim(), country: '' });
    setCityInput('');
  };

  const fetchAISummary = async (data: any) => {
    setLoadingAI(true);
    setAiSummary('');
    setError('');
    try {
      const aiRes = await fetch('http://localhost:8000/api/ai-summary', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!aiRes.ok) {
        throw new Error('Failed to get AI summary');
      }

      const aiData = await aiRes.json();
      setAiSummary(aiData.summary);
    } catch (err: any) {
      setError(err.message || 'Could not fetch AI summary.');
    } finally {
      setLoadingAI(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="w-full bg-white shadow flex justify-between items-center px-8 py-4">
        <div className="flex items-center space-x-2">
          <span className="text-2xl text-yellow-400">🌈</span>
          <span className="text-xl font-bold text-blue-700 tracking-wide">WECAST</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-lg font-bold text-blue-700">{user?.name || user?.email}</span>
          <button
            onClick={handleLogout}
            className="py-2 px-4 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* City Selector */}
      <div className="flex flex-row justify-center gap-6 mt-8 mb-4">
        {DEFAULT_CITIES.map((city, idx) => (
          <button
            key={city.city}
            className={`rounded-xl px-6 py-3 font-bold shadow transition ${
              selectedCity.city.toLowerCase() === city.city.toLowerCase()
                ? "bg-gradient-to-br from-blue-500 to-purple-500 text-white scale-105"
                : "bg-white text-blue-700 hover:bg-blue-100"
            }`}
            onClick={() => setSelectedCity(city)}
            disabled={searching}
          >
            {city.city}
          </button>
        ))}
      </div>

      {/* City Search */}
      <div className="flex flex-col items-center">
        <div className="flex gap-2">
          <input
            className="px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={cityInput}
            onChange={e => setCityInput(e.target.value)}
            placeholder="Enter any city"
            onKeyDown={e => { if (e.key === 'Enter') handleCitySearch(); }}
            disabled={searching}
          />
          <button
            onClick={handleCitySearch}
            className="px-4 py-2 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
            disabled={searching}
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
        </div>
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </div>

      {/* Weather, Time, Festival, AI Summary */}
      {weather && (
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto mt-8">
          <div className="bg-white/90 rounded-lg p-6 shadow text-gray-800 w-full">
            <div className="text-2xl font-bold mb-2">{weather.name}, {weather.sys.country}</div>
            <div className="mb-2">Weather: <span className="font-semibold">{weather.main.temp}°C, {weather.weather[0].main}</span></div>
            <div className="mb-2">Humidity: {weather.main.humidity}% | Wind: {weather.wind.speed} km/h</div>
            <div className="mb-2">Local Time: <span className="font-semibold">{localTime}</span></div>
            <div className="mb-2">Festival: <span className="font-semibold">{festival}</span></div>
          </div>
          {/* AI Summary */}
          <div className="w-full">
            {loadingAI && <div className="text-center text-blue-700 mt-4">Getting AI summary...</div>}
            {aiSummary && (
              <div className="bg-white/90 rounded-lg p-6 mt-4 shadow text-gray-800 w-full">
                <div className="text-lg font-semibold mb-2">AI Weather Summary</div>
                <div className="whitespace-pre-line">{aiSummary}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;