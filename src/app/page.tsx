"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // If already logged in, go straight to form
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/form");
    });
  }, [router]);

  const signUp = async () => {
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setMessage("❌ " + error.message);
    else setMessage("✅ Signup successful! Check your email to confirm.");
    setLoading(false);
  };

  const signIn = async () => {
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage("❌ " + error.message);
    else router.push("/form");
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center p-10">
      <h1 className="text-2xl font-bold mb-4">Water Bottle App</h1>

      <input
        className="border p-2 mb-2 w-64 rounded"
        type="email"
        placeholder="Enter email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
      />
      <input
        className="border p-2 mb-4 w-64 rounded"
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
      />

      <div className="flex gap-3">
        <button
          onClick={signUp}
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          Sign Up
        </button>
        <button
          onClick={signIn}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          Sign In
        </button>
      </div>

      {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
    </div>
  );
}
