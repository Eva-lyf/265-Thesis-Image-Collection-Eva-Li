'use client';

type ColorSpectrumProps = {
  hue: number;
  color: string;
  onChange: (hue: number) => void;
};

export function ColorSpectrum({ hue, color, onChange }: ColorSpectrumProps) {
  return (
    <section className="spectrum-section" aria-label="Color spectrum">
      <div className="spectrum-copy">
        <span>COLOR SPECTRUM</span>
        <strong style={{ color }}>{color}</strong>
      </div>
      <div className="spectrum-control">
        <div className="spectrum-track color-spectrum-track" />
        <span
          className="spectrum-indicator"
          style={{ left: `${(hue / 360) * 100}%` }}
          aria-hidden="true"
        />
        <input
          type="range"
          min={0}
          max={360}
          step={1}
          value={Math.round(hue)}
          aria-label="Choose a color"
          aria-valuetext={`${Math.round(hue)} degrees`}
          onChange={(event) => onChange(Number(event.currentTarget.value))}
        />
      </div>
    </section>
  );
}
