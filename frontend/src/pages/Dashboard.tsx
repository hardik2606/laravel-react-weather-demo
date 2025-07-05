import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DateTime } from 'luxon';

// console.log('All env variables:', import.meta.env);
// console.log('VITE_WEATHER_API_KEY:', import.meta.env.VITE_WEATHER_API_KEY);
// console.log('MODE:', import.meta.env.MODE);
// console.log('DEV:', import.meta.env.DEV);
const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY as string;
// console.log('WEATHER_API_KEY', WEATHER_API_KEY);
// For demo: a small static list for autosuggest. Replace with a real API for production.
const CITY_SUGGESTIONS = [
  "Amsterdam", "Paris", "London", "Surat", "Ahmedabad", "New York", "Tokyo", "Sydney", "Berlin", "Delhi"
];

const FIXED_CITIES = [
  { city: "Surat", country: "IN" },
  { city: "Ahmedabad", country: "IN" }
];

// Weather backgrounds
const WEATHER_BACKGROUNDS: Record<string, string> = {
  clear:    "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80')",
  clouds:   "url('https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1200&q=80')",
  rain:     "url('https://images.pexels.com/photos/14060192/pexels-photo-14060192.jpeg?auto=format&fit=crop&w=1200&q=80')",
  drizzle:  "url('https://images.unsplash.com/photo-1551854838-02c201dd54c5?auto=format&fit=crop&w=1200&q=80')",
  thunderstorm: "url('https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?auto=format&fit=crop&w=1200&q=80')",
  snow:     "url('https://images.unsplash.com/photo-1491002052546-bf38f186af56?auto=format&fit=crop&w=1200&q=80')",
  mist:     "url('https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=1200&q=80')",
  fog:      "url('https://images.unsplash.com/photo-1508514177221-188b1cf16e2e?auto=format&fit=crop&w=1200&q=80')",
  wind:     "url('https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80')",
  haze:     "url('https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1200&q=80')",
  smoke:    "url('https://images.unsplash.com/photo-1519452575410-b5ca07b1efa1?auto=format&fit=crop&w=1200&q=80')",
  dust:     "url('https://images.unsplash.com/photo-1581091215367-55f290f9d545?auto=format&fit=crop&w=1200&q=80')",
  sand:     "url('https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=1200&q=80')",
  squall:   "url('https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1200&q=80')",
  tornado:  "url('https://images.unsplash.com/photo-1534131657664-2f7e843493f5?auto=format&fit=crop&w=1200&q=80')",
  default:  "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80')"
};


const getWeatherIcon = (main: string) => {
  switch (main?.toLowerCase()) {
    case "clouds": return "🌥️";
    case "clear": return "☀️";
    case "rain": return "🌧️";
    case "drizzle": return "🌦️";
    case "thunderstorm": return "⛈️";
    case "snow": return "❄️";
    case "mist": return "🌫️";
    default: return "🌡️";
  }
};

const getCityIllustration = (city: string, country: string) => {
  if (/surat/i.test(city)) return "🍲";
  if (/ahmedabad/i.test(city)) return "🏛️";
  if (/paris|france/i.test(city + country)) return "🗼";
  return "🌍";
};

const getBackgroundByWeather = (main: string) => {
  return WEATHER_BACKGROUNDS[main?.toLowerCase()] || WEATHER_BACKGROUNDS.default;
};

