// Sample listings for previewing the site. They all belong to a separate demo
// user (demo@example.test, can't sign in), so `remove` deletes only them.
// Usage: npm run demo:add | npm run demo:remove
const { Prisma, PrismaClient } = require("@prisma/client");

const DEMO_EMAIL = "demo@example.test";
const M2_PER_UNIT = { SQM: 1, ARE: 100, HECTARE: 10_000 };

// Irregular 5–7 corner plot boundary around the pin, scaled to the listing's area.
function demoBoundary(lat, lng, areaM2, seed) {
  const count = 5 + (seed % 3);
  const ratio = 1.1 + (seed % 3) * 0.25; // stretch along one axis
  const angle = (((seed * 37) % 180) * Math.PI) / 180;

  // Corners in increasing angle order, so the shape never crosses itself.
  const shape = Array.from({ length: count }, (_, i) => {
    const t = (i / count) * 2 * Math.PI + Math.sin(seed + i) * 0.25;
    const r = 0.8 + 0.25 * Math.abs(Math.sin(seed * 3 + i * 1.7));
    const x = r * Math.cos(t) * ratio;
    const y = r * Math.sin(t);
    return [x * Math.cos(angle) - y * Math.sin(angle), x * Math.sin(angle) + y * Math.cos(angle)];
  });

  const unitArea =
    Math.abs(
      shape.reduce((sum, [x1, y1], i) => {
        const [x2, y2] = shape[(i + 1) % count];
        return sum + x1 * y2 - x2 * y1;
      }, 0),
    ) / 2;
  const scale = Math.sqrt(areaM2 / unitArea); // meters per unit
  const metersPerDegLng = 111_320 * Math.cos((lat * Math.PI) / 180);
  const round = (value) => Math.round(value * 1e6) / 1e6;

  const corners = shape.map(([x, y]) => [round(lng + (x * scale) / metersPerDegLng), round(lat + (y * scale) / 111_320)]);
  return { type: "Polygon", coordinates: [[...corners, corners[0]]] };
}

// Same normalization as src/lib/search.ts, so demo listings are searchable.
const LT_LETTERS = { ą: "a", č: "c", ę: "e", ė: "e", į: "i", š: "s", ų: "u", ū: "u", ž: "z" };
const TYPE_LABELS = { LAND: "Sklypas", FARMSTEAD: "Sodyba", HOUSE: "Namas", FOREST: "Miškas" };
const normalize = (text) =>
  text.toLowerCase().split("").map((c) => LT_LETTERS[c] ?? c).join("").replace(/\s+/g, " ").trim();

const ALL_UTILITIES = ["electricity", "water", "sewage", "gas", "road"];

