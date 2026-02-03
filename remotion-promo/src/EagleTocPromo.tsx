import { AbsoluteFill, useVideoConfig } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Scene1Pain } from "./components/Scene1Pain";
import { Scene2Solution } from "./components/Scene2Solution";
import { Scene3Search } from "./components/Scene3Search";
import { Scene4CTA } from "./components/Scene4CTA";
import { Watermark } from "./components/Watermark";

export interface EagleTocPromoProps {
  format?: "full" | "square" | "vertical";
}

/**
 * EagleTocPromo - Main Composition
 *
 * Timeline breakdown (24 fps, ~24 seconds total):
 * ┌─────────────────────────────────────────────────────────────┐
 * │ Scene 1 │ Scene 2      │ Scene 3  │ Scene 4               │
 * │  5s     │   7s         │   5s     │   7s                  │
 * │ Pain    │ Solution     │ Feature  │ CTA                   │
 * │         │   ↑fade      │   ↑fade  │                       │
 * └─────────────────────────────────────────────────────────────┘
 *           0:05          0:12       0:17                   0:24
 *
 * Transitions:
 * - Scene 1 → 2: Hard cut (emphasizes contrast between problem/solution)
 * - Scene 2 → 3: Fade dissolve (0.5s) - smooth flow
 * - Scene 3 → 4: Fade dissolve (0.5s) - smooth flow to CTA
 *
 * Note: TransitionSeries overlaps scenes during transitions, so we account
 * for this in duration calculations. With 12-frame (0.5s) transitions,
 * actual durations need to be increased to maintain visual timing.
 *
 * Supports multiple formats:
 * - full: 16:9 (1920x1080) for YouTube, website
 * - square: 1:1 (1080x1080) for Instagram posts, LinkedIn
 * - vertical: 9:16 (1080x1920) for TikTok, Reels, YouTube Shorts
 */
export const EagleTocPromo: React.FC<EagleTocPromoProps> = ({
  format = "full",
}) => {
  const { fps } = useVideoConfig();

  // Scene durations in frames
  const scene1Duration = 5 * fps; // 120 frames
  const scene2Duration = 7 * fps; // 168 frames
  const scene3Duration = 5 * fps; // 120 frames
  const scene4Duration = 7 * fps; // 168 frames

  // Transition duration (0.5 seconds)
  const transitionDuration = Math.round(0.5 * fps); // 12 frames

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      {/* Scene transitions */}
      <TransitionSeries>
        {/* Scene 1: Pain Point - "Lost in endless scrolling?" */}
        <TransitionSeries.Sequence durationInFrames={scene1Duration}>
          <Scene1Pain format={format} />
        </TransitionSeries.Sequence>

        {/* Hard cut to Scene 2 (no transition - creates impact) */}
        {/* We achieve hard cut by not adding a transition between Scene 1 and 2 */}

        {/* Scene 2: Solution - "EagleToc" brand introduction */}
        <TransitionSeries.Sequence durationInFrames={scene2Duration}>
          <Scene2Solution format={format} />
        </TransitionSeries.Sequence>

        {/* Fade transition to Scene 3 */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: transitionDuration })}
        />

        {/* Scene 3: Feature - "Type. Filter. Found." */}
        <TransitionSeries.Sequence durationInFrames={scene3Duration}>
          <Scene3Search format={format} />
        </TransitionSeries.Sequence>

        {/* Fade transition to Scene 4 */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: transitionDuration })}
        />

        {/* Scene 4: CTA - Icon + "Free Chrome Extension" */}
        <TransitionSeries.Sequence durationInFrames={scene4Duration}>
          <Scene4CTA format={format} />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* Watermark - Bottom-right corner logo (appears throughout) */}
      <Watermark format={format} />
    </AbsoluteFill>
  );
};
