async function getFirebaseConfig() {
  const response = await fetch('config/getFirebaseConfig.php');
  return await response.json();
}

async function getMapboxAccessToken() {
  const response = await fetch('config/getMapboxAccessToken.php');
  return await response.json();
}

(async function () {
  const data = await getFirebaseConfig();
  const app = firebase.initializeApp(data.firebaseConfig);
  const auth = firebase.auth(app);

  const mapboxData = await getMapboxAccessToken();
  mapboxgl.accessToken = mapboxData.mapboxAccessToken;

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [10.451526, 51.165691],
    zoom: 3,
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
    ...SOUTH_AMERICAN_COUNTRIES,
  ];

  function addEmoteMarkers(emotes) {
    ALL_COUNTRIES.forEach((countryData) => {
      const countryCode = countryData.countryCode;
      const emoteData = emotes.find((emote) => emote.countryCode === countryCode);

      const el = document.createElement('div');
      el.className = 'marker';
      el.textContent = emoteData ? emoteData.emote : '🤔';
      el.style.fontSize = '24px';

      new mapboxgl.Marker(el).setLngLat([countryData.longitude, countryData.latitude]).addTo(map);
    });
  }

  async function updateMap() {
    const mostPopularEmotes = await fetchMostPopularEmotes();
    addEmoteMarkers(mostPopularEmotes);
  }

  updateMap();
  setInterval(updateMap, 60000);

  function openLoginDialog(errorMessage) {
    $("#login-dialog").dialog({
      autoOpen: false,
      modal: true,
      show: 'fade',
      hide: 'fade',
      draggable: false,
      title: 'Login',
      classes: {
        'ui-dialog': 'custom-ui-dialog',
        'ui-dialog-content': 'custom-ui-dialog-content',
      },
      open: function () {
        $("#login-error").text(errorMessage);
      },
    }).dialog("open");
  }

  function openRegisterDialog(errorMessage) {
    $("#register-dialog").dialog({
      autoOpen: false,
      modal: true,
      show: 'fade',
      hide: 'fade',
      draggable: false,
      title: 'Register',
      classes: {
        'ui-dialog': 'custom-ui-dialog',
        'ui-dialog-content': 'custom-ui-dialog-content',
      },
      open: function () {
        $("#register-error").text(errorMessage);
      },
    }).dialog("open");
  }

  // Funktionen zum Anmelden und Registrieren
  function loginUser(email, password) {
    auth
        .signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
          // Überprüfen, ob der Benutzer seine E-Mail-Adresse bestätigt hat
          if (userCredential.user.emailVerified) {
            // Anmeldung erfolgreich, Fenster schließen und zur Statistikseite wechseln
            $("#login-dialog").dialog("close");
            window.location.href = "statistics.php";
          } else {
            // Benutzer hat seine E-Mail-Adresse nicht bestätigt
            auth.signOut();
            $("#login-error").text('Bitte bestätigen Sie Ihre E-Mail-Adresse, bevor Sie sich anmelden.');
          }
        })
        .catch((error) => {
          // Fehlermeldung anzeigen
          $("#login-error").text(error.message);
        });
  }

  function registerUser(username, email, password) {
    auth
        .createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
          // Registrierung erfolgreich, Benutzername aktualisieren
          userCredential.user.updateProfile({ displayName: username });

          // Bestätigungs-E-Mail senden
          userCredential.user.sendEmailVerification()
              .then(() => {
                alert('Eine Bestätigungs-E-Mail wurde gesendet. Bitte überprüfen Sie Ihren Posteingang.');
              })
              .catch((error) => {
                alert('Fehler beim Senden der Bestätigungs-E-Mail:', error.message);
              });

          // Fenster schließen
          $("#registration-dialog").dialog("close");
        })
        .catch((error) => {
          // Fehlermeldung anzeigen
          $("#register-error").text(error.message);
        });
  }

  $("#login-dialog").dialog({
    autoOpen: false,
    modal: true,
    show: 'fade',
    hide: 'fade',
    draggable: false,
    title: 'Login',
    classes: {
      'ui-dialog': 'custom-ui-dialog',
      'ui-dialog-content':   'custom-ui-dialog-content',
    },
  });

  $("#register-dialog").dialog({
    autoOpen: false,
    modal: true,
    show: 'fade',
    hide: 'fade',
    draggable: false,
    title: 'Register',
    classes: {
      'ui-dialog': 'custom-ui-dialog',
      'ui-dialog-content': 'custom-ui-dialog-content',
    },
  });

  $("#register-login-btn").on("click", function () {
    $("#register-dialog").dialog("close");
    $("#login-dialog").dialog("open");
  });

// Öffnen des Login-Dialogs beim Klicken auf den Login-Button
  $("#login-btn").on("click", function () {
    $("#login-dialog").dialog("open");
  });

// Anmeldung des Benutzers beim Klicken auf den Anmelde-Button
  $("#submit-btn").on("click", function () {
    const email = $("#username").val();
    const password = $("#password").val();
    loginUser(email, password);
  });

// Öffnen des Registrierungsdialogs beim Klicken auf den Registrierungsbutton
  $("#open-register-btn").on("click", function () {
    $("#login-dialog").dialog("close");
    $("#register-dialog").dialog("open");
  });

// Registrierung des Benutzers beim Klicken auf den Registrierungs-Button
  $("#register-submit-btn").on("click", function () {
    const username = $("#reg-username").val();
    const email = $("#reg-email").val();
    const password = $("#reg-password").val();
    registerUser(username, email, password);
  });

})();
