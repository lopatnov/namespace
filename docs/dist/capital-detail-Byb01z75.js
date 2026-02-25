import { t as capitals } from "./capitals-DITjSB8O.js";

//#region src/pages/capital-detail.html
var capital_detail_default = "<div class=\"py-4\">\r\n  <nav aria-label=\"breadcrumb\">\r\n    <ol class=\"breadcrumb\">\r\n      <li class=\"breadcrumb-item\"><a href=\"/examples/capitals\" data-nav>World Capitals</a></li>\r\n      <li class=\"breadcrumb-item active\" id=\"breadcrumb-name\"></li>\r\n    </ol>\r\n  </nav>\r\n\r\n  <h1 id=\"capital-name\"></h1>\r\n  <p class=\"lead text-body-secondary\" id=\"capital-country\"></p>\r\n  <p id=\"capital-description\"></p>\r\n  <hr />\r\n\r\n  <div class=\"row g-4\">\r\n    <!-- Weather -->\r\n    <div class=\"col-md-6\" id=\"weather-section\">\r\n      <div class=\"card\">\r\n        <div class=\"card-header\"><i class=\"bi bi-cloud-sun me-2\"></i>Current Weather</div>\r\n        <div class=\"card-body\">\r\n          <div class=\"d-flex justify-content-center\">\r\n            <div class=\"spinner-border text-primary\" role=\"status\" id=\"weather-spinner\">\r\n              <span class=\"visually-hidden\">Loading...</span>\r\n            </div>\r\n          </div>\r\n          <div id=\"weather-data\" class=\"d-none\">\r\n            <div class=\"row text-center\">\r\n              <div class=\"col\">\r\n                <div class=\"fs-2 fw-bold\" id=\"weather-temp\"></div>\r\n                <small class=\"text-muted\">Temperature</small>\r\n              </div>\r\n              <div class=\"col\">\r\n                <div class=\"fs-2 fw-bold\" id=\"weather-wind\"></div>\r\n                <small class=\"text-muted\">Wind</small>\r\n              </div>\r\n              <div class=\"col\">\r\n                <div class=\"fs-4\" id=\"weather-icon\"></div>\r\n                <small class=\"text-muted\" id=\"weather-desc\"></small>\r\n              </div>\r\n            </div>\r\n          </div>\r\n        </div>\r\n      </div>\r\n    </div>\r\n\r\n    <!-- Currency -->\r\n    <div class=\"col-md-6\" id=\"currency-section\">\r\n      <div class=\"card\">\r\n        <div class=\"card-header\"><i class=\"bi bi-currency-exchange me-2\"></i>Exchange Rate</div>\r\n        <div class=\"card-body\">\r\n          <div class=\"d-flex justify-content-center\">\r\n            <div class=\"spinner-border text-primary\" role=\"status\" id=\"currency-spinner\">\r\n              <span class=\"visually-hidden\">Loading...</span>\r\n            </div>\r\n          </div>\r\n          <div id=\"currency-data\" class=\"d-none\">\r\n            <div class=\"text-center\">\r\n              <div class=\"fs-4 fw-bold\" id=\"currency-rate\"></div>\r\n              <small class=\"text-muted\" id=\"currency-label\"></small>\r\n            </div>\r\n          </div>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n\r\n  <div class=\"mt-3\">\r\n    <small class=\"text-muted\">\r\n      <i class=\"bi bi-info-circle me-1\"></i>\r\n      Weather: <a href=\"https://open-meteo.com\" target=\"_blank\">Open-Meteo API</a>.\r\n      Currency: <a href=\"https://api.monobank.ua\" target=\"_blank\">Monobank API</a> (available locally via proxy).\r\n    </small>\r\n  </div>\r\n\r\n  <a href=\"/examples/capitals\" data-nav class=\"btn btn-outline-secondary btn-sm mt-4\">\r\n    <i class=\"bi bi-arrow-left me-1\"></i>Back to Capitals\r\n  </a>\r\n</div>\r\n";

