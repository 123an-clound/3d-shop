/** Decorative CSS-only 3D cube with "printing" layers — no WebGL, so it costs nothing on LCP. */
export function PrintCube() {
  const faces = [
    "rotateY(0deg)",
    "rotateY(90deg)",
    "rotateY(180deg)",
    "rotateY(-90deg)",
    "rotateX(90deg)",
    "rotateX(-90deg)",
  ];
  return (
    <div aria-hidden className="pointer-events-none [perspective:900px]">
      <div className="relative size-40 animate-spin-slow [--half:5rem] [transform-style:preserve-3d] sm:size-48 sm:[--half:6rem]">
        {faces.map((t) => (
          <div
            key={t}
            className="absolute inset-0 rounded-2xl border border-accent/50 bg-accent/[0.06] shadow-[inset_0_0_40px_-10px_var(--color-accent)] backdrop-blur-[1px]"
            style={{ transform: `${t} translateZ(var(--half))` }}
          >
            <div className="flex h-full flex-col justify-end gap-1.5 p-4">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="h-1 origin-left animate-layer rounded-full bg-accent/70"
                  style={{ animationDelay: `${i * 0.35}s` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
