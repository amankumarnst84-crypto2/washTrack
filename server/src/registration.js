const bcrypt = require("bcryptjs");
const prisma = require("./db");
const { fail, text } = require("./rules");
const { publicUser } = require("./auth");
function emailAddress(value) {
  const email = text(value, "Email", 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fail("Enter a valid email address.");
  }
  return email;
}
function bagNumber(value) {
  const bagNo = text(value, "Bag number", 20).toUpperCase();
  if (!/^[BG]-[1-9][0-9]{0,7}$/.test(bagNo)) {
    fail("Use a bag number such as B-69 or G-76.");
  }
  return bagNo;
}
async function register(req, res) {
  const email = emailAddress(req.body.email);
  const bagNo = bagNumber(req.body.bagNo);
  const name = text(req.body.name, "Name", 100);
  const { password, confirmPassword } = req.body;
  if (
    typeof password !== "string" ||
    password.length < 8 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    fail(
      "Password must have at least 8 characters and at most 72 UTF-8 bytes.",
    );
  }
  if (password !== confirmPassword) {
    fail("Passwords do not match.");
  }
  // Never accept a role supplied by a public registration request.
  if (req.body.role !== undefined && req.body.role !== "STUDENT") {
    fail("Staff accounts cannot be registered here.", 403);
  }
  // Students register their assigned bag; staff accounts cannot self-register.
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, bagNo, passwordHash, role: "STUDENT" },
    select: publicUser,
  });
  res.status(201).json({
    user,
    message: "Account created. Sign in with your email and password.",
  });
}
module.exports = { register };
