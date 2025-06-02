import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import jsPDF from "jspdf";

export default function RefinedSummaryPage() {
  const { id } = useParams();
  const [refinedSummary, setRefinedSummary] = useState<any | null>(null);
  const [loadingField, setLoadingField] = useState<string | null>(null);

  const handleShuffle = async (field: string) => {
    setLoadingField(field);
    if (!refinedSummary || !id) return;

    const latest = { ...refinedSummary };

    try {
      const res = await fetch("http://localhost:3000/refine/field", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pitch: latest,
          field,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Shuffle failed");

      const updated = {
        ...latest,
        [field]: data.value,
      };

      setRefinedSummary(updated);
      localStorage.setItem(`pitch-${id}-refinedSummary`, JSON.stringify(updated));
      setLoadingField(null);
    } catch (err) {
      console.error("Shuffle failed:", err);
      alert("❌ Failed to shuffle field. Please try again.");
    }
  };

  const handleTextOnlyPDF = () => {
    if (!refinedSummary) return;

    const doc = new jsPDF();
    let y = 20;

    const addField = (label: string, value?: string) => {
      if (!value) return;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(label, 20, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      const lines = doc.splitTextToSize(value, 170);
      doc.text(lines, 20, y);
      y += lines.length * 6 + 4;
    };

    addField("Startup Name", refinedSummary.name);
    addField("One-liner", refinedSummary.oneLiner);
    addField("Elevator Pitch", refinedSummary.elevatorPitch);
    addField("Tagline", refinedSummary.tagline);
    addField("Vision", refinedSummary.vision);
    addField("Target Audience", refinedSummary.targetAudience);
    addField("Planned Features", refinedSummary.features);
    addField("Tools/Tech Stack", refinedSummary.tools);
    addField("Risks & Challenges", refinedSummary.risks);
    addField("Unique Value", refinedSummary.uniquePoint);

    doc.save(`${refinedSummary.name || "Startup"}_Summary.pdf`);
  };

  const Section = ({
    label,
    value,
    fieldKey,
  }: {
    label: string;
    value?: string;
    fieldKey: string;
  }) => {
    if (value === undefined) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const updated = {
        ...refinedSummary,
        [fieldKey]: e.target.value,
      };
      setRefinedSummary(updated);
      if (id) {
        localStorage.setItem(`pitch-${id}-refinedSummary`, JSON.stringify(updated));
      }
    };

    const isMultiline = value.length > 80 || fieldKey === "elevatorPitch";

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2 flex-wrap">
          <h3 className="text-lg font-semibold text-blue-400">{label}</h3>
          <button
            onClick={() => handleShuffle(fieldKey)}
            disabled={loadingField === fieldKey}
            className={`text-sm ${
              loadingField === fieldKey
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-300 hover:text-white"
            } flex items-center gap-1`}
          >
            <RefreshCw className={`w-4 h-4 ${loadingField === fieldKey ? "animate-spin" : ""}`} />
            {loadingField === fieldKey ? "Shuffling..." : "Shuffle"}
          </button>
        </div>

        {isMultiline ? (
          <textarea
            className="w-full p-3 rounded-lg border border-gray-500 text-base leading-relaxed bg-[#f9f9f9] text-black resize-none"
            rows={4}
            value={value}
            onChange={handleChange}
          />
        ) : (
          <input
            className="w-full p-3 rounded-lg border border-gray-500 text-base leading-relaxed bg-[#f9f9f9] text-black"
            type="text"
            value={value}
            onChange={handleChange}
          />
        )}
      </div>
    );
  };

  useEffect(() => {
    const stored = localStorage.getItem(`pitch-${id}-refinedSummary`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.raw) {
          const extractField = (label: string) => {
            const regex = new RegExp(`${label}:\\s*(.+?)(?=\\n\\w|$)`, 'is');
            const match = parsed.raw.match(regex);
            return match ? match[1].trim() : undefined;
          };

          parsed.name = parsed.name || extractField("name");
          parsed.oneLiner = parsed.oneLiner || extractField("oneLiner");
          parsed.elevatorPitch = parsed.elevatorPitch || extractField("elevatorPitch");
          parsed.tagline = parsed.tagline || extractField("Tagline");
          parsed.vision = parsed.vision || extractField("Vision");
          parsed.targetAudience = parsed.targetAudience || extractField("Target Audience");
          parsed.features = parsed.features || extractField("Planned Features");
          parsed.tools = parsed.tools || extractField("Tools/Tech Stack");
          parsed.risks = parsed.risks || extractField("Potential Challenges");
          parsed.uniquePoint = parsed.uniquePoint || extractField("Uniqueness");
        }

        setRefinedSummary(parsed);
      } catch (err) {
        console.error("Failed to parse refined summary:", err);
      }
    }
  }, [id]);

  if (!refinedSummary)
    return <p className="text-center text-gray-400">⏳ Loading summary...</p>;

  return (
    <div style={{width: "60vw"}} className="max-w-5xl mx-auto p-6 text-white">
      <h1 className="text-3xl font-bold text-blue-500 mb-6">💡 Refined Startup Summary</h1>

      <div className="bg-[#1e1e1e] text-white p-6 rounded-lg border border-gray-700 shadow space-y-6">
        <Section label="Startup Name" value={refinedSummary.name || "N/A"} fieldKey="name" />
        <Section label="One-liner" value={refinedSummary.oneLiner} fieldKey="oneLiner" />
        <Section label="Elevator Pitch" value={refinedSummary.elevatorPitch} fieldKey="elevatorPitch" />
        <Section label="Tagline" value={refinedSummary.tagline} fieldKey="tagline" />
        <Section label="Vision" value={refinedSummary.vision} fieldKey="vision" />
        <Section label="Target Audience" value={refinedSummary.targetAudience} fieldKey="targetAudience" />
        <Section label="Planned Features" value={refinedSummary.features} fieldKey="features" />
        <Section label="Tools/Tech Stack" value={refinedSummary.tools} fieldKey="tools" />
        <Section label="Risks & Challenges" value={refinedSummary.risks} fieldKey="risks" />
        <Section label="Unique Value" value={refinedSummary.uniquePoint} fieldKey="uniquePoint" />
      </div>

      <div className="mt-6 flex gap-4">
        <button
          onClick={handleTextOnlyPDF}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition font-semibold"
        >
          📄 Export Clean PDF
        </button>
      </div>
    </div>
  );
}
