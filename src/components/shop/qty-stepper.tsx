"use client";

export function QtyStepper({ value, max, onChange, label = "Số lượng" }: { value: number; max: number; onChange: (v: number) => void; label?: string }) {
  const set = (v: number) => onChange(Math.max(1, Math.min(max, Number.isFinite(v) ? v : 1)));
  return (
    <div className="inline-flex h-11 items-center rounded-xl border border-line bg-surface-2" role="group" aria-label={label}>
      <button type="button" className="size-11 text-lg disabled:opacity-40" onClick={() => set(value - 1)} disabled={value <= 1} aria-label="Giảm">−</button>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={max}
        value={value}
        onChange={(e) => set(Number.parseInt(e.target.value, 10))}
        className="h-full w-12 bg-transparent text-center text-sm font-semibold [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
        aria-label={label}
      />
      <button type="button" className="size-11 text-lg disabled:opacity-40" onClick={() => set(value + 1)} disabled={value >= max} aria-label="Tăng">+</button>
    </div>
  );
}
