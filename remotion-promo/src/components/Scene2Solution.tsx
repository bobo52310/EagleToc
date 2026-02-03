import { AbsoluteFill, staticFile, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";
import { TextOverlay } from "./TextOverlay";
import type { SceneProps } from "./Scene1Pain";

/**
 * Scene 2: Solution Introduction
 * - Duration: 7 seconds (168 frames at 24fps)
 * - Video: scene2.mp4 - eagle eye perspective transitioning to TOC
 * - Message: "EagleToc" with "鷹眼智慧目錄" subtitle
 *
 * The eagle eye metaphor reinforces the product's ability to see
 * the whole article structure at a glance.
 * Adapts text size based on format for optimal readability.
 */
export const Scene2Solution: React.FC<SceneProps> = ({ format = "full" }) => {
  const { fps } = useVideoConfig();

  // Responsive font sizes - main title should be prominent
  const fontSize = format === "vertical" ? 64 : format === "square" ? 80 : 96;
  const subtitleFontSize = format === "vertical" ? 28 : format === "square" ? 32 : 40;

  return (
    <AbsoluteFill>
      {/* Background video */}
      <Video
        src={staticFile("scene2.mp4")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
        muted
      />

      {/* Subtle dark gradient overlay */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.2) 100%)",
        }}
      />

      {/* Brand name with spring animation for impact */}
      <TextOverlay
        text="EagleToc"
        subtitle="鷹眼智慧目錄"
        position="center"
        animation="spring"
        delay={Math.round(1 * fps)}
        fontSize={fontSize}
        subtitleFontSize={subtitleFontSize}
      />
    </AbsoluteFill>
  );
};
