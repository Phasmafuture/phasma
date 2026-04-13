interface PhasmaLogoProps {
  size?: "small" | "medium" | "large";
  className?: string;
}

export default function PhasmaLogo({
  size = "medium",
  className = "",
}: PhasmaLogoProps) {
  const sizeMap = {
    small: "h-8",
    medium: "h-16",
    large: "h-32",
  };

  return (
    <img
      src="/assets/PHASMA_White.PNG"
      alt="PHASMA Robotics"
      className={`${sizeMap[size]} w-auto object-contain ${className}`}
    />
  );
}