// [title, price €, area, unit, city, municipality, purpose, lat, lng, description, extra?]
// extra: { type, status, utilities, buildings }
const LISTINGS = [
  ["Sklypas prie Asvejos ežero", 39000, 25, "ARE", "Dubingiai", "Molėtų r. sav.", "Rekreacinė", 55.058, 25.4475,
    "Ramus sklypas vos 200 m nuo Asvejos ežero. Aplink miškai, privažiavimas žvyrkeliu, elektra prie sklypo ribos."],
  ["Namų valdos sklypas Pavilnyje", 62000, 8, "ARE", "Vilnius", "Vilniaus m. sav.", "Gyvenamoji", 54.674, 25.348,
    "Sklypas individualaus namo statybai ramiame Pavilnio kvartale. Miesto vandentiekis ir nuotekos, asfaltuotas privažiavimas.",
    { utilities: ["electricity", "water", "sewage", "road"] }],
  ["Žemės ūkio paskirties sklypas", 28500, 3.2, "HECTARE", "Josvainiai", "Kėdainių r. sav.", "Žemės ūkio", 55.2456, 23.8389,
    "Lygus, dirbamas laukas su geru našumo balu. Tinka grūdinėms kultūroms, šalia vietinės reikšmės kelias."],
  ["Sklypas su miško dalimi", 45000, 1.1, "HECTARE", "Lentvaris", "Trakų r. sav.", "Miškų ūkio", 54.6436, 25.0517,
    "Mišrus miškas ir pievos dalis. Puiki vieta sodybai ar poilsiui, 25 min. iki Vilniaus."],
  ["Sodyba prie Nemuno", 54000, 15, "ARE", "Kulautuva", "Kauno r. sav.", "Gyvenamoji", 54.944, 23.642,
    "Kurortinė Kulautuva, pušynas ir Nemuno paplūdimys pėsčiomis. Sodyboje medinis namas ir pirtis.",
    {
      type: "FARMSTEAD",
      utilities: ["electricity", "water", "road"],
      buildings: [
        { kind: "house", area: 95, yearBuilt: 1978, condition: "renovate", description: "Medinis namas, 3 kambariai, šildymas krosnimi." },
        { kind: "sauna", area: 18, yearBuilt: 2012, condition: "equipped" },
      ],
    }],
  ["Komercinis sklypas prie kelio", 89000, 50, "ARE", "Gargždai", "Klaipėdos r. sav.", "Komercinė", 55.7128, 21.3967,
    "Matomas sklypas prie intensyvaus eismo kelio. Tinka prekybai, sandėliavimui ar paslaugų pastatui."],
  ["Sklypas netoli jūros", 118000, 6, "ARE", "Šventoji", "Palangos m. sav.", "Gyvenamoji", 56.03, 21.083,
    "Iki jūros apie 700 m. Visos komunikacijos, detalusis planas parengtas.",
    { utilities: ALL_UTILITIES }],
  ["Sklypas su vaizdu į Šventosios slėnį", 33000, 20, "ARE", "Anykščiai", "Anykščių r. sav.", "Gyvenamoji", 55.525, 25.103,
    "Aukštesnėje vietoje esantis sklypas su panoraminiu vaizdu. Iki miesto centro 3 km."],
  ["Sklypas kurortinėje zonoje", 47000, 12, "ARE", "Birštonas", "Birštono sav.", "Rekreacinė", 54.61, 24.03,
    "Kurorto teritorijoje, šalia Nemuno kilpų regioninio parko. Tinka poilsio namui."],
  ["Sklypas prie Zarasaičio ežero", 26000, 30, "ARE", "Zarasai", "Zarasų r. sav.", "Rekreacinė", 55.73, 26.245,
    "Sklypas su nuosava pakrante. Ramioje vietoje, 5 min. iki Zarasų."],
  ["Miško sklypas netoli Ignalinos", 21000, 2.4, "HECTARE", "Palūšė", "Ignalinos r. sav.", "Miškų ūkio", 55.329, 26.102,
    "Brandus pušynas, patogus privažiavimas miško keliu. Gera investicija.",
    { type: "FOREST", utilities: ["road"] }],
  ["Žemės ūkio sklypas Kuršėnuose", 17500, 4.5, "HECTARE", "Kuršėnai", "Šiaulių r. sav.", "Žemės ūkio", 56.004, 22.936,
    "Pievos ir dirbama žemė, tinka ganykloms. Melioruota."],
  ["Namų valdos sklypas Velžyje", 24000, 10, "ARE", "Velžys", "Panevėžio r. sav.", "Gyvenamoji", 55.719, 24.392,
    "Naujų namų kvartale, 5 km iki Panevėžio. Elektra ir vandentiekis."],
  ["Sklypas Druskininkuose", 72000, 9, "ARE", "Druskininkai", "Druskininkų sav.", "Gyvenamoji", 54.017, 23.97,
    "Pušynų apsuptyje, netoli Nemuno. Tinka namui ar svečių namams.",
    { utilities: ["electricity", "water", "sewage", "gas", "road"] }],
  ["Medinis namas su sklypu", 135000, 12, "ARE", "Rumšiškės", "Kaišiadorių r. sav.", "Gyvenamoji", 54.864, 24.201,
    "Jaukus dviejų aukštų namas ramioje vietoje prie Kauno marių.",
    {
      type: "HOUSE",
      utilities: ALL_UTILITIES,
      buildings: [
        { kind: "house", area: 140, yearBuilt: 2008, condition: "equipped", description: "4 kambariai, šildymas šilumos siurbliu, terasa." },
        { kind: "garage", area: 30, yearBuilt: 2010, condition: "equipped" },
      ],
    }],
  ["Sodyba su pirtimi ir tvenkiniu", 89000, 1.6, "HECTARE", "Labanoras", "Švenčionių r. sav.", "Žemės ūkio", 55.256, 25.798,
    "Vienkiemis Labanoro girios pakraštyje: tvenkinys, sodas, erdvūs pastatai.",
    {
      type: "FARMSTEAD",
      utilities: ["electricity", "water", "road"],
      buildings: [
        { kind: "house", area: 110, yearBuilt: 1965, condition: "renovate" },
        { kind: "barn", area: 80, yearBuilt: 1965 },
        { kind: "sauna", area: 25, yearBuilt: 2015, condition: "equipped", description: "Rąstinė pirtis prie tvenkinio." },
      ],
    }],
  ["Sklypas Utenoje (juodraštis)", 19000, 7, "ARE", "Utena", "Utenos r. sav.", "Gyvenamoji", 55.4977, 25.5999,
    "Juodraštis — šis skelbimas matomas tik administratoriui.", { status: "DRAFT" }],
];

