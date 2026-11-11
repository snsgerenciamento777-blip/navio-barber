const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

function scryptHash(password, salt, keylen, options) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password.normalize("NFKC"), salt, keylen, options, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
}

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const key = await scryptHash(password, salt, 64, {
    N: 16384,
    r: 16,
    p: 1,
    maxmem: 128 * 16384 * 16 * 2,
  });
  return `${salt}:${key.toString("hex")}`;
}

const p = new PrismaClient();

async function main() {
  await p.$connect();

  const adminPassword = await hashPassword("Admin123!");
  const barberPassword = await hashPassword("Barber123!");

  const adminUser = await p.user.create({
    data: {
      email: "admin@naviobarber.test",
      name: "Admin Navio",
      role: "ADMIN",
      emailVerified: true,
    },
  });
  await p.account.create({
    data: {
      userId: adminUser.id,
      accountId: adminUser.id,
      providerId: "credential",
      password: adminPassword,
    },
  });

  const barberUser = await p.user.create({
    data: {
      email: "barber@naviobarber.test",
      name: "Barber Navio",
      role: "BARBER",
      emailVerified: true,
    },
  });
  await p.account.create({
    data: {
      userId: barberUser.id,
      accountId: barberUser.id,
      providerId: "credential",
      password: barberPassword,
    },
  });

  const shop = await p.shop.create({
    data: {
      name: "Barbearia Teste Navio",
      address: "Rua das Flores, 123",
      phone: "(11) 99999-9999",
      email: "contato@barbearia-teste.test",
      ownerId: adminUser.id,
    },
  });

  const professional = await p.professional.create({
    data: {
      shopId: shop.id,
      userId: barberUser.id,
      name: "João Silva",
      bio: "Barbeiro especializado em cortes clássicos",
      workingHours: {
        mon: ["09:00", "18:00"],
        tue: ["09:00", "18:00"],
        wed: ["09:00", "18:00"],
        thu: ["09:00", "18:00"],
        fri: ["09:00", "18:00"],
        sat: ["09:00", "17:00"],
        sun: null,
      },
      isActive: true,
    },
  });

  const professional2 = await p.professional.create({
    data: {
      shopId: shop.id,
      userId: null,
      name: "Maria Santos",
      workingHours: {
        mon: ["09:00", "18:00"],
        tue: ["09:00", "18:00"],
        wed: ["09:00", "18:00"],
        thu: ["09:00", "18:00"],
        fri: ["09:00", "18:00"],
        sat: ["09:00", "17:00"],
        sun: null,
      },
      isActive: true,
    },
  });

  const serviceCorte = await p.service.create({
    data: {
      shopId: shop.id,
      name: "Corte Clássico",
      category: "Corte",
      price: 50.0,
      durationMinutes: 30,
      commissionPercent: 0,
      isActive: true,
    },
  });

  const serviceBarba = await p.service.create({
    data: {
      shopId: shop.id,
      name: "Barba Completa",
      category: "Barba",
      price: 35.0,
      durationMinutes: 25,
      commissionPercent: 0,
      isActive: true,
    },
  });

  const serviceCorteBarba = await p.service.create({
    data: {
      shopId: shop.id,
      name: "Corte + Barba",
      category: "Combo",
      price: 75.0,
      durationMinutes: 50,
      commissionPercent: 0,
      isActive: true,
    },
  });

  const customer1 = await p.customer.create({
    data: {
      shopId: shop.id,
      fullName: "Carlos Alberto",
      phone: "(11) 91111-1111",
      email: "carlos@test.test",
      status: "ACTIVE",
      noShowCount: 0,
    },
  });

  const customer2 = await p.customer.create({
    data: {
      shopId: shop.id,
      fullName: "Fernanda Lima",
      phone: "(11) 92222-2222",
      email: "fernanda@test.test",
      status: "ACTIVE",
      noShowCount: 0,
    },
  });

  const customerBlocked = await p.customer.create({
    data: {
      shopId: shop.id,
      fullName: "Cliente Bloqueado",
      phone: "(11) 93333-3333",
      email: "bloqueado@test.test",
      status: "BLOCKED",
      noShowCount: 5,
    },
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const appointment1 = await p.appointment.create({
    data: {
      shopId: shop.id,
      professionalId: professional.id,
      serviceId: serviceCorte.id,
      customerId: customer1.id,
      startAt: tomorrow,
      endAt: new Date(tomorrow.getTime() + 30 * 60 * 1000),
      status: "CONFIRMED",
      totalValue: 50.0,
      paymentStatus: "PENDING",
    },
  });

  const tomorrow2 = new Date(tomorrow);
  tomorrow2.setHours(14, 0, 0, 0);

  const appointment2 = await p.appointment.create({
    data: {
      shopId: shop.id,
      professionalId: professional2.id,
      serviceId: serviceBarba.id,
      customerId: customer2.id,
      startAt: tomorrow2,
      endAt: new Date(tomorrow2.getTime() + 25 * 60 * 1000),
      status: "PENDING",
      totalValue: 35.0,
      paymentStatus: "PENDING",
    },
  });

  console.log("=== SEED DATA CREATED ===");
  console.log("Admin user:", adminUser.id, adminUser.email, adminUser.role);
  console.log("Barber user:", barberUser.id, barberUser.email, barberUser.role);
  console.log("Shop:", shop.id, shop.name);
  console.log("Professional 1 (barber):", professional.id, professional.name);
  console.log("Professional 2:", professional2.id, professional2.name);
  console.log("Service 1:", serviceCorte.id, serviceCorte.name, "R$", serviceCorte.price);
  console.log("Service 2:", serviceBarba.id, serviceBarba.name, "R$", serviceBarba.price);
  console.log("Service 3:", serviceCorteBarba.id, serviceCorteBarba.name, "R$", serviceCorteBarba.price);
  console.log("Customer 1:", customer1.id, customer1.fullName);
  console.log("Customer 2:", customer2.id, customer2.fullName);
  console.log("Customer blocked:", customerBlocked.id, customerBlocked.fullName);
  console.log("Appointment 1 (barber):", appointment1.id);
  console.log("Appointment 2 (other pro):", appointment2.id);
  console.log("=== ADMIN PASSWORD: Admin123! ===");
  console.log("=== BARBER PASSWORD: Barber123! ===");

  await p.$disconnect();
}

main().catch((e) => {
  console.error("Seed error:", e);
  process.exit(1);
});
