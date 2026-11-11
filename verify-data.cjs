const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
p.$connect()
  .then(() => p.user.findMany({ include: { accounts: true } }))
  .then((users) => {
    users.forEach((u) => {
      console.log("User:", u.id, u.email, u.role, "emailVerified:", u.emailVerified);
      u.accounts.forEach((a) => {
        console.log("  Account:", a.providerId, a.accountId, "password set:", !!a.password);
      });
    });
  })
  .catch((e) => console.error("Error:", e.message))
  .finally(() => p.$disconnect());
