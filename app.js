// Ersetzen Sie <BACKEND_URL> durch die URL Ihres Backend-Servers
const backendUrl = "https://emotebackend.vercel.app/api/getMostPopularEmotesByCountry";

const map = L.map("map").setView([51.165691, 10.451526], 3);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

let markers = {};

function updateMarkers(emotes) {
  // Entfernen Sie alte Marker
  for (const countryCode in markers) {
    markers[countryCode].remove();
  }

  // Fügen Sie neue Marker hinzu
  for (const emoteData of emotes) {
    const marker = L.marker([emoteData.latitude, emoteData.longitude]).addTo(map);
    marker.bindPopup(`<b>${emoteData.name}</b><br>Emote: ${emoteData.emote}`);
    markers[emoteData.countryCode] = marker;
  }
}

function fetchEmotes() {
  fetch(backendUrl)
    .then((response) => response.json())
    .then((data) => {
      updateMarkers(data);
    })
    .catch((error) => console.error("Error fetching data:", error));
}

// Aktualisieren Sie die Marker beim Laden der Seite
fetchEmotes();

// Aktualisieren Sie die Marker alle 5 Minuten (300000 Millisekunden)
setInterval(fetchEmotes, 300000);
