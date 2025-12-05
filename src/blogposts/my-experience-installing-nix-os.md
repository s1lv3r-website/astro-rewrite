---
title: My experience installing Nix OS
description: ""
showInUI: true
pubDate: 2025-11-29T18:34:00.000+01:00
---
After some friends of mine started using and recommending [NixOS](https://nixos.org) to me I eventually got tempted enough by the sweet, sweet reproducibility and git-managed system that I decided to give it a try.

At first, I wasn't a massive fan. Configurations were archaic, the nix configuration language had some... quirks (?) that I weren't a big fan of (more on that [here](#nix-language-quirks), and configuring flakes for git-managed configurations wasn't exactly intuitive.

# Installation process

First of all, there's the installation process. Now, this was likely mostly an issue with my machine, but for some unknown reason WiFi was absolutely *refusing* to connect, whether I was using the Minimal or Graphical installer, and regardless of environment in the Graphical installer. This caused me about an hour of pain with trying, restarting, retrying, and repeat. In the end I just plugged the machine in with a cable, and that solved my issues, but not a "good" first experience at least.

Next, the installer itself was being kinda annoying. There was no ability to shrink my existing LUKS partition to make 

<!--
network issues
  - restarting installation repeatedly
- installer being dumb with partitions
  - shrinking luks
  - updating partition list after external changes
- overwriting sd-boot config and boot order
-->

# Nix language quirks

<!--
- semicolon after `with pkgs` into array
- issues with indents
-->

# Home-manager

<!--
- Config management
- Package installation
-->

# The good

<!--
- Defining exactly what i need to install
- Different setups for different machines in the same repo
-->

# The bad

<!--
- lack of filesystem hierarchy standard following
- vscode remote in bwrap,  sudo issues
-->

# The confusing

<!--
- systemPackages vs packages vs programs vs home-manager packages (e.g. sway) vs wayland.windowManager
- services
- weird packaging of binaries
  - krunner package not including krunner
-->
