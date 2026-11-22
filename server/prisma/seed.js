require("dotenv").config({ quiet: true });
const bcrypt = require("bcryptjs");
const prisma = require("../src/db");
async function seed() {
  const password = process.env.DEMO_PASSWORD;
  if (
    !password ||
    password.length < 8 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    throw new Error(
      "Set DEMO_PASSWORD (8+ characters, maximum 72 UTF-8 bytes) before seeding.",
    );
  }
  const passwordHash = await bcrypt.hash(password, 12);
  // Assigned demo accounts avoid letting someone claim another student's bag.
  const users = [
    {
      name: "Demo Student",
      email: "student@washtrack.test",
      role: "STUDENT",
      bagNo: "B-69",
    },
    {
      name: "Second Student",
      email: "student2@washtrack.test",
      role: "STUDENT",
      bagNo: "G-76",
    },
    {
      name: "Laundry Staff",
      email: "staff@washtrack.test",
      role: "STAFF",
      bagNo: null,
    },
  ];
  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      create: { ...user, passwordHash },
      update: {},
    });
  }
  console.log(
    "Demo accounts ready. Existing users and orders were not changed.",
  );
}
seed()
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
