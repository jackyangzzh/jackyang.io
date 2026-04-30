---
layout: project
title: 'PolySpaceVR'
description: >
  Lightweight, customizable VR social hub for small groups that I designed, engineered, and shipped on the Meta Quest Store.
date: '01-01-2021'
category: personal
image: 
  path: /assets/img/projects/PolySpaceLogo.webp
  alt: PolySpaceVR logo featuring low-poly 3D environment design
links:
  - title: Meta Quest Store
    url: https://www.meta.com/experiences/pcvr/3258096647627881/?utm_source=yangjack.com&utm_medium=oculusredirect
  - title: GitHub
    url: https://github.com/jackyangzzh/Poly-Space-VR

---
PolySpaceVR is a VR social platform purpose-built for intimate, customizable gatherings. I started the project to explore how lightweight networking, avatars, and spatial audio can make remote hangouts feel less like meetings and more like living-room conversations.

## Problem

Most social VR products sit at one of two extremes: large public worlds that are great for serendipity but noisy for small groups, or enterprise collaboration tools that feel efficient but sterile. PolySpaceVR was my attempt to design a middle ground for friend groups, study sessions, and lightweight community events.

The goal was not to win on scale. It was to make small-group presence feel warm, customizable, and technically reliable on commodity VR hardware.

## Product Strategy

- **Comfortable performance:** Low-poly art direction, baked lighting, and GPU instancing keep framerate high on standalone Meta Quest devices.
- **Modular spaces:** Environment templates use ScriptableObjects so creators can remix layouts, props, and lighting without touching core code.
- **Social presence:** Customizable avatars, spatial audio falloff, and shared interactables (whiteboards, card tables, media surfaces) make small gatherings playful.

## My Role

- Owned the product concept, core engineering, and shipping path from prototype through store release.
- Implemented Photon networking to keep voice chat, avatar poses, and interactables synchronized for up to eight participants.
- Built the in-headset world builder, creator tooling, and moderation hooks needed to make the product usable by hosts rather than just developers.

## Key Tradeoffs

- Prioritized stable framerate and comfort over higher-fidelity visuals, which is why the product leans into low-poly art direction and tightly controlled scene complexity.
- Capped the experience around small groups because intimacy and reliable synchronization mattered more to the concept than maximizing room size.
- Open-sourced the codebase to encourage community extension, while still adding moderation primitives like mute, soft kick, and invite lists so hosts could keep spaces usable.

## Outcomes

- Open-sourced the project so educators and hobbyists can host their own Poly Spaces without vendor lock-in.
- Documented creator guidelines that supported monthly community drops on the store listing.
- Used the platform for internal dogfooding sessions at Holos and as an early reference point for the kind of intimacy-focused social spaces I wanted to design professionally.

![PolySpaceVR on Meta Quest Store](/assets/img/projects/screenshot-store.webp){:loading="lazy"}
{:.figcaption}

PolySpaceVR started as a response to a gap I felt in the market, but it became equally valuable as a sandbox for testing how networking, world-building tools, moderation, and social presence need to fit together. That systems-level thinking has carried into the more structured social spaces I have designed professionally.
