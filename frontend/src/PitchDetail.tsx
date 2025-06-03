import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";


const questions = [
  "What’s your vision for this idea?",
  "Who is your target audience?",
  "What features would you like to include?",
  "What tools, tech, or platforms might you use?",
  "What are the potential risks or challenges?",
  "What makes this idea stand out?",
];

export default function PitchDetail() {
  const { id } = useParams();
  const [pitch, setPitch] = useState<any>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(questions.length).fill(""));
  const [submitted, setSubmitted] = useState(false);
  const [refinedSummary, setRefinedSummary] = useState<any | null>(null);
  const [refining, setRefining] = useState(false);

  useEffect(() => {
    const savedAnswers = localStorage.getItem(`pitch-${id}-answers`);
    const savedSummary = localStorage.getItem(`pitch-${id}-refinedSummary`);
    const savedSubmitted = localStorage.getItem(`pitch-${id}-submitted`);

    if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
    if (savedSummary) setRefinedSummary(JSON.parse(savedSummary));
    if (savedSubmitted === "true") setSubmitted(true);
  }, [id]);

  useEffect(() => {
    localStorage.setItem(`pitch-${id}-answers`, JSON.stringify(answers));
  }, [answers]);

  useEffect(() => {
    if (refinedSummary) {
      localStorage.setItem(`pitch-${id}-refinedSummary`, JSON.stringify(refinedSummary));
      localStorage.setItem(`pitch-${id}-submitted`, "true");
    }
  }, [refinedSummary]);

  useEffect(() => {
    const savedStep = localStorage.getItem(`pitch-${id}-step`);
    if (savedStep) setStep(parseInt(savedStep));
  }, [id]);

  useEffect(() => {
    localStorage.setItem(`pitch-${id}-step`, step.toString());
  }, [step]);

  useEffect(() => {
    fetch(`http://localhost:3000/pitch/${id}`)
      .then((res) => res.json())
      .then(setPitch);
  }, [id]);

  useEffect(() => {
    if (submitted && pitch && !refinedSummary) {
      setRefining(true);
      fetch("http://localhost:3000/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pitch, answers }),
      })
        .then((res) => res.json())
        .then((data) => {
          try {
            const parsed = typeof data.summary === "string" ? JSON.parse(data.summary) : data.summary;
            setRefinedSummary(parsed);
          } catch {
            setRefinedSummary({ raw: data.summary });
          }
        })
        .catch(() => {
          setRefinedSummary({ raw: "❌ Failed to generate refined summary." });
        })
        .finally(() => {
          setRefining(false);
        });
    }
  }, [submitted, pitch, answers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const updated = [...answers];
    updated[step] = e.target.value;
    setAnswers(updated);
  };

  useEffect(() => {
    console.log("Restored summary:", refinedSummary);
    console.log("Restored answers:", answers);
  }, [refinedSummary, answers]);

  const handleNext = () => {
    const updated = [...answers];
    if (!updated[step].trim()) updated[step] = "Unsure";
    setAnswers(updated);
    step < questions.length - 1 ? setStep(step + 1) : setSubmitted(true);
  };

  

  if (!pitch) return <div>Loading...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{pitch.name}</h1>
      <p className="italic text-lg mb-4 text-purple-300">{pitch.oneLiner}</p>
      <p className="mb-4 text-lg">{pitch.elevatorPitch}</p>
      <p className="text-sm text-gray-500">{pitch.tagline}</p>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">🧠 Let's build your idea step-by-step</h2>

        {!submitted ? (
          <>
            <label className="block mb-2 font-medium">{questions[step]}</label>
            <textarea
              className="w-full p-3 rounded bg-[#1e1e1e] text-white border border-gray-600 mb-4"
              rows={4}
              value={answers[step]}
              onChange={handleInputChange}
              placeholder="Type your thoughts here..."
            />
            <button
              onClick={handleNext}
              className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition text-white font-semibold"
            >
              {step < questions.length - 1 ? "Next →" : "Finish"}
            </button>
          </>
        ) : (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2 text-green-400">✅ Done! Here's your vision:</h3>
            <ul className="list-disc ml-5 space-y-2 text-white/90">
              {questions.map((q, i) => (
                <li key={i}>
                  <strong>{q}</strong><br />
                  <span className={answers[i] === "Unsure" ? "text-red-400 italic" : "text-white/80 italic"}>
                    {answers[i]}
                  </span>
                </li>
              ))}
            </ul>

            <div id="refined-summary-block" className="mt-8 bg-white text-gray-800 p-6 rounded shadow-md print:bg-white print:text-black">
              <h2 className="text-xl font-bold mb-4 text-blue-600">💡 Refined Startup Summary</h2>
              {refining && <p className="italic text-gray-500">Refining your idea with AI...</p>}

              {!refining && refinedSummary && (
                <div className="space-y-4">
                  {refinedSummary.summary && <p><strong>Summary:</strong> {refinedSummary.summary}</p>}
                  {refinedSummary.vision && <p><strong>Vision:</strong> {refinedSummary.vision}</p>}
                  {refinedSummary.targetAudience && <p><strong>Target Audience:</strong> {refinedSummary.targetAudience}</p>}
                  {refinedSummary.features && <p><strong>Planned Features:</strong> {refinedSummary.features}</p>}
                  {refinedSummary.tools && <p><strong>Tools/Tech Stack:</strong> {refinedSummary.tools}</p>}
                  {refinedSummary.risks && <p><strong>Risks & Challenges:</strong> {refinedSummary.risks}</p>}
                  {refinedSummary.uniquePoint && <p><strong>Unique Value:</strong> {refinedSummary.uniquePoint}</p>}
                  {refinedSummary.raw && (
                    <p className="whitespace-pre-wrap text-gray-700">{refinedSummary.raw}</p>
                  )}
                </div>
              )}
            </div>

            <Link to={`/pitch/${id}/summary`}>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 mt-6">
                📄 View Summary Report
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
