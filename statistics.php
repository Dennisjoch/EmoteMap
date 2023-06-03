<!DOCTYPE html>
<html lang="de">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MyEmoteMap - Statistiken</title>
        <link rel="stylesheet" href="css/statistics_styles.css">
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script src="https://www.gstatic.com/firebasejs/8.6.1/firebase-app.js"></script>
        <script src="https://www.gstatic.com/firebasejs/8.6.1/firebase-auth.js"></script>
        <script src="https://www.gstatic.com/firebasejs/8.6.1/firebase-firestore.js"></script>
    </head>
    <body>
    <h1>Statistiken</h1>
        <div class="stat">
            <h2>Land mit den meisten Abstimmungen</h2>
            <p id="most-votes"></p>
        </div>
        <div class="stat">
            <h2>Glücklichstes Land</h2>
            <p id="happiest-country"></p>
        </div>
        <div class="stat">
            <h2>Gesamtzahl der Stimmen</h2>
            <p id="total-votes"></p>
        </div>
        <div class="stat">
            <h2>Emote-Verteilung für ein Land</h2>
            <select id="country-select"></select>
            <canvas id="emote-chart"></canvas>
        </div>
        <div class="stat">
            <h2>Emote-Verteilung für ein Land pro Monat</h2>
            <select id="country-select-monthly"></select>
            <canvas id="emote-chart-monthly"></canvas>
        </div>
        <div class="stat">
            <h2>Emote-Trends</h2>
            <canvas id="emote-trends-chart"></canvas>
        </div>
        <div class="stat">
            <h2>Vergleich zwischen Ländern</h2>
            <canvas id="country-comparison-chart"></canvas>
        </div>
        <script type="module" src="js/statistics.js"></script>
    </body>
</html>