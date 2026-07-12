---
layout: project
weight: 7
title: 'VR Vision Disorder Simulation'
description: >
  Led two VR research projects on color vision deficiency and binocular rivalry using computer vision and consumer headsets.
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
At the Kats Research Group, I worked on two related VR projects. One simulated color vision deficiency; the other created controlled binocular rivalry. Both ran on consumer headsets, which made the demos easier to reproduce outside an optics lab.

## Research question

Could a consumer VR headset reproduce useful parts of a vision experiment without specialized optics hardware?

I wanted the simulations to be accurate enough for early experiments and clear enough that a non-specialist could understand what changed. They were teaching and research prototypes, not diagnostic tools.

## Color-vision deficiency

![Color vision deficiency simulation](/assets/img/projects/colorDeficiencyCover.webp){:loading="lazy"}

I designed chromatic adjustment algorithms that approximate how people with color vision deficiency perceive hyperspectral images. In pilot color tests, the system reached about 90% agreement with the expected adjustments. A color-calibrated VR demo let viewers compare the transformed image with the reference.

This experiment is separate from my co-authored [Journal of Optics paper](https://doi.org/10.1088/2040-8986/abf171), which concerns passive conversion of ultraviolet images into visible light.

## Binocular rivalry

<video src="/assets/img/projects/staticRivalry.webm" autoplay loop muted playsinline preload="metadata" aria-label="Static rivalry demonstration"></video>
<video src="/assets/img/projects/dynamicRivalry.webm" autoplay loop muted playsinline preload="metadata" aria-label="Dynamic rivalry demonstration"></video>

The human visual system normally combines signals from both eyes. I broke that redundancy by showing different static and moving content to each eye. This produced controlled rivalry effects without a mirror stereoscope.

## Method and constraints

- Implemented the color pipeline in Unity's HDRP, including LUT blending and per-eye calibration routines for HMDs.
- Built tools for researchers to capture headset sensor data, compare it with hyperspectral reference images, and export reports.
- Worked with ophthalmology advisors so the simulations followed clinical constraints rather than acting as visual effects.

Consumer displays could not reproduce every part of human perception. I documented those limits and kept the scope narrow: controlled prototypes for teaching and early perception experiments.

## What it demonstrated

- The demos gave me a concrete way to explain color perception and accessibility work to people without an optics background.
- VR reproduced parts of an optics lab setup at a lower cost for teaching and early experiments.

I still use the same test for accessibility tools: the model has to be grounded
in the underlying science, but it also has to be understandable to the people
making product decisions.
