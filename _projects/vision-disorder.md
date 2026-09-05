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

These were tools for teaching and early perception experiments, not diagnosis. Someone without an optics background should be able to compare the images and understand what had changed.

## Color-vision deficiency

![Color vision deficiency simulation](/assets/img/projects/colorDeficiencyCover.webp){:loading="lazy"}

I designed chromatic adjustment algorithms to approximate how people with color vision deficiency perceive hyperspectral images. In pilot color tests, the system reached about 90% agreement with the expected adjustments. I then built a color-calibrated VR demo for comparing the transformed image with its reference. That pilot result wasn't a claim that the simulation could reproduce every person's vision.

*This work is separate from my co-authored [Journal of Optics paper](https://doi.org/10.1088/2040-8986/abf171) on converting ultraviolet images into visible light.*

## Binocular rivalry

<video src="/assets/img/projects/staticRivalry.webm" autoplay loop muted playsinline preload="metadata" aria-label="Static rivalry demonstration"></video>
<video src="/assets/img/projects/dynamicRivalry.webm" autoplay loop muted playsinline preload="metadata" aria-label="Dynamic rivalry demonstration"></video>

Our visual system normally combines information from both eyes. I showed different static and moving content to each eye to produce controlled rivalry effects, using the headset instead of a mirror stereoscope.

## What I built

- Implemented the color pipeline in Unity's HDRP, including lookup-table blending and per-eye calibration.
- Built tools to capture headset sensor data, compare it with hyperspectral reference images, and export reports.
- Worked with ophthalmology advisors to keep the simulations grounded in the underlying vision science.

## The limits matter

Consumer displays can't reproduce the full range of human perception. I documented those limits and kept the scope narrow rather than present the demos as a complete simulation of someone's vision.

Within that scope, VR gave me a practical way to explain color perception and accessibility concepts to people outside optics. The comparison needed to be understandable, and its limitations needed to be just as clear.