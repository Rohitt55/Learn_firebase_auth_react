import React, { useEffect, useRef, useState } from "react";
import { getFirestore, doc, updateDoc } from "firebase/firestore";

/** Level/Term options */
const TERM_OPTIONS = [
  { value: "L1T1", label: "Level 1 • Term I" },
  { value: "L1T2", label: "Level 1 • Term II" },
  { value: "L2T1", label: "Level 2 • Term I" },
  { value: "L2T2", label: "Level 2 • Term II" },
  { value: "L3T1", label: "Level 3 • Term I" },
  { value: "L3T2", label: "Level 3 • Term II" },
  { value: "L4T1", label: "Level 4 • Term I" },
  { value: "L4T2", label: "Level 4 • Term II" },
];

const BATCHES = ["12","13","14","15","16","17","18"]; // extend if needed

/** Guess termLevel from legacy text like “Level 3 Term II” */
const guessTermLevelFromText = (text = "") => {
  const romanToNum = { I: 1, II: 2 };
  const m = text.match(/Level\s*([1-4]).*Term\s*(I{1,2})/i);
  if (!m) return "";
  const level = m[1];
  const termNum = romanToNum[(m[2] || "").toUpperCase()];
  return termNum ? `L${level}T${termNum}` : "";
};
const termLabelFor = (value) =>
  TERM_OPTIONS.find((o) => o.value === value)?.label || "";
const batchLabelFor = (batch) => (batch ? `${batch}th Batch` : "");

/**
 * Props:
 *  - note: { id, title, university, subject, term, termLevel, batch, fileUrl, coverImageUrl }
 *  - onClose: () => void
 */
const NoteEditorModal = ({ note, onClose }) => {
  const db = getFirestore();
  const [saving, setSaving] = useState(false);

  const initialTermLevel =
    note.termLevel || guessTermLevelFromText(note.term) || "L1T1";

  const [form, setForm] = useState({
    title: note.title || "",
    university: note.university || "",
    termLevel: initialTermLevel,
    batch: note.batch || "", // "" means none selected
    subject: note.subject || "",
    fileUrl: note.fileUrl || "",
    coverImageUrl: note.coverImageUrl || "",
  });

  const firstInputRef = useRef(null);
  const setField = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  // focus + lock scroll + esc to close
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstInputRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const handleSave = async (e) => {
    e.preventDefault();
    const { title, university, termLevel, batch, subject, fileUrl, coverImageUrl } = form;
    if (!title.trim() || !university.trim() || !termLevel || !subject.trim() || !fileUrl.trim()) {
      return alert("Please fill all required fields.");
    }

    setSaving(true);
    try {
      await updateDoc(doc(db, "notes", note.id), {
        title: title.trim(),
        university: university.trim(),
        termLevel,                      // canonical key: e.g. "L3T2"
        term: termLabelFor(termLevel),  // human label:  "Level 3 • Term II"
        batch: batch || "",             // e.g. "13"
        batchLabel: batchLabelFor(batch || ""), // e.g. "13th Batch"
        subject: subject.trim(),
        fileUrl: fileUrl.trim(),
        coverImageUrl: (coverImageUrl || "").trim(),
      });
      onClose(); // parent onSnapshot will refresh
    } catch (err) {
      console.error(err);
      alert(`Update failed: ${err.message || err}`);
    } finally {
      setSaving(false);
    }
  };

  const onBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg p-5 bg-white shadow-lg rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Edit Note</h3>
          <button onClick={onClose} className="text-sm text-gray-600 hover:text-black" aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSave} className="grid gap-3">
          <div>
            <label className="block mb-1 text-sm font-medium">Title</label>
            <input
              ref={firstInputRef}
              className="w-full p-2 border rounded"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-sm font-medium">University</label>
              <input
                className="w-full p-2 border rounded"
                value={form.university}
                onChange={(e) => setField("university", e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Level / Term</label>
              <select
                className="w-full p-2 border rounded"
                value={form.termLevel}
                onChange={(e) => setField("termLevel", e.target.value)}
                required
              >
                {TERM_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-sm font-medium">Batch (optional)</label>
              <select
                className="w-full p-2 border rounded"
                value={form.batch}
                onChange={(e) => setField("batch", e.target.value)}
              >
                <option value="">— None —</option>
                {BATCHES.map((b) => (
                  <option key={b} value={b}>{b}th Batch</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Subject</label>
              <input
                className="w-full p-2 border rounded"
                value={form.subject}
                onChange={(e) => setField("subject", e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">File URL (direct download)</label>
            <input
              className="w-full p-2 border rounded"
              value={form.fileUrl}
              onChange={(e) => setField("fileUrl", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Cover Image URL (optional)</label>
            <input
              className="w-full p-2 border rounded"
              value={form.coverImageUrl}
              onChange={(e) => setField("coverImageUrl", e.target.value)}
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteEditorModal;
