import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

type TextOverlayProps = {
  text: string;
  subtitle?: string;
  position?: "center" | "bottom" | "top";
  animation?: "fade" | "spring" | "none";
  delay?: number; // in frames
  fontSize?: number;
  subtitleFontSize?: number;
  color?: string;
  shadowColor?: string;
};

/**
 * TextOverlay - Reusable text overlay component with animations
 *
 * Key features:
 * - Supports fade or spring entrance animations
 * - Configurable position (center/top/bottom)
 * - Optional subtitle with secondary styling
 * - Text shadow for readability on video backgrounds
 */
export const TextOverlay: React.FC<TextOverlayProps> = ({
  text,
  subtitle,
  position = "center",
  animation = "fade",
  delay = 0,
  fontSize = 72,
  subtitleFontSize = 36,
  color = "#ffffff",
  shadowColor = "rgba(0, 0, 0, 0.8)",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Calculate animation progress
  const adjustedFrame = frame - delay;

  let opacity = 1;
  let translateY = 0;
  let scale = 1;

  if (animation === "fade" && adjustedFrame >= 0) {
    opacity = interpolate(adjustedFrame, [0, 0.5 * fps], [0, 1], {
      extrapolateRight: "clamp",
      extrapolateLeft: "clamp",
    });
  } else if (animation === "spring" && adjustedFrame >= 0) {
    const springProgress = spring({
      frame: adjustedFrame,
      fps,
      config: { damping: 200 },
    });
    opacity = springProgress;
    scale = interpolate(springProgress, [0, 1], [0.8, 1]);
    translateY = interpolate(springProgress, [0, 1], [30, 0]);
  } else if (adjustedFrame < 0) {
    opacity = 0;
  }

  // Position styles
  const positionStyles: React.CSSProperties = {
    center: {
      top: "50%",
      left: "50%",
      transform: `translate(-50%, -50%) translateY(${translateY}px) scale(${scale})`,
    },
    top: {
      top: "15%",
      left: "50%",
      transform: `translateX(-50%) translateY(${translateY}px) scale(${scale})`,
    },
    bottom: {
      bottom: "15%",
      left: "50%",
      transform: `translateX(-50%) translateY(${translateY}px) scale(${scale})`,
    },
  }[position];

  return (
    <div
      style={{
        position: "absolute",
        ...positionStyles,
        opacity,
        textAlign: "center",
        zIndex: 10,
      }}
    >
      <div
        style={{
          fontSize,
          fontWeight: 700,
          color,
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          textShadow: `0 4px 20px ${shadowColor}, 0 2px 8px ${shadowColor}`,
          letterSpacing: "0.02em",
        }}
      >
        {text}
      </div>
      {subtitle && (
        <div
          style={{
            fontSize: subtitleFontSize,
            fontWeight: 500,
            color,
            fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
            textShadow: `0 2px 10px ${shadowColor}`,
            marginTop: 16,
            opacity: 0.9,
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
};
