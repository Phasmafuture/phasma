import { recordPerformance } from "@/lib/analytics/localActivityStore";
import { generateSnapshotFilename } from "./filename";
import { svgToPng } from "./svgToPng";

interface SnapshotOptions {
  runName: string;
  currentEpisode: number;
  totalEpisodes: number;
  workspace3DImage: string;
  rewardChartSvg: SVGSVGElement | null;
  lossChartSvg: SVGSVGElement | null;
  successChartSvg: SVGSVGElement | null;
  policyChartSvg: SVGSVGElement | null;
}

export async function generateDemoSnapshot(
  options: SnapshotOptions,
): Promise<void> {
  const startTime = performance.now();
  const {
    runName,
    currentEpisode,
    totalEpisodes,
    workspace3DImage,
    rewardChartSvg,
    lossChartSvg,
    successChartSvg: _successChartSvg,
    policyChartSvg: _policyChartSvg,
  } = options;

  // Canvas dimensions
  const canvasWidth = 1920;
  const canvasHeight = 1080;
  const padding = 40;
  const headerHeight = 100;

  // Create offscreen canvas
  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  // Background
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Header
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 36px system-ui, -apple-system, sans-serif";
  ctx.fillText(runName, padding, padding + 36);

  ctx.fillStyle = "#9ca3af";
  ctx.font = "20px system-ui, -apple-system, sans-serif";
  ctx.fillText(
    `Episode ${currentEpisode + 1} / ${totalEpisodes}`,
    padding,
    padding + 70,
  );

  const contentTop = headerHeight + padding;
  const contentHeight = canvasHeight - contentTop - padding;

  // 3D Workspace (left, larger)
  const workspaceWidth = (canvasWidth - padding * 3) * 0.55;
  const workspaceHeight = contentHeight;

  const workspace3DImg = new Image();
  workspace3DImg.src = workspace3DImage;
  await new Promise((resolve, reject) => {
    workspace3DImg.onload = resolve;
    workspace3DImg.onerror = reject;
  });

  ctx.drawImage(
    workspace3DImg,
    padding,
    contentTop,
    workspaceWidth,
    workspaceHeight,
  );

  // Charts (right, 2x2 grid)
  const chartsLeft = padding * 2 + workspaceWidth;
  const chartsWidth = canvasWidth - chartsLeft - padding;
  const chartHeight = (contentHeight - padding) / 2;

  const charts = [
    { svg: rewardChartSvg, x: chartsLeft, y: contentTop },
    { svg: lossChartSvg, x: chartsLeft, y: contentTop + chartHeight + padding },
  ];

  // Convert and draw charts (only reward and loss for top row)
  for (const chart of charts) {
    if (!chart.svg) continue;

    const pngDataUrl = await svgToPng(chart.svg);
    const img = new Image();
    img.src = pngDataUrl;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    ctx.drawImage(img, chart.x, chart.y, chartsWidth, chartHeight);
  }

  // Export
  canvas.toBlob((blob) => {
    if (!blob) {
      recordPerformance("export_failure");
      throw new Error("Failed to create blob");
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = generateSnapshotFilename(runName);
    link.click();
    URL.revokeObjectURL(url);

    const renderTime = performance.now() - startTime;
    recordPerformance("export_success", renderTime);
  }, "image/png");
}