const prisma = new PrismaClient();

async function add() {
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    create: { email: DEMO_EMAIL, name: "Demo" },
    update: {},
  });

  const now = Date.now();
  for (const [index, row] of LISTINGS.entries()) {
    const [title, price, area, areaUnit, city, municipality, landPurpose, latitude, longitude, description, extra = {}] = row;
    const { type = "LAND", status = "PUBLISHED", utilities, buildings } = extra;
    const slug = `demo-${index + 1}`;
    const data = {
      type,
      title,
      slug,
      description: `${description}\n\n(Pavyzdinis skelbimas.)`,
      price,
      pricePerUnit: Math.round(price / area),
      area,
      areaUnit,
      city,
      municipality,
      latitude,
      longitude,
      // Every 4th listing keeps only a pin, to show both cases.
      geometry: index % 4 === 3 ? Prisma.DbNull : demoBoundary(latitude, longitude, area * M2_PER_UNIT[areaUnit], index),
      attributes: {
        landPurpose,
        plotNumber: `4400-0000-${String(index + 1).padStart(4, "0")}`,
        ...(utilities && { utilities }),
        ...(buildings && { buildings }),
      },
      areaSqm: area * M2_PER_UNIT[areaUnit],
      searchText: normalize([title, city, municipality, TYPE_LABELS[type]].join(" ")),
      status,
      publishedAt: status === "PUBLISHED" ? new Date(now - index * 6 * 60 * 60 * 1000) : null,
      viewCount: status === "PUBLISHED" ? 15 + ((index * 37) % 140) : 0,
      userId: user.id,
    };
    await prisma.listing.upsert({ where: { slug }, create: data, update: data });
  }

  console.log(`OK: demo skelbimų: ${LISTINGS.length}.`);
}

async function remove() {
  const { count } = await prisma.user.deleteMany({ where: { email: DEMO_EMAIL } });
  console.log(count ? "OK: demo skelbimai ištrinti." : "Demo skelbimų nėra.");
}

const run = { add, remove }[process.argv[2]];
if (!run) {
  console.error("Naudojimas: npm run demo:add | npm run demo:remove");
  process.exit(1);
}

run()
  .catch((err) => {
    console.error(`Klaida: ${err.message}`);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
