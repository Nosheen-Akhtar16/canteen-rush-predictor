import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase.js";

export function useCanteens() {
  const [canteens, setCanteens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "canteens"),
      (snapshot) => {
        setCanteens(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message || "Failed to load canteens");
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  return { canteens, loading, error };
}
