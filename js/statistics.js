const ALL_COUNTRIES = [
    { countryCode: "DE", name: "Deutschland" },
    { countryCode: "US", name: "USA" },
    { countryCode: "FR", name: "Frankreich" },
    { countryCode: "IT", name: "Italien" },
    { countryCode: "ES", name: "Spanien" },
];

async function getFirebaseConfig() {
    const response = await fetch('config/getFirebaseConfig.php');
    return await response.json();
}

async function initializeFirebase() {
    const data = await getFirebaseConfig();
    const app = firebase.initializeApp(data.firebaseConfig);
    const auth = firebase.auth(app);
    return auth;
}

async function fetchEmotes() {
    const db = firebase.firestore();
    const emotesSnapshot = await db.collection("emotes").get();
    return emotesSnapshot.docs.map(doc => doc.data());
}

async function main() {
    await checkAuthentication();

    const emotes = await fetchEmotes();
    const countryWithMostVotes = getCountryWithMostVotes(emotes);
    const happiestCountry = getHappiestCountry(emotes);
    const totalVotes = getTotalVotes(emotes);

    //Land mit den meisten Abstimmungen
    document.getElementById("most-votes").textContent = countryWithMostVotes;
    //Glücklichstes Land
    document.getElementById("happiest-country").textContent = happiestCountry;
    //Gesamtzahl der Stimmen
    document.getElementById("total-votes").textContent = totalVotes;
    //Emote-Verteilung für ein Land (all time)
    populateCountryDropdown("country-select");
    document.getElementById("country-select").addEventListener("change", async (event) => {
        const countryCode = event.target.value;
        updateEmoteChart(countryCode);
    });
    //Emote-Verteilung für ein Land pro Monat
    populateCountryDropdown("country-select-monthly");
    document.getElementById("country-select-monthly").addEventListener("change", async (event) => {
        const countryCode = event.target.value;
        await updateMonthlyEmoteChart(countryCode);
    });
    //Emote-Trends
    createEmoteTrendsChart(emotes);
    //Vergleich zwischen Ländern
    createCountryComparisonChart(emotes);
}

function populateCountryDropdown(dropdownId) {
    const select = document.getElementById(dropdownId);
    ALL_COUNTRIES.forEach((country) => {
        const option = document.createElement("option");
        option.value = country.countryCode;
        option.textContent = country.name;
        select.appendChild(option);
    });
}

async function updateEmoteChart(countryCode) {
    const emoteStats = await fetchEmoteStatsForCountry(countryCode);
    const chartData = {
        labels: ["Happy 😊", "Sad 😢", "Angry 😠", "Love ❤️"],
        datasets: [
            {
                data: [
                    emoteStats.happy,
                    emoteStats.sad,
                    emoteStats.angry,
                    emoteStats.love,
                ],
                backgroundColor: [
                    "rgba(75, 192, 192, 0.2)",
                    "rgba(255, 99, 132, 0.2)",
                    "rgba(255, 159, 64, 0.2)",
                    "rgba(255, 205, 86, 0.2)",
                ],
                borderColor: [
                    "rgba(75, 192, 192, 1)",
                    "rgba(255, 99, 132, 1)",
                    "rgba(255, 159, 64, 1)",
                    "rgba(255, 205, 86, 1)",
                ],
                borderWidth: 1,
            },
        ],
    };

    if (window.myChart) {
        window.myChart.data = chartData;
        window.myChart.update();
    } else {
        const ctx = document.getElementById("emote-chart").getContext("2d");
        window.myChart = new Chart(ctx, {
            type: "pie",
            data: chartData,
        });
    }
}

