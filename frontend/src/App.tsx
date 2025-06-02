import React, { useState } from "react";
import ChatCard from "./ChatCard";
import LoadingScreen from "./LoadingScreen";
import { Toaster } from "react-hot-toast";
import { Route, Routes } from "react-router-dom";
import PitchDetail from "./PitchDetail";
import RefinedSummaryPage from "./RefinedSummaryPage";

export default function App() {
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  const safeFetch = async (keywords: string) => {
    setLoading(true);
    setError("");
    setData(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords }),
      });

      const text = await res.text(); // Read raw response
      console.log("📦 Raw response text:", text.slice(0, 300));

      let json;
      try {
        json = JSON.parse(text);
      } catch (err) {
        throw new Error("❌ Invalid JSON from backend:\n" + text.slice(0, 200));
      }

      if (!res.ok) throw new Error(json.error || "Server error");
      setData(json);
    } catch (err: any) {
      console.error("❌ Frontend error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    safeFetch(keywords);
  };

  const surpriseMe = () => {
    safeFetch("");
  };

  const replaceOtherCard = (sourcePitch: any, remixPitch: any) => {
    setData((prev) => {
      if (!prev?.pitches) return null;
      const newPitches = prev.pitches.map((p) =>
        p.name === sourcePitch.name ? remixPitch : p
      );
      return { pitches: newPitches };
    });
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6 font-sans flex flex-col items-center">
      <Toaster />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
                🚀 Startup Pitch Generator
              </h1>

              <form
                onSubmit={handleSubmit}
                className="w-full max-w-2xl flex flex-wrap gap-2 justify-center mb-6"
              >
                <input
                  className="flex-1 min-w-[250px] px-4 py-2 rounded-lg bg-[#2b2b2b] text-white border border-gray-600 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
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
                <button
                  type="button"
                  onClick={surpriseMe}
                  className="bg-pink-600 px-4 py-2 rounded-lg hover:bg-pink-700 transition text-white font-semibold"
                >
                  🎲 Surprise Me
                </button>
              </form>

              {error && <p className="text-red-500 text-sm">{error}</p>}
              {loading && <LoadingScreen />}
              {data?.pitches && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 w-full max-w-6xl">
                  {data.pitches.map((pitch: any, index: number) => (
                    <ChatCard
                      key={index}
                      pitch={pitch}
                      onReplaceOther={replaceOtherCard}
                    />
                  ))}
                </div>
              )}
            </>
          }
        />
        <Route path="/pitch/:id" element={<PitchDetail />} />
        <Route path="/pitch/:id/summary" element={<RefinedSummaryPage />} />
      </Routes>
    </div>
  );
}
