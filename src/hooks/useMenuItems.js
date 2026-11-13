import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../lib/firebase.js";

export function useMenuItems(canteenId = null) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const baseRef = collection(db, "menuItems");
    const q = canteenId
      ? query(baseRef, where("canteenId", "==", canteenId))
      : baseRef;

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setItems(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message || "Failed to load menu items");
        setLoading(false);
      }
    );
    return () => unsub();
  }, [canteenId]);

  return { items, loading, error };
}
