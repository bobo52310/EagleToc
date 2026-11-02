import { AbsoluteFill, staticFile, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";
import { TextOverlay } from "./TextOverlay";
import type { SceneProps } from "./Scene1Pain";

/**
 * Scene 3: Feature Highlight - Search
 * - Duration: 5 seconds (uses full scene3.mp4 ~4.58s, extended slightly)
 * - Video: scene3.mp4 - search/filter functionality visualization
 * - Message: "Type. Filter. Found." - emphasizes speed and simplicity
 *
 * Short, punchy copy that mirrors the quick search experience.
 * Adapts text size based on format for optimal readability.
 */
export const Scene3Search: React.FC<SceneProps> = ({ format = "full" }) => {
  const { fps } = useVideoConfig();

  // Responsive font sizes
  const fontSize = format === "vertical" ? 52 : format === "square" ? 60 : 72;

  return (
    <AbsoluteFill>
      {/* Background video - full length */}
      <Video
        src={staticFile("scene3.mp4")}
        style={{
          width: "100%",
          height: "100%",
        }}
        objectFit="cover"
        muted
        loop // Loop to extend beyond 4.58s if needed
      />

      {/* Dark overlay */}
      <AbsoluteFill
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.25)",
        }}
      />

      {/* Feature tagline with fade animation */}
      <TextOverlay
        text="Type. Filter. Found."
        position="center"
        animation="fade"
        delay={Math.round(0.5 * fps)}
        fontSize={fontSize}
      />
    </AbsoluteFill>
  );
};
