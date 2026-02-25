//#region src/data/capitals.ts
const capitals = [
	{
		id: "abu-dhabi",
		name: "Abu Dhabi",
		country: "United Arab Emirates",
		lat: 24.47,
		lng: 54.37,
		currencyCode: 784,
		currencyName: "AED",
		description: "Abu Dhabi is the capital of the United Arab Emirates and the largest of the seven emirates. Home to the Sheikh Zayed Grand Mosque and Louvre Abu Dhabi, it is a major oil and financial hub."
	},
	{
		id: "abuja",
		name: "Abuja",
		country: "Nigeria",
		lat: 9.07,
		lng: 7.4,
		currencyCode: 566,
		currencyName: "NGN",
		description: "Abuja is the capital of Nigeria, a planned city that replaced Lagos in 1991. Located in the center of the country to serve as a neutral ground for Nigeria's many ethnic groups, it is home to the National Assembly and Aso Rock."
	},
	{
		id: "accra",
		name: "Accra",
		country: "Ghana",
		lat: 5.55,
		lng: -.2,
		currencyCode: 936,
		currencyName: "GHS",
		description: "Accra is the capital of Ghana and one of West Africa's most dynamic cities. Built on the Atlantic coast, it blends colonial architecture with vibrant markets and a growing technology and finance sector."
	},
	{
		id: "addis-ababa",
		name: "Addis Ababa",
		country: "Ethiopia",
		lat: 9.03,
		lng: 38.74,
		currencyCode: 230,
		currencyName: "ETB",
		description: "Addis Ababa is the capital of Ethiopia and headquarters of the African Union. At over 2,300 m altitude, it is one of Africa's highest capitals. The city is Ethiopia's economic and cultural center."
	},
	{
		id: "algiers",
		name: "Algiers",
		country: "Algeria",
		lat: 36.74,
		lng: 3.06,
		currencyCode: 12,
		currencyName: "DZD",
		description: "Algiers is the capital of Algeria and the largest city in Africa by area. Overlooking the Bay of Algiers on the Mediterranean, its historic Casbah district is a UNESCO World Heritage Site."
	},
	{
		id: "amman",
		name: "Amman",
		country: "Jordan",
		lat: 31.95,
		lng: 35.93,
		currencyCode: 400,
		currencyName: "JOD",
		description: "Amman is the capital of Jordan, built across a series of hills. One of the oldest continuously inhabited cities in the world, it is a modern metropolis with Roman ruins, vibrant souks, and the citadel of Jabal al-Qal'a."
	},
	{
		id: "ankara",
		name: "Ankara",
		country: "Turkey",
		lat: 39.93,
		lng: 32.86,
		currencyCode: 949,
		currencyName: "TRY",
		description: "Ankara is the capital of Turkey, situated in the heart of Anatolia. Home to the Mausoleum of Atatürk and the Museum of Anatolian Civilizations, it has been the capital since 1923."
	},
	{
		id: "antananarivo",
		name: "Antananarivo",
		country: "Madagascar",
		lat: -18.91,
		lng: 47.54,
		currencyCode: 969,
		currencyName: "MGA",
		description: "Antananarivo is the capital of Madagascar, perched on a ridge at over 1,200 m. Known as 'Tana', it is the political, economic, and cultural heart of the island nation, with colorful hilltop neighborhoods and rice paddies on its outskirts."
	},
	{
		id: "astana",
		name: "Astana",
		country: "Kazakhstan",
		lat: 51.18,
		lng: 71.45,
		currencyCode: 398,
		currencyName: "KZT",
		description: "Astana is the capital of Kazakhstan, a planned city that rose from the steppe. It features futuristic architecture including the Bayterek Tower and Khan Shatyr Entertainment Center."
	},
	{
		id: "asuncion",
		name: "Asunción",
		country: "Paraguay",
		lat: -25.29,
		lng: -57.65,
		currencyCode: 600,
		currencyName: "PYG",
		description: "Asunción is the capital of Paraguay, one of South America's oldest cities, founded in 1537. Located on the eastern bank of the Paraguay River, it is the country's only major city and political, commercial center."
	},
	{
		id: "baghdad",
		name: "Baghdad",
		country: "Iraq",
		lat: 33.34,
		lng: 44.4,
		currencyCode: 368,
		currencyName: "IQD",
		description: "Baghdad is the capital of Iraq and was the center of the medieval Islamic Golden Age. Built on the Tigris River, it was once the world's largest city. Today it is rebuilding as a major metropolis of over 7 million people."
	},
	{
		id: "baku",
		name: "Baku",
		country: "Azerbaijan",
		lat: 40.41,
		lng: 49.87,
		currencyCode: 944,
		currencyName: "AZN",
		description: "Baku is the capital of Azerbaijan, situated on the Caspian Sea coast. It blends medieval architecture of the Old City (a UNESCO site) with modern Flame Towers and is an important oil and gas center."
	},
	{
		id: "bandar-seri-begawan",
		name: "Bandar Seri Begawan",
		country: "Brunei",
		lat: 4.94,
		lng: 114.95,
		currencyCode: 96,
		currencyName: "BND",
		description: "Bandar Seri Begawan is the capital of Brunei. A small but wealthy city on the northern coast of Borneo, it is famous for the Sultan Omar Ali Saifuddien Mosque and the sprawling water village of Kampong Ayer."
	},
	{
		id: "banjul",
		name: "Banjul",
		country: "Gambia",
		lat: 13.45,
		lng: -16.58,
		currencyCode: 270,
		currencyName: "GMD",
		description: "Banjul is the capital of Gambia, situated on an island at the mouth of the Gambia River. One of Africa's smallest capitals, it serves as the country's administrative and commercial hub."
	},
	{
		id: "bangkok",
		name: "Bangkok",
		country: "Thailand",
		lat: 13.75,
		lng: 100.52,
		currencyCode: 764,
		currencyName: "THB",
		description: "Bangkok is the capital of Thailand, known for ornate shrines, vibrant street life, and the Grand Palace. The city is one of the world's top tourist destinations and Southeast Asia's financial hub."
	},
	{
		id: "beijing",
		name: "Beijing",
		country: "China",
		lat: 39.91,
		lng: 116.39,
		currencyCode: 156,
		currencyName: "CNY",
		description: "Beijing is the capital of China, with a history spanning over 3,000 years. Home to the Forbidden City, the Great Wall nearby, and Tiananmen Square. A center for politics, culture, and innovation."
	},
	{
		id: "beirut",
		name: "Beirut",
		country: "Lebanon",
		lat: 33.89,
		lng: 35.5,
		currencyCode: 422,
		currencyName: "LBP",
		description: "Beirut is the capital of Lebanon, a Mediterranean city with a rich history spanning thousands of years. Known as the 'Paris of the Middle East', it has been a major cultural and intellectual center of the Arab world."
	},
	{
		id: "belgrade",
		name: "Belgrade",
		country: "Serbia",
		lat: 44.82,
		lng: 20.46,
		currencyCode: 941,
		currencyName: "RSD",
		description: "Belgrade is the capital of Serbia, one of Europe's oldest cities at the confluence of the Sava and Danube rivers. Known for its vibrant nightlife, the Kalemegdan Fortress, and a growing tech startup scene."
	},
	{
		id: "berlin",
		name: "Berlin",
		country: "Germany",
		lat: 52.52,
		lng: 13.41,
		currencyCode: 978,
		currencyName: "EUR",
		description: "Berlin is the capital of Germany. Known for its history, vibrant arts scene, and the Brandenburg Gate. The city was divided by the Berlin Wall from 1961 to 1989."
	},
	{
		id: "bern",
		name: "Bern",
		country: "Switzerland",
		lat: 46.95,
		lng: 7.45,
		currencyCode: 756,
		currencyName: "CHF",
		description: "Bern is the federal city (de facto capital) of Switzerland. Its medieval old town is a UNESCO World Heritage Site. The city is home to the Federal Palace and the famous Bear Park."
	},
	{
		id: "bishkek",
		name: "Bishkek",
		country: "Kyrgyzstan",
		lat: 42.87,
		lng: 74.59,
		currencyCode: 417,
		currencyName: "KGS",
		description: "Bishkek is the capital of Kyrgyzstan, nestled in the Chuy Valley near the Tian Shan mountains. A Soviet-planned city known for its wide tree-lined avenues, it is the cultural and economic heart of this Central Asian republic."
	},
	{
		id: "bogota",
		name: "Bogotá",
		country: "Colombia",
		lat: 4.71,
		lng: -74.07,
		currencyCode: 170,
		currencyName: "COP",
		description: "Bogotá is the capital of Colombia, one of the world's highest capital cities at 2,640 m. A sprawling metropolis on the Andean plateau, it is famous for the Gold Museum, Monserrate hill, and a vibrant food and arts scene."
	},
	{
		id: "brasilia",
		name: "Brasilia",
		country: "Brazil",
		lat: -15.79,
		lng: -47.88,
		currencyCode: 986,
		currencyName: "BRL",
		description: "Brasilia is the capital of Brazil, inaugurated in 1960. Designed by Oscar Niemeyer and Lúcio Costa, the entire city is a UNESCO World Heritage Site known for its modernist architecture."
	},
	{
		id: "bucharest",
		name: "Bucharest",
		country: "Romania",
		lat: 44.43,
		lng: 26.1,
		currencyCode: 946,
		currencyName: "RON",
		description: "Bucharest is the capital of Romania, known as the 'Little Paris of the East' for its belle époque architecture. Home to the Palace of the Parliament, one of the world's largest buildings."
	},
	{
		id: "budapest",
		name: "Budapest",
		country: "Hungary",
		lat: 47.5,
		lng: 19.04,
		currencyCode: 348,
		currencyName: "HUF",
		description: "Budapest is the capital of Hungary, formed by uniting Buda and Pest in 1873. Famous for its Parliament building, thermal baths, and Buda Castle. The Danube riverbank is a UNESCO World Heritage Site."
	},
	{
		id: "buenos-aires",
		name: "Buenos Aires",
		country: "Argentina",
		lat: -34.61,
		lng: -58.38,
		currencyCode: 32,
		currencyName: "ARS",
		description: "Buenos Aires is the capital of Argentina, a cosmopolitan city on the Río de la Plata. Known as the 'Paris of South America', it is famous for tango, wide boulevards, European-style architecture, and a passionate football culture."
	},
	{
		id: "cairo",
		name: "Cairo",
		country: "Egypt",
		lat: 30.06,
		lng: 31.25,
		currencyCode: 818,
		currencyName: "EGP",
		description: "Cairo is the capital of Egypt, the largest city in the Arab world and Africa. Built along the Nile River, it lies near the ancient Giza Pyramids and the Great Sphinx. A major center of Islamic art, culture, and history."
	},
	{
		id: "canberra",
		name: "Canberra",
		country: "Australia",
		lat: -35.28,
		lng: 149.13,
		currencyCode: 36,
		currencyName: "AUD",
		description: "Canberra is the capital of Australia, a planned city chosen as a compromise between Sydney and Melbourne. It is home to Parliament House and the Australian War Memorial."
	},
	{
		id: "chisinau",
		name: "Chișinău",
		country: "Moldova",
		lat: 47.01,
		lng: 28.86,
		currencyCode: 498,
		currencyName: "MDL",
		description: "Chișinău is the capital of Moldova. The city was largely rebuilt after World War II and Soviet-era earthquakes. It is the country's economic, cultural, and administrative center."
	},
	{
		id: "colombo",
		name: "Colombo",
		country: "Sri Lanka",
		lat: 6.93,
		lng: 79.85,
		currencyCode: 144,
		currencyName: "LKR",
		description: "Colombo is the commercial capital of Sri Lanka and seat of the executive government. A port city on the Indian Ocean coast, it blends Dutch, British, and South Asian architecture and is the country's largest and most cosmopolitan city."
	},
	{
		id: "conakry",
		name: "Conakry",
		country: "Guinea",
		lat: 9.54,
		lng: -13.68,
		currencyCode: 324,
		currencyName: "GNF",
		description: "Conakry is the capital of Guinea, a port city on the Atlantic coast of West Africa. Situated on the Kaloum Peninsula, it is the country's economic and political center and home to a vibrant music and arts scene."
	},
	{
		id: "copenhagen",
		name: "Copenhagen",
		country: "Denmark",
		lat: 55.68,
		lng: 12.57,
		currencyCode: 208,
		currencyName: "DKK",
		description: "Copenhagen is the capital of Denmark, consistently ranked as one of the world's most livable cities. Home to Tivoli Gardens, the Little Mermaid statue, and the colorful Nyhavn waterfront."
	},
	{
		id: "dakar",
		name: "Dakar",
		country: "Senegal",
		lat: 14.69,
		lng: -17.44,
		currencyCode: 952,
		currencyName: "XOF",
		description: "Dakar is the capital of Senegal and the westernmost point of mainland Africa. A vibrant cosmopolitan city on the Cap-Vert Peninsula, it uses the West African CFA franc (XOF), shared by eight countries of the Economic Community of West African States."
	},
	{
		id: "dhaka",
		name: "Dhaka",
		country: "Bangladesh",
		lat: 23.73,
		lng: 90.4,
		currencyCode: 50,
		currencyName: "BDT",
		description: "Dhaka is the capital of Bangladesh and one of the world's most densely populated cities. Located on the Buriganga River, it is the heart of the global garment industry and a rapidly growing economic center."
	},
	{
		id: "djibouti-city",
		name: "Djibouti City",
		country: "Djibouti",
		lat: 11.59,
		lng: 43.15,
		currencyCode: 262,
		currencyName: "DJF",
		description: "Djibouti City is the capital of Djibouti, a small nation at the entrance to the Red Sea. The city is a major port and logistics hub at one of the world's most strategic shipping lanes, and hosts several foreign military bases."
	},
	{
		id: "dodoma",
		name: "Dodoma",
		country: "Tanzania",
		lat: -6.18,
		lng: 35.74,
		currencyCode: 834,
		currencyName: "TZS",
		description: "Dodoma is the official capital of Tanzania, a planned city in the center of the country designated as capital in 1974. While Dar es Salaam remains the largest city and economic hub, Dodoma is the seat of the National Assembly."
	},
	{
		id: "doha",
		name: "Doha",
		country: "Qatar",
		lat: 25.29,
		lng: 51.53,
		currencyCode: 634,
		currencyName: "QAR",
		description: "Doha is the capital of Qatar, a gleaming modern city on the Persian Gulf that transformed from a small fishing village into a global hub within a generation. It hosted the 2022 FIFA World Cup and is home to Al Jazeera and the Museum of Islamic Art."
	},
	{
		id: "dushanbe",
		name: "Dushanbe",
		country: "Tajikistan",
		lat: 38.56,
		lng: 68.77,
		currencyCode: 972,
		currencyName: "TJS",
		description: "Dushanbe is the capital of Tajikistan, situated in the Hissar Valley surrounded by mountains. Its name means 'Monday' — it grew from a village market held on Mondays. Today it is the country's main cultural and economic center."
	},
	{
		id: "freetown",
		name: "Freetown",
		country: "Sierra Leone",
		lat: 8.49,
		lng: -13.23,
		currencyCode: 694,
		currencyName: "SLL",
		description: "Freetown is the capital of Sierra Leone, founded in 1792 as a home for freed slaves. Located on a peninsula with a natural harbor, it is the country's political, financial, and cultural center, set against green mountains and Atlantic beaches."
	},
	{
		id: "gaborone",
		name: "Gaborone",
		country: "Botswana",
		lat: -24.65,
		lng: 25.91,
		currencyCode: 72,
		currencyName: "BWP",
		description: "Gaborone is the capital of Botswana, one of Africa's youngest capital cities, built in the 1960s near the South African border. It has grown rapidly alongside Botswana's diamond-driven economic success."
	},
	{
		id: "gitega",
		name: "Gitega",
		country: "Burundi",
		lat: -3.43,
		lng: 29.93,
		currencyCode: 108,
		currencyName: "BIF",
		description: "Gitega is the political capital of Burundi, officially designated as capital in 2019, replacing Bujumbura. Located in the center of the country, it houses the national parliament and presidency."
	},
	{
		id: "hanoi",
		name: "Hanoi",
		country: "Vietnam",
		lat: 21.03,
		lng: 105.85,
		currencyCode: 704,
		currencyName: "VND",
		description: "Hanoi is the capital of Vietnam, a city of ancient temples, tree-lined boulevards, and French colonial architecture alongside modern skyscrapers. With over 1,000 years of history, it is the country's political and cultural center."
	},
	{
		id: "havana",
		name: "Havana",
		country: "Cuba",
		lat: 23.13,
		lng: -82.38,
		currencyCode: 192,
		currencyName: "CUP",
		description: "Havana is the capital of Cuba, a city of faded grandeur, classic American cars, and vibrant salsa music. Its historic center (La Habana Vieja) is a UNESCO World Heritage Site, and the city is a major center of Caribbean culture and history."
	},
	{
		id: "hong-kong",
		name: "Hong Kong",
		country: "Hong Kong SAR, China",
		lat: 22.32,
		lng: 114.17,
		currencyCode: 344,
		currencyName: "HKD",
		description: "Hong Kong is a Special Administrative Region of China. A global financial center known for its dramatic skyline, Victoria Harbour, dim sum, and the world-class transit system."
	},
	{
		id: "islamabad",
		name: "Islamabad",
		country: "Pakistan",
		lat: 33.72,
		lng: 73.06,
		currencyCode: 586,
		currencyName: "PKR",
		description: "Islamabad is the capital of Pakistan, a planned city built in the 1960s at the foot of the Margalla Hills. Clean, green, and modern compared to other Pakistani cities, it is home to the Faisal Mosque and the Pakistan Monument."
	},
	{
		id: "jakarta",
		name: "Jakarta",
		country: "Indonesia",
		lat: -6.21,
		lng: 106.85,
		currencyCode: 360,
		currencyName: "IDR",
		description: "Jakarta is the current capital of Indonesia and one of Southeast Asia's largest cities. The country is relocating its capital to Nusantara in Borneo, but Jakarta remains the economic heart of the archipelago."
	},
	{
		id: "jerusalem",
		name: "Jerusalem",
		country: "Israel",
		lat: 31.78,
		lng: 35.22,
		currencyCode: 376,
		currencyName: "ILS",
		description: "Jerusalem is a city sacred to Judaism, Christianity, and Islam. Seat of the Israeli government and home to the Old City with the Western Wall, Church of the Holy Sepulchre, and Al-Aqsa Mosque."
	},
	{
		id: "kabul",
		name: "Kabul",
		country: "Afghanistan",
		lat: 34.52,
		lng: 69.18,
		currencyCode: 971,
		currencyName: "AFN",
		description: "Kabul is the capital of Afghanistan, situated in a mountain-ringed valley at 1,800 m. One of the oldest cities in South Asia, it has been a crossroads of civilizations for millennia and is the country's political and commercial center."
	},
	{
		id: "kampala",
		name: "Kampala",
		country: "Uganda",
		lat: .32,
		lng: 32.58,
		currencyCode: 800,
		currencyName: "UGX",
		description: "Kampala is the capital of Uganda, built across a series of hills near Lake Victoria. A rapidly growing city with a young population, it is East Africa's third-largest city and a major commercial and cultural hub."
	},
	{
		id: "kathmandu",
		name: "Kathmandu",
		country: "Nepal",
		lat: 27.71,
		lng: 85.31,
		currencyCode: 524,
		currencyName: "NPR",
		description: "Kathmandu is the capital of Nepal, nestled in a valley surrounded by the Himalayas. A city of ancient temples, stupas, and intricate Newari architecture, it is the gateway to Everest expeditions and one of Asia's most historic cities."
	},
	{
		id: "khartoum",
		name: "Khartoum",
		country: "Sudan",
		lat: 15.55,
		lng: 32.53,
		currencyCode: 938,
		currencyName: "SDG",
		description: "Khartoum is the capital of Sudan, situated at the confluence of the Blue and White Nile rivers. It serves as the country's administrative and financial center, and the National Museum holds outstanding artifacts from ancient Nubian civilizations."
	},
	{
		id: "kinshasa",
		name: "Kinshasa",
		country: "DR Congo",
		lat: -4.32,
		lng: 15.32,
		currencyCode: 976,
		currencyName: "CDF",
		description: "Kinshasa is the capital of the Democratic Republic of Congo, the largest French-speaking city in the world. Situated on the Congo River opposite Brazzaville, it is one of Africa's most populous cities and a major cultural hub."
	},
	{
		id: "kuala-lumpur",
		name: "Kuala Lumpur",
		country: "Malaysia",
		lat: 3.15,
		lng: 101.69,
		currencyCode: 458,
		currencyName: "MYR",
		description: "Kuala Lumpur is the capital of Malaysia and home to the iconic Petronas Twin Towers. A cosmopolitan city blending Malay, Chinese, and Indian cultures with a dynamic economy and cuisine."
	},
	{
		id: "kuwait-city",
		name: "Kuwait City",
		country: "Kuwait",
		lat: 29.37,
		lng: 47.98,
		currencyCode: 414,
		currencyName: "KWD",
		description: "Kuwait City is the capital of Kuwait, a wealthy Gulf state on the Persian Gulf. Home to the iconic Kuwait Towers and Liberation Tower, it is the country's political, financial, and cultural center, built on oil revenues."
	},
	{
		id: "kyiv",
		name: "Kyiv",
		country: "Ukraine",
		lat: 50.45,
		lng: 30.52,
		currencyCode: 980,
		currencyName: "UAH",
		description: "Kyiv is the capital and most populous city of Ukraine. Founded in the 5th century, it is one of the oldest cities in Eastern Europe. Known for its golden-domed churches, the Kyiv Pechersk Lavra, and a vibrant tech industry."
	},
	{
		id: "la-paz",
		name: "La Paz",
		country: "Bolivia",
		lat: -16.5,
		lng: -68.15,
		currencyCode: 68,
		currencyName: "BOB",
		description: "La Paz is the seat of government of Bolivia and, at 3,640 m, one of the world's highest capital cities. Nestled in a dramatic canyon in the Andes, it is famous for the Witches' Market and the Mi Teleférico cable car system."
	},
	{
		id: "lilongwe",
		name: "Lilongwe",
		country: "Malawi",
		lat: -13.97,
		lng: 33.79,
		currencyCode: 454,
		currencyName: "MWK",
		description: "Lilongwe is the capital of Malawi, a landlocked country in southeastern Africa. A relatively modern capital city established in 1975, it sits on the Lilongwe River and serves as the country's administrative and commercial hub."
	},
	{
		id: "lima",
		name: "Lima",
		country: "Peru",
		lat: -12.04,
		lng: -77.03,
		currencyCode: 604,
		currencyName: "PEN",
		description: "Lima is the capital of Peru and home to a third of the country's population. A sprawling coastal city on the Pacific, it is famous for its remarkable cuisine (a UNESCO Intangible Cultural Heritage), colonial old town, and pre-Incan huacas."
	},
	{
		id: "london",
		name: "London",
		country: "United Kingdom",
		lat: 51.51,
		lng: -.13,
		currencyCode: 826,
		currencyName: "GBP",
		description: "London is the capital of England and the United Kingdom. A global centre for finance, arts, and culture, it is home to Big Ben, the Tower of London, and Buckingham Palace."
	},
	{
		id: "luanda",
		name: "Luanda",
		country: "Angola",
		lat: -8.84,
		lng: 13.23,
		currencyCode: 973,
		currencyName: "AOA",
		description: "Luanda is the capital of Angola, a major Atlantic port city that has transformed since the end of the civil war in 2002. One of Africa's most expensive cities, it sits on a natural harbor and is the country's economic and political center."
	},
	{
		id: "managua",
		name: "Managua",
		country: "Nicaragua",
		lat: 12.13,
		lng: -86.29,
		currencyCode: 558,
		currencyName: "NIO",
		description: "Managua is the capital of Nicaragua, situated on the southern shore of Lake Managua. Much of the historic center was destroyed by an earthquake in 1972 and was never fully rebuilt, giving the city a decentralized character."
	},
	{
		id: "manama",
		name: "Manama",
		country: "Bahrain",
		lat: 26.23,
		lng: 50.59,
		currencyCode: 48,
		currencyName: "BHD",
		description: "Manama is the capital of Bahrain, a small island nation in the Persian Gulf. A modern financial hub known for its Islamic architecture, the Bahrain National Museum, and as a major banking center for the Gulf region."
	},
	{
		id: "manila",
		name: "Manila",
		country: "Philippines",
		lat: 14.6,
		lng: 120.98,
		currencyCode: 608,
		currencyName: "PHP",
		description: "Manila is the capital of the Philippines, one of the most densely populated cities in the world. Built around Manila Bay, it is the political, economic, and cultural center of the archipelago."
	},
	{
		id: "maputo",
		name: "Maputo",
		country: "Mozambique",
		lat: -25.97,
		lng: 32.59,
		currencyCode: 943,
		currencyName: "MZN",
		description: "Maputo is the capital of Mozambique, a port city on the Indian Ocean with striking Portuguese colonial architecture. Known for its lively markets, art deco buildings, and fresh seafood, it is the economic and cultural heart of southern Africa's most Portuguese-influenced nation."
	},
	{
		id: "mbabane",
		name: "Mbabane",
		country: "Eswatini",
		lat: -26.32,
		lng: 31.14,
		currencyCode: 748,
		currencyName: "SZL",
		description: "Mbabane is the administrative capital of Eswatini (formerly Swaziland), a landlocked kingdom in southern Africa. Nestled in the Mdimba Mountains, it shares its capital status with Lobamba, the royal and legislative capital."
	},
	{
		id: "mexico-city",
		name: "Mexico City",
		country: "Mexico",
		lat: 19.43,
		lng: -99.13,
		currencyCode: 484,
		currencyName: "MXN",
		description: "Mexico City is the capital of Mexico and one of the largest cities in the world. Built on the ruins of the Aztec capital Tenochtitlán, it is a city of world-class museums, cuisine, and culture."
	},
	{
		id: "minsk",
		name: "Minsk",
		country: "Belarus",
		lat: 53.9,
		lng: 27.57,
		currencyCode: 933,
		currencyName: "BYN",
		description: "Minsk is the capital of Belarus, extensively rebuilt in Soviet Stalinist style after World War II. The city features wide boulevards, imposing architecture, and is the seat of the Commonwealth of Independent States."
	},
	{
		id: "mogadishu",
		name: "Mogadishu",
		country: "Somalia",
		lat: 2.05,
		lng: 45.34,
		currencyCode: 706,
		currencyName: "SOS",
		description: "Mogadishu is the capital of Somalia, an ancient port city on the Indian Ocean coast. One of the oldest cities in East Africa with a history dating back over a millennium, it has been rebuilding since the end of the civil war."
	},
	{
		id: "montevideo",
		name: "Montevideo",
		country: "Uruguay",
		lat: -34.9,
		lng: -56.19,
		currencyCode: 858,
		currencyName: "UYU",
		description: "Montevideo is the capital of Uruguay, home to nearly half the country's population. A progressive, livable city on the Río de la Plata with a charming old town, long beaches, and a high quality of life consistently ranked among the best in Latin America."
	},
	{
		id: "moscow",
		name: "Moscow",
		country: "Russia",
		lat: 55.75,
		lng: 37.62,
		currencyCode: 643,
		currencyName: "RUB",
		description: "Moscow is the capital of Russia, the largest city in Europe. Home to the Kremlin, Red Square, Saint Basil's Cathedral, and the Bolshoi Theatre. A major global center of politics and culture."
	},
	{
		id: "muscat",
		name: "Muscat",
		country: "Oman",
		lat: 23.59,
		lng: 58.59,
		currencyCode: 512,
		currencyName: "OMR",
		description: "Muscat is the capital of Oman, a city of white-washed buildings, ancient forts, and the magnificent Sultan Qaboos Grand Mosque. Nestled between the sea and the Al Hajar Mountains, it is one of the Gulf region's most historically rich capitals."
	},
	{
		id: "nairobi",
		name: "Nairobi",
		country: "Kenya",
		lat: -1.29,
		lng: 36.82,
		currencyCode: 404,
		currencyName: "KES",
		description: "Nairobi is the capital of Kenya and the economic hub of East Africa. Uniquely, it borders a national park where lions and giraffes roam within sight of the city skyline. It is also home to the UN Environment Programme headquarters."
	},
	{
		id: "new-delhi",
		name: "New Delhi",
		country: "India",
		lat: 28.61,
		lng: 77.21,
		currencyCode: 356,
		currencyName: "INR",
		description: "New Delhi is the capital of India, built as a planned city by the British in the 1910s. Adjacent to Old Delhi, it houses Parliament, Rashtrapati Bhavan, and India Gate, part of the National Capital Territory of Delhi."
	},
	{
		id: "oslo",
		name: "Oslo",
		country: "Norway",
		lat: 59.91,
		lng: 10.75,
		currencyCode: 578,
		currencyName: "NOK",
		description: "Oslo is the capital of Norway, situated at the head of the Oslofjord. Known for the Viking Ship Museum, the Nobel Peace Center, and proximity to fjords and ski resorts. Norway's economic and cultural heart."
	},
	{
		id: "ottawa",
		name: "Ottawa",
		country: "Canada",
		lat: 45.42,
		lng: -75.7,
		currencyCode: 124,
		currencyName: "CAD",
		description: "Ottawa is the capital of Canada, located on the Ontario side of the Ottawa River. Known for Parliament Hill, the Rideau Canal (a UNESCO World Heritage Site), and the National Gallery."
	},
	{
		id: "paramaribo",
		name: "Paramaribo",
		country: "Suriname",
		lat: 5.87,
		lng: -55.17,
		currencyCode: 968,
		currencyName: "SRD",
		description: "Paramaribo is the capital of Suriname, a small South American country with a unique Dutch colonial heritage. Its historic inner city is a UNESCO World Heritage Site, featuring a remarkable blend of Dutch and Caribbean architectural styles."
	},
	{
		id: "paris",
		name: "Paris",
		country: "France",
		lat: 48.86,
		lng: 2.35,
		currencyCode: 978,
		currencyName: "EUR",
		description: "Paris is the capital of France, known as the City of Light. Home to the Eiffel Tower, the Louvre, and Notre-Dame, it is a global center for art, fashion, and gastronomy."
	},
	{
		id: "phnom-penh",
		name: "Phnom Penh",
		country: "Cambodia",
		lat: 11.57,
		lng: 104.92,
		currencyCode: 116,
		currencyName: "KHR",
		description: "Phnom Penh is the capital of Cambodia, situated at the confluence of the Mekong, Tonlé Sap, and Bassac rivers. A city rebuilt after the Khmer Rouge era, it is home to the Royal Palace, Silver Pagoda, and the Tuol Sleng Genocide Museum."
	},
	{
		id: "port-louis",
		name: "Port Louis",
		country: "Mauritius",
		lat: -20.16,
		lng: 57.5,
		currencyCode: 480,
		currencyName: "MUR",
		description: "Port Louis is the capital of Mauritius, a bustling harbor city on the Indian Ocean island. A financial hub for the African continent, it blends French, British, and Asian influences in its architecture, cuisine, and culture."
	},
	{
		id: "prague",
		name: "Prague",
		country: "Czech Republic",
		lat: 50.08,
		lng: 14.44,
		currencyCode: 203,
		currencyName: "CZK",
		description: "Prague is the capital of the Czech Republic, nicknamed the 'City of a Hundred Spires'. Its Old Town Square, Charles Bridge, and Prague Castle make it one of Europe's most visited cities."
	},
	{
		id: "pretoria",
		name: "Pretoria",
		country: "South Africa",
		lat: -25.75,
		lng: 28.19,
		currencyCode: 710,
		currencyName: "ZAR",
		description: "Pretoria is the administrative capital of South Africa. Known for the Union Buildings and jacaranda trees that line its streets, giving it the nickname 'Jacaranda City'."
	},
	{
		id: "rabat",
		name: "Rabat",
		country: "Morocco",
		lat: 34.02,
		lng: -6.84,
		currencyCode: 504,
		currencyName: "MAD",
		description: "Rabat is the capital of Morocco, a royal city on the Atlantic coast. Home to the Hassan Tower, the Kasbah of the Udayas, and the Mausoleum of Mohammed V, its historic center is a UNESCO World Heritage Site."
	},
	{
		id: "reykjavik",
		name: "Reykjavik",
		country: "Iceland",
		lat: 64.14,
		lng: -21.9,
		currencyCode: 352,
		currencyName: "ISK",
		description: "Reykjavik is the capital of Iceland and the world's northernmost capital. A small, colorful city of around 130,000 people, it is famous for the Hallgrímskirkja church, the Northern Lights, geothermal pools, and being the gateway to Iceland's dramatic landscapes."
	},
	{
		id: "riyadh",
		name: "Riyadh",
		country: "Saudi Arabia",
		lat: 24.69,
		lng: 46.72,
		currencyCode: 682,
		currencyName: "SAR",
		description: "Riyadh is the capital of Saudi Arabia, one of the fastest-growing cities in the world. Home to the iconic Kingdom Centre Tower and Masmak Fortress, it is the political and economic center of the Kingdom."
	},
	{
		id: "san-jose",
		name: "San José",
		country: "Costa Rica",
		lat: 9.93,
		lng: -84.08,
		currencyCode: 188,
		currencyName: "CRC",
		description: "San José is the capital of Costa Rica, nestled in the Valle Central at 1,170 m. A compact, walkable city surrounded by cloud forests and volcanoes, it is the cultural and economic hub of this Central American nation known for its biodiversity and stability."
	},
	{
		id: "sanaa",
		name: "Sana'a",
		country: "Yemen",
		lat: 15.35,
		lng: 44.21,
		currencyCode: 886,
		currencyName: "YER",
		description: "Sana'a is the capital of Yemen, one of the oldest cities in the world with over 2,500 years of history. Its ancient walled city with distinctive multi-story tower houses is a UNESCO World Heritage Site, currently threatened by ongoing conflict."
	},
	{
		id: "santiago",
		name: "Santiago",
		country: "Chile",
		lat: -33.46,
		lng: -70.65,
		currencyCode: 152,
		currencyName: "CLP",
		description: "Santiago is the capital of Chile, a modern city in the shadow of the snow-capped Andes. Home to nearly 40% of Chile's population, it is South America's safest major city and a growing hub for technology and finance."
	},
	{
		id: "seoul",
		name: "Seoul",
		country: "South Korea",
		lat: 37.57,
		lng: 126.98,
		currencyCode: 410,
		currencyName: "KRW",
		description: "Seoul is the capital of South Korea, one of the world's most technologically advanced cities. A dynamic metropolis blending ancient palaces like Gyeongbokgung with K-pop culture and world-class cuisine."
	},
	{
		id: "singapore",
		name: "Singapore",
		country: "Singapore",
		lat: 1.36,
		lng: 103.82,
		currencyCode: 702,
		currencyName: "SGD",
		description: "Singapore is a city-state and island nation in Southeast Asia. One of the world's leading financial and trade centers, known for Marina Bay Sands, Gardens by the Bay, and its multicultural cuisine."
	},
	{
		id: "skopje",
		name: "Skopje",
		country: "North Macedonia",
		lat: 41.99,
		lng: 21.43,
		currencyCode: 807,
		currencyName: "MKD",
		description: "Skopje is the capital of North Macedonia, rebuilt after a devastating earthquake in 1963. Known for the Stone Bridge over the Vardar River and the controversial 'Skopje 2014' urban renewal project with classical-style statues and buildings."
	},
	{
		id: "sofia",
		name: "Sofia",
		country: "Bulgaria",
		lat: 42.7,
		lng: 23.32,
		currencyCode: 975,
		currencyName: "BGN",
		description: "Sofia is the capital of Bulgaria, one of Europe's oldest cities, situated beneath the Vitosha Mountain. Home to the Alexander Nevsky Cathedral, Roman ruins, and a growing tech industry, it is one of the most affordable capitals in the EU."
	},
	{
		id: "stockholm",
		name: "Stockholm",
		country: "Sweden",
		lat: 59.33,
		lng: 18.07,
		currencyCode: 752,
		currencyName: "SEK",
		description: "Stockholm is the capital of Sweden, built across 14 islands where Lake Mälaren meets the Baltic Sea. Home to the Nobel Prize ceremonies, the Vasa Museum, and the medieval old town Gamla Stan."
	},
	{
		id: "taipei",
		name: "Taipei",
		country: "Taiwan",
		lat: 25.05,
		lng: 121.53,
		currencyCode: 901,
		currencyName: "TWD",
		description: "Taipei is the capital of Taiwan, a vibrant city of night markets, hot springs, and the iconic Taipei 101 skyscraper. Known for its blend of Chinese, Japanese, and Western influences, it is a global hub for semiconductor manufacturing and tech innovation."
	},
	{
		id: "tashkent",
		name: "Tashkent",
		country: "Uzbekistan",
		lat: 41.3,
		lng: 69.27,
		currencyCode: 860,
		currencyName: "UZS",
		description: "Tashkent is the capital of Uzbekistan and the largest city in Central Asia. A major hub on the ancient Silk Road, it combines Soviet-era wide boulevards with Islamic monuments and a growing modern skyline."
	},
	{
		id: "tbilisi",
		name: "Tbilisi",
		country: "Georgia",
		lat: 41.69,
		lng: 44.83,
		currencyCode: 981,
		currencyName: "GEL",
		description: "Tbilisi is the capital of Georgia, with a history spanning 1,500 years. Famous for its distinctive wooden-balconied architecture, sulfuric baths, and location at the crossroads of Europe and Asia."
	},
	{
		id: "tirana",
		name: "Tirana",
		country: "Albania",
		lat: 41.33,
		lng: 19.82,
		currencyCode: 8,
		currencyName: "ALL",
		description: "Tirana is the capital of Albania, a colorful city that reinvented itself after emerging from decades of communist isolation. Famous for the pastel-painted buildings commissioned by a former mayor, the National History Museum mosaic, and the vibrant Blloku district."
	},
	{
		id: "tokyo",
		name: "Tokyo",
		country: "Japan",
		lat: 35.68,
		lng: 139.69,
		currencyCode: 392,
		currencyName: "JPY",
		description: "Tokyo is the capital of Japan and the world's most populous metropolitan area. It blends ultramodern technology with traditional temples, and is famous for its cherry blossoms and cuisine."
	},
	{
		id: "tripoli",
		name: "Tripoli",
		country: "Libya",
		lat: 32.9,
		lng: 13.18,
		currencyCode: 434,
		currencyName: "LYD",
		description: "Tripoli is the capital of Libya, a Mediterranean port city with over 2,700 years of history. The old medina, with its Ottoman-era mosques and the Arch of Marcus Aurelius, stands alongside a modern city built on oil wealth."
	},
	{
		id: "tunis",
		name: "Tunis",
		country: "Tunisia",
		lat: 36.82,
		lng: 10.17,
		currencyCode: 788,
		currencyName: "TND",
		description: "Tunis is the capital of Tunisia, a North African city where the ancient medina (a UNESCO World Heritage Site) meets a French colonial new town. Nearby lie the ruins of ancient Carthage, once Rome's greatest rival."
	},
	{
		id: "ulaanbaatar",
		name: "Ulaanbaatar",
		country: "Mongolia",
		lat: 47.91,
		lng: 106.88,
		currencyCode: 496,
		currencyName: "MNT",
		description: "Ulaanbaatar is the capital of Mongolia and the world's coldest capital city. Home to over 40% of Mongolia's population, it sits in a valley surrounded by mountains and serves as the country's main cultural, industrial, and financial center."
	},
	{
		id: "victoria",
		name: "Victoria",
		country: "Seychelles",
		lat: -4.62,
		lng: 55.46,
		currencyCode: 690,
		currencyName: "SCR",
		description: "Victoria is the capital of Seychelles and one of the world's smallest capital cities, home to under 30,000 people. Situated on Mahé island in the Indian Ocean, it is notable for the silver clock tower (a miniature of London's Big Ben) and vibrant Sir Selwyn Clarke Market."
	},
	{
		id: "vientiane",
		name: "Vientiane",
		country: "Laos",
		lat: 17.96,
		lng: 102.6,
		currencyCode: 418,
		currencyName: "LAK",
		description: "Vientiane is the capital of Laos, one of Southeast Asia's most laid-back capital cities, situated on a bend of the Mekong River bordering Thailand. Known for Pha That Luang stupa, the Patuxai monument, and a relaxed pace of life."
	},
	{
		id: "warsaw",
		name: "Warsaw",
		country: "Poland",
		lat: 52.23,
		lng: 21.01,
		currencyCode: 985,
		currencyName: "PLN",
		description: "Warsaw is the capital of Poland. Almost completely destroyed in World War II, it was meticulously rebuilt. The Old Town is a UNESCO World Heritage Site. Today it is a major European tech hub."
	},
	{
		id: "washington",
		name: "Washington, D.C.",
		country: "United States",
		lat: 38.91,
		lng: -77.04,
		currencyCode: 840,
		currencyName: "USD",
		description: "Washington, D.C. is the capital of the United States, home to the White House, the Capitol, and the Smithsonian museums. The city was designed by Pierre Charles L'Enfant in 1791."
	},
	{
		id: "wellington",
		name: "Wellington",
		country: "New Zealand",
		lat: -41.29,
		lng: 174.78,
		currencyCode: 554,
		currencyName: "NZD",
		description: "Wellington is the capital of New Zealand, situated at the southern tip of the North Island. Known for its vibrant café culture, Te Papa Tongarewa museum, and as the filming location for the Lord of the Rings."
	},
	{
		id: "windhoek",
		name: "Windhoek",
		country: "Namibia",
		lat: -22.57,
		lng: 17.08,
		currencyCode: 516,
		currencyName: "NAD",
		description: "Windhoek is the capital of Namibia, a tidy, modern city at 1,700 m in the central highlands. Founded as a German colonial settlement, it blends European and African influences and serves as the gateway to Namibia's extraordinary desert landscapes."
	},
	{
		id: "yaounde",
		name: "Yaoundé",
		country: "Cameroon",
		lat: 3.87,
		lng: 11.52,
		currencyCode: 950,
		currencyName: "XAF",
		description: "Yaoundé is the capital of Cameroon and uses the Central African CFA franc (XAF), shared by six countries of the Central African Economic and Monetary Community. A city of hills, it is the political capital while Douala serves as the main commercial port."
	},
	{
		id: "yerevan",
		name: "Yerevan",
		country: "Armenia",
		lat: 40.18,
		lng: 44.51,
		currencyCode: 51,
		currencyName: "AMD",
		description: "Yerevan is the capital of Armenia, one of the world's oldest continuously inhabited cities. Known for its pink-tinted tuff stone buildings, views of Mount Ararat, and the Cascade stairway monument complex."
	},
	{
		id: "zagreb",
		name: "Zagreb",
		country: "Croatia",
		lat: 45.81,
		lng: 15.98,
		currencyCode: 191,
		currencyName: "HRK",
		description: "Zagreb is the capital of Croatia, a Central European city on the southern slopes of Medvednica mountain. Croatia adopted the euro in 2023, but HRK still appears in some exchange rate feeds. Known for the Cathedral, Dolac market, and the Museum of Broken Relationships."
	}
];

//#endregion
export { capitals as t };