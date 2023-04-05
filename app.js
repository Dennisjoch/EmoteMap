import React, { useEffect, useState } from 'react';

function App() {
  const [markers, setMarkers] = useState([]);

  async function fetchEmoteMarkers() {
    try {
      const response = await fetch('https://emotebackend.vercel.app/api/getMostPopularEmotesByCountry');
      const data = await response.json();

      // Konvertieren der Emote-Daten in Marker-Objekte
      const markers = data.map(emote => ({
        latlng: [emote.latitude, emote.longitude],
        emote: emote.emote
      }));

      setMarkers(markers);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  useEffect(() => {
    // Rufe die Emote-Marker alle 5 Minuten auf
    fetchEmoteMarkers();
    const interval = setInterval(fetchEmoteMarkers, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Erstelle die Karte mit Leaflet und füge die Marker hinzu
    const map = L.map('map').setView([51.165691, 10.451526], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    markers.forEach(marker => {
      const icon = L.divIcon({
        className: 'emote-marker',
        html: marker.emote
      });

      L.marker(marker.latlng, { icon }).addTo(map);
    });
  }, [markers]);

  return (
    <div id="map" style={{ height: '100vh' }}></div>
  );
}

export default App;
