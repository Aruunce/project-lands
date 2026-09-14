// One-off admin bootstrap tool, since there's no admin UI yet.
// Usage:
//   npm run promote -- someone@example.com admin   -> makes them an admin (can also create listings)
//   npm run promote -- someone@example.com          -> grants listing-creation rights only, role stays USER
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const [, , email, mode] = process.argv;

  if (!email) {
    console.error("Naudojimas: npm run promote -- <el.pastas> [admin]");
    process.exit(1);
  }

  const data =
    mode === "admin" ? { role: "ADMIN", canCreateListings: true } : { canCreateListings: true };

  const user = await prisma.user.update({ where: { email }, data });

  console.log(`OK: ${user.email} -> role=${user.role}, canCreateListings=${user.canCreateListings}`);
}

main()
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
