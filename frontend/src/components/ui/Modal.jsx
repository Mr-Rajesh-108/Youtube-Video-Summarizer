import * as React from "react"
import { cn } from "../../lib/utils"
import { FaTimes } from "react-icons/fa"

export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-md rounded-lg shadow-lg border animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors">
            <FaTimes />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
