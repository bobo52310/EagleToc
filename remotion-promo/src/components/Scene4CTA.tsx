import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Video } from "@remotion/media";
import type { SceneProps } from "./Scene1Pain";

/**
 * Scene 4: Call to Action
 * - Duration: 7 seconds (168 frames at 24fps)
 * - Video: scene4.mp4 - panoramic/overview perspective
 * - Phase 1 (0-3s): "See Everything. Miss Nothing."
 * - Phase 2 (3-7s): Icon + "EagleToc" + "Free Chrome Extension" CTA
 *
 * This scene combines the emotional hook with practical CTA.
 * The icon animation uses spring physics for a memorable bouncy entrance.
 * Adapts sizes based on format for optimal visibility.
 */
export const Scene4CTA: React.FC<SceneProps> = ({ format = "full" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase timing (in frames)
  const ctaStartFrame = Math.round(3 * fps); // CTA appears at 3s mark

  return (
    <AbsoluteFill>
      {/* Background video */}
      <Video
        src={staticFile("scene4.mp4")}
        style={{
          width: "100%",
          height: "100%",
        }}
        objectFit="cover"
        muted
      />

      {/* Dark overlay - gets darker for CTA phase */}
      <AbsoluteFill
        style={{
          backgroundColor: `rgba(0, 0, 0, ${interpolate(
            frame,
            [ctaStartFrame - 12, ctaStartFrame],
            [0.3, 0.5],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          )})`,
        }}
      />

      {/* Phase 1: Tagline (0-3s) */}
      <Sequence durationInFrames={ctaStartFrame} premountFor={fps}>
        <TaglineOverlay format={format} />
      </Sequence>

      {/* Phase 2: CTA with Icon (3s onwards) */}
      <Sequence from={ctaStartFrame} premountFor={fps}>
        <CTAOverlay format={format} />
      </Sequence>
    </AbsoluteFill>
  );
};

/**
 * TaglineOverlay - "See Everything. Miss Nothing."
 */
const TaglineOverlay: React.FC<SceneProps> = ({ format = "full" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [0, 0.5 * fps], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Responsive font size for tagline
  const fontSize = format === "vertical" ? 52 : format === "square" ? 60 : 72;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity,
      }}
    >
      <div
        style={{
          textAlign: "center",
          color: "#ffffff",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          textShadow: "0 4px 20px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.8)",
        }}
      >
        <div style={{ fontSize, fontWeight: 700, marginBottom: 8 }}>
          See Everything.
        </div>
        <div style={{ fontSize, fontWeight: 700 }}>Miss Nothing.</div>
      </div>
    </AbsoluteFill>
  );
};

/**
 * CTAOverlay - Icon with spring animation + CTA text
 * Features:
 * - Spring entrance animation for icon
 * - Pulsing glow effect on icon
 * - "Free Chrome Extension" call to action
 * - Responsive sizing based on format
 */
const CTAOverlay: React.FC<SceneProps> = ({ format = "full" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Icon spring animation
  const iconSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 }, // Bouncy entrance
  });

  const iconScale = interpolate(iconSpring, [0, 1], [0.3, 1]);
  const iconOpacity = interpolate(iconSpring, [0, 0.3], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Pulsing glow effect (subtle)
  const glowIntensity = interpolate(
    Math.sin(frame * 0.15), // Slow pulse
    [-1, 1],
    [20, 40]
  );

  // Text animations (delayed after icon)
  const textDelay = Math.round(0.4 * fps);
  const textOpacity = interpolate(frame - textDelay, [0, 0.5 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ctaDelay = Math.round(0.8 * fps);
  const ctaOpacity = interpolate(frame - ctaDelay, [0, 0.5 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Responsive sizes
  const iconSize = format === "vertical" ? 280 : format === "square" ? 320 : 400;
  const iconBorderRadius = format === "vertical" ? 28 : format === "square" ? 32 : 40;
  const brandFontSize = format === "vertical" ? 48 : format === "square" ? 56 : 64;
  const ctaFontSize = format === "vertical" ? 24 : format === "square" ? 28 : 32;
  const ctaPaddingV = format === "vertical" ? 12 : 16;
  const ctaPaddingH = format === "vertical" ? 32 : 40;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
        }}
      >
        {/* Icon with glow */}
        <div
          style={{
            transform: `scale(${iconScale})`,
            opacity: iconOpacity,
            filter: `drop-shadow(0 0 ${glowIntensity}px rgba(59, 130, 246, 0.6))`,
          }}
        >
          <Img
            src={staticFile("icon128.png")}
            style={{
              width: iconSize,
              height: iconSize,
              borderRadius: iconBorderRadius,
            }}
          />
        </div>

        {/* Brand name */}
        <div
          style={{
            fontSize: brandFontSize,
            fontWeight: 700,
            color: "#ffffff",
            fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
            textShadow: "0 4px 20px rgba(0,0,0,0.8)",
            opacity: textOpacity,
          }}
        >
          EagleToc
        </div>

        {/* CTA */}
        <div
          style={{
            fontSize: ctaFontSize,
            fontWeight: 500,
            color: "#ffffff",
            fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
            textShadow: "0 2px 10px rgba(0,0,0,0.8)",
            opacity: ctaOpacity,
            backgroundColor: "rgba(59, 130, 246, 0.8)",
            padding: `${ctaPaddingV}px ${ctaPaddingH}px`,
            borderRadius: 50,
          }}
        >
          Free Chrome Extension
        </div>
      </div>
    </AbsoluteFill>
  );
};
