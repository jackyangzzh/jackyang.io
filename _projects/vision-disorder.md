---
layout: project
weight: 5
title: 'Color Vision & Binocular Rivalry in VR'
description: >
  Per-eye rendering in Unity and SteamVR, built to explore color perception and binocular rivalry.
date: '2020-01-01'
category: research
image: 
  path: /assets/img/projects/kats.webp
  srcset:
    - [480, /assets/img/projects/kats-480.webp]
    - [720, /assets/img/projects/kats-720.webp]
    - [854, /assets/img/projects/kats.webp]
  alt: VR headset displaying different color-adjusted scenes to the left and right eyes
links:
  - title: Journal Paper
    url: https://doi.org/10.1088/2040-8986/abf171
  - title: Technical Report
    url: /assets/files/Breaking%20Binocular%20Redundancy.pdf
  - title: GitHub
    url: https://github.com/jackyangzzh/Monocular-Vision-VR-demo

---
At the Kats Research Group, I built VR prototypes to explore color perception and **what happens when each eye receives different information**. Unity and SteamVR let me create static-image and moving-object comparisons in a consumer headset.

This work contributed to the research behind my co-authored [Journal of Optics paper](https://doi.org/10.1088/2040-8986/abf171) on converting ultraviolet images into visible light, published in 2021.

## Two views, one scene

I used a shared camera prefab with **separate layers, culling masks, and stereo targets** for each eye. Both eyes see the same room, but chosen images or objects reach only one of them. All three settings have to agree. In fact, the project history has exactly that mistake: `LeftEyeCanvas` sat on layer 9, the right eye's layer, until it was moved to layer 8.

<figure>
  <div class="eye-comparison">
    <div class="eye-comparison__labels"><span>Left Eye</span><span>Right Eye</span></div>
  <video src="/assets/img/projects/staticRivalry.webm" loop muted playsinline controls preload="none" poster="/assets/img/projects/kats.webp" data-deferred-video data-autoplay="true" aria-label="Original static-image comparison showing the left and right eye views"></video>
  </div>
  <figcaption>Original static comparison. Keyboard controls select among eleven prepared images independently for each eye.</figcaption>
</figure>

{% include pro/diagram.html
  src="/assets/img/projects/vision-disorder/01-eye-isolation.svg"
  mobile="/assets/img/projects/vision-disorder/01-eye-isolation-mobile.svg"
  mobile_height="1130"
  title="Eye isolation: layer, mask, output"
  height="850"
  alt="Three settings isolate each eye: object layer, camera culling mask, and stereo target. Shared layers 0, 1, 2, 4 and 5 appear in both views. Layer 8 appears only through the left camera with mask 311; layer 9 appears only through the right camera with mask 567."
  caption="What each eye sees comes down to the object’s layer and the camera’s mask. Naming a canvas LeftEyeCanvas doesn’t put it in the left eye."
%}

## A shared clock, different motion

For the dynamic demo, I gave each eye its own cube and let the operator select a movement axis. The saved scene starts with matching X-axis motion; selecting Y for the left cube produces the orthogonal comparison shown below.

<figure>
  <div class="eye-comparison">
    <div class="eye-comparison__labels"><span>Left Eye</span><span>Right Eye</span></div>
  <video src="/assets/img/projects/dynamicRivalry.webm" loop muted playsinline controls preload="none" poster="/assets/img/projects/kats.webp" data-deferred-video data-autoplay="true" aria-label="Original moving-cube comparison showing different trajectories in the left and right eye views"></video>
  </div>
  <figcaption>Original dynamic comparison. The two eye views share a scene while their cubes move on separately selected axes.</figcaption>
</figure>

{% include pro/diagram.html
  src="/assets/img/projects/vision-disorder/02-motion.svg"
  mobile="/assets/img/projects/vision-disorder/02-motion-mobile.svg"
  mobile_height="1260"
  title="A shared clock, two trajectories"
  height="720"
  alt="Calculated trajectories at an angular rate of one radian per second. The default left and right X motions trace the same sine wave over a 6.28-second period. A Y/X condition traces perpendicular line segments through a common origin. Blue identifies the left eye; dashed orange identifies the right."
  caption="Paths calculated from the motion code, starting at a common origin. They show where the cubes move in the scene; nothing here was measured from a participant."
%}

One thing I learned here is that **position and phase need separate controls**. Pressing Space recenters the cubes for a single update, but the motion picks up again from the shared clock, so you can't really restart a trial. A repeatable experiment needs explicit start, pause, and reset.

## Color perception and the research connection

<figure>
<img src="/assets/img/projects/colorDeficiencyCover.webp" srcset="/assets/img/projects/colorDeficiencyCover-480.webp 480w, /assets/img/projects/colorDeficiencyCover-720.webp 720w, /assets/img/projects/colorDeficiencyCover.webp 831w" sizes="(min-width: 86em) 52rem, (min-width: 54em) 46rem, (min-width: 42em) 40rem, 100vw" alt="Reference and transformed images from the color vision deficiency prototype" loading="lazy" decoding="async" width="831" height="270">
<figcaption>Reference and transformed images from the color vision deficiency prototype.</figcaption>
</figure>

Alongside the rivalry demo, I explored color vision deficiency by comparing reference and transformed images. The journal paper is about a physical optical system, and one idea it discusses is sending the converted spectral information to only one eye, so it stays distinguishable from ordinary visible content. Per-eye control gave me a way to try that idea in a consumer headset.

The prototype controls **which stimulus each eye receives**. In other words, it decides what each eye is shown, but it doesn't measure what the person actually perceives. That would need calibrated displays, recorded responses, and a proper study protocol, and those are what I would build next.
