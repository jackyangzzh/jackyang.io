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
At the Kats Research Group, I worked on two major VR projects. One specifically simulated color vision deficiency, while the other created highly controlled binocular rivalry. Because both ran completely on consumer headsets, the core idea was to make these demos vastly easier to reproduce outside of a highly specialized optics lab.

## The problem

Even though specialized optics hardware is completely standard for robust vision experiments, I found it incredibly frustrating how expensive and inaccessible that equipment is for general teaching. 

I originally assumed that we needed custom hardware. However, I hypothesized that a standard consumer VR headset could reproduce at least the useful parts of an experiment. My goal wasn't to build a diagnostic tool; rather, I wanted the simulations to be accurate enough for early experiments but approachable enough that a total non-specialist could immediately understand what changed.

## Color-vision deficiency

![Color vision deficiency simulation](/assets/img/projects/colorDeficiencyCover.webp){:loading="lazy"}

I designed chromatic adjustment algorithms that specifically approximate how people with color vision deficiency perceive hyperspectral images. When we ran pilot color tests, I was actually quite surprised to see the system reach about 90% agreement with the expected clinical adjustments. I then built a fully color-calibrated VR demo so viewers could seamlessly compare the transformed image against the reference.

*(Note: This particular experiment is entirely separate from my co-authored [Journal of Optics paper](https://doi.org/10.1088/2040-8986/abf171), which concerns the passive conversion of ultraviolet images into visible light.)*

## Binocular rivalry

<video src="/assets/img/projects/staticRivalry.webm" autoplay loop muted playsinline preload="metadata" aria-label="Static rivalry demonstration"></video>
<video src="/assets/img/projects/dynamicRivalry.webm" autoplay loop muted playsinline preload="metadata" aria-label="Dynamic rivalry demonstration"></video>

Even though the human visual system normally combines signals from both eyes to create one image, I wanted to aggressively break that redundancy. By showing completely different static and moving content to each individual eye, I produced controlled rivalry effects without needing a massive mirror stereoscope.

## Implementation constraints

- I fully implemented the color pipeline in Unity's HDRP and managed all LUT blending and per-eye calibration routines across the HMDs.
- I built several custom tools for the researchers, making it easy to capture headset sensor data, cross-reference it with hyperspectral reference images, and export clean reports.
- I actively collaborated with ophthalmology advisors because I completely wanted to avoid these simulations turning into mere visual effects instead of adhering to strict clinical constraints.

## Reflection

I initially tried to map the full range of human perception over to VR perfectly, but I quickly conceded that standard consumer displays simply cannot physically reproduce all of it. Because of that, I deliberately documented those absolute limits and kept the project scope very narrow. These remained controlled prototypes specifically meant for teaching and early perception experiments.

Ultimately, these VR demos gave me an extremely concrete way to explain complicated color perception and accessibility concepts to people who had absolutely zero optics background. 

Personally, I still use the exact same test metric for accessibility tools today: while the model absolutely has to be grounded in the underlying science, it also has to be intuitively understandable to the people actually making product decisions.