//#endregion
//#region src/pages/capital-detail.ts
const weatherCodes = {
	0: ["☀️", "Clear sky"],
	1: ["🌤️", "Mainly clear"],
	2: ["⛅", "Partly cloudy"],
	3: ["☁️", "Overcast"],
	45: ["🌫️", "Fog"],
	48: ["🌫️", "Depositing rime fog"],
	51: ["🌦️", "Light drizzle"],
	53: ["🌦️", "Moderate drizzle"],
	55: ["🌦️", "Dense drizzle"],
	61: ["🌧️", "Slight rain"],
	63: ["🌧️", "Moderate rain"],
	65: ["🌧️", "Heavy rain"],
	71: ["🌨️", "Slight snow"],
	73: ["🌨️", "Moderate snow"],
	75: ["🌨️", "Heavy snow"],
	80: ["🌦️", "Slight showers"],
	81: ["🌧️", "Moderate showers"],
	82: ["🌧️", "Violent showers"],
	95: ["⛈️", "Thunderstorm"],
	96: ["⛈️", "Thunderstorm with hail"],
	99: ["⛈️", "Thunderstorm with heavy hail"]
};
const RATES_KEY = "ns:monobank-rates";
const RATES_TTL = 600 * 1e3;
function loadCachedRates() {
	try {
		const raw = localStorage.getItem(RATES_KEY);
		if (!raw) return null;
		const { data, timestamp } = JSON.parse(raw);
		if (Date.now() - timestamp > RATES_TTL) return null;
		return {
			rates: data,
			fromCache: true
		};
	} catch {
		return null;
	}
}
function saveCachedRates(data) {
	try {
		localStorage.setItem(RATES_KEY, JSON.stringify({
			data,
			timestamp: Date.now()
		}));
	} catch {}
}
async function capitalDetail(container, params) {
	const capital = capitals.find((c) => c.id === params.id);
	if (!capital) {
		container.innerHTML = `
      <div class="py-4">
        <h1>Capital not found</h1>
        <p>No data for <code>${params.id}</code>.</p>
        <a href="/examples/capitals" data-nav class="btn btn-outline-primary">Back to Capitals</a>
      </div>`;
		return;
	}
	container.innerHTML = capital_detail_default;
	$("#breadcrumb-name").text(capital.name);
	$("#capital-name").text(`${capital.name}`);
	$("#capital-country").text(capital.country);
	$("#capital-description").text(capital.description);
	try {
		const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${capital.lat}&longitude=${capital.lng}&current=temperature_2m,wind_speed_10m,weather_code&timezone=auto`;
		const weather = await $.getJSON(weatherUrl);
		const [emoji, desc] = weatherCodes[weather.current.weather_code] ?? ["❓", "Unknown"];
		$("#weather-spinner").addClass("d-none");
		$("#weather-data").removeClass("d-none");
		$("#weather-temp").text(`${weather.current.temperature_2m}\u00B0C`);
		$("#weather-wind").text(`${weather.current.wind_speed_10m} km/h`);
		$("#weather-icon").text(emoji);
		$("#weather-desc").text(desc);
	} catch {
		$("#weather-section .card-body").html("<div class=\"alert alert-warning mb-0\"><i class=\"bi bi-exclamation-triangle me-2\"></i>Weather data unavailable</div>");
	}
	try {
		let rates;
		let fromCache = false;
		const cached = loadCachedRates();
		if (cached) {
			rates = cached.rates;
			fromCache = true;
		} else {
			rates = await $.getJSON("/api/monobank/bank/currency");
			saveCachedRates(rates);
		}
		const rate = rates.find((r) => r.currencyCodeA === capital.currencyCode && r.currencyCodeB === 980);
		$("#currency-spinner").addClass("d-none");
		$("#currency-data").removeClass("d-none");
		if (rate) {
			const rateValue = rate.rateSell ?? rate.rateCross ?? rate.rateBuy;
			$("#currency-rate").text(`${rateValue?.toFixed(2)} UAH`);
			const cacheNote = fromCache ? " <span class=\"badge bg-secondary ms-1\">cached</span>" : "";
			$("#currency-label").html(`1 ${capital.currencyName} → UAH (Monobank)${cacheNote}`);
		} else if (capital.currencyCode === 980) {
			$("#currency-rate").text("UAH");
			$("#currency-label").text("Local currency");
		} else {
			$("#currency-rate").text("N/A");
			$("#currency-label").text("Rate not available for this currency");
		}
	} catch {
		$("#currency-section .card-body").html("<div class=\"alert alert-warning mb-0\"><i class=\"bi bi-exclamation-triangle me-2\"></i>Currency data unavailable (proxy required)</div>");
	}
}

//#endregion
export { capitalDetail as default };