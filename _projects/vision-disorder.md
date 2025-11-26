---
layout: project
title: 'VR Vision Disorder Simulation'
caption: AI-powered VR system simulating color blindness and binocular rivalry
description: >
  Research project I led that uses AI and computer vision to recreate vision impairments inside VR.
date: '01-01-2020'
image: 
  path: /assets/img/projects/kats.webp
  alt: VR vision disorder simulation interface showing colorblindness test
links:
  - title: Technical Report
    url: ../../assets/files/Breaking Binocular Redundancy.pdf
  - title: GitHub
    url: https://github.com/jackyangzzh/Monocular-Vision-VR-demo
sitemap: false

---
This research explores and simulates visual impairments—including color blindness and binocular rivalry—inside VR. It combined my optics coursework with Unity prototyping and directly influenced the accessibility tooling I build today.

## Color Vision Deficiency

![Color vision deficiency simulation](/assets/img/projects/colorDeficiencyCover.webp){:loading="lazy"}

I first designed chromatic adjustment algorithms using computer vision to approximate how people with color vision deficiency perceive hyperspectral imagery. Combining optics with AI yielded a system that mimics human responses on clinical color tests with over 90% agreement in pilot studies—which I later visualized inside VR.

## Binocular Rivalry

![Static rivalry demonstration](/assets/img/projects/staticRivalry.gif){:loading="lazy"}
![Dynamic rivalry demonstration](/assets/img/projects/dynamicRivalry.gif){:loading="lazy"}

The human visual system infers depth by blending signals from both eyes. This phase demonstrates a VR system that deliberately breaks binocular redundancy by projecting different dynamic and static content to each eye, creating controllable rivalry effects.

## Application

These techniques pair mathematical optical simulations with VR to create realistic representations of color vision deficiency. Beyond education, the work could be reversed to enhance color perception or improve accessibility tooling. The binocular rivalry experiments further demonstrate how VR can replicate lab setups such as mirror stereoscopes without specialized hardware, opening new avenues for studying binocular disparity and potential vision augmentation.

## My Contributions

- Implemented the color pipeline in Unity's HDRP, including LUT blending and per-eye calibration routines for HMDs.
- Wrote researcher-facing tooling to capture headset sensor data, compare it against hyperspectral reference images, and export reports.
- Collaborated with ophthalmology advisors to ensure the visuals respected clinical constraints before showing the demos in outreach events.

## Why It Matters

- Provided a tangible demo for explaining accessibility investments to stakeholders later in my career.
- Validated that VR can serve as a fast, low-cost substitute for physical optics labs when teaching vision science concepts.
