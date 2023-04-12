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

const ALL_COUNTRIES = [
  ...AFRICAN_COUNTRIES,
  ...ASIAN_COUNTRIES,
  ...EUROPEAN_COUNTRIES,
  ...NORTH_AMERICAN_COUNTRIES,
  ...OCEANIA_COUNTRIES,
  ...SOUTH_AMERICAN_COUNTRIES
];

function addEmoteMarkers(emotes) {
  ALL_COUNTRIES.forEach(countryData => {
    const countryCode = countryData.countryCode;
    const emoteData = emotes.find(emote => emote.countryCode === countryCode);

    const el = document.createElement('div');
    el.className = 'marker';
    el.textContent = emoteData ? emoteData.emote : '🤔'; // Fallback auf 🤔, wenn keine Emote-Daten vorhanden sind
    el.style.fontSize = '24px';

    new mapboxgl.Marker(el)
      .setLngLat([countryData.longitude, countryData.latitude])
      .addTo(map);
  });
}

async function updateMap() {
  const mostPopularEmotes = await fetchMostPopularEmotes();
  addEmoteMarkers(mostPopularEmotes);
}

updateMap();
setInterval(updateMap, 60000); // Jede minute aktualisieren

// Öffnet das Login-Fenster
$("#login-btn").click(function () {
  $("#login-dialog").dialog({
    modal: true,
    show: "fade",
    hide: "fade",
    draggable: false, // Deaktiviert das Verschieben des Login-Fensters
    title: null, // Entfernt den Standard-Dialog-Titel
    classes: { // Fügt benutzerdefinierte CSS-Klassen hinzu
      "ui-dialog": "custom-ui-dialog",
      "ui-dialog-content": "custom-ui-dialog-content"
    }
  });
});

// Überprüft die Anmeldedaten und leitet zur Statistik-Seite weiter
$("#submit-btn").click(function () {
  const username = $("#username").val();
  const password = $("#password").val();

  if (username === "admin" && password === "admin") {
    window.location.href = "statistics.html";
  } else {
    alert("Wrong username or password. Please try again.");
  }
});
