"use client";

import { useEffect } from "react";

/**
 * @typedef {{ label: string; value: string; strong?: boolean }} SnapshotRow
 */

/**
 * @param {{
 *  isOpen: boolean;
 *  onClose: () => void;
 *  rows?: SnapshotRow[];
 * }} props
 */
export function WholesaleSnapshotModal({ isOpen, onClose, rows = [] }) {
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Wholesale Snapshot"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-extrabold text-slate-900">Wholesale Snapshot</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-1 gap-y-3 text-sm text-slate-800 sm:grid-cols-[1fr_auto] sm:gap-x-4">
            {rows.map((row) => (
              <div key={row.label} className="contents">
                <div className="font-medium text-slate-700">{row.label}</div>
                <div
                  className={`text-left sm:text-right ${row.strong ? "font-extrabold text-slate-900" : "font-semibold"}`}
                >
                  {row.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
