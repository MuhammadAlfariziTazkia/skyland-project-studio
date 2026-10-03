interface Props {
  label: string;
  value: string;
  options: { id: string; label: string }[];
  onChange: (id: string) => void;
}

/** One-tap answer row used for the price-relevant choices (region, content, timeline). */
export function Segmented({ label, value, options, onChange }: Props) {
  return (
    <div class="q-row">
      <span class="q-label">{label}</span>
      <div class="seg q-seg" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button type="button" role="radio" aria-checked={value === o.id} onClick={() => onChange(o.id)}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
