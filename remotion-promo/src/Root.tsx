import { Composition } from "remotion";
import { EagleTocPromo } from "./EagleTocPromo";

/**
 * Video configuration
 * - 24 fps to match source videos
 * - Multiple formats for different platforms
 * - 24 seconds total duration = 576 frames
 */
const FPS = 24;
const DURATION_SECONDS = 24;
const DURATION_FRAMES = FPS * DURATION_SECONDS;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Full HD (YouTube, Website) - 16:9 */}
      <Composition
        id="EagleTocPromo"
        component={EagleTocPromo}
        durationInFrames={DURATION_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{
          format: "full",
        }}
      />

      {/* Square (Instagram Post, LinkedIn) - 1:1 */}
      <Composition
        id="EagleTocPromo-Square"
        component={EagleTocPromo}
        durationInFrames={DURATION_FRAMES}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={{
          format: "square",
        }}
      />

      {/* Vertical (TikTok, Instagram Reels, YouTube Shorts) - 9:16 */}
      <Composition
        id="EagleTocPromo-Vertical"
        component={EagleTocPromo}
        durationInFrames={DURATION_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{
          format: "vertical",
        }}
      />
    </>
  );
};
