import type { ElementType, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  double?: boolean;
  labelledBy?: string;
  label?: string;
}

/** Cream paper frame with inner highlight and soft bevel. `double` nests a second frame (slider). */
export default function CreamFrame({
  children,
  className = '',
  as: Tag = 'div',
  double = false,
  labelledBy,
  label,
}: Props) {
  if (double) {
    return (
      <Tag className={`frame-double on-paper ${className}`} aria-labelledby={labelledBy} aria-label={label}>
        <div className="frame-inner">{children}</div>
      </Tag>
    );
  }
  return (
    <Tag className={`frame on-paper ${className}`} aria-labelledby={labelledBy} aria-label={label}>
      {children}
    </Tag>
  );
}
