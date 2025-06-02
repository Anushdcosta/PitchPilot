import React, { useState } from "react";
import ChatCard from "./ChatCard";

export default function App() {
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setData(null);

    try {
      const res = await fetch("http://localhost:3000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Unknown error");

      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen bg-[#121212] text-white p-4 flex flex-col items-center font-sans">
    <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
  <span>🚀</span> Startup Pitch Generator
</h1>


    <form onSubmit={handleSubmit} className="w-full max-w-2xl flex gap-2 mb-6">
      <input
        className="flex-1 px-4 py-2 rounded-lg bg-[#2b2b2b] text-white border border-gray-600 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
        value={keywords}
        onChange={(e) => setKeywords(e.target.value)}
        placeholder="Tell me your dream idea..."
      />
      <button
        type="submit"
        className="bg-purple-600 px-4 py-2 rounded-lg hover:bg-purple-700 transition text-white font-semibold"
        disabled={loading}
      >
        {loading ? "Loading..." : "Generate"}
      </button>
    </form>

    {error && <p className="text-red-500 text-sm">{error}</p>}
    {console.log(data)}
    {data?.pitches && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {data?.pitches?.map((pitch: any, index: number) => (
          <ChatCard key={index} pitch={pitch} />
        ))}
      </div>
    )}



  </div>
  );
}