const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
p.$connect()
  .then(() => {
    console.log("DB CONNECTED");
    return p.$queryRaw`SELECT 1 as test`;
  })
  .then((r) => console.log("QUERY OK:", JSON.stringify(r)))
  .catch((e) => console.error("DB ERROR:", e.message))
  .finally(() => p.$disconnect());
