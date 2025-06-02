import React from "react";

interface ContextMenuProps {
  x: number;
  y: number;
  visible: boolean;
  onClose: () => void;
  onCopy: () => void;
  onRemix: () => void;
  onShareWhatsApp: () => void;
  onShareEmail: () => void;
  shareAsImage: () => void;
}

export default function ContextMenu({
  x, y, visible, onClose, onCopy, onRemix, onShareEmail, onShareWhatsApp, shareAsImage
}: ContextMenuProps) {
  if (!visible) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50"
    >
      <ul
        className="absolute z-50 bg-[#1f1f1f] border border-white/10 shadow-xl text-white rounded-md py-1 w-48"
        style={{ top: y, left: x }}
      >
        <li onClick={onCopy} className="px-4 py-2 hover:bg-white/10 cursor-pointer">📋 Copy Pitch</li>
        <li className="relative group px-4 py-2 hover:bg-white/10 cursor-pointer">
          📤 Share
          <ul className="absolute left-full top-0  hidden group-hover:block bg-[#1f1f1f] border border-white/10 text-white rounded-md w-40 shadow-xl z-50">
            <li onClick={onShareWhatsApp} className="px-4 py-2 hover:bg-white/10 cursor-pointer">📱 WhatsApp</li>
            <li onClick={onShareEmail} className="px-4 py-2 hover:bg-white/10 cursor-pointer">✉️ Email</li>
          </ul>
        </li>
        <li onClick={shareAsImage} className="px-4 py-2 hover:bg-white/10 cursor-pointer">🖼️ Share as Image</li>
        <li onClick={onRemix} className="px-4 py-2 hover:bg-white/10 cursor-pointer">🎲 Remix This</li>
      </ul>
    </div>
  );
}
