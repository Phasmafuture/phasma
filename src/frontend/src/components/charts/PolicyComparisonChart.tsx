import { forwardRef, useMemo } from "react";

interface PolicyComparisonChartProps {
  policy1Data: number[];
  policy2Data: number[];
  height?: number;
}

const PolicyComparisonChart = forwardRef<
  SVGSVGElement,
  PolicyComparisonChartProps
>(({ policy1Data, policy2Data, height = 200 }, ref) => {
  const { path1, path2, yAxisLabels, xAxisLabels } = useMemo(() => {
    if (policy1Data.length === 0 || policy2Data.length === 0) {
      return { path1: "", path2: "", yAxisLabels: [], xAxisLabels: [] };
    }

    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const width = 600;
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const allData = [...policy1Data, ...policy2Data];
    const minY = Math.min(...allData);
    const maxY = Math.max(...allData);
    const rangeY = maxY - minY || 1;

    const createPath = (data: number[]) => {
      const points = data.map((value, index) => {
        const x = padding.left + (index / (data.length - 1 || 1)) * chartWidth;
        const y =
          padding.top + chartHeight - ((value - minY) / rangeY) * chartHeight;
        return { x, y };
      });

      return points
        .map(
          (point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`,
        )
        .join(" ");
    };

    const pathData1 = createPath(policy1Data);
    const pathData2 = createPath(policy2Data);

    // Y-axis labels
    const yLabels = Array.from({ length: 5 }, (_, i) => {
      const value = minY + (rangeY * (4 - i)) / 4;
      const y = padding.top + (chartHeight * i) / 4;
      return { value: value.toFixed(1), y };
    });

    // X-axis labels
    const xLabels = Array.from({ length: 5 }, (_, i) => {
      const index = Math.floor((policy1Data.length - 1) * (i / 4));
      const x = padding.left + (chartWidth * i) / 4;
      return { value: index.toString(), x };
    });

    return {
      path1: pathData1,
      path2: pathData2,
      yAxisLabels: yLabels,
      xAxisLabels: xLabels,
    };
  }, [policy1Data, policy2Data, height]);

  return (
    <div className="w-full">
      <svg
        ref={ref}
        width="100%"
        height={height}
        viewBox="0 0 600 200"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Policy comparison chart"
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

        {/* Policy 1 - Solid line */}
        {path1 && (
          <path
            d={path1}
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Policy 2 - Dashed line */}
        {path2 && (
          <path
            d={path2}
            fill="none"
            stroke="rgb(156, 163, 175)"
            strokeWidth="2"
            strokeDasharray="5,5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Legend */}
        <g transform="translate(480, 30)">
          <line x1="0" y1="0" x2="30" y2="0" stroke="white" strokeWidth="2" />
          <text x="35" y="4" fill="rgb(209, 213, 219)" fontSize="11">
            Policy A
          </text>
          <line
            x1="0"
            y1="15"
            x2="30"
            y2="15"
            stroke="rgb(156, 163, 175)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          <text x="35" y="19" fill="rgb(209, 213, 219)" fontSize="11">
            Policy B
          </text>
        </g>

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
          Performance
        </text>
      </svg>
    </div>
  );
});

PolicyComparisonChart.displayName = "PolicyComparisonChart";

export default PolicyComparisonChart;
