import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// Remotion 4.0.539 drops the audio track when every <Video> is muted; keep the
// silent AAC track that 4.0.417 renders (and out/eagletoc-promo.mp4) contain.
Config.setEnforceAudioTrack(true);
// The default Chrome Headless Shell (157) crashes on startup (GPU process cannot
// find icudtl.dat) when the project lives under ~/Desktop on macOS; Chrome for
// Testing starts fine there (the same shell binary works outside ~/Desktop).
Config.setChromeMode("chrome-for-testing");
