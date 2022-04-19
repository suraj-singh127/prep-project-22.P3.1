import { useEffect, useState } from 'react';
import { BiError } from 'react-icons/bi';
import backgrounds from './components/weatherCard/backgroundArray';
import './App.css';
import Navbar from './components/Navbar/navbar';
import WeatherCard from './components/weatherCard/weatherCard';
import logo from './mlh-prep.png';
import Search from './components/Navbar/Search';
import useLocation from './hooks/useLocation';
import useFetchCity from './hooks/useFetchCity';
import WeatherMap from './components/weatherMap/weatherMap';
import Alert from './components/Alerts/Alert';

function App() {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [city, setCity] = useState(null);
  const [results, setResults] = useState(null);
  const [cardBackground, setcardBackground] = useState('Clear');
  const geoLocation = useLocation();
  const geoCity = useFetchCity(
    geoLocation.coordinates.lat,
    geoLocation.coordinates.lng
  );
  const [cityCoordinates, setCityCoordinates] = useState({
    lat: geoLocation.coordinates.lat,
    lon: geoLocation.coordinates.lng,
  });

  useEffect(() => {
    setCity(`${geoCity.city}, ${geoCity.countryCode}`);
  }, [geoCity.city, geoCity.countryCode]);

  useEffect(() => {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${process.env.REACT_APP_APIKEY}`;
    fetch(url)
      .then((res) => res.json())
      .then(
        (result) => {
          if (result.cod !== 200) {
            setIsLoaded(false);
          } else {
            setIsLoaded(true);
            setResults(result);
            setcardBackground(result.weather[0].main);
            setCityCoordinates({
              lat: result.coord.lat,
              lon: result.coord.lon,
            });
          }
        },
        (err) => {
          setIsLoaded(true);
          setError(err);
        }
      );
  }, [city]);

  if (error) {
    return <div>Error: {error.message}</div>;
  }
  return (
    <div
      className="entirePage"
      style={{
        backgroundImage: `url(${backgrounds[cardBackground][0]})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <Navbar src={logo} />
      <Alert city={city} isLoaded={isLoaded} cityCoordinates={results?.coord} />
      <div>
        <h2 className="search-prompt">Enter a city below 👇</h2>
        <Search setCity={setCity} />
      </div>
      <div className="Results">
        {!isLoaded && (
          <>
            <div>
              <div className="error-prompt">
                <BiError className="error-icon" /> <br />
                Location not found <br />
                Please enter a valid location.
              </div>
              <div className="weather-map">
                <WeatherMap
                  city={city}
                  setCity={setCity}
                  cityCoordinates={cityCoordinates}
                  setCityCoordinates={setCityCoordinates}
                />
              </div>
            </div>
          </>
        )}
        {isLoaded && results && (
          <>
            <WeatherCard results={results} cardBackground={cardBackground} />
            <div className="weather-map">
              <WeatherMap
                city={city}
                setCity={setCity}
                cityCoordinates={cityCoordinates}
                setCityCoordinates={setCityCoordinates}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
