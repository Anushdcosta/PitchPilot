import React, { memo } from "react";
import { RefreshCw } from "lucide-react";

export const Section = memo(function Section({
  label,
  value,
  fieldKey,
  refinedSummary,
  setRefinedSummary,
  loadingField,
  handleShuffle,
  id,
}: {
  label: string;
  value?: string;
  fieldKey: string;
  refinedSummary: any;
  setRefinedSummary: React.Dispatch<React.SetStateAction<any>>;
  loadingField: string | null;
  handleShuffle: (field: string) => void;
  id: string | undefined;
}) {
  if (value === undefined) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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
                ? "text-gray-800 dark:text-gray-400 cursor-not-allowed"
                : "text-gray-800 dark:text-gray-300 hover:text-gray-500 dark:hover:text-white"
            } flex items-center gap-1`}
        >
          <RefreshCw
            className={`w-4 h-4 ${
              loadingField === fieldKey ? "animate-spin" : ""
            }`}
          />
          {loadingField === fieldKey ? "Shuffling..." : "Shuffle"}
        </button>
      </div>

      {isMultiline ? (
        <textarea
          className="w-full p-3 rounded-lg border border-gray-500 text-base leading-relaxed bg-[#f9f9f9] text-black resize-none"
          rows={4}
          value={refinedSummary?.[fieldKey] ?? ""}
          onChange={handleChange}
        />
      ) : (
        <input
          className="w-full p-3 rounded-lg border border-gray-500 text-base leading-relaxed bg-[#f9f9f9] text-black"
          type="text"
          value={refinedSummary?.[fieldKey] ?? ""}
          onChange={handleChange}
        />
      )}
    </div>
  );
});
