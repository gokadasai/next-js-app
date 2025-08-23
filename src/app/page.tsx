"use client";

import { useState, useEffect } from "react";

interface Entry {
  tins: number;
  date: string;
}

export default function WaterBottleApp() {
  const [tins, setTins] = useState<number>(1);
  const [date, setDate] = useState<string>("");
  const [history, setHistory] = useState<Entry[]>([]);

  // Load history from localStorage on first render
  useEffect(() => {
    const storedData = localStorage.getItem("waterTinsHistory");
    if (storedData) {
      setHistory(JSON.parse(storedData));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;

    const newEntry: Entry = { tins, date };
    const updatedHistory: Entry[] = [...history, newEntry];

    setHistory(updatedHistory);
    localStorage.setItem("waterTinsHistory", JSON.stringify(updatedHistory));

    setDate("");
    setTins(1);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-blue-50">
      <h1 className="text-2xl font-bold mb-6">Water Bottle Tracker</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-2xl p-6 w-full max-w-md"
      >
        <label className="block mb-4">
          <span className="text-gray-700">Number of Water Tins</span>
          <select
            value={tins}
            onChange={(e) => setTins(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            {[1, 2, 3, 4, 5].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </label>

        <label className="block mb-4">
          <span className="text-gray-700">Date of Deposit</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </label>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-xl hover:bg-blue-600"
        >
          Submit
        </button>
      </form>

      <div className="mt-8 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Submission History</h2>
        {history.length === 0 ? (
          <p className="text-gray-500">No data yet.</p>
        ) : (
          <ul className="space-y-2">
            {history.map((entry, index) => (
              <li
                key={index}
                className="bg-white p-3 rounded-xl shadow-sm flex justify-between"
              >
                <span>{entry.tins} Tin(s)</span>
                <span>{entry.date}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
