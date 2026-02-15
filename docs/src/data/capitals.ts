export interface Capital {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  currencyCode: number;
  currencyName: string;
  description: string;
}

export const capitals: Capital[] = [
  {
    id: "kyiv",
    name: "Kyiv",
    country: "Ukraine",
    lat: 50.45,
    lng: 30.52,
    currencyCode: 980,
    currencyName: "UAH",
    description:
      "Kyiv is the capital and most populous city of Ukraine. Founded in the 5th century, it is one of the oldest cities in Eastern Europe. Known for its golden-domed churches, the Kyiv Pechersk Lavra, and a vibrant tech industry.",
  },
  {
    id: "washington",
    name: "Washington, D.C.",
    country: "United States",
    lat: 38.91,
    lng: -77.04,
    currencyCode: 840,
    currencyName: "USD",
    description:
      "Washington, D.C. is the capital of the United States, home to the White House, the Capitol, and the Smithsonian museums. The city was designed by Pierre Charles L'Enfant in 1791.",
  },
  {
    id: "london",
    name: "London",
    country: "United Kingdom",
    lat: 51.51,
    lng: -0.13,
    currencyCode: 826,
    currencyName: "GBP",
    description:
      "London is the capital of England and the United Kingdom. A global centre for finance, arts, and culture, it is home to Big Ben, the Tower of London, and Buckingham Palace.",
  },
  {
    id: "tokyo",
    name: "Tokyo",
    country: "Japan",
    lat: 35.68,
    lng: 139.69,
    currencyCode: 392,
    currencyName: "JPY",
    description:
      "Tokyo is the capital of Japan and the world's most populous metropolitan area. It blends ultramodern technology with traditional temples, and is famous for its cherry blossoms and cuisine.",
  },
  {
    id: "paris",
    name: "Paris",
    country: "France",
    lat: 48.86,
    lng: 2.35,
    currencyCode: 978,
    currencyName: "EUR",
    description:
      "Paris is the capital of France, known as the City of Light. Home to the Eiffel Tower, the Louvre, and Notre-Dame, it is a global center for art, fashion, and gastronomy.",
  },
  {
    id: "berlin",
    name: "Berlin",
    country: "Germany",
    lat: 52.52,
    lng: 13.41,
    currencyCode: 978,
    currencyName: "EUR",
    description:
      "Berlin is the capital of Germany. Known for its history, vibrant arts scene, and the Brandenburg Gate. The city was divided by the Berlin Wall from 1961 to 1989.",
  },
  {
    id: "canberra",
    name: "Canberra",
    country: "Australia",
    lat: -35.28,
    lng: 149.13,
    currencyCode: 36,
    currencyName: "AUD",
    description:
      "Canberra is the capital of Australia, a planned city chosen as a compromise between Sydney and Melbourne. It is home to Parliament House and the Australian War Memorial.",
  },
  {
    id: "ottawa",
    name: "Ottawa",
    country: "Canada",
    lat: 45.42,
    lng: -75.7,
    currencyCode: 124,
    currencyName: "CAD",
    description:
      "Ottawa is the capital of Canada, located on the Ontario side of the Ottawa River. Known for Parliament Hill, the Rideau Canal (a UNESCO World Heritage Site), and the National Gallery.",
  },
  {
    id: "warsaw",
    name: "Warsaw",
    country: "Poland",
    lat: 52.23,
    lng: 21.01,
    currencyCode: 985,
    currencyName: "PLN",
    description:
      "Warsaw is the capital of Poland. Almost completely destroyed in World War II, it was meticulously rebuilt. The Old Town is a UNESCO World Heritage Site. Today it is a major European tech hub.",
  },
  {
    id: "brasilia",
    name: "Brasilia",
    country: "Brazil",
    lat: -15.79,
    lng: -47.88,
    currencyCode: 986,
    currencyName: "BRL",
    description:
      "Brasilia is the capital of Brazil, inaugurated in 1960. Designed by Oscar Niemeyer and Lucio Costa, the entire city is a UNESCO World Heritage Site known for its modernist architecture.",
  },
  {
    id: "ankara",
    name: "Ankara",
    country: "Turkey",
    lat: 39.93,
    lng: 32.86,
    currencyCode: 949,
    currencyName: "TRY",
    description:
      "Ankara is the capital of Turkey, situated in the heart of Anatolia. Home to the Mausoleum of Ataturk and the Museum of Anatolian Civilizations, it has been a capital since 1923.",
  },
  {
    id: "beijing",
    name: "Beijing",
    country: "China",
    lat: 39.91,
    lng: 116.39,
    currencyCode: 156,
    currencyName: "CNY",
    description:
      "Beijing is the capital of China, with a history spanning over 3,000 years. Home to the Forbidden City, the Great Wall nearby, and Tiananmen Square. A center for politics, culture, and innovation.",
  },
];
