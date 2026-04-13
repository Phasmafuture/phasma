/**
 * Converts an SVG element to a PNG image data URL
 */
export async function svgToPng(svgElement: SVGSVGElement): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Clone the SVG to avoid modifying the original
      const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;

      // Get SVG dimensions
      const bbox = svgElement.getBoundingClientRect();
      const width = bbox.width;
      const height = bbox.height;

      // Serialize SVG to string
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(clonedSvg);

      // Create a blob from the SVG string
      const svgBlob = new Blob([svgString], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(svgBlob);

      // Create an image element
      const img = new Image();
      img.onload = () => {
        // Create canvas and draw the image
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to PNG data URL
        const pngDataUrl = canvas.toDataURL("image/png");

        // Clean up
        URL.revokeObjectURL(url);

        resolve(pngDataUrl);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load SVG image"));
      };

      img.src = url;
    } catch (error) {
      reject(error);
    }
  });
}
