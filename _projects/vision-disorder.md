---
layout: project
weight: 7
title: 'Color Vision & Binocular Rivalry in VR'
description: >
  Two research prototypes using consumer VR headsets to explore color vision deficiency and binocular rivalry.
date: '01-01-2020'
category: research
image: 
  path: /assets/img/projects/kats.webp
  alt: VR headset displaying different color-adjusted scenes to the left and right eyes
links:
  - title: Technical Report
    url: /assets/files/Breaking%20Binocular%20Redundancy.pdf
  - title: GitHub
    url: https://github.com/jackyangzzh/Monocular-Vision-VR-demo

---
At the Kats Research Group, I led two VR research prototypes: one for simulating color vision deficiency and another for exploring binocular rivalry. Both used consumer headsets so the demos could be reproduced outside a specialized optics lab.

## A headset instead of a full optics setup

Specialized optics equipment gives researchers control, but its cost and setup requirements can make it difficult to use for teaching. I wanted to see which parts of an experiment a consumer headset could reproduce well enough to be useful.

These were built for teaching and early perception experiments, and diagnosis was out of scope. Someone without an optics background should be able to compare the images and understand what had changed.

## Color vision deficiency

![Color vision deficiency simulation](/assets/img/projects/colorDeficiencyCover.webp){:loading="lazy"}

I designed chromatic adjustment algorithms to approximate how people with color vision deficiency perceive hyperspectral images. The system reached 90% accuracy in simulating color vision deficiency. I then built a color-calibrated VR demo for comparing the transformed image with its reference. That result doesn't mean the simulation can reproduce every person's vision.

*This work is separate from my co-authored [Journal of Optics paper](https://doi.org/10.1088/2040-8986/abf171) on converting ultraviolet images into visible light.*

## Binocular rivalry

<video src="/assets/img/projects/staticRivalry.webm" autoplay loop muted playsinline preload="metadata" aria-label="Static rivalry demonstration"></video>
<video src="/assets/img/projects/dynamicRivalry.webm" autoplay loop muted playsinline preload="metadata" aria-label="Dynamic rivalry demonstration"></video>

Normally, the visual system merges what each eye sees into a single image. Using the headset in place of a mirror stereoscope, I showed each eye different static and moving content to produce controlled rivalry effects.

## What I built

- Implemented the color pipeline in Unity's HDRP, including lookup-table blending and per-eye calibration.
- Built tools to capture headset sensor data, compare it with hyperspectral reference images, and export reports.
- Worked with ophthalmology advisors to keep the simulations grounded in the underlying vision science.

## The limits matter

Consumer displays can't reproduce the full range of human perception, so I documented those limits and kept the scope narrow.

Within that scope, VR gave me a practical way to explain color perception and accessibility to people outside optics, as long as I explained the demo's limitations as clearly as the comparison itself.