import type { InputHTMLAttributes } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  hint?: string;
}

export default function FormField({ id, label, error, hint, ...input }: Props) {
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <input
        id={id}
        className="field"
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        {...input}
      />
      {error ? (
        <p id={`${id}-err`} className="error-text">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-1 text-[11px] text-ink-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
