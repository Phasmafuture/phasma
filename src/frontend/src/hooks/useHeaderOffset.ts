import { useEffect, useState } from "react";

/**
 * Hook that measures the sticky header height and sets it as the --header-offset CSS variable
 * for offsetting main content on all devices, with ResizeObserver and window event tracking.
 */
export function useHeaderOffset(headerId: string) {
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    const headerElement = document.getElementById(headerId);
    if (!headerElement) return;

    const updateHeight = () => {
      const height = headerElement.getBoundingClientRect().height;
      setHeaderHeight(height);
      // Set CSS variable for use in layout (main content offset)
      document.documentElement.style.setProperty(
        "--header-offset",
        `${height}px`,
      );
    };

    // Initial measurement
    updateHeight();

    // Observe size changes (e.g., font loading, dynamic content, mobile layout changes)
    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(headerElement);

    // Handle window resize and orientation changes
    window.addEventListener("resize", updateHeight);
    window.addEventListener("orientationchange", updateHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateHeight);
      window.removeEventListener("orientationchange", updateHeight);
    };
  }, [headerId]);

  return headerHeight;
}
