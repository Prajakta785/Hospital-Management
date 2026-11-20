import React from 'react';

// Lightweight standalone SVG QR Code visual token generator
export function QRCodeToken({ value = 'APEX-CARE', size = 80, label = 'Scan at Counter' }) {
  // Generate deterministic grid pattern from value string
  const hash = String(value).split('').reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) & 0xffffffff, 0);
  const matrixSize = 21;
  const grid = Array(matrixSize).fill(0).map((_, r) => {
    return Array(matrixSize).fill(0).map((_, c) => {
      // Standard QR position markers (Top-left, Top-right, Bottom-left)
      const isTopLeft = r < 7 && c < 7;
      const isTopRight = r < 7 && c >= matrixSize - 7;
      const isBottomLeft = r >= matrixSize - 7 && c < 7;

      if (isTopLeft) {
        if (r === 0 || r === 6 || c === 0 || c === 6) return true;
        if (r >= 2 && r <= 4 && c >= 2 && c <= 4) return true;
        return false;
      }
      if (isTopRight) {
        const cAdj = c - (matrixSize - 7);
        if (r === 0 || r === 6 || cAdj === 0 || cAdj === 6) return true;
        if (r >= 2 && r <= 4 && cAdj >= 2 && cAdj <= 4) return true;
        return false;
      }
      if (isBottomLeft) {
        const rAdj = r - (matrixSize - 7);
        if (rAdj === 0 || rAdj === 6 || c === 0 || c === 6) return true;
        if (rAdj >= 2 && rAdj <= 4 && c >= 2 && c <= 4) return true;
        return false;
      }

      // Pseudo-random pseudo-QR data pattern from hash
      const cellBit = Math.abs((hash ^ (r * 37 + c * 41 + (r * c))) % 3);
      return cellBit === 0;
    });
  });

  const cellSize = size / matrixSize;

  return (
    <div className="inline-flex flex-col items-center gap-1 p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="shape-rendering-crispEdges"
      >
        <rect width={size} height={size} fill="#ffffff" />
        {grid.map((row, r) =>
          row.map((active, c) =>
            active ? (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize}
                height={cellSize}
                fill="#071933"
              />
            ) : null
          )
        )}
      </svg>
      {label && (
        <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-tight">
          {label}
        </span>
      )}
    </div>
  );
}
