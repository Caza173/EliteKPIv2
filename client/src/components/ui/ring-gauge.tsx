interface RingGaugeProps {
  value: number;
  thresholds?: {
    warn: number;
    good: number;
  };
}

export function RingGauge({ value, thresholds = { warn: 60, good: 80 } }: RingGaugeProps) {
  const radius = 80;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  const getColor = () => {
    if (value >= thresholds.good) return "#10b981"; // success
    if (value >= thresholds.warn) return "#06b6d4"; // warning
    return "#ef4444"; // danger
  };

  const getZoneLabel = () => {
    if (value >= thresholds.good) return "Excellent";
    if (value >= thresholds.warn) return "Good";
    return "Needs Improvement";
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            stroke="#e2e8f0"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress circle */}
          <circle
            stroke={getColor()}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-slate-900 tabular-nums">
            {value}
          </span>
          <span className="text-xs text-slate-600 uppercase tracking-wide">
            Score
          </span>
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-sm font-medium text-slate-900">{getZoneLabel()}</p>
        <p className="text-xs text-slate-600">Overall Efficiency</p>
      </div>
    </div>
  );
}