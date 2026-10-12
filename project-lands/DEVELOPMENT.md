# LANDs.lt — kūrėjo dokumentacija

Vidinė NT skelbimų platforma, pradedama nuo žemės sklypų, projektuojama taip, kad
vėliau būtų galima pridėti namus, butus, komercines patalpas, miškus, sodybas ir kt.
be didelio perrašymo.

## Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **DB:** Neon (serverless PostgreSQL, free tier) per Prisma ORM
- **Auth:** Auth.js (NextAuth v5) — email/password (Credentials provider), JWT sesijos
- **Storage:** Vercel Blob (dar neprijungta — planuojama kitame etape)
- **Žemėlapis:** MapLibre GL JS + OpenFreeMap plytelės (nemokamos, be API rakto)
- **Stiliai:** Tailwind CSS v4, ikonos — `lucide-react`, šriftai — Inter + Plus Jakarta Sans
- **Hosting:** Vercel

Pasirinkta sąmoningai NE Supabase (vartotojo sprendimas) — atskiri, tarpusavyje
nepriklausomi nemokami servisai vietoj vieno all-in-one tiekėjo.

## Kas jau padaryta

- **Vieno pardavėjo svetainė (2026-10-08):** skelbimus kelia tik svetainės
  savininkas. Viešos registracijos nėra — lankytojai naršo be paskyros.
  Prisijungti gali tik `ADMIN` rolės vartotojai, adresu `/admin/prisijungti`
  (nuorodos į jį meniu nėra). Admin paskyra sukuriama `npm run create-admin`
  skriptu.
- **Admin dalis** (`/admin/*`): skelbimų valdymas (`/admin`), naujas skelbimas
  (`/admin/skelbimai/naujas`), redagavimas
  (`/admin/skelbimai/[slug]/redaguoti`). Middleware tik nukreipia
  neprisijungusius; tikrasis teisių patikrinimas — `requireAdmin()`
  (`src/lib/authz.ts`), kuris kviečiamas kiekviename admin puslapyje ir
  server action'e ir rolę tikrina DB.
- **Dviejų žingsnių patvirtinimas (2FA, 2026-10-12):** slaptažodis + 6 skaitmenų
  kodas iš autentifikavimo programėlės (Google Authenticator ir pan., TOTP).
  Įjungiama `/admin/saugumas` (QR kodas). Slaptas raktas DB saugomas
  užšifruotas (AES-256-GCM, raktas išvedamas iš `AUTH_SECRET` — todėl
  `AUTH_SECRET` turi sutapti visur, kur naudojama ta pati DB). Panaudotas kodas
  antrą kartą netinka. Pametus telefoną — `npm run create-admin` leidžia
  išjungti 2FA.
- **Prisijungimo apsauga:** in-memory rate limit (10 bandymų / 15 min. vienam
  IP), `callbackUrl` leidžiamas tik tos pačios svetainės kelias (apsauga nuo
  open redirect), admin puslapiai pažymėti `noindex`.
- **Kontaktai** nustatomi vieną kartą visai svetainei — `src/config/site.ts`
  (nebe kiekviename skelbime).
- **Skelbimų CRUD:** kūrimas (juodraštis) → redagavimas → publikavimas →
  paslėpimas/archyvavimas → trynimas. Visos mutacijos vyksta per Next.js
  Server Actions (`src/lib/actions/listings.ts`), kurios visada iš naujo
  patikrina teises tiesiogiai duomenų bazėje — niekada nepasitikima vien
  middleware ar kliento puse.
- **Kainos/ploto formatavimas** pagal lietuvišką lokalę (`src/lib/format.ts`):
  „45 000 €“, „12,5 a“.
- **Dizainas (2026-10-08):** naujas pradinis puslapis (hero su paieška,
  naujausi skelbimai, „Apie“, „Kontaktai“, footer), mobilusis meniu, subtilios
  animacijos (gerbia „reduced motion“). Paieška: `/skelbimai?q=...`.
- **Žemėlapis (2026-10-12):** admin formoje sklypo vieta pažymima paspaudus
  žemėlapyje; skelbimo puslapyje rodomas žemėlapis ir mygtukai „Google Maps“ /
  „Waze“ maršrutui. MapLibre worker failas kopijuojamas į `public/` per
  `postinstall` (`scripts/copy-map-worker.js`).
- **Admin sąraše** rodomas kiekvieno skelbimo peržiūrų skaičius, trynimas
  prašo patvirtinimo.
- **Viešas skelbimų sąrašas ir detalus puslapis** su SEO metaduomenimis
  (`generateMetadata`, OpenGraph, kanoninis URL).
- **Tipui-specifiniai laukai** (žemės paskirtis, sklypo Nr.) saugomi
  `Listing.attributes` JSONB stulpelyje — naujiems NT tipams ateityje
  nereikės naujos migracijos, tik naujo TS tipo `src/types/listing.ts`.
