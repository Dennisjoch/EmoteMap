const ALL_COUNTRIES = [
    { countryCode: "DE", name: "Deutschland" },
    { countryCode: "US", name: "USA" },
    { countryCode: "FR", name: "Frankreich" },
    { countryCode: "IT", name: "Italien" },
    { countryCode: "ES", name: "Spanien" },
    // Fügen Sie hier weitere Länder hinzu
];

firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();

async function getStatistics() {
    const emotes = await fetch("test_votes.json").then((response) => response.json());

    const countries = {};

    emotes.forEach(emoteData => {
        if (emoteData.countryCode in countries) {
            countries[emoteData.countryCode].votes += 1;
            if (emoteData.emote === '😊') {
                countries[emoteData.countryCode].happiness += 1;
            }
        } else {
            countries[emoteData.countryCode] = {
                votes: 1,
                happiness: emoteData.emote === '😊' ? 1 : 0,
            };
        }
    });

    let mostVotesCountry = '';
    let mostVotes = 0;

    let happiestCountry = '';
    let highestHappinessRatio = 0;

    for (const countryCode in countries) {
        if (countries[countryCode].votes > mostVotes) {
            mostVotes = countries[countryCode].votes;
            mostVotesCountry = countryCode;
        }

        const happinessRatio = countries[countryCode].happiness / countries[countryCode].votes;
        if (happinessRatio > highestHappinessRatio) {
            highestHappinessRatio = happinessRatio;
            happiestCountry = countryCode;
        }
    }

    return {
        mostVotesCountry,
        happiestCountry
    };
}

(async () => {
    const stats = await getStatistics();
    document.getElementById('most-votes').innerText = stats.mostVotesCountry;
    document.getElementById('happiest-country').innerText = stats.happiestCountry;
})();

document.addEventListener("DOMContentLoaded", async () => {
    const countryCode = document.getElementById("country-select").value;
    await updateEmoteChart(countryCode);
});

async function fetchEmoteStatsForCountry(countryCode) {
    const response = await fetch("test_votes.json");
    const emotes = await response.json();

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
                case "😊":
                    emoteStats.happy++;
                    break;
                case "😢":
                    emoteStats.sad++;
                    break;
                case "😠":
                    emoteStats.angry++;
                    break;
                case "❤️":
                    emoteStats.love++;
                    break;
                default:
                    break;
            }
        }
    });

    return emoteStats;
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

function getTotalVotes(emotes) {
    return emotes.length;
}

(async function displayTotalVotes() {
    const emotes = await fetch("test_votes.json").then((response) => response.json());
    const totalVotes = getTotalVotes(emotes);
    document.getElementById("total-votes").textContent = `Anzahl der Stimmen: ${totalVotes}`;
})();


// Dropdown-Menü mit Ländern füllen
function populateCountryDropdown() {
    const select = document.getElementById("country-select");
    ALL_COUNTRIES.forEach((country) => {
        const option = document.createElement("option");
        option.value = country.countryCode;
        option.textContent = country.name;
        select.appendChild(option);
    });
}

populateCountryDropdown();

document.getElementById("country-select").addEventListener("change", async (event) => {
    const countryCode = event.target.value;
    await updateEmoteChart(countryCode);
});

async function displayEmoteChartForCountry(countryCode) {
    const emotes = await fetch("test_votes.json").then((response) => response.json());
    const countryEmotes = getEmotesForCountry(emotes, countryCode);
    const emoteCounts = countEmotes(countryEmotes);
    const emotePercentages = calculateEmotePercentages(emoteCounts, countryEmotes.length);

    const ctx = document.getElementById("emote-chart").getContext("2d");
    if (window.myChart) {
        window.myChart.destroy();
    }
    window.myChart = createEmoteChart(ctx, emotePercentages);
}
