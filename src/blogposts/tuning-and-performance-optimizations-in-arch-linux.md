---
title: Tuning and performance optimizations in Arch Linux
showInUI: true
pubDate: 2025-12-07T01:29:00.000+01:00
---
Recently, I decided to read up on the Arch Wiki because I was bored, and I decided to read on the [Improving performance](https://wiki.archlinux.org/title/Improving_performance) pages. I found some cool topics and settings, this post is simply an overview of the ones I use and have configured, and others that don't come from the wiki at all but that I have found *somewhere* on the internet.

Relevant links are added where available, expect this document to update frequently :3

# Kernel parameters

## Clock

Improves game performance at the cost of a small reduction in clock accuracy. Only in use on my laptop.

- <https://wiki.archlinux.org/title/Gaming#Improve_clock_gettime_throughput>

```conf
tsc=reliable clocksource=tsc
```

# Sysctl

## Swappiness

Lower the default swappiness to increase responsiveness, as i have 32G and up with system memory on all my systems.

- <https://wiki.archlinux.org/title/Swap#Swappiness>

```conf title=/etc/sysctl.d/99-swappiness.conf
vm.swappiness = 35
```
