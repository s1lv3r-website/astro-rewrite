---
title: BTRFS on LUKS with TPM2 unlock in Arch
description: My experience with installing Arch Linux on my Framework 13
  with   LUKS, BTRFS, and automatic unlocking using TPM2 similar to what
  BitLocker   does.
showInUI: true
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

All volumes are mounted with the options `defaults,noatime,autodefrag,compress=lzo,commit=30` unless otherwise specified.

| Subvol name | Mount path    | Flags              | Rationale |
| ----------- | ------------- | ------------------ | --------- |
| `root`      | `/`           |                    |           |
| `snapshots` | `/.snapshots` || Having snapshots separated is highly recommended to avoid a snapshot-within-snapshot situation |
| `home`      | `/home`       || Some people also recommend having a separate subvol for each user, however for my laptop there's only one user: me. So I stick to only having `/home` be its own subvolume. |
| `opt` | `/opt` || A lot of third-party apps are installed here, and we don't want those to be uninstalled in case of a rootfs rollback |
| `srv` | `/srv` | | Similar reason to `opt`, as well as this being a mountpoint for other drives. Don't wanna take snapshots of everything here |
| `swap` | `/swap` | Remove `compress` option | Swapfile |
| `tmp` | `/tmp` | | Temp data doesn't need to be stored |
| `usr_local` | `/usr/local` | | Similar reason to `opt` |
| `podman` | `/var/lib/containers` | | Podman images are stored here |
| `docker` | `/var/lib/docker` | | Docker images are stored here |
| `libvirt` | `/var/lib/libvirt/images` | | Libvirt (qemu, virt-manager) stores data here |

Using `lzo` encryption won't save me a *lot* of storage space, however it does have the highest transfer speeds out of the three available (ZLIB, LZO, ZSTD) according to [a test by TheLinuxCode](https://thelinuxcode.com/enable-btrfs-filesystem-compression/). With me having a 2TB drive, sacrificing some compression in favor of speed is therefore acceptable.

## Installation

Before starting the install itself, I boot into my regular arch install to shrink the existing BTRFS partition down to roughly 500G, giving me ~1.5T to install the encrypted OS on: `btrfs filesystem resize 500G /`

Following that, installation starts off as usual. I download the latest [Arch ISO](https://archlinux.org/downloads), boot it, configure the keyboard, network, etc. All the usual stuff.

I open a `tmux` session so I can actually scroll my terminal. and proceed with opening `fdisk` on `/dev/nvme0n1`. Since the BTRFS data has been shrunk to 500G, I can shrink the partition to match, and create a new partition following it for the new installation. Once this has been configured as a linux root partition, I write and close `fdisk`.

After setting up the partition, I configure it with `crypttab`. I pre-generated a passphrase to use with Bitwarden's [passphrase generator](https://bitwarden.com/passphrase-generator/#passphrase-generator), and input that here when prompted.

```sh
crypttab luksFormat \
  --type luks2 \
  --cipher aes-xts-plain64 \
  --hash sha256 \
  --iter-time 2000 \
  --key-size 256 \
  --pbkdf argon2id \
  --use-urandom \
  --verify-passphrase \
  /dev/nvme0n1p3
```

Running this sets up encryption on the partition, requiring it to be opened with `cryptsetup` before any further configuration can be made. This will also require the password generated earlier:

```sh
cryptsetup open /dev/device root
```

This will create a device mapper on `/dev/mapper/root`, allowing the decrypted partition to be interacted with like any other. This gets followed up with creating a fresh BTRFS filesystem, which I mount at /mnt:

```sh
mkfs.btrfs /dev/mapper/root
mount /dev/mapper/root /mnt
```

I can then create the subvolumes defined [earlier](#btrfs-configuration):

```

```


## Post-install configuration

## Acknowledgements

While setting up my own system I leaned heavily on a few other blogs, namely:

* [Btrfs Layout - Jordan Williams](https://www.jwillikers.com/btrfs-layout)
* [Arch Linux Installation Guide - mihirchanduka](https://gist.github.com/mihirchanduka/a9ba1c6edbfa068d2fbc2acb614c80e8)
