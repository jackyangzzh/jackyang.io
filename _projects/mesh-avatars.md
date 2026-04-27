---
layout: project
title: 'Microsoft Mesh & Avatars for Teams'
description: >
  Built the cross-platform UI system (UXTools), avatar customization, and core avatar stack behind Microsoft Mesh and Avatars for Microsoft Teams.
date: '01-01-2023'
image:
  path: /assets/img/projects/mesh-avatars.webp
  alt: Avatars gathered around a presentation in a Microsoft Mesh immersive space inside Microsoft Teams
links:
  - title: Microsoft Mesh
    url: https://www.microsoft.com/en-us/microsoft-teams/microsoft-mesh
  - title: Avatars in Teams
    url: https://support.microsoft.com/en-us/office/customize-your-avatar-in-microsoft-teams-be6a9703-f03d-4eb5-9908-995fdc5c91a8

---
Microsoft Mesh brings shared 3D spaces into Teams, where attendees can gather as personalized avatars instead of only appearing as video tiles. The experience runs through Teams on PC and Mac and through the Microsoft Teams Immersive app on Meta Quest, with the same avatar identity carrying across standard meetings, immersive events, and VR.

{% include pro/project-video.html id="fSKBHOWOcSM" title="Microsoft Mesh" %}
{% include pro/project-video.html id="Pk5BVxlKL5w" title="Avatars in Microsoft Teams" %}

## Problem

Remote work made meetings efficient but flat. Video grids strip out spatial awareness, body language, and the small social cues that make group conversations feel human. Mesh and Avatars for Teams set out to add a layer of presence on top of the meeting stack — without forcing every participant into a headset and without breaking the reliability bar that Teams customers expect.

Hitting that target meant building one avatar system that could render and animate consistently across very different runtimes: a Teams meeting tile on a laptop, a fully immersive Quest session, and an immersive event where many avatars share the same 3D scene.

## What We Shipped

- **Avatars for Teams meetings** — users can opt in to represent themselves with a personalized avatar instead of a camera feed, with reactions, lip sync, and gestures driven from existing meeting controls.
- **Immersive events in Teams** — large-scale, customizable 3D venues for all-hands, training, product showcases, and recruiting, joinable from desktop or Meta Quest.
- **Cross-device identity** — one avatar identity and wardrobe that follows the user across 2D Teams, immersive events, and VR.
- **Customization studio** — a wardrobe-style editor that lets people compose body shapes, faces, hair, clothing, and accessories at the fidelity needed for close-up meeting portraits and crowded 3D venues.

## My Contributions

### Cross-platform UI system (UXTools)
- Helped build the shared UI toolkit used by Mesh and avatar surfaces across Teams desktop, web-hosted surfaces, and immersive VR clients.
- Designed component primitives that worked under both 2D pointer input and 3D hand/controller input, so interaction patterns could be reused across endpoints instead of rebuilt per platform.
- Established patterns for theming, accessibility, focus, and input routing that became defaults for Mesh-era surfaces.

### Avatar customization
- Built the customization experience that lets users assemble and personalize their avatar — body, face, hair, outfits, and accessories — with live preview.
- Worked across design, art, and platform teams to land an editor that was approachable for first-time users while still exposing the depth needed for self-representation.
- Tuned loading, asset swapping, and pipeline behavior so edits in the customization flow felt immediate without blowing past memory budgets on lower-end devices.

### General avatar stack
- Contributed to the underlying avatar stack: how avatars are described, assembled from modular assets, animated, and synchronized across clients.
- Worked on making the same avatar definition render consistently in a Teams meeting tile, in an immersive event with many concurrent avatars, and in a fully immersive VR session.
- Partnered with platform, networking, and rendering teams to keep the stack stable as the product moved from preview into broad availability.

## Engineering Constraints

Mesh and Avatars sit inside Teams, which means every change is measured against the reliability and performance bar of an enterprise communications product used at massive scale. A few constraints shaped the work:

- **One system, many runtimes.** The avatar that appears in a meeting tile, in an immersive event, and on Quest had to be the same avatar — not three lookalikes — which forced the UI and avatar stack to be platform-agnostic by default.
- **Identity is personal.** Customization had to feel respectful and inclusive, not gamified. That changed how we shaped defaults, inclusivity of options, and the editor flow.
- **Scale is the feature.** Immersive events can fill a room with avatars, so every byte of asset weight and every animation update mattered for keeping framerate and join times in range.

## Impact

- Avatars for Teams and immersive events shipped into the modern Teams meeting experience, giving customers a video-off way to stay present and a 3D format for events where presence matters most.
- The cross-platform UI system became a shared foundation for Mesh-era surfaces, reducing duplicated UI work between desktop and immersive clients.
- Gave me deep experience shipping platform-level systems — UI frameworks, avatar pipelines, and customization tooling — inside a product where stability, accessibility, and cross-device consistency are non-negotiable.
