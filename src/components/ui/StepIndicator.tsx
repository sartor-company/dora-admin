interface StepIndicatorProps {
  total: number;
  current: number;
}

export function StepIndicator({ total, current }: StepIndicatorProps) {
  return (
    <div className="steps">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`step ${i < current ? 'done' : i === current ? 'cur' : ''}`}
        />
      ))}
    </div>
  );
}
