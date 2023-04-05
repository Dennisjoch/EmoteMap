import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import EmotionMap from './EmotionMap';

function App() {
  const [emotes, setEmotes] = useState([]);

  useEffect(() => {
    const fetchEmotes = async () => {
      const backendUrl = 'https://emotebackend.vercel.app';
      try {
        const response = await fetch(`${backendUrl}/api/getMostPopularEmotesByCountry`);
        const data = await response.json();
        setEmotes(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchEmotes();
    const interval = setInterval(() => {
      fetchEmotes();
    }, 300000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1>Emotionale Landkarte</h1>
      <EmotionMap emotes={emotes} />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('app'));
