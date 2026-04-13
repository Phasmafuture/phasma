import { forwardRef, useMemo } from "react";

interface LineChartMonoProps {
  data: number[];
  label: string;
  color?: string;
  height?: number;
  yMax?: number;
}

const LineChartMono = forwardRef<SVGSVGElement, LineChartMonoProps>(
  ({ data, label, color = "white", height = 200, yMax }, ref) => {
    const { path, yAxisLabels, xAxisLabels } = useMemo(() => {
      if (data.length === 0) {
        return { path: "", yAxisLabels: [], xAxisLabels: [] };
      }

      const padding = { top: 20, right: 20, bottom: 40, left: 60 };
      const width = 600;
      const chartWidth = width - padding.left - padding.right;
      const chartHeight = height - padding.top - padding.bottom;

      const minY = Math.min(...data);
      const maxY = yMax !== undefined ? yMax : Math.max(...data);
      const rangeY = maxY - minY || 1;

      const points = data.map((value, index) => {
        const x = padding.left + (index / (data.length - 1 || 1)) * chartWidth;
        const y =
          padding.top + chartHeight - ((value - minY) / rangeY) * chartHeight;
        return { x, y };
      });

      const pathData = points
        .map(
          (point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`,
        )
        .join(" ");

      // Y-axis labels
      const yLabels = Array.from({ length: 5 }, (_, i) => {
        const value = minY + (rangeY * (4 - i)) / 4;
        const y = padding.top + (chartHeight * i) / 4;
        return { value: value.toFixed(1), y };
      });

      // X-axis labels
      const xLabels = Array.from({ length: 5 }, (_, i) => {
        const index = Math.floor((data.length - 1) * (i / 4));
        const x = padding.left + (chartWidth * i) / 4;
        return { value: index.toString(), x };
      });

      return { path: pathData, yAxisLabels: yLabels, xAxisLabels: xLabels };
    }, [data, height, yMax]);

    return (
      <div className="w-full">
        <svg
          ref={ref}
          width="100%"
          height={height}
          viewBox="0 0 600 200"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`${label} chart`}
        >
          {/* Grid lines */}
          {yAxisLabels.map((yLabel) => (
            <line
              key={`grid-${yLabel.y}`}
              x1={60}
              y1={yLabel.y}
              x2={580}
              y2={yLabel.y}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
          ))}

          {/* Y-axis labels */}
          {yAxisLabels.map((yLabel) => (
            <text
              key={`ylabel-${yLabel.y}`}
              x={50}
              y={yLabel.y + 4}
              fill="rgb(156, 163, 175)"
              fontSize="12"
              textAnchor="end"
            >
              {yLabel.value}
            </text>
          ))}

          {/* X-axis labels */}
          {xAxisLabels.map((xLabel) => (
            <text
              key={`xlabel-${xLabel.x}`}
              x={xLabel.x}
              y={height - 10}
              fill="rgb(156, 163, 175)"
              fontSize="12"
              textAnchor="middle"
            >
              {xLabel.value}
            </text>
          ))}

          {/* Line */}
          {path && (
            <path
              d={path}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Axis labels */}
          <text
            x={300}
            y={height - 5}
            fill="rgb(156, 163, 175)"
            fontSize="12"
            textAnchor="middle"
            fontWeight="500"
          >
            Episode
          </text>
          <text
            x={20}
            y={height / 2}
            fill="rgb(156, 163, 175)"
            fontSize="12"
            textAnchor="middle"
            fontWeight="500"
            transform={`rotate(-90, 20, ${height / 2})`}
          >
            {label}
          </text>
        </svg>
      </div>
    );
  },
);

LineChartMono.displayName = "LineChartMono";

export default LineChartMono;
