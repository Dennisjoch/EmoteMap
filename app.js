import React, { useState, useEffect } from 'react';
import { render } from 'react-dom';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import Overlay from 'ol/Overlay';
import { toStringHDMS } from 'ol/coordinate';

const App = () => {
  const [selectedEmote, setSelectedEmote] = useState(null);
  const [mostPopularEmotes, setMostPopularEmotes] = useState([]);
  const [countryCode, setCountryCode] = useState(null);

  function fetchMostPopularEmotes() {
    const backendUrl = 'https://emotebackend.vercel.app';

    fetch(`${backendUrl}/api/getMostPopularEmotesByCountry`)
      .then(response => response.json())
      .then(data => {
        setMostPopularEmotes(data);
      })
      .catch(error => console.error('Error fetching data:', error));
  }

  function getEmoteForCountry(countryCode) {
    const countryEmote = mostPopularEmotes.find(emote => emote.countryCode === countryCode);
    console.log('Emote for country', countryCode, countryEmote ? countryEmote.emote : '🤔');
    return countryEmote ? countryEmote.emote : '🤔';
  }

  async function fetchCountryCode() {
    const response = await fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat=51.165691&lon=10.451526');
    const data = await response.json();

    if (data && data.address && data.address.country_code) {
      setCountryCode(data.address.country_code.toUpperCase());
    }
  }

  useEffect(() => {
    fetchCountryCode();
    fetchMostPopularEmotes();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      fetchMostPopularEmotes();
    }, 300000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!countryCode) return;

    const markerCoords = COUNTRIES.find(c => c.countryCode === countryCode)?.coords;
    if (!markerCoords) return;

    const map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat(markerCoords),
        zoom: 6,
      }),
    });

    const marker = new Feature({
      geometry: new Point(fromLonLat(markerCoords)),
    });

    const markerVectorSource = new VectorSource({
      features: [marker],
    });

    const markerVectorLayer = new VectorLayer({
      source: markerVectorSource,
    });

    map.addLayer(markerVectorLayer);

    const popup = new Overlay({
      element: document.getElementById('popup'),
      positioning: 'bottom-center',
      stopEvent: false,
      offset: [0, -10],
    });

    map.addOverlay(popup);

    map.on('click', function (evt) {
      const feature = map.getFeaturesAtPixel(evt.pixel)[0];
      if (feature) {
        const coordinate = feature.getGeometry().getCoordinates();
       
