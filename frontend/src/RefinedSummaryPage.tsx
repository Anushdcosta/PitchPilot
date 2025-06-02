import { useParams} from "react-router-dom";
import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react"; // optional: lucide icon for shuffle


export default function RefinedSummaryPage() {
  const { id } = useParams();
  const [refinedSummary, setRefinedSummary] = useState<any | null>(null);
  const [loadingField, setLoadingField] = useState<string | null>(null);


  const handleShuffle = async (field: string) => {
    if (!refinedSummary || !id) return;
    setLoadingField(field); // start loading

    try {
      const res = await fetch("/api/refine/field", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pitch: refinedSummary,
          field,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Shuffle failed");

      const updated = {
        ...refinedSummary,
        [field]: data.value,
      };

      setRefinedSummary(updated);
      localStorage.setItem(`pitch-${id}-refinedSummary`, JSON.stringify(updated));
    } catch (err) {
      console.error("Shuffle failed:", err);
      alert("❌ Failed to shuffle field. Please try again.");
    } finally {
      setLoadingField(null); // stop loading
    }
  };

    const Section = ({ label, value, fieldKey }: { label: string; value?: string; fieldKey: string }) => {
      if (!value) return null;
      return (
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-semibold text-blue-300">{label}</h3>
            <button
              onClick={() => handleShuffle(fieldKey)}
              disabled={loadingField === fieldKey}
              className={`text-sm ${
                loadingField === fieldKey ? "text-gray-500 cursor-not-allowed" : "text-gray-400 hover:text-white"
              } flex items-center gap-1`}
            >
              <RefreshCw className={`w-4 h-4 ${loadingField === fieldKey ? "animate-spin" : ""}`} />
              {loadingField === fieldKey ? "Shuffling..." : "Shuffle"}
            </button>
          </div>
          <p className="text-gray-200">{value}</p>
        </div>
      );
    };

  useEffect(() => {
    const stored = localStorage.getItem(`pitch-${id}-refinedSummary`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log(parsed)

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

  if (!refinedSummary) return <p className="text-center text-gray-400">⏳ Loading summary...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 text-white">
      <h1 className="text-3xl font-bold text-blue-500 mb-6">💡 Refined Startup Summary</h1>

      <div className="bg-[#1e1e1e] p-6 rounded-lg shadow-lg border border-gray-700 space-y-6">
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
    </div>
  );
}
