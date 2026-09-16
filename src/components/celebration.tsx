import { useEffect, useMemo, useState } from "react";

const TONES = ["--tone-0", "--tone-1", "--tone-2", "--tone-3", "--tone-4", "--tone-5"];

/** Lightweight confetti burst, mounted only while `active` flips to true. */
export function Celebration({ active }: { active: boolean }) {
  const [visible, setVisible] = useState(false);
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    if (!active) return;
    setRunId((n) => n + 1);
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), 2600);
    return () => window.clearTimeout(t);
  }, [active]);

  const pieces = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        left: `${(i * 97) % 100}%`,
        delay: `${(i % 10) * 90}ms`,
        duration: `${1500 + ((i * 137) % 900)}ms`,
        drift: `${(((i * 53) % 120) - 60).toFixed(0)}px`,
        tone: TONES[i % TONES.length]!,
      })),
    [runId],
  );

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={`${runId}-${i}`}
          className="confetti-piece"
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            backgroundColor: `var(${p.tone})`,
            ["--drift" as string]: p.drift,
          }}
        />
      ))}
    </div>
  );
}
