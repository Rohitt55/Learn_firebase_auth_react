import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getFirestore, collection, query, where, onSnapshot } from "firebase/firestore";

/* Turn Drive download to preview page */
const toDrivePreview = (raw) => {
  try {
    const url = new URL(raw);
    const id = url.searchParams.get("id");
    if (id) return `https://drive.google.com/file/d/${id}/view`;
    const m1 = url.pathname.match(/\/file\/d\/([^/]+)/);
    if (m1?.[1]) return `https://drive.google.com/file/d/${m1[1]}/view`;
    const m2 = url.pathname.match(/\/d\/([^/]+)/);
    if (m2?.[1]) return `https://drive.google.com/file/d/${m2[1]}/view`;
    return raw;
  } catch {
    return raw;
  }
};

const TERM_LABELS = {
  L1T1: "Level 1 · Term I",
  L1T2: "Level 1 · Term II",
  L2T1: "Level 2 · Term I",
  L2T2: "Level 2 · Term II",
  L3T1: "Level 3 · Term I",
  L3T2: "Level 3 · Term II",
  L4T1: "Level 4 · Term I",
  L4T2: "Level 4 · Term II",
};

const NotesByTerm = () => {
  const { batch, termLevel } = useParams(); // batch is undefined for /notes/:termLevel
  const db = getFirestore();

  const [notesNew, setNotesNew] = useState([]);
  const [notesLegacy, setNotesLegacy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    const colRef = collection(db, "notes");

    // Build the "new schema" query depending on what we have in the URL
    let qNew;
    if (batch && termLevel) {
      // needs composite index: uploadedByRole + termLevel + batch
      qNew = query(
        colRef,
        where("uploadedByRole", "==", "admin"),
        where("termLevel", "==", termLevel),
        where("batch", "==", batch)
      );
    } else if (termLevel) {
      // legacy/shortcut route without batch
      qNew = query(
        colRef,
        where("uploadedByRole", "==", "admin"),
        where("termLevel", "==", termLevel)
      );
    } else {
      setErrMsg("Invalid route: missing term level.");
      setLoading(false);
      return;
    }

    // Legacy admin docs (may not have termLevel/batch)
    const qLegacy = query(colRef, where("role", "==", "admin"));

    const unsub1 = onSnapshot(
      qNew,
      (snap) => {
        setNotesNew(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error("qNew error:", err);
        setErrMsg(
          "Query failed. If this is the first time using these filters, create the composite index from the Firestore error link in the console."
        );
        setLoading(false);
      }
    );

    const unsub2 = onSnapshot(
      qLegacy,
      (snap) => setNotesLegacy(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => console.error("qLegacy error:", err)
    );

    return () => {
      unsub1();
      unsub2();
    };
  }, [db, termLevel, batch]);

  // Merge + best-effort filter for legacy docs
  const notes = useMemo(() => {
    const merged = [...notesNew];

    for (const n of notesLegacy) {
      // include legacy if matches
      const okTerm =
        n.termLevel === termLevel ||
        (n.term && termLevel && n.term.includes(TERM_LABELS[termLevel]));
      const okBatch = batch ? (n.batch || "") === batch : true;

      if (okTerm && okBatch) merged.push(n);
    }

    return merged.sort((a, b) => {
      const ta = a.createdAt?.toMillis?.() ?? 0;
      const tb = b.createdAt?.toMillis?.() ?? 0;
      return tb - ta;
    });
  }, [notesNew, notesLegacy, termLevel, batch]);

  const headerLabel = TERM_LABELS[termLevel] || "Notes";

  return (
    <div className="max-w-6xl px-4 py-8 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{headerLabel}</h1>
          {batch && <p className="text-sm text-gray-600">Batch {batch}</p>}
        </div>
        <div className="space-x-3">
          {batch && (
            <Link to={`/browse/${batch}`} className="text-sm text-blue-600 hover:underline">
              ← Change term
            </Link>
          )}
          <Link to="/browse" className="text-sm text-blue-600 hover:underline">
            Change batch
          </Link>
        </div>
      </div>

      {errMsg && (
        <div className="p-3 mb-4 text-sm text-red-700 rounded bg-red-50">{errMsg}</div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : notes.length === 0 ? (
        <p className="text-gray-500">No notes found for this selection.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((n) => {
            const preview = toDrivePreview(n.fileUrl);
            return (
              <div
                key={n.id}
                className="overflow-hidden transition-shadow bg-white border rounded-xl hover:shadow"
              >
                <div className="relative w-full border-b h-28">
                  {n.coverImageUrl ? (
                    <img
                      src={n.coverImageUrl}
                      alt={`${n.title} cover`}
                      className="absolute inset-0 object-cover w-full h-full"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(59,130,246,.15), rgba(16,185,129,.15))",
                      }}
                    />
                  )}
                </div>

                <div className="px-4 pb-5 -mt-10">
                  <div className="inline-block px-2 py-1 text-xs bg-white rounded shadow ring-1 ring-gray-200">
                    Hand Written Notes
                  </div>

                  <h3 className="mt-3 text-lg font-semibold line-clamp-2">{n.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {n.university || "—"} • {n.subject || "—"}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <a
                      href={preview}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-semibold text-white bg-gray-700 rounded-lg hover:bg-gray-800"
                    >
                      PREVIEW
                    </a>
                    <a
                      href={n.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700"
                    >
                      DOWNLOAD
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotesByTerm;
