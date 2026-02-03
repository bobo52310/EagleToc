import { Img, staticFile } from "remotion";
import type { SceneProps } from "./Scene1Pain";

/**
 * Watermark - Bottom-right corner logo
 * Simple, static watermark without animation for consistent branding.
 * Adapts size based on format for optimal visibility without being intrusive.
 */
export const Watermark: React.FC<SceneProps> = ({ format = "full" }) => {
  // Responsive watermark sizes
  const size = format === "vertical" ? 140 : format === "square" ? 160 : 200;
  const position = format === "vertical" ? -8 : -10;

  return (
    <div
      style={{
        position: "absolute",
        bottom: position,
        right: position,
        zIndex: 100,
      }}
    >
      <Img
        src={staticFile("icon128.png")}
        style={{
          width: size,
          height: size,
          opacity: 0.95,
          filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))",
        }}
      />
    </div>
  );
};
