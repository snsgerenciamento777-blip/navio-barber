const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
p.$connect()
  .then(() => Promise.all([
    p.user.findMany().then(u => console.log("USERS:", u.length, u.map(x => ({ id: x.id, email: x.email, role: x.role })))),
    p.shop.findMany().then(s => console.log("SHOPS:", s.length, s.map(x => ({ id: x.id, name: x.name, ownerId: x.ownerId })))),
    p.professional.findMany().then(pr => console.log("PROFESSIONALS:", pr.length)),
    p.service.findMany().then(sv => console.log("SERVICES:", sv.length)),
    p.customer.findMany().then(c => console.log("CUSTOMERS:", c.length)),
    p.appointment.findMany().then(a => console.log("APPOINTMENTS:", a.length)),
  ]))
  .catch((e) => console.error("ERROR:", e.message))
  .finally(() => p.$disconnect());
