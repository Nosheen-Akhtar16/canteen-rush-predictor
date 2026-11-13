import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import admin from "firebase-admin";
import { computeUsual, SCORE_MAP } from "../src/lib/usual.js";
import { istParts } from "../src/lib/time.js";

const keyPath = resolve("scripts/serviceAccountKey.json");
const serviceAccount = JSON.parse(readFileSync(keyPath, "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const auth = admin.auth();
const isResetOnly = process.argv.includes("--reset");

const CANTEENS = [
  { id: "main", name: "Main Canteen", location: "Central Academic Block, Ground Floor" },
  { id: "engineering", name: "Engineering Cafe", location: "Block C, Near Robotics Lab" },
  { id: "library", name: "Library Cafe", location: "Central Library Annexe" },
];

const MENU_BY_CANTEEN = {
  main: [
    { id: "main_samosa", name: "Aloo Samosa", category: "Snacks" },
    { id: "main_dosa", name: "Masala Dosa", category: "Meals" },
    { id: "main_thali", name: "Veg Deluxe Thali", category: "Meals" },
    { id: "main_biryani", name: "Veg Biryani", category: "Meals" },
    { id: "main_roll", name: "Paneer Tikka Roll", category: "Snacks" },
    { id: "main_chai", name: "Masala Chai", category: "Beverages" },
    { id: "main_coffee", name: "Cold Coffee", category: "Beverages" },
    { id: "main_pastry", name: "Chocolate Truffle Pastry", category: "Bakery" },
  ],
  engineering: [
    { id: "eng_samosa", name: "Aloo Samosa", category: "Snacks" },
    { id: "eng_burger", name: "Crispy Aloo Tikki Burger", category: "Snacks" },
    { id: "eng_maggi", name: "Cheese Masala Maggi", category: "Snacks" },
    { id: "eng_paratha", name: "Aloo Paratha & Curd", category: "Meals" },
    { id: "eng_friedrice", name: "Schezwan Fried Rice", category: "Meals" },
    { id: "eng_coffee", name: "Cold Coffee", category: "Beverages" },
    { id: "eng_lemonade", name: "Fresh Mint Lemonade", category: "Beverages" },
    { id: "eng_muffin", name: "Blueberry Muffin", category: "Bakery" },
  ],
  library: [
    { id: "lib_sandwich", name: "Grilled Veg Sandwich", category: "Snacks" },
    { id: "lib_poha", name: "Indori Poha", category: "Snacks" },
    { id: "lib_pasta", name: "White Sauce Penne Pasta", category: "Meals" },
    { id: "lib_wrap", name: "Falafel Hummus Wrap", category: "Meals" },
    { id: "lib_chai", name: "Masala Chai", category: "Beverages" },
    { id: "lib_espresso", name: "Iced Americano", category: "Beverages" },
    { id: "lib_croissant", name: "Butter Croissant", category: "Bakery" },
    { id: "lib_brownie", name: "Walnut Brownie", category: "Bakery" },
  ],
};

const DEMO_USERS = [
  { email: "student@demo.com", password: "Demo@1234", role: "student", canteenId: null, displayName: "Aarav (Student)" },
  { email: "staff1@demo.com", password: "Demo@1234", role: "staff", canteenId: "main", displayName: "Ramesh (Main Staff)" },
  { email: "staff2@demo.com", password: "Demo@1234", role: "staff", canteenId: "engineering", displayName: "Priya (Engg. Staff)" },
  { email: "admin@demo.com", password: "Demo@1234", role: "admin", canteenId: null, displayName: "Dr. Sharma (Admin)" },
];

async function resetLiveState() {
  const now = admin.firestore.Timestamp.now();
  const batch = db.batch();

  for (const c of CANTEENS) {
    batch.set(
      db.collection("canteens").doc(c.id),
      {
        name: c.name,
        location: c.location,
        currentLevel: "low",
        levelUpdatedAt: now,
      },
      { merge: true }
    );

    for (const item of MENU_BY_CANTEEN[c.id]) {
      batch.set(
        db.collection("menuItems").doc(item.id),
        {
          canteenId: c.id,
          name: item.name,
          category: item.category,
          stockStatus: "in",
          stockUpdatedAt: now,
        },
        { merge: true }
      );
    }
  }

  await batch.commit();
  console.log("Reset complete: all 3 canteens set to Low & all 24 items In stock.");
}

async function seedUsers() {
  for (const u of DEMO_USERS) {
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(u.email);
    } catch {
      userRecord = await auth.createUser({
        email: u.email,
        password: u.password,
        displayName: u.displayName,
      });
    }

    await db.collection("users").doc(userRecord.uid).set(
      {
        email: u.email,
        displayName: u.displayName,
        role: u.role,
        canteenId: u.canteenId,
      },
      { merge: true }
    );
  }
  console.log("Demo accounts verified/created (Password: Demo@1234).");
}

function pickHistoricalLevel(canteenId, hour, step) {
  let base = "low";
  if (hour >= 12 && hour <= 14) {
    base = canteenId === "library" && step === 0 ? "medium" : "high";
  } else if (hour === 11 || hour === 15 || hour === 16) {
    base = canteenId === "main" && step === 1 ? "high" : "medium";
  } else if (canteenId === "main" && (hour === 10 || hour === 17) && step === 0) {
    base = "medium";
  }
  return base;
}

async function seedHistoryAndUsual() {
  const logsByCanteen = { main: [], engineering: [], library: [] };
  const allOps = [];
  const nowMs = Date.now();

  for (let dayOffset = 1; dayOffset <= 21; dayOffset++) {
    for (const c of CANTEENS) {
      for (let hour = 8; hour <= 18; hour++) {
        const count = (dayOffset + hour) % 2 === 0 ? 3 : 2;
        for (let s = 0; s < count; s++) {
          const tsMs = nowMs - dayOffset * 86400000 - (18 - hour) * 3600000 - s * 600000;
          const { weekday, hour: istHour } = istParts(new Date(tsMs));
          const level = pickHistoricalLevel(c.id, istHour, s);
          const logDoc = {
            canteenId: c.id,
            level,
            score: SCORE_MAP[level],
            timestamp: admin.firestore.Timestamp.fromMillis(tsMs),
            weekday,
            hour: istHour,
          };
          logsByCanteen[c.id].push(logDoc);
          allOps.push(logDoc);
        }
      }
    }
  }

  for (let i = 0; i < allOps.length; i += 450) {
    const chunk = allOps.slice(i, i + 450);
    const batch = db.batch();
    for (const log of chunk) {
      batch.set(db.collection("crowdLogs").doc(), log);
    }
    await batch.commit();
  }

  const usualBatch = db.batch();
  for (const c of CANTEENS) {
    const usual = computeUsual(logsByCanteen[c.id]);
    usualBatch.update(db.collection("canteens").doc(c.id), { usual });
  }
  await usualBatch.commit();
  console.log(`Seeded ${allOps.length} crowdLogs and saved usual rush maps.`);
}

async function main() {
  await resetLiveState();
  if (!isResetOnly) {
    await seedUsers();
    await seedHistoryAndUsual();
  }
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
