import { AbsoluteFill, staticFile, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";
import { TextOverlay } from "./TextOverlay";

export interface SceneProps {
  format?: "full" | "square" | "vertical";
}

/**
 * Scene 1: Pain Point
 * - Duration: 5 seconds (120 frames at 24fps)
 * - Video: scene1.mp4 trimmed to first 5 seconds
 * - Message: "Lost in endless scrolling?" - establishes the problem
 *
 * This scene creates empathy with viewers who struggle with long articles.
 * Adapts text size based on format for optimal readability.
 */
export const Scene1Pain: React.FC<SceneProps> = ({ format = "full" }) => {
  const { fps } = useVideoConfig();

  // Responsive font sizes based on format
  const fontSize = format === "vertical" ? 48 : format === "square" ? 56 : 64;

  return (
    <AbsoluteFill>
      {/* Background video - trimmed to 5 seconds */}
      <Video
        src={staticFile("scene1.mp4")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
        muted
      />

      {/* Dark overlay for better text readability */}
      <AbsoluteFill
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.3)",
        }}
      />

      {/* Main text overlay - appears after 0.5s */}
      <TextOverlay
        text="Lost in endless scrolling?"
        position="center"
        animation="fade"
        delay={Math.round(0.5 * fps)}
        fontSize={fontSize}
      />
    </AbsoluteFill>
  );
};
