// Creates the admin account (or resets its password). Usage: npm run create-admin
// The password is typed hidden, never passed as an argument (shell history).
const readline = require("readline");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const MIN_PASSWORD_LENGTH = 12;
const MAX_PASSWORD_LENGTH = 72; // bcrypt ignores everything past 72 bytes

const prisma = new PrismaClient();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: Boolean(process.stdin.isTTY),
});

// Buffers input lines so answers typed ahead of the prompt aren't lost.
const lines = rl[Symbol.asyncIterator]();

let muted = false;
rl._writeToOutput = (text) => {
  if (!muted) rl.output.write(text);
};

async function ask(question, { hidden = false } = {}) {
  rl.setPrompt(question);
  rl.prompt();
  muted = hidden; // after the prompt, so only typed characters are hidden

  const { value, done } = await lines.next();
  if (hidden) {
    muted = false;
    rl.output.write("\n");
  }
  if (done) throw new Error("Įvestis nutrūko.");
  return value;
}

async function main() {
  const email = (await ask("El. paštas: ")).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Neteisingas el. pašto adresas.");
  }

  const name = (await ask("Vardas (nebūtina): ")).trim();

  const password = await ask(`Slaptažodis (bent ${MIN_PASSWORD_LENGTH} simbolių): `, { hidden: true });
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Slaptažodis per trumpas — reikia bent ${MIN_PASSWORD_LENGTH} simbolių.`);
  }
  if (Buffer.byteLength(password, "utf8") > MAX_PASSWORD_LENGTH) {
    throw new Error("Slaptažodis per ilgas.");
  }

  const confirmation = await ask("Pakartokite slaptažodį: ", { hidden: true });
  if (confirmation !== password) {
    throw new Error("Slaptažodžiai nesutampa.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    create: { email, name: name || null, password: passwordHash, role: "ADMIN" },
    update: { password: passwordHash, role: "ADMIN", ...(name ? { name } : {}) },
  });

  console.log(`OK: ${user.email} yra administratorius. Prisijunkite adresu /admin`);
}

main()
  .catch((err) => {
    console.error(`Klaida: ${err.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    rl.close();
    await prisma.$disconnect();
  });
