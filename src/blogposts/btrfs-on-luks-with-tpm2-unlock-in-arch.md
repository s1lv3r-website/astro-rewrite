---
title: BTRFS on LUKS with TPM2 unlock in Arch
description: My experience with installing Arch Linux on my Framework 13
  with   LUKS, BTRFS, and automatic unlocking using TPM2 similar to what
  BitLocker   does.
showInUI: false
pubDate: 2025-11-23T23:39:00.000+01:00
---
## Background

I first installed my laptop with plain BTRFS and Arch without any form of encryption since I just needed a functional laptop as soon as possible (shipment was already 2 months delayed), but now that I have more time to tinker I have decided to re-install to get full disk encryption[^1].

[^1]: Technically I'm not using *full* encryption here, as I am only encrypting the main data partition of the device and not the boot partition, however because I am signing the kernel and creating a unified image I deemed this an acceptable risk.

Usually I wouldn't go for full encryption, however I chose encryption here for a few reasons:

1. As a challenge to myself, and to learn new technologies
2. The changing political climates and my status as a minority in more ways than one unfortunately result in me being more likely to be targeted by various actors, state or otherwise, and I figure I need to protect my privacy better.

## BTRFS configuration

Before setting up the system I'll pre-plan the BTRFS subvolumes I'll be using and the options I'll be applying to each of these, to simplify later setup. This is taken a lot from [Jordan Williams' post on Btrfs subvolumes](https://www.jwillikers.com/btrfs-layout), so I recommend going there if you want to replicate this yourself.

For simplicity's sake I'll only include the flags that are unique to each mount, with the defaults applying to all of them being `defaults,noatime,autodefrag,compress=zstd,commit=120`. Some options are also overwritten at times (e.g. `compress`).

| Subvol name | Mount path    | Flags              | Rationale                                                                                                                                                                   |
| ----------- | ------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `root`      | `/`           | `subvol=root`      |                                                                                                                                                                             |
| `snapshots` | `/.snapshots` | `subvol=snapshots` | Having snapshots separated is highly recommended to avoid a snapshot-within-snapshot situation                                                                              |
| `home`      | `/home`       | `subvol=home`      | Some people also recommend having a separate subvol for each user, however for my laptop there's only one user: me. So I stick to only having `/home` be its own subvolume. |

## Installation

## Post-install configuration

## Acknowledgements

While setting up my own system I leaned heavily on a few other blogs, namely:

* [Btrfs Layout - Jordan Williams](https://www.jwillikers.com/btrfs-layout)
* [Arch Linux Installation Guide - mihirchanduka](https://gist.github.com/mihirchanduka/a9ba1c6edbfa068d2fbc2acb614c80e8)
