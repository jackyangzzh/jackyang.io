---
layout: project
title: 'VR Vision Disorder Simulation'
description: >
  Research project I led that uses AI and computer vision to recreate vision impairments inside VR.
date: '01-01-2020'
image: 
  path: /assets/img/projects/kats.webp
  alt: VR vision disorder simulation interface showing colorblindness test
links:
  - title: Technical Report
    url: /assets/files/Breaking%20Binocular%20Redundancy.pdf
  - title: GitHub
    url: https://github.com/jackyangzzh/Monocular-Vision-VR-demo

---
This research project simulates visual impairments—including color vision deficiency and binocular rivalry—inside VR. It combined my optics coursework with Unity prototyping and pushed me to think about accessibility simulations as both technical and communication tools.

## Research Question

Can VR recreate vision impairments convincingly enough to support education, accessibility communication, and low-cost experimentation without requiring specialized optics hardware?

I approached the project as both a research exercise and a prototyping exercise: if the simulation was grounded enough to be useful, it could help non-specialists understand how visual disorders affect perception while also opening up new ways to teach and demonstrate vision science.

## Color Vision Deficiency

![Color vision deficiency simulation](/assets/img/projects/colorDeficiencyCover.webp){:loading="lazy"}

I first designed chromatic adjustment algorithms using computer vision to approximate how people with color vision deficiency perceive hyperspectral imagery. Combining optics with AI yielded a system that matched clinical color-test outcomes with high agreement (~90%) in pilot evaluations, which I later visualized inside VR.

## Binocular Rivalry

![Static rivalry demonstration](/assets/img/projects/staticRivalry.gif){:loading="lazy"}
![Dynamic rivalry demonstration](/assets/img/projects/dynamicRivalry.gif){:loading="lazy"}

The human visual system infers depth by blending signals from both eyes. This phase demonstrates a VR system that deliberately breaks binocular redundancy by projecting different dynamic and static content to each eye, creating controllable rivalry effects.

## Method and Constraints

- Implemented the color pipeline in Unity's HDRP, including LUT blending and per-eye calibration routines for HMDs.
- Built researcher-facing tooling to capture headset sensor data, compare it against hyperspectral reference images, and export reports.
- Worked with ophthalmology advisors to keep the simulations aligned with clinical constraints rather than treating them as purely visual effects.

The main challenge was balancing scientific credibility with the limitations of consumer VR displays. I could not replicate every nuance of human perception, so the project focused on building a representation accurate enough to teach, explain, and prototype around.

## Applications

These techniques pair optical simulation with VR to create more realistic representations of color vision deficiency. Beyond education, the work can inform accessibility tooling and potential vision-augmentation concepts. The binocular rivalry experiments also show how VR can replicate lab setups (for example, mirror stereoscopes) without specialized hardware.

## Why It Matters

- Provided a tangible demo for explaining accessibility investments to stakeholders later in my career.
- Validated that VR can serve as a fast, low-cost substitute for physical optics labs when teaching vision science concepts.
- Sharpened how I think about accessibility work: useful simulations need to be technically grounded, but also legible enough that designers, engineers, and decision-makers can actually learn from them.
