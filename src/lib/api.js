import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase.js";
import { istParts } from "./time.js";
import { SCORE_MAP, computeUsual } from "./usual.js";

export async function setCrowdLevel(canteenId, level) {
  if (!canteenId) throw new Error("Missing canteenId");
  if (!SCORE_MAP[level]) throw new Error(`Invalid crowd level: ${level}`);

  const { weekday, hour } = istParts(new Date());
  const batch = writeBatch(db);

  batch.update(doc(db, "canteens", canteenId), {
    currentLevel: level,
    levelUpdatedAt: serverTimestamp(),
  });

  batch.set(doc(collection(db, "crowdLogs")), {
    canteenId,
    level,
    score: SCORE_MAP[level],
    timestamp: serverTimestamp(),
    weekday,
    hour,
  });

  await batch.commit();
}

export async function setStockStatus(itemId, status) {
  if (!itemId) throw new Error("Missing itemId");
  if (!["in", "low", "out"].includes(status)) {
    throw new Error(`Invalid stock status: ${status}`);
  }

  const payload = {
    stockStatus: status,
    stockUpdatedAt: serverTimestamp(),
  };

  if (status === "out") {
    payload.soldOutCount = increment(1);
  }

  await updateDoc(doc(db, "menuItems", itemId), payload);
}

export async function resetAllStockToIn(items = []) {
  if (!items.length) return;
  const batch = writeBatch(db);
  for (const item of items) {
    batch.update(doc(db, "menuItems", item.id), {
      stockStatus: "in",
      stockUpdatedAt: serverTimestamp(),
    });
  }
  await batch.commit();
}

export async function addMenuItem(canteenId, { name, category }) {
  const trimmedName = (name || "").trim();
  if (!trimmedName) throw new Error("Item name is required");

  await addDoc(collection(db, "menuItems"), {
    canteenId,
    name: trimmedName,
    category: (category || "Snacks").trim(),
    stockStatus: "in",
    soldOutCount: 0,
    stockUpdatedAt: serverTimestamp(),
  });
}

export async function renameMenuItem(itemId, name) {
  const trimmedName = (name || "").trim();
  if (!trimmedName) throw new Error("Item name cannot be empty");
  await updateDoc(doc(db, "menuItems", itemId), { name: trimmedName });
}

export async function deleteMenuItem(itemId) {
  await deleteDoc(doc(db, "menuItems", itemId));
}

export async function updateUserRole(uid, role, canteenId) {
  await updateDoc(doc(db, "users", uid), {
    role,
    canteenId: role === "staff" ? canteenId || "main" : null,
  });
}

export async function recomputeAllUsualLevels() {
  const [canteensSnap, logsSnap] = await Promise.all([
    getDocs(collection(db, "canteens")),
    getDocs(collection(db, "crowdLogs")),
  ]);

  const logsByCanteen = {};
  logsSnap.forEach((docSnap) => {
    const data = docSnap.data();
    if (!data.canteenId) return;
    if (!logsByCanteen[data.canteenId]) logsByCanteen[data.canteenId] = [];
    logsByCanteen[data.canteenId].push(data);
  });

  const batch = writeBatch(db);
  canteensSnap.forEach((canteenDoc) => {
    const usual = computeUsual(logsByCanteen[canteenDoc.id] || []);
    batch.update(doc(db, "canteens", canteenDoc.id), { usual });
  });

  await batch.commit();
}
