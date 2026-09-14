# LANDs.lt — kūrėjo dokumentacija

Vidinė NT skelbimų platforma, pradedama nuo žemės sklypų, projektuojama taip, kad
vėliau būtų galima pridėti namus, butus, komercines patalpas, miškus, sodybas ir kt.
be didelio perrašymo.

## Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **DB:** Neon (serverless PostgreSQL, free tier) per Prisma ORM
- **Auth:** Auth.js (NextAuth v5) — email/password (Credentials provider), JWT sesijos
- **Storage:** Vercel Blob (dar neprijungta — planuojama kitame etape)
- **Žemėlapis:** MapLibre GL JS + OpenStreetMap (dar neprijungta — planuojama kitame etape)
- **Stiliai:** Tailwind CSS v4
- **Hosting:** Vercel

Pasirinkta sąmoningai NE Supabase (vartotojo sprendimas) — atskiri, tarpusavyje
nepriklausomi nemokami servisai vietoj vieno all-in-one tiekėjo.

## Kas jau padaryta (2026-08-31)

- **Autentifikacija:** registracija, prisijungimas, atsijungimas, JWT sesijos su
  `role` (`USER`/`ADMIN`) ir `canCreateListings` požymiu.
- **Leidimų modelis (peržiūros etapas):** registracija ir skelbimų naršymas yra
  vieši, bet skelbimą kurti gali tik vartotojai, kuriems administratorius
  rankiniu būdu suteikė teisę (`User.canCreateListings`). Tai atskira nuo
  `role`, kad vėliau būtų galima atidaryti visiems, tiesiog pakeitus stulpelio
  numatytąją reikšmę į `true`.
- **Skelbimų CRUD:** kūrimas (juodraštis) → redagavimas → publikavimas →
  paslėpimas/archyvavimas → trynimas. Visos mutacijos vyksta per Next.js
  Server Actions (`src/lib/actions/listings.ts`), kurios visada iš naujo
  patikrina nuosavybę/teises tiesiogiai duomenų bazėje — niekada nepasitikima
  vien middleware ar kliento puse.
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

- **Nuotraukų įkėlimas** (Vercel Blob) — kitas planuojamas etapas.
- **Žemėlapis ir sklypo polygon žymėjimas** (MapLibre GL JS + OSM).
- **Filtrai ir paieška** (kaina, plotas, savivaldybė, paskirtis, tekstinė paieška).
- **Admin panelė** skelbimų moderavimui ir vartotojų valdymui (šiuo metu teisės
  suteikiamos rankiniu `npm run promote` skriptu per komandinę eilutę).
- **Magic link prisijungimas** — reikės transakcinio el. laiškų siuntimo
  serviso (pvz. Resend), tai atskira paskyra/sprendimas; email/password kol
  kas tenkina MVP minimumą.
- **Rate limiting** registracijos/kūrimo endpointuose šiuo metu yra tik
  paprastas in-memory best-effort sprendimas (`src/lib/rate-limit.ts`) — jis
  neveikia patikimai per kelias serverless instancijas. Jei prireiks
  patikimesnio, geriausias nemokamas variantas — Upstash Redis free tier.
- Geo užklausos (radius paieška, paieška matomame žemėlapio plote) — schema
  paruošta (GeoJSON `Listing.geometry` stulpelis), bet PostGIS neįjungtas,
  nes Prisma jo native nepalaiko be raw SQL, o tai P2 prioritetas.
- Peržiūrų statistika (`viewCount` stulpelis jau yra ir didėja kiekvieną kartą
  atidarius skelbimą, bet jokio UI tam dar nėra).

## Duomenų bazės struktūra

Pilna schema: [`prisma/schema.prisma`](prisma/schema.prisma). Trumpai:

- **User** — Auth.js standartiniai laukai + `role` (`USER`/`ADMIN`) +
  `canCreateListings` (boolean, default `false`).
- **Account, Session, VerificationToken** — Auth.js adapterio lentelės.
- **Listing** — bendri NT laukai (`title`, `slug`, `description`, `price`,
  `pricePerUnit`, `area`, `areaUnit`, `address`, `municipality`, `city`,
  `latitude`, `longitude`, `geometry` (GeoJSON), `status`, `viewCount`,
  kontaktai) + `attributes` (JSONB, tipui-specifiniai laukai, žr.
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
| `NEXT_PUBLIC_MAP_PROVIDER` | Žemėlapio tiekėjo pasirinkimas (dar nenaudojama) |

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

Pirmam adminui / skelbimų kūrimo teisei suteikti (nes admin panelės dar nėra):

```bash
npm run promote -- vartotojo@paštas.lt admin
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
