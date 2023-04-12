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

async function fetchMonthlyEmoteStatsForCountry(countryCode) {
    const response = await fetch("test_votes.json");
    const emotes = await response.json();

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
                case "😊":
                    monthlyEmoteStats[month].happy++;
                    break;
                case "😢":
                    monthlyEmoteStats[month].sad++;
                    break;
                case "😠":
                    monthlyEmoteStats[month].angry++;
                    break;
                case "❤️":
                    monthlyEmoteStats[month].love++;
                    break;
                default:
                    break;
            }
        }
    });

    return monthlyEmoteStats;
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

document.addEventListener("DOMContentLoaded", async () => {
    const countryCode = document.getElementById("country-select-monthly").value;
    await updateMonthlyEmoteChart(countryCode);
});

function populateCountryDropdownMonthly() {
    const select = document.getElementById("country-select-monthly");
    ALL_COUNTRIES.forEach((country) => {
        const option = document.createElement("option");
        option.value = country.countryCode;
        option.textContent = country.name;
        select.appendChild(option);
    });
}

populateCountryDropdownMonthly();

document.getElementById("country-select-monthly").addEventListener("change", async (event) => {
    const countryCode = event.target.value;
    await updateMonthlyEmoteChart(countryCode);
});

async function createEmoteTrendsChart() {
    const emotes = await fetch("test_votes.json").then((response) => response.json());
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

createEmoteTrendsChart();

async function createCountryComparisonChart() {
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
            // Fügen Sie hier weitere Emote-Datensätze hinzu
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


createCountryComparisonChart();

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
            case "😊":
                monthlyEmoteStats[month].happy++;
                break;
            case "😢":
                monthlyEmoteStats[month].sad++;
                break;
            case "😠":
                monthlyEmoteStats[month].angry++;
                break;
            case "❤️":
                monthlyEmoteStats[month].love++;
                break;
            default:
                break;
        }
    });

    return monthlyEmoteStats;
}