- Saugumo pataisos: atnaujintas Next.js (kritinis `tar` CVE ir keli Next.js
  CVE uždaryti), `prisma`/`@prisma/client` prisegti prie stabilios `6.19.3`
  versijos (npm `latest` šiuo metu rodo į release-candidate `8.0.0-rc.*`, o
  `7.x` reikalauja Node ≥20.19, o šis kompiuteris turi Node 20.9.0).

## Kas dar NEpadaryta (TODO)

- **Nuotraukų įkėlimas** — kitas planuojamas etapas.
- **Sklypo ribos (polygon)** žemėlapyje — dabar žymimas tik taškas.
- **Filtrai** (kaina, plotas, savivaldybė, paskirtis) — kol kas tik tekstinė paieška.
- **Admin dalies dizainas** — dar senas stilius.
- **Užklausos forma** skelbime — reikės transakcinio el. laiškų siuntimo
  serviso (pvz. Resend free tier).
- **Rate limiting** prisijungimo/kūrimo veiksmuose šiuo metu yra tik
  paprastas in-memory best-effort sprendimas (`src/lib/rate-limit.ts`) — jis
  neveikia patikimai per kelias serverless instancijas. Jei prireiks
  patikimesnio, geriausias nemokamas variantas — Upstash Redis free tier.
- Geo užklausos (radius paieška, paieška matomame žemėlapio plote) — schema
  paruošta (GeoJSON `Listing.geometry` stulpelis), bet PostGIS neįjungtas,
  nes Prisma jo native nepalaiko be raw SQL, o tai P2 prioritetas.

## Duomenų bazės struktūra

Pilna schema: [`prisma/schema.prisma`](prisma/schema.prisma). Trumpai:

- **User** — Auth.js standartiniai laukai + `role` (`USER`/`ADMIN`). Prisijungti
  gali tik `ADMIN`.
- **Account, Session, VerificationToken** — Auth.js adapterio lentelės.
- **Listing** — bendri NT laukai (`title`, `slug`, `description`, `price`,
  `pricePerUnit`, `area`, `areaUnit`, `address`, `municipality`, `city`,
  `latitude`, `longitude`, `geometry` (GeoJSON), `status`, `viewCount`) +
  `attributes` (JSONB, tipui-specifiniai laukai, žr.
  `src/types/listing.ts`).
- **ListingImage** — nuotraukų metaduomenys (dar nenaudojama, laukia storage
  etapo).

Migracijos: `prisma/migrations/` — visi DB pakeitimai turi eiti per
`npx prisma migrate dev --name <pavadinimas>`, niekada rankiniu SQL tiesiai
production DB.

## Reikalingi ENV kintamieji

Žr. [`.env.example`](.env.example). Trumpai:

| Kintamasis | Paskirtis |
|---|---|
| `DATABASE_URL` | Neon pooled connection (runtime) |
| `DIRECT_URL` | Neon direct connection (tik migracijoms) |
| `AUTH_SECRET` | Auth.js JWT pasirašymo raktas (`npx auth secret`) |
| `NEXT_PUBLIC_SITE_URL` | Svetainės bazinis URL |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob (dar nenaudojama) |
| `NEXT_PUBLIC_MAP_STYLE_URL` | Žemėlapio stilius (nebūtina; numatytasis — OpenFreeMap) |

**Svarbu:** `DATABASE_URL`/`DIRECT_URL` turi būti faile `.env` (ne tik
`.env.local`), nes Prisma CLI automatiškai skaito tik `.env`. Next.js skaito
abu (`.env.local` turi prioritetą). Nė vienas iš jų necommitinamas — abu
`.gitignore` sąraše.

## Paleidimas lokaliai

```bash
npm install
npm run db:migrate   # pritaiko Prisma migracijas prie DB, nurodytos .env
npm run dev
```

Admin paskyrai sukurti (arba pamirštam slaptažodžiui pakeisti) — skriptas
paklaus el. pašto, vardo ir slaptažodžio (slaptažodis rašant nerodomas):

```bash
npm run create-admin
```

Tada prisijunkite adresu `/admin`.

Pavyzdiniai (demo) skelbimai peržiūrai — 15 sklypų su vietomis žemėlapyje.
Jie priklauso atskiram `demo@example.test` vartotojui, todėl ištrinami tik jie:

```bash
npm run demo:add
npm run demo:remove   # būtinai prieš paleidžiant svetainę viešai
```

## Deploy (Vercel)

Standartinis Next.js deploy — `npm run build` paleidžia `prisma generate`
prieš `next build`, tad papildomo build command konfigūravimo Vercel'yje
nereikia. Vercel projekto Environment Variables turi turėti tuos pačius
kintamuosius kaip `.env.example` (tikras `DATABASE_URL`/`DIRECT_URL` iš Neon,
`AUTH_SECRET`, ir t.t.). Po pirmo deploy DB migracijas reikia pritaikyti
rankiniu `npm run db:migrate` (arba `prisma migrate deploy`) su production
`DIRECT_URL`.

## Kaštų apsauga

Visi išoriniai servisai laikomi nemokamame tier'e (Neon Free, Vercel/Blob free
limitai). Joks paslaugos atnaujinimas į mokamą planą ar usage-based billing
nėra įjungiamas be aiškaus vartotojo patvirtinimo.
