import { capitals } from "../data/capitals.ts";
import template from "./capital-detail.html";

// WMO Weather code → emoji + description
const weatherCodes: Record<number, [string, string]> = {
  0: ["\u2600\uFE0F", "Clear sky"],
  1: ["\u{1F324}\uFE0F", "Mainly clear"],
  2: ["\u26C5", "Partly cloudy"],
  3: ["\u2601\uFE0F", "Overcast"],
  45: ["\u{1F32B}\uFE0F", "Fog"],
  48: ["\u{1F32B}\uFE0F", "Depositing rime fog"],
  51: ["\u{1F326}\uFE0F", "Light drizzle"],
  53: ["\u{1F326}\uFE0F", "Moderate drizzle"],
  55: ["\u{1F326}\uFE0F", "Dense drizzle"],
  61: ["\u{1F327}\uFE0F", "Slight rain"],
  63: ["\u{1F327}\uFE0F", "Moderate rain"],
  65: ["\u{1F327}\uFE0F", "Heavy rain"],
  71: ["\u{1F328}\uFE0F", "Slight snow"],
  73: ["\u{1F328}\uFE0F", "Moderate snow"],
  75: ["\u{1F328}\uFE0F", "Heavy snow"],
  80: ["\u{1F326}\uFE0F", "Slight showers"],
  81: ["\u{1F327}\uFE0F", "Moderate showers"],
  82: ["\u{1F327}\uFE0F", "Violent showers"],
  95: ["\u26C8\uFE0F", "Thunderstorm"],
  96: ["\u26C8\uFE0F", "Thunderstorm with hail"],
  99: ["\u26C8\uFE0F", "Thunderstorm with heavy hail"],
};

// --- Currency cache (localStorage, TTL = 10 min) ---
// Key uses the 'ns:' prefix convention from @lopatnov/namespace-storage

interface MonobankRate {
  currencyCodeA: number;
  currencyCodeB: number;
  rateBuy?: number;
  rateSell?: number;
  rateCross?: number;
}

const RATES_KEY = "ns:monobank-rates";
const RATES_TTL = 10 * 60 * 1000; // 10 minutes

function loadCachedRates(): { rates: MonobankRate[]; fromCache: boolean } | null {
  try {
    const raw = localStorage.getItem(RATES_KEY);
    if (!raw) return null;
    const { data, timestamp }: { data: MonobankRate[]; timestamp: number } = JSON.parse(raw);
    if (Date.now() - timestamp > RATES_TTL) return null;
    return { rates: data, fromCache: true };
  } catch {
    return null;
  }
}

function saveCachedRates(data: MonobankRate[]): void {
  try {
    localStorage.setItem(RATES_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // Storage quota exceeded or private browsing — ignore
  }
}

export default async function capitalDetail(container: Element, params: Record<string, string>) {
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

  container.innerHTML = template;
  $("#breadcrumb-name").text(capital.name);
  $("#capital-name").text(`${capital.name}`);
  $("#capital-country").text(capital.country);
  $("#capital-description").text(capital.description);

  // Fetch weather
  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${capital.lat}&longitude=${capital.lng}&current=temperature_2m,wind_speed_10m,weather_code&timezone=auto`;
    const weather = await $.getJSON(weatherUrl);
    const code = weather.current.weather_code as number;
    const [emoji, desc] = weatherCodes[code] ?? ["\u2753", "Unknown"];

    $("#weather-spinner").addClass("d-none");
    $("#weather-data").removeClass("d-none");
    $("#weather-temp").text(`${weather.current.temperature_2m}\u00B0C`);
    $("#weather-wind").text(`${weather.current.wind_speed_10m} km/h`);
    $("#weather-icon").text(emoji);
    $("#weather-desc").text(desc);
  } catch {
    $("#weather-section .card-body").html(
      '<div class="alert alert-warning mb-0"><i class="bi bi-exclamation-triangle me-2"></i>Weather data unavailable</div>',
    );
  }

  // Fetch currency (with localStorage cache, TTL = 10 min)
  try {
    let rates: MonobankRate[];
    let fromCache = false;

    const cached = loadCachedRates();
    if (cached) {
      rates = cached.rates;
      fromCache = true;
    } else {
      rates = (await $.getJSON("/api/monobank/bank/currency")) as MonobankRate[];
      saveCachedRates(rates);
    }

    const rate = rates.find(
      (r) => r.currencyCodeA === capital.currencyCode && r.currencyCodeB === 980,
    );

    $("#currency-spinner").addClass("d-none");
    $("#currency-data").removeClass("d-none");

    if (rate) {
      const rateValue = rate.rateSell ?? rate.rateCross ?? rate.rateBuy;
      $("#currency-rate").text(`${rateValue?.toFixed(2)} UAH`);
      const cacheNote = fromCache ? ' <span class="badge bg-secondary ms-1">cached</span>' : "";
      $("#currency-label").html(`1 ${capital.currencyName} → UAH (Monobank)${cacheNote}`);
    } else if (capital.currencyCode === 980) {
      $("#currency-rate").text("UAH");
      $("#currency-label").text("Local currency");
    } else {
      $("#currency-rate").text("N/A");
      $("#currency-label").text("Rate not available for this currency");
    }
  } catch {
    $("#currency-section .card-body").html(
      '<div class="alert alert-warning mb-0"><i class="bi bi-exclamation-triangle me-2"></i>Currency data unavailable (proxy required)</div>',
    );
  }
}
