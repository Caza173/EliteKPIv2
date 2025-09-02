interface MiniBarProps {
  value: number;
  max: number;
  label?: string;
  color?: "blue" | "emerald" | "cyan" | "rose";
}

export function MiniBar({ value, max, label, color = "blue" }: MiniBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const getColorClasses = () => {
    switch (color) {
      case "emerald":
        return "bg-emerald-500 dark:bg-emerald-600";
      case "cyan":
        return "bg-cyan-500 dark:bg-cyan-600";
      case "rose":
        return "bg-rose-500 dark:bg-rose-600";
      default:
        return "bg-sky-500 dark:bg-sky-600";
    }
  };

  return (
    <div className="space-y-1">
      {label && (
        <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
          <span>{label}</span>
          <span className="tabular-nums">{value}/{max}</span>
        </div>
      )}
      <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-500 ease-out ${getColorClasses()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}