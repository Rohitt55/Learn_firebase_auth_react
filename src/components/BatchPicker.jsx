import React from "react";
import { Link } from "react-router-dom";

const BATCHES = ["12","13","14","15","16","17","18"]; // extend as needed

const BatchPicker = () => {
  return (
    <div className="max-w-5xl px-4 py-8 mx-auto">
      <h1 className="mb-6 text-2xl font-bold">Choose Your Batch</h1>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {BATCHES.map((b) => (
          <Link
            key={b}
            to={`/browse/${b}`}
            className="p-6 text-center transition bg-white border rounded-xl hover:shadow"
          >
            <div className="text-4xl font-extrabold">{b}</div>
            <div className="mt-1 text-sm text-gray-600">Batch</div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BatchPicker;
