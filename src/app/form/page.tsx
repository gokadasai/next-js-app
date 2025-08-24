"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Entry = {
  id: string;
  user_id: string;
  tins: number;
  date: string; // ISO date (YYYY-MM-DD)
  created_at: string;
};

export default function WaterForm() {
  const router = useRouter();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [tins, setTins] = useState<number>(1);
  const [date, setDate] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const [entries, setEntries] = useState<Entry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [error, setError] = useState<string>("");

  // Check session on mount
  useEffect(() => {
    let unsub = supabase.auth.onAuthStateChange((_event, sess) => {
      if (sess?.user) {
        setUserId(sess.user.id);
      } else {
        setUserId(null);
        router.replace("/");
      }
      setSessionChecked(true);
    });
    // also fetch current once
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setUserId(data.session.user.id);
      } else {
        router.replace("/");
      }
      setSessionChecked(true);
    });
    return () => {
      unsub.data.subscription.unsubscribe();
    };
  }, [router]);

  // Fetch entries for this user
  useEffect(() => {
    const fetch = async () => {
      if (!userId) return;
      setLoadingEntries(true);
      const { data, error } = await supabase
        .from("water_entries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setEntries((data || []) as Entry[]);
        setError("");
      }
      setLoadingEntries(false);
    };
    fetch();
  }, [userId]);

  const addEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !date || !tins) return;

    setSubmitting(true);
    setError("");

    const { data, error } = await supabase
      .from("water_entries")
      .insert([{ user_id: userId, tins, date }])
      .select()
      .single();

    if (error) {
      setError(error.message);
    } else if (data) {
      setEntries((prev) => [data as Entry, ...prev]);
      setDate("");
      setTins(1);
    }
    setSubmitting(false);
  };

  const deleteEntry = async (id: string) => {
    // optimistic UI
    const prev = entries;
    setEntries((e) => e.filter((x) => x.id !== id));
    const { error } = await supabase.from("water_entries").delete().eq("id", id);
    if (error) {
      // rollback on error
      setEntries(prev);
      setError(error.message);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  if (!sessionChecked) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">💧 Water Bottle Tracker</h1>
        <button
          onClick={logout}
          className="text-sm px-3 py-1 rounded bg-gray-700 text-white"
        >
          Logout
        </button>
      </div>
  
      {/* Water Form */}
      <form
        onSubmit={addEntry}
        className="bg-cyan-500 rounded-xl shadow p-4 mb-6 space-y-3"
      >
        <div>
          <label className="block text-sm font-medium mb-1">
            Number of Water Tins
          </label>
          <select
            value={tins}
            onChange={(e) => setTins(Number(e.target.value))}
            className="w-full border rounded px-3 py-2"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
  
        <div>
          <label className="block text-sm font-medium mb-1">
            Date of Deposit
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
  
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Submit"}
        </button>
  
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </form>
  
      {/* Total tins */}
      {entries.length > 0 && (
        <div className="mb-3 p-3 rounded bg-gray-100 dark:bg-gray-800">
          <p className="font-medium">
            ✅ Total Tins Submitted:{" "}
            <span className="font-bold">
              {entries.reduce((sum, e) => sum + e.tins, 0)}
            </span>
          </p>
        </div>
      )}
  
      {/* History */}
      <h2 className="text-lg font-semibold mb-2">Submission History</h2>
      {loadingEntries ? (
        <p>Loading entries…</p>
      ) : entries.length === 0 ? (
        <p className="text-gray-500">No data yet.</p>
      ) : (
        <ul className="space-y-2">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="bg-cyan-500 p-3 rounded-xl shadow flex items-center justify-between"
            >
              <div>
                <div className="font-medium">{entry.tins} Tin(s)</div>
                <div className="text-sm text-gray-600">{entry.date}</div>
              </div>
              <button
                onClick={() => deleteEntry(entry.id)}
                className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}