async function updateMonthlyEmoteChart(countryCode) {
    const monthlyEmoteStats = await fetchMonthlyEmoteStatsForCountry(countryCode);
    const chartData = {
        labels: Object.keys(monthlyEmoteStats).map((month) => `Month ${Number(month) + 1}`),
        datasets: [
            {
                label: "Happy 😊",
                data: Object.values(monthlyEmoteStats).map((stats) => stats.happy),
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
            },
            {
                label: "Sad 😢",
                data: Object.values(monthlyEmoteStats).map((stats) => stats.sad),
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                borderColor: "rgba(255, 99, 132, 1)",
                borderWidth: 1,
            },
            {
                label: "Angry 😠",
                data: Object.values(monthlyEmoteStats).map((stats) => stats.angry),
                backgroundColor: "rgba(255, 159, 64, 0.2)",
                borderColor: "rgba(255, 159, 64, 1)",
                borderWidth: 1,
            },
            {
                label: "Love ❤️",
                data: Object.values(monthlyEmoteStats).map((stats) => stats.love),
                backgroundColor: "rgba(255, 205, 86, 0.2)",
                borderColor: "rgba(255, 205, 86, 1)",
                borderWidth: 1,
            },
        ],
    };

    if (window.myMonthlyChart) {
        window.myMonthlyChart.data = chartData;
        window.myMonthlyChart.update();
    } else {
        const ctx = document.getElementById("emote-chart-monthly").getContext("2d");
        window.myMonthlyChart = new Chart(ctx, {
            type: "bar",
            data: chartData,
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        });
    }
}

function getMonthlyEmoteStats(emotes) {
    const monthlyEmoteStats = {};

    emotes.forEach((emoteData) => {
        const emote = emoteData.emote;
        const month = new Date(emoteData.createdAt).getMonth();

        if (!monthlyEmoteStats[month]) {
            monthlyEmoteStats[month] = {
                happy: 0,
                sad: 0,
                angry: 0,
                love: 0,
            };
        }

        switch (emote) {
            case "happy":
                monthlyEmoteStats[month].happy++;
                break;
            case "sad":
                monthlyEmoteStats[month].sad++;
                break;
            case "angry":
                monthlyEmoteStats[month].angry++;
                break;
            case "love":
                monthlyEmoteStats[month].love++;
                break;
            default:
                break;
        }
    });

    return monthlyEmoteStats;
}

function createEmoteTrendsChart(emotes) {
    const monthlyEmoteStats = getMonthlyEmoteStats(emotes);

    const chartData = {
        labels: Object.keys(monthlyEmoteStats).map((month) => `Month ${Number(month) + 1}`),
        datasets: [
            {
                label: "Happy 😊",
                data: Object.values(monthlyEmoteStats).map((stats) => stats.happy),
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
            },
            {
                label: "Sad 😢",
                data: Object.values(monthlyEmoteStats).map((stats) => stats.sad),
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                borderColor: "rgba(255, 99, 132, 1)",
                borderWidth: 1,
            },
            {
                label: "Angry 😠",
                data: Object.values(monthlyEmoteStats).map((stats) => stats.angry),
                backgroundColor: "rgba(255, 159, 64, 0.2)",
                borderColor: "rgba(255, 159, 64, 1)",
                borderWidth: 1,
            },
            {
                label: "Love ❤️",
                data: Object.values(monthlyEmoteStats).map((stats) => stats.love),
                backgroundColor: "rgba(255, 205, 86, 0.2)",
                borderColor: "rgba(255, 205, 86, 1)",
                borderWidth: 1,
            },
        ],
    };

    const ctx = document.getElementById("emote-trends-chart").getContext("2d");
    new Chart(ctx, {
        type: "line",
        data: chartData,
    });
}

async function createCountryComparisonChart(emotes) {
    const chartData = {
        labels: ALL_COUNTRIES.map(country => country.name),
        datasets: [
            {
                label: "Happy 😊",
                data: [],
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
            },
            {
                label: "Sad 😢",
                data: [],
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                borderColor: "rgba(255, 99, 132, 1)",
                borderWidth: 1,
            },
            {
                label: "Angry 😠",
                data: [],
                backgroundColor: "rgba(255, 159, 64, 0.2)",
                borderColor: "rgba(255, 159, 64, 1)",
                borderWidth: 1,
            },
            {
                label: "Love ❤️",
                data: [],
                backgroundColor: "rgba(255, 205, 86, 0.2)",
                borderColor: "rgba(255, 205, 86, 1)",
                borderWidth: 1,
            },
        ],
    };

    for (const country of ALL_COUNTRIES) {
        const countryCode = country.countryCode;
        const emoteStats = await fetchEmoteStatsForCountry(countryCode);

        chartData.datasets[0].data.push(emoteStats.happy);
        chartData.datasets[1].data.push(emoteStats.sad);
        chartData.datasets[2].data.push(emoteStats.angry);
        chartData.datasets[3].data.push(emoteStats.love);
    }

    const ctx = document.getElementById("country-comparison-chart").getContext("2d");
    new Chart(ctx, {
        type: "bar",
        data: chartData,
    });
}

