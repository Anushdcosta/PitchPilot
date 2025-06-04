import React, { useState, useEffect } from "react";
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
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  // COde to swtich between light and dark modes
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") setIsDarkMode(true);
    console.log(storedTheme)
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const TagButton = ({
      label,
      icon,
      value,
    }: {
      label: string;
      icon: string;
      value: string;
    }) => {
      const isSelected = selectedTag === value;

      const handleClick = () => {
        setSelectedTag((prev) => (prev === value ? null : value));
      };

      return (
        <button
          type="button"
          onClick={handleClick}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition
            ${isSelected ? "bg-blue-600 text-white border-blue-600" : "border-gray-700 hover:bg-[#4899e0] dark:hover:bg-[#2a2a2a]"}`}
        >
          <span className="material-symbols-outlined">
            {isSelected ? "check_circle" : icon}
          </span>
          {label}
        </button>
      );
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setData(null);

    try {
      const combinedKeywords = selectedTag
        ? `${selectedTag} ${keywords}`.trim()
        : keywords;

      const res = await fetch("http://localhost:3000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: combinedKeywords }),
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


  const replaceOtherCard = (sourcePitch: any, remixPitch: any) => {
  setData((prev) => {
    if (!prev?.pitches || prev.pitches.length < 2) return prev;

    // Find the other pitch to replace
    const newPitches = prev.pitches.map((p) =>
      p.name !== sourcePitch.name ? remixPitch : p
    );

    return { pitches: newPitches };
  });
};

  const surpriseMe = async () => {
    setLoading(true);
    setError("");
    setData(null);

    try {
      const combinedKeywords = selectedTag
        ? `${selectedTag}`.trim()
        : "";

      const res = await fetch("http://localhost:3000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: combinedKeywords }),
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
    <div className={isDarkMode ? 'dark' : ''}>
      <button
      onClick={() => setIsDarkMode(!isDarkMode)}
      className="fixed top-4 right-4 px-3 py-1 bg-gray-200 dark:bg-gray-800 text-black dark:text-white rounded"
      >
        {isDarkMode ? '☀️ Light' : '🌙 Dark'}
      </button>
      <div className="min-h-screen dark:bg-[#121212] dark:text-white p-6 font-sans flex flex-col items-center">
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" />
        <Toaster />
  
        <Routes>
          <Route
            path="/"
            element={
              <>
                <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
                  
                    <span className="material-symbols-outlined text-pink-500" style={{fontSize: "1.25em"}}>rocket</span> Startup Pitch Generator
                </h1>
  
                <form
                  onSubmit={handleSubmit}
                  className="w-full max-w-2xl flex flex-col gap-2 justify-center mb-6"
                >
                  <div className="relative border border-gray-700 rounded-xl p-4 dark:bg-[#1e1e1e] ring-1 ring-blue-500">
                    <textarea
                      className="w-full bg-transparent text-white placeholder:text-gray-400 focus:outline-none resize-none"
                      rows={1}
                      value={keywords} 
                      onChange={(e) => setKeywords(e.target.value)}
                      placeholder="Describe your design"
                    />
  
                    <div className="mt-4 flex justify-end items-center gap-2">
                      <button
                        type="submit"
                        className="flex items-center gap-1 bg-purple-600 px-4 py-2 rounded-lg hover:bg-purple-700 transition text-white font-semibold"
                        disabled={loading}
                      >
                        {loading ? "Loading..." : "Generate designs"}
                      </button>
  
                      <button
                        type="button"
                        onClick={surpriseMe}
                        className="bg-pink-600 px-4 py-2 rounded-lg hover:bg-pink-700 transition text-white font-semibold"
                      >
                        🎲 Surprise Me
                      </button>
                    </div>                  
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <TagButton label="University project" icon="school" value="This idea should be suitable for a final-year university capstone project in computer science." />
                    <TagButton label="Research idea" icon="science" value="This idea should be a novel research project that can be explored in academia." />
                    <TagButton label="Hackathon" icon="emoji_objects" value="This idea should be a creative and original project suitable to build during a 24-hour hackathon." />
                    <TagButton label="Startup" icon="business_center" value="" />
                  </div>
  
                </form>
  
  
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {loading && <LoadingScreen />}
                {data?.pitches && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-1 w-full max-w-6xl">
                    {data.pitches.map((pitch, index) => (
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
    </div>
  );
}
