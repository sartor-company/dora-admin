interface ProgressBarProps {
  percent: number;
  color?: string;
}

export function ProgressBar({ percent, color }: ProgressBarProps) {
  return (
    <div className="pbar">
      <div
        className="pfill"
        style={{ width: `${percent}%`, ...(color ? { background: color } : {}) }}
      />
    </div>
  );
}
