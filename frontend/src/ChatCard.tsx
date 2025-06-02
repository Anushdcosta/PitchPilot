import React, { useRef, useState } from "react";
import { toast } from "react-hot-toast";
import ContextMenu from "./ContextMenu";
import LoadingScreen from "./LoadingScreen";
import { toPng } from 'html-to-image';
import { useNavigate } from "react-router-dom";


export default function ChatCard({ pitch, onReplaceOther }: any) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const handleClick = () => {
    if (!menuVisible) {
      navigate(`/pitch/${pitch.id}`);
    }
  };
  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPos({ x: e.pageX, y: e.pageY });
    setMenuVisible(true);
  };
  const handleShareWhatsApp = () => {
    const text = `NAME : ${pitch.name}\n\n ONE-LINER : "${pitch.oneLiner}"\n\n ELEVATOR-PITCH : ${pitch.elevatorPitch}\n\n TAGLINE: ${pitch.tagline}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    setMenuVisible(false);
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Startup Idea: ${pitch.name}`);
    const body = encodeURIComponent(
      `🚀 ${pitch.name}\n\n🧠 "${pitch.oneLiner}"\n\n📜 ${pitch.elevatorPitch}\n\n💬 ${pitch.tagline}`
    );
    const url = `mailto:?subject=${subject}&body=${body}`;
    window.open(url, "_blank");
    setMenuVisible(false);
  };
  const shareAsImage = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current);
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${pitch.name}_card.png`;
      link.click();
    } catch (err) {
      console.error("Image export failed", err);
    }
  };


  const copyToClipboard = () => {
    const text = `🚀 ${pitch.name}\n\n🧠 "${pitch.oneLiner}"\n\n📜 ${pitch.elevatorPitch}\n\n💬 ${pitch.tagline}`;
    navigator.clipboard.writeText(text);
    toast("Copied to Clipboard! 📋");
    setMenuVisible(false);
  };

  

  const handleRemix = async () => {
    setLoading(true);
    setMenuVisible(false);
    try {
      const res = await fetch("/api/remix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pitch }),
      });

      if (!res.ok) throw new Error("Bad response");

      const json = await res.json();
      if (!json?.remix) throw new Error("No remix returned");

      toast.success("🎲 Remixed!");
      onReplaceOther?.(pitch, json.remix);
    } catch (err) {
      console.error("❌ Remix failed:", err);
      toast.error("Remix failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={handleClick}
      onContextMenu={handleRightClick}
      className="ideacard relative max-w-xl w-full mx-auto p-[1px] rounded-2xl bg-gradient-to-br from-purple-500/40 to-pink-500/30 shadow-xl animate-glow-ring overflow-hidden min-h-[300px]"
    >
      <div className="h-full backdrop-blur-lg bg-white/10 text-white p-6 rounded-2xl flex flex-col">
        {/* Title + One Liner */}
        <div className="mb-3">
          <h2 className="text-2xl font-bold leading-snug">{pitch.name}</h2>
          <p className="italic text-sm text-gray-300 leading-snug mt-1">
            “{pitch.oneLiner}”
          </p>
        </div>

        {/* Main Description */}
        <p className="text-sm text-gray-200 leading-relaxed mb-4">
          {pitch.elevatorPitch}
        </p>

        {/* Tagline */}
        <p className="text-xs text-gray-400 pt-2 border-t border-white/10 mt-auto">
          {pitch.tagline}
        </p>

        {/* 📋 Manual Copy Button (bottom right) */}
        <div className="absolute bottom-4 right-4">
          <button
            onClick={copyToClipboard}
            aria-label="Copy pitch to clipboard"
            className="text-white hover:text-purple-400 transition-opacity opacity-70 hover:opacity-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h3l1-1h4l1 1h3a2 2 0 012 2v12a2 2 0 01-2 2z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 🖱 Custom Right-Click Menu */}
      <ContextMenu
        x={menuPos.x}
        y={menuPos.y}
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onCopy={copyToClipboard}
        onRemix={handleRemix}
        onShareWhatsApp={handleShareWhatsApp}
        onShareEmail={handleShareEmail}
        shareAsImage={shareAsImage}
      />

      {/* 🌀 Fullscreen Loading Overlay */}
      {loading && <LoadingScreen />}
    </div>
  );
}