const Dashboard: React.FC = () => {
  const { user, logout, loading, isAuthenticated } = useAuth();
  const [cityInput, setCityInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [weather, setWeather] = useState<any>(null);
  const [localTime, setLocalTime] = useState('');
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);
  const [fixedWeather, setFixedWeather] = useState<any[]>([null, null]);
  const [fixedTimes, setFixedTimes] = useState<string[]>(['', '']);
  const [fixedZones, setFixedZones] = useState<string[]>(['', '']);
  const [aiSummary, setAiSummary] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  // Fetch weather for searched city
  useEffect(() => {
    if (selectedCity) fetchWeather(selectedCity, setWeather, setLocalTime);
    // eslint-disable-next-line
  }, [selectedCity]);

  // Fetch weather for fixed cities
  useEffect(() => {
    FIXED_CITIES.forEach((c, i) => {
      fetchWeather(
        c.city,
        (data: any) => {
          setFixedWeather(prev => {
            const arr = [...prev];
            arr[i] = data;
            return arr;
          });
          // Set local time and timezone
          if (data && data.timezone !== undefined) {
            const dt = DateTime.utc().plus({ seconds: data.timezone });
            setFixedTimes(prev => {
              const arr = [...prev];
              arr[i] = dt.toFormat("hh:mm a");
              return arr;
            });
            setFixedZones(prev => {
              const arr = [...prev];
              arr[i] = `UTC${data.timezone >= 0 ? '+' : ''}${data.timezone / 3600}`;
              return arr;
            });
          }
        }
      );
    });
    // eslint-disable-next-line
  }, []);

  // Autosuggest logic
  useEffect(() => {
    if (cityInput.length < 2) {
      setSuggestions([]);
      setActiveSuggestion(-1);
      return;
    }
    const filtered = CITY_SUGGESTIONS.filter(c =>
      c.toLowerCase().startsWith(cityInput.toLowerCase()) &&
      c.toLowerCase() !== cityInput.toLowerCase()
    ).slice(0, 5);
    setSuggestions(filtered);
    setActiveSuggestion(-1);
  }, [cityInput]);

  const fetchWeather = async (
    city: string,
    setWeatherFn: (data: any) => void,
    setLocalTimeFn?: (time: string) => void
  ) => {
    try {
      setError('');
      setWeatherFn(null);
      if (setLocalTimeFn) setLocalTimeFn('');
      setSearching(true);
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`
      );
      if (!res.ok) throw new Error('City not found or API error.');
      const data = await res.json();
      setWeatherFn(data);
      if (setLocalTimeFn) {
        const timezoneOffset = data.timezone;
        const local = DateTime.utc().plus({ seconds: timezoneOffset });
        setLocalTimeFn(local.toFormat("cccc, dd LLL yyyy • hh:mm a"));
      }
      // Fetch AI summary for main city only
      if (setWeatherFn === setWeather) fetchAISummary(data);
    } catch (err: any) {
      setError(err.message || 'Could not fetch weather.');
    } finally {
      setSearching(false);
    }
  };

  const fetchAISummary = async (data: any) => {
    setLoadingAI(true);
    setAiSummary('');
    try {
      const aiRes = await fetch('http://localhost:8000/api/ai-summary', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          city: data.name,
          country: data.sys.country,
          temp: data.main.temp,
          humidity: data.main.humidity,
          condition: data.weather[0].main,
          windSpeed: data.wind.speed,
          datetime: DateTime.utc().plus({ seconds: data.timezone }).toISO(),
        }),
      });

      if (!aiRes.ok) {
        throw new Error('Failed to get AI summary');
      }

      const aiData = await aiRes.json();
      setAiSummary(aiData.summary);
    } catch (err: any) {
      setAiSummary('Could not fetch AI summary.');
    } finally {
      setLoadingAI(false);
    }
  };

  const handleCitySearch = () => {
    if (!cityInput.trim()) {
      setError('Please enter a city name.');
      return;
    }
    setSelectedCity(cityInput.trim());
    setCityInput('');
    setSuggestions([]);
    setActiveSuggestion(-1);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      setActiveSuggestion(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      setActiveSuggestion(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      if (activeSuggestion >= 0 && activeSuggestion < suggestions.length) {
        setSelectedCity(suggestions[activeSuggestion]);
        setCityInput('');
        setSuggestions([]);
        setActiveSuggestion(-1);
      } else {
        handleCitySearch();
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Get background based on weather
  const mainWeather = weather?.weather?.[0]?.main?.toLowerCase() || 'default';
  const backgroundImage = getBackgroundByWeather(mainWeather);

  // Add a function to get short funny weather titles
  const getShortWeatherTitle = () => {
    const titles = [
      "🌤️ Weather Magic",
      "🌦️ Cloud Chaser",
      "☀️ Sun Seeker",
      "🌧️ Rain Tracker",
      "❄️ Snow Finder",
      "🌪️ Storm Hunter",
      "🌈 Weather Pro",
      "🌡️ Temp Master",
      "💨 Wind Watcher",
      "🌫️ Fog Finder",
      "⚡ Lightning Pro",
      "🌊 Wave Tracker",
      "🏔️ Peak Weather",
      "🏖️ Beach Weather",
      "🌅 Sky Watcher"
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  };

  // Add this temporarily at the top of your Dashboard component to test the API
  useEffect(() => {
    // Test the weather API
    const testWeatherAPI = async () => {
      try {
        const testUrl = `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${WEATHER_API_KEY}&units=metric`;
        const response = await fetch(testUrl);
        const data = await response.json();
        
        if (response.ok) {
          console.log('✅ Weather API is working!', data.name, data.main.temp);
        } else {
          console.log('❌ Weather API error:', data);
        }
      } catch (error) {
        console.log('❌ Weather API failed:', error);
      }
    };
    
    if (WEATHER_API_KEY) {
      testWeatherAPI();
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div
      className="min-h-screen w-full flex flex-col relative overflow-auto"
      style={{
        backgroundImage: backgroundImage,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Black overlay - full screen */}
      <div className="fixed inset-0 bg-black/40 z-0" />
      
      {/* Header - Fixed at top */}
      <div className="relative z-10 w-full bg-black/30 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-6xl mx-auto px-8 py-4 flex justify-between items-center">
          {/* Left side - Demo name */}
          <div className="text-white text-2xl font-bold">
            {getShortWeatherTitle()}
          </div>
          
          {/* Right side - User info and logout */}
          <div className="flex items-center gap-4">
            <div className="text-white font-semibold">
              Welcome, {user?.name || 'User'}!
            </div>
            <button
              onClick={handleLogout}
              className="py-2 px-4 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content - Below header */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-row gap-8 py-12 px-8">
        {/* Main Weather Card */}
        <div className="flex-1">
          {/* Search bar */}
          <div className="flex justify-center mb-6">
            <div className="relative w-full max-w-md">
              <input
                ref={inputRef}
                className="w-full px-5 py-3 rounded-full bg-white/20 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow"
                value={cityInput}
                onChange={e => setCityInput(e.target.value)}
                placeholder="Type a city... let's chase the weather!"
                onKeyDown={handleInputKeyDown}
                disabled={searching}
                autoComplete="off"
              />
              <button
                onClick={handleCitySearch}
                className={`absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1 rounded-full font-semibold shadow transition ${
                  cityInput.trim()
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
                disabled={!cityInput.trim() || searching}
              >
                Search
              </button>
              {/* Autosuggestions */}
              {suggestions.length > 0 && (
                <div className="absolute z-20 mt-2 w-full bg-white/95 rounded shadow text-blue-800">
                  {suggestions.map((s, idx) => (
                    <div
                      key={s}
                      className={`px-4 py-2 cursor-pointer hover:bg-blue-100 ${
                        idx === activeSuggestion ? 'bg-blue-200 font-bold' : ''
                      }`}
                      onMouseDown={() => {
                        setSelectedCity(s);
                        setCityInput('');
                        setSuggestions([]);
                        setActiveSuggestion(-1);
                      }}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Daily Forecast Card */}
          {weather && (
            <div className="rounded-3xl bg-black/60 shadow-2xl p-8 text-white mb-8">
              <div className="text-2xl font-bold mb-2">Daily Forecast</div>
              <div className="flex flex-row items-center justify-between mb-4">
                <div>
                  <div className="text-3xl font-bold">{weather.name}</div>
                  <div className="text-gray-300 text-sm">
                    {localTime}
                  </div>
                </div>
                <div className="text-7xl">{getWeatherIcon(weather.weather?.[0]?.main)}</div>
                <div className="flex flex-col items-end">
                  <div className="text-4xl font-bold">{Math.round(weather.main.temp * 10) / 10}°</div>
                  <div className="text-gray-300">{weather.weather?.[0]?.description}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center text-lg">
                <div>
                  <div className="font-bold">{Math.round(weather.main.temp_max * 10) / 10}°</div>
                  <div className="text-xs text-gray-300">High</div>
                </div>
                <div>
                  <div className="font-bold">{Math.round(weather.main.temp_min * 10) / 10}°</div>
                  <div className="text-xs text-gray-300">Low</div>
                </div>
                <div>
                  <div className="font-bold">{weather.wind.speed} km/h</div>
                  <div className="text-xs text-gray-300">Wind Speed</div>
                </div>
                <div>
                  <div className="font-bold">{weather.main.humidity}%</div>
                  <div className="text-xs text-gray-300">Humidity</div>
                </div>
                <div>
                  <div className="font-bold">
                    {DateTime.fromSeconds(weather.sys.sunrise + weather.timezone).toFormat('h:mm a')}
                  </div>
                  <div className="text-xs text-gray-300">Sunrise</div>
                </div>
                <div>
                  <div className="font-bold">
                    {DateTime.fromSeconds(weather.sys.sunset + weather.timezone).toFormat('h:mm a')}
                  </div>
                  <div className="text-xs text-gray-300">Sunset</div>
                </div>
              </div>
              {error && <div className="text-red-400 text-center mt-2">{error}</div>}
            </div>
          )}
          
          {/* AI Summary - now full width */}
          <div className="rounded-3xl bg-black/60 shadow-2xl p-6 text-white">
            <div className="font-bold text-lg mb-2">🤖 AI Weather Summary</div>
            {loadingAI ? (
              <div>Getting AI summary...</div>
            ) : (
              <div className="whitespace-pre-line font-bold">{aiSummary}</div>
            )}
          </div>
        </div>
        
        {/* Right Side: Fixed Cities */}
        <div className="flex flex-col gap-8 w-[260px]">
          {FIXED_CITIES.map((c, i) => (
            <div
              key={c.city}
              className="rounded-3xl bg-gradient-to-br from-blue-900/70 via-blue-600/60 to-blue-400/50 shadow-xl p-6 flex flex-col items-center text-white backdrop-blur-md"
            >
              <div className="text-3xl mb-2">{getCityIllustration(fixedWeather[i]?.name || c.city, fixedWeather[i]?.sys?.country || c.country)}</div>
              <div className="text-2xl font-extrabold mb-1 tracking-wide drop-shadow">{c.city.toUpperCase()}</div>
              {fixedWeather[i] ? (
                <>
                  <div className="text-xl font-bold mb-1">{Math.round(fixedWeather[i].main.temp * 10) / 10}°</div>
                  <div className="text-gray-100 text-xs mb-1">{fixedWeather[i].weather?.[0]?.main}</div>
                  <div className="text-gray-100 text-xs mb-1">min {Math.round(fixedWeather[i].main.temp_min * 10) / 10}° / max {Math.round(fixedWeather[i].main.temp_max * 10) / 10}°</div>
                  <div className="text-yellow-200 text-xs font-bold mb-1">Timezone: {fixedZones[i]}</div>
                  <div className="text-yellow-100 text-xs font-bold">Local Time: {fixedTimes[i]}</div>
                </>
              ) : (
                <div className="text-gray-400 text-xs">Loading...</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;