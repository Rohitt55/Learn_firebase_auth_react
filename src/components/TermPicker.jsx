import React from "react";
import { Link, useParams } from "react-router-dom";

const TERM_LEVELS = [
  { value: "L1T1", label: "Level 1 · Term I" },
  { value: "L1T2", label: "Level 1 · Term II" },
  { value: "L2T1", label: "Level 2 · Term I" },
  { value: "L2T2", label: "Level 2 · Term II" },
  { value: "L3T1", label: "Level 3 · Term I" },
  { value: "L3T2", label: "Level 3 · Term II" },
  { value: "L4T1", label: "Level 4 · Term I" },
  { value: "L4T2", label: "Level 4 · Term II" },
];

const TermPicker = () => {
  const { batch } = useParams();

  return (
    <div className="max-w-5xl px-4 py-8 mx-auto">
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-2xl font-bold">Batch {batch}</h1>
        <Link to="/browse" className="text-sm text-blue-600 hover:underline">
          ← Change batch
        </Link>
      </div>

      <h2 className="mb-4 text-lg font-semibold">Choose Level / Term</h2>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {TERM_LEVELS.map((t) => (
          <Link
            key={t.value}
            to={`/browse/${batch}/${t.value}`}
            className="p-6 transition bg-white border rounded-xl hover:shadow"
          >
            <div className="font-semibold">{t.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TermPicker;
