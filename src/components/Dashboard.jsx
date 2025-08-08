import React, { useEffect, useMemo, useState } from "react";
import { getFirestore, collection, query, where, onSnapshot } from "firebase/firestore";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const db = getFirestore();
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const col = collection(db, "notes");
    const qNew = query(col, where("uploadedByRole", "==", "admin"));
    const qLegacy = query(col, where("role", "==", "admin"));

    const u1 = onSnapshot(qNew, s => {
      setNotes(prev => {
        const m = new Map(prev.map(n => [n.id, n]));
        s.docs.forEach(d => m.set(d.id, { id: d.id, ...d.data() }));
        return Array.from(m.values());
      });
    });
    const u2 = onSnapshot(qLegacy, s => {
      setNotes(prev => {
        const m = new Map(prev.map(n => [n.id, n]));
        s.docs.forEach(d => m.set(d.id, { id: d.id, ...d.data() }));
        return Array.from(m.values());
      });
    });

    return () => { u1(); u2(); };
  }, [db]);

  // group by termLevel
  const groups = useMemo(() => {
    const map = new Map(); // termLevel -> { label, cover, count }
    notes.forEach(n => {
      const key = n.termLevel || "UNKNOWN";
      const label = n.termLabel || n.term || key;
      const obj = map.get(key) || { key, label, cover: n.coverImageUrl || "", count: 0 };
      obj.count += 1;
      if (!obj.cover && n.coverImageUrl) obj.cover = n.coverImageUrl;
      map.set(key, obj);
    });
    return Array.from(map.values()).sort((a,b)=>a.key.localeCompare(b.key));
  }, [notes]);

  return (
    <div className="max-w-6xl px-4 py-6 mx-auto">
      <h2 className="mb-6 text-2xl font-bold">📚 Notes by Level/Term</h2>

      {groups.length === 0 ? (
        <p className="text-gray-500">No notes yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map(g => (
            <Link
              key={g.key}
              to={`/notes/${g.key}`}
              className="overflow-hidden transition-shadow bg-white border rounded-xl hover:shadow-md"
            >
              <div className="relative w-full border-b h-28">
                {g.cover ? (
                  <img src={g.cover} alt={g.label} className="absolute inset-0 object-cover w-full h-full" />
                ) : (
                  <div className="absolute inset-0"
                       style={{background:"linear-gradient(135deg, rgba(59,130,246,.15), rgba(16,185,129,.15))"}}/>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold">{g.label}</h3>
                <p className="text-sm text-gray-600">Total notes: {g.count}</p>
                <div className="inline-flex items-center px-3 py-1 mt-3 text-sm font-semibold text-white bg-indigo-600 rounded">
                  View all
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
export default Dashboard;
