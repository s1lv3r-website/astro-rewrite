---
title: Arma 3 head tracking on linux using OpenTrack
pubDate: 2026-01-27T21:05:00.000+01:00
---
I love playing Arma 3, and recently got myself a dedicated [PlayStation Eye](https://en.wikipedia.org/wiki/PlayStation_Eye) camera for head tracking due to the alternatives like [TrackIR](https://www.trackir.com/) being decently expensive (€219). I found the setup a bit tedious and honestly just annoying, so I wrote it down to make it easier for others :)

## Opentrack - Installation

Ensure Opentrack is installed with the Neuralnet tracker enabled. On Arch Linux, this involves installing it with any of the packages providing the onnxruntime optional dependency:

- `onnxruntime-cpu` - CPU-based computation
- `onnxruntime-cuda` - For NVIDIA based GPU acceleration
- `onnxruntime-rocm` - For AMD based GPU acceleration

```bash
paru -S onnxruntime-rocm opentrack
```

## Opentrack - Neuralnet configuration

In the Opentrack UI, select the neuralnet tracker in the Input field.

Then, the tracker will need to be configured. Open the settings panel with the hammer button next to the input field. Select the correct camera, ideally one placed right in front of your face. Configure the FOV and resolution, and optionally any other settings through the Camera Settings button. This will open the Qt V4L2 test utility if installed.

See more configuration details in the [Opentrack wiki](https://github.com/opentrack/opentrack/wiki/AI-Face-Tracking/3d839e36c47074ad40de570e1abfb0dce865fd37), common FOV values can be found in the [AiTrack Wiki](https://github.com/AIRLegend/aitrack/wiki/Common-camera-FOV-values)

## Opentrack - Wine output configuration

For native Wine/proton output, select the Wine output module. Then click the hammer to open settings.

In here, we use the regular Wine variant, not the Proton output. Select Custom path to Wine executable. Then you will need to do some looking.

1. Find what version of Proton Arma is configured to use in the steam settings. In this example, that is Proton 9.0-4
2. Fill in the path to the wine binary in the proton installation, here that would be `/srv/steam_games/steamapps/common/Proton 9.0 (Beta)/files/bin/wine`, where `/srv/steam_games` is the steam library. Your location may wary.
3. Fill in the path to the Arma 3 proton directory. In this example: `/srv/steam_games/steamapps/compatdata/107410/pfx`.
4. Under **Advanced**, ensure **Protocol** is set to _Both_ and **Steam application id** is set to _107410_, it being the AppID for Arma 3

### Why not the Proton output?

Opentrack has a [hardcoded](https://github.com/opentrack/opentrack/blob/2d3ab7a61d2514ce51c9656908d33465a788763e/proto-wine/proton.cpp#L17-L27) list of locations for steam libraries and wine locations, which in many cases won't be applicable to your installation directory. In this case, the dropdown allowed no selections.

## Arma 3 config

Ensure Opentrack is running before launching Arma. Then, open Arma's input settings, and find the Controllers tab. There, two devices should be listed:

- Track IR
- FreeTrack

Ensure **Track IR** is **enabled**, and **FreeTrack** is **disabled**. Input bindings for analog head movement should be set up by default.

## Acknowledgements

This section was largely inspired by and guided by [robert](https://steamcommunity.com/profiles/76561199380829285)'s [Linux head tracking - simple, cost-free method using Proton and Opentrack](https://steamcommunity.com/sharedfiles/filedetails/?id=2972803012). Many thanks for that original, which made this one possible.
