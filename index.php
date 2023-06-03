<!DOCTYPE html>
<html lang="de">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MyEmoteMap</title>
        <link rel="icon" type="image/x-icon" href="img/favicon.ico">
        <link rel="stylesheet" href="css/styles.css">
        <meta property="og:title" content="MyEmoteMap" />
        <meta property="og:description" content="Erkunde eine Weltkarte, die die Emotionen der Menschen in Echtzeit zeigt, und erhalte faszinierende Einblicke in globale Stimmungen." />
        <meta property="og:image" content="https://dennisjoch.github.io/EmoteMap/MyEmoteApp_Card.png" />
        <meta property="og:url" content="https://dennisjoch.github.io/EmoteMap/" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="MyEmoteMap" />
        <meta name="twitter:description" content="Erkunde eine Weltkarte, die die Emotionen der Menschen in Echtzeit zeigt, und erhalte faszinierende Einblicke in globale Stimmungen." />
        <meta name="twitter:image" content="https://dennisjoch.github.io/EmoteMap/MyEmoteApp_Card.png" />
        <link rel="canonical" href="https://dennisjoch.github.io/EmoteMap/">
        <meta name="author" content="DeDo Studios UG">
        <meta name="copyright" content="DeDo Studios UG">
        <link rel="stylesheet" href="https://code.jquery.com/ui/1.12.1/themes/smoothness/jquery-ui.css">
        <link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">
        <link href="https://api.mapbox.com/mapbox-gl-js/v2.7.0/mapbox-gl.css" rel="stylesheet" />
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap" rel="stylesheet">
    </head>
    <body>
        <?php
        $is_logged_in = false;
        if ($is_logged_in) {
            echo '<button id="logout-btn">Logout</button>';
        } else {
            echo '<button id="login-btn">Login</button>';
        }
        ?>
        <div class="legend">
            <p><span role="img" aria-label="happy">😊</span> - Happy</p>
            <p><span role="img" aria-label="sad">😢</span> - Sad</p>
            <p><span role="img" aria-label="angry">😠</span> - Angry</p>
            <p><span role="img" aria-label="love">❤️</span> - Love</p>
            <p><span role="img" aria-label="thinking">🤔</span> - No data available</p>
        </div>
        <div id="map">
            <!-- Map -->
        </div>
        <script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js"></script>
        <script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-auth.js"></script>
        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
        <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js"></script>
        <script src="https://api.mapbox.com/mapbox-gl-js/v2.7.0/mapbox-gl.js"></script>
        <script src="js/countrys/europeanCountries.js"></script>
        <script src="js/countrys/asianCountries.js"></script>
        <script src="js/countrys/africanCountries.js"></script>
        <script src="js/countrys/northAmericanCountries.js"></script>
        <script src="js/countrys/southAmericanCountries.js"></script>
        <script src="js/countrys/oceaniaCountries.js"></script>
        <script type="module" src="js/app.js"></script>
        <div id="login-dialog" style="display:none;">
            <p id="login-error" style="color: red;"></p>
            <label for="username">Email:</label>
            <input type="text" id="username" />
            <label for="password">Password:</label>
            <input type="password" id="password" />
            <div id="login-button-container">
                <button id="submit-btn">Login</button>
                <button id="open-register-btn">Register</button>
            </div>
        </div>
        <div id="register-dialog" style="display:none;">
            <p id="register-error" style="color: red;"></p>
            <label for="reg-username">Username:</label>
            <input type="text" id="reg-username" />
            <label for="reg-email">Email:</label>
            <input type="text" id="reg-email" />
            <label for="reg-password">Password:</label>
            <input type="password" id="reg-password" />
            <div id="register-button-container">
                <button id="register-submit-btn">Registrieren</button>
                <button id="register-login-btn">Login</button>
            </div>
        </div>
    </body>
</html>