import { EUROPEAN_COUNTRIES } from './europeanCountries.js';

mapboxgl.accessToken = 'pk.eyJ1Ijoia2FsaXJvYm90IiwiYSI6ImNsZzN0Y3lrMjA4aXEzaHFlYXczbHl5c3IifQ.vCKMxqx0hgyoHzmRcpJ60w';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [10.451526, 51.165691],
  zoom: 3
});

async function fetchMostPopularEmotes() {
  const backendUrl = 'https://emotebackend.vercel.app';
  const response = await fetch(`${backendUrl}/api/getMostPopularEmotesByCountry`);
  return await response.json();
}

function addEmoteMarkers(emotes) {
  emotes.forEach(emote => {
    const countryCode = emote.countryCode;
    const countryData = EUROPEAN_COUNTRIES.find(country => country.countryCode === countryCode);

    if (countryData) {
      const el = document.createElement('div');
      el.className = 'marker';
      el.textContent = emote.emote;
      el.style.fontSize = '24px';

      new mapboxgl.Marker(el)
        .setLngLat([countryData.longitude, countryData.latitude])
        .addTo(map);
    }
  });
}

async function updateMap() {
  const mostPopularEmotes = await fetchMostPopularEmotes();
  addEmoteMarkers(mostPopularEmotes);
}

updateMap();
setInterval(updateMap, 300000); // Alle 5 Minuten aktualisieren