function getCountryWithMostVotes(emotes) {
    const countryVotes = {};

    emotes.forEach((emoteData) => {
        const countryCode = emoteData.countryCode;
        if (!countryVotes[countryCode]) {
            countryVotes[countryCode] = 0;
        }
        countryVotes[countryCode]++;
    });

    let maxVotes = 0;
    let maxVotesCountryCode = "";

    for (const countryCode in countryVotes) {
        if (countryVotes[countryCode] > maxVotes) {
            maxVotes = countryVotes[countryCode];
            maxVotesCountryCode = countryCode;
        }
    }

    const country = ALL_COUNTRIES.find((country) => country.countryCode === maxVotesCountryCode);
    return country ? country.name : "";
}

function getHappiestCountry(emotes) {
    const countryHappiness = {};

    emotes.forEach((emoteData) => {
        const countryCode = emoteData.countryCode;
        if (!countryHappiness[countryCode]) {
            countryHappiness[countryCode] = 0;
        }
        if (emoteData.emote === "happy") {
            countryHappiness[countryCode]++;
        }
    });

    let maxHappiness = 0;
    let maxHappinessCountryCode = "";

    for (const countryCode in countryHappiness) {
        if (countryHappiness[countryCode] > maxHappiness) {
            maxHappiness = countryHappiness[countryCode];
            maxHappinessCountryCode = countryCode;
        }
    }

    const country = ALL_COUNTRIES.find((country) => country.countryCode === maxHappinessCountryCode);
    return country ? country.name : "";
}

function getTotalVotes(emotes) {
    let totalVotes = 0;

    emotes.forEach((emoteData) => {
        totalVotes++;
    });

    return totalVotes;
}

async function fetchEmoteStatsForCountry(countryCode) {
    const emotes = await fetchEmotes();

    const emoteStats = {
        happy: 0,
        sad: 0,
        angry: 0,
        love: 0,
    };

    emotes.forEach((emoteData) => {
        if (emoteData.countryCode === countryCode) {
            const emote = emoteData.emote;
            switch (emote) {
                case "happy":
                    emoteStats.happy++;
                    break;
                case "sad":
                    emoteStats.sad++;
                    break;
                case "angry":
                    emoteStats.angry++;
                    break;
                case "love":
                    emoteStats.love++;
                    break;
                default:
                    break;
            }
        }
    });

    return emoteStats;
}

async function fetchMonthlyEmoteStatsForCountry(countryCode) {
    const emotes = await fetchEmotes();

    const monthlyEmoteStats = {};

    emotes.forEach((emoteData) => {
        if (emoteData.countryCode === countryCode) {
            const emote = emoteData.emote;
            const month = new Date(emoteData.createdAt).getMonth();

            if (!monthlyEmoteStats[month]) {
                monthlyEmoteStats[month] = {
                    happy: 0,
                    sad: 0,
                    angry: 0,
                    love: 0,
                };
            }

            switch (emote) {
                case "happy":
                    monthlyEmoteStats[month].happy++;
                    break;
                case "sad":
                    monthlyEmoteStats[month].sad++;
                    break;
                case "angry":
                    monthlyEmoteStats[month].angry++;
                    break;
                case "love":
                    monthlyEmoteStats[month].love++;
                    break;
                default:
                    break;
            }
        }
    });

    return monthlyEmoteStats;
}

async function checkAuthentication() {
    const auth = await initializeFirebase();

    return new Promise((resolve) => {
        auth.onAuthStateChanged((user) => {
            if (user) {
                // Der Benutzer ist angemeldet
                if (!user.emailVerified) {
                    // Die E-Mail-Adresse des Benutzers wurde nicht bestätigt, daher wird er auf die Startseite umgeleitet
                    alert('Bitte bestätigen Sie Ihre E-Mail-Adresse, bevor Sie auf die Statistikseite zugreifen.');
                    window.location.href = "index.php";
                } else {
                    resolve();
                }
            } else {
                // Der Benutzer ist nicht angemeldet, also wird er auf die Startseite umgeleitet
                alert('Bitte melden Sie sich an, um auf die Statistikseite zuzugreifen.');
                window.location.href = "index.php";
            }
        });
    });
}

main();