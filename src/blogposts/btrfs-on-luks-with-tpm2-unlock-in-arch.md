---
title: BTRFS on LUKS with TPM2 unlock in Arch
description: My experience with installing Arch Linux on my Framework 13
  with   LUKS, BTRFS, and automatic unlocking using TPM2 similar to what
  BitLocker   does.
showInUI: true
pubDate: 2025-11-25T22:42:00.000+01:00
---
> [NOTE] 
> As of this writing (initial publish date), and until this notice is removed, this is still a WIP and very much a living document.

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

## Secure boot keys

As I already had a configured system with UKI and secureboot-signed images, I make sure to make a copy of the existing secureboot private key and certificates from `/etc/kernel/secure-boot-private-key.pem` and `secure-boot-certificate.pem`. These were previously generated with `ukify genkey` following the guide for [secure boot with systemd](https://wiki.archlinux.org/title/Unified_Extensible_Firmware_Interface/Secure_Boot#Assisted_process_with_systemd) on the Arch Wiki. Later on, when setting up image signing, these will need to be put back in place.

## Installation

Before starting the install itself, I boot into my regular arch install to shrink the existing BTRFS partition down to roughly 500G, giving me ~1.5T to install the encrypted OS on: `btrfs filesystem resize 500G /`

Following that, installation starts off as usual. I download the latest [Arch ISO](https://archlinux.org/downloads), boot it, configure the keyboard, network, etc. All the usual stuff, including opening a `tmux` session.

### Partitions

First things first, I opened `/dev/nvme0n1` with `fdisk`. Since the BTRFS data has been shrunk to 500G already, I can shrink the partition to match and create a new partition following it for the new installation. Once this has been configured as a linux root partition, I write and close `fdisk`.

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

I can then create the subvolumes defined [earlier](#btrfs-configuration), by running the following command with each of the volumes:

```sh
btrfs subvolume create /mnt/@$NAME
```


Then the root-volume gets unmounted, and I mount each of the subvolumes to their correct locations, putting in or removing the appropriate options as required:

```sh
umount /mnt
mount --mkdir /dev/mapper/root /dev/$MOUNTPOINT -o defaults,noatime,autodefrag,compress-force=lzo,commit=30,subvol=@$NAME
```

This is followed up with creating and mounting a swapfile using BTRFS' [`filesystem mkswapfile`](https://wiki.archlinux.org/title/Btrfs#Swap_file) command:

```sh
btrfs filesystem mkswapfile /mnt/swap/swapfile --size 40G --uuid clear
swapon /mnt/swap/swapfile
```

### Base setup

After setting up all the partitions, I simply set up the system like any other:

```sh
# Generate new mirrorlist
reflector --save /etc/pacman.d/mirrorlist --protocol http,https --country Norway,Sweden,France,Germany,Finland,Iceland,US --latest 250 --sort score --ipv4 --threads 4 --fastest 50 --age 6


# Install base packages
# Further hyprland addons (like hyprshot, hyprpicker, various xdg-desktop-portals, etc are installed in the post-install section)
pacstrap -K /mnt base linux linux-firmware-amdgpu linux-firmware-mediatek ukify systemd-ukify uwsm firefox-developer-edition tmux kate zsh git sudo vim amd-ucode networkmanager btrfs-progs hyprland rofi dolphin man-db greetd-tuigreet fprintd efibootmgr alacritty

# Generate an initial fstab
genfstab -U /mnt >> /mnt/etc/fstab
```

After installing the base packages I `chroot`ed into the system with `arch-chroot /mnt`. Any commands after here are in the chroot unless otherwise specified.

In the chroot, I do some other post-config:
- Setup locales: `vim /etc/locale.gen` + `locale-gen` + `/etc/locale.conf` + `localectl set-locale`
- Setup keymap: `/etc/vconsole.conf` + `localectl set-keymap`
- Setup hostname: `/etc/hostname` + `hostnamectl hostname`
- Setup hosts file: `/etc/hosts`

### Mkinitcpio

Arch uses `mkinitcpio` to generate the kernel and initramfs images by default, so I'll just keep using it for simplicity's sake. I could've used an alternative like [`dracut`](https://wiki.archlinux.org/title/Dracut), but meh. `Mkinitcpio` works.

There are a few options I need to configure for mkinitcpio to

1. Have the required modules to boot the encrypted-signed image
2. Generate a [UKI](https://wiki.archlinux.org/title/Unified_kernel_image)
3. Sign the generated image for secure boot

First task is configuring `mkinitcpio` to have the required modules for my desired setup. Editing the configuration file, I make it look something like this:

```sh title=/etc/mkinitcpio.conf
MODULES=(btrfs)
BINARIES=(/usr/bin/btrfs)
FILES=()
HOOKS=(systemd autodetect microcode modconf kms keyboard sd-vconsole sd-encrypt block filesystems)
COMPRESSION="lz4"
COMPRESSION_OPTIONS=(-9)
```

This enables btrfs on root, sets up unlocking encryption through systemd, and increases compression ratio to around 2.5 while preserving the fastest decryption speeds ([Mkinitcpio#COMPRESSION on the Arch Wiki](https://wiki.archlinux.org/title/Mkinitcpio#COMPRESSION)).

Second is the UKI. For this, I installed `systemd-ukify` during pacstrap, which includes the `ukify` binary used by `mkinitcpio`. In the `/etc/mkinitcpio.d/linux.preset` file, I uncomment the `default_uki`, `default_options`, `fallback_uki`, and `fallback_options` lines, and comment out the `default_image` and `fallback_image` options. I then put in the correct paths in the `default_uki` and `fallback_uki` lines (in my case `/boot/EFI/Linux/arch-linux.efi` and `arch-linux-fallback.efi`).

Uncommenting these options tells `mkinitcpio` to generate a unified image instead of a separate kernel and initramfs. It can also be configured to automatically sign the generated image for secure boot, leading me into the final task of actually signing the images.

As mentioned in [Secure boot keys](#secure-boot-keys), I took a copy of the secure boot keys. I'll copy these over into the new system, making sure to set up `/etc/kernel/uki.conf` in the process. I'll need to set the `SecureBootSigningTool` to `systemd-sbsign`, and `SecureBootPrivateKey` + `SecureBootCertificate` to their appropriate files. `SignKernel` must also be set to true. Once this is done, `ukify` signs its generated images.

### Signing the bootloader

So far I've only set up signing of the images themselves (which can *technically* be booted directly), however if I want to ever use a bootloader for multiple OSes or kernels I'll have to sign it too (less I disable secure boot every time, which isn't particularly favorable).

For pacman, this is luckily decently simple. I'll need to install two hooks:
- [`80-sign-systemd-boot.hook`](#TODO: UPLOAD FILE) - As the name implies, this hook signs the systemd-boot efi binary.
- [`95-update-systemd-boot`](#TODO: UPLOAD FILE) - This restarts the systemd-boot updater, ensuring the new version of the binary is put into place immediately

For simplicity's sake I've just uploaded the full files for download instead of putting them into the post itself.

I'll also make sure to reinstall systemd to make both hooks run once, so the binary gets signed and put into place: `sudo pacman -S systemd`

### Misc last touches

Before having a usable system, I'll need to configure a few smaller things:
- `/etc/fstab`
  - Add /boot to the fstab
  - Use `/dev/mapper/root` instead of the UUID (personal preference)
- Greeter
  - Enable and create cache dir for remembering the last used session
    ```sh
    systemctl enable greetd
    mkdir /var/cache/tuigreet
    chown greeter:greeter /var/cache/tuigreet
    chmod 0755 /var/cache/tuigreet
    ```
  - Select the greeter to use by editing `/etc/greetd/config.toml`:
    ```toml
    command = "tuigreet --time --remember --remember-user-session --user-menu --user-menu-min-uid 1000 --asterisks --cmd 'uwsm start hyprland-uwsm.desktop'"
    ```

Once this is all completed: Reboot time!

## Post-install configuration

Now, this is where the actual TPM2 unlocking part comes into place. I'll skip all the boring "copy old home dir and struggle for 2 hours to configure dotfiles and install programs" stuff, and only focus on TPM2 here.

> [NOTE]
> Aaaand that's about as far as I've gotten so far. Document is very much a WIP, so check back in a week or two and there might be progress!


## Acknowledgements

While setting up my own system I leaned heavily on a few other blogs, namely:

* [Btrfs Layout - Jordan Williams](https://www.jwillikers.com/btrfs-layout)
* [Arch Linux Installation Guide - mihirchanduka](https://gist.github.com/mihirchanduka/a9ba1c6edbfa068d2fbc2acb614c80e8)
