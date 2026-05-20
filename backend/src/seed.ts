import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ANIMALS = [
  { name: "Bella", type: "cow",     age: 4 },
  { name: "Daisy", type: "cow",     age: 3 },
  { name: "Rocky", type: "buffalo", age: 5 },
  { name: "Luna",  type: "buffalo", age: 4 },
];

function entry(
  date: string, animalType: string, animalName: string,
  quantity: number, notes?: string,
) {
  const rate = animalType === "cow" ? 35 : 30;
  return {
    date, animalType, animalName, quantity, rate,
    totalAmount: Math.round(quantity * rate * 100) / 100,
    notes,
  };
}

const M = "Morning milking";

const ENTRIES = [
  entry("2026-04-23", "cow",     "Bella", 125.5, M),
  entry("2026-04-23", "cow",     "Daisy", 120.0, M),
  entry("2026-04-23", "buffalo", "Rocky",  95.0, M),
  entry("2026-04-23", "buffalo", "Luna",   85.0, M),
  entry("2026-04-22", "cow",     "Bella", 118.0, M),
  entry("2026-04-22", "cow",     "Daisy", 112.0, M),
  entry("2026-04-22", "buffalo", "Rocky",  92.5, M),
  entry("2026-04-22", "buffalo", "Luna",   83.0, M),
  entry("2026-04-21", "cow",     "Bella", 124.9),
  entry("2026-04-21", "cow",     "Daisy", 120.1),
  entry("2026-04-21", "buffalo", "Rocky",  96.9),
  entry("2026-04-21", "buffalo", "Luna",   82.4),
  entry("2026-04-20", "cow",     "Bella", 115.1),
  entry("2026-04-20", "cow",     "Daisy", 123.5),
  entry("2026-04-20", "buffalo", "Rocky",  86.3),
  entry("2026-04-20", "buffalo", "Luna",   88.4),
  entry("2026-04-19", "cow",     "Bella", 117.6),
  entry("2026-04-19", "cow",     "Daisy", 122.8),
  entry("2026-04-19", "buffalo", "Rocky",  85.1),
  entry("2026-04-19", "buffalo", "Luna",   87.9),
  entry("2026-04-18", "cow",     "Bella", 119.7),
  entry("2026-04-18", "cow",     "Daisy", 124.4),
  entry("2026-04-18", "buffalo", "Rocky",  93.7),
  entry("2026-04-18", "buffalo", "Luna",   84.8),
  entry("2026-04-17", "cow",     "Bella", 117.5),
  entry("2026-04-17", "cow",     "Daisy", 111.1),
  entry("2026-04-17", "buffalo", "Rocky",  92.0),
  entry("2026-04-17", "buffalo", "Luna",   82.3),
];

async function main() {
  console.log("🌱  Seeding database…");

  for (const a of ANIMALS) {
    await prisma.animal.upsert({
      where:  { name: a.name },
      update: a,
      create: a,
    });
  }
  console.log(`   ✓ ${ANIMALS.length} animals upserted`);

  const existing = await prisma.dailyEntry.count();
  if (existing === 0) {
    await prisma.dailyEntry.createMany({ data: ENTRIES });
    console.log(`   ✓ ${ENTRIES.length} entries seeded`);
  } else {
    console.log(`   ↷ Skipped entries (${existing} already in DB)`);
  }

  console.log("✅  Seeding complete!");
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
