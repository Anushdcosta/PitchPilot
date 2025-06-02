import React, { useEffect, useState } from "react";
const verbs = ["crafting", "forging", "thinking", "summoning", "launching", "dreaming", "igniting", "processing", "simulating", "hallucinating"];
const nouns = ["startups", "ideas", "brands", "pitches", "chaos", "value", "genius", "clarity", "madness", "products"];

function getRandom(arr: string[]) {
  const index = Math.floor(Math.random() * arr.length);
  return arr[index];
}

function generateWordLoop(word: string) {
  // Duplicate the word list for the loop effect
  return [word, ...Array(3).fill(getRandom(nouns)), word];
}
export default function LoadingScreen() {
  const [label, setLabel] = useState("crafting");
  const [words, setWords] = useState(generateWordLoop("startups"));

  useEffect(() => {
    const timer = setInterval(() => {
      setLabel(getRandom(verbs));
      const next = getRandom(nouns);
      setWords(generateWordLoop(next));
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-lg bg-[#121212]/60 flex items-center justify-center">
      <div className="card text-white">
        <div className="loader">
            <div className="words">
                {verbs.map((word, i) => (
                <span key={i} className="wordother">{word}</span>
                ))}
            </div>
            <div className="words">
                {nouns.map((word, i) => (
                <span key={i} className="word">{word}</span>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
