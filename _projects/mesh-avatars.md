---
layout: project
weight: 1
title: 'Microsoft Mesh & Avatars for Teams'
description: >
  Helped build the UI, avatar editor, and real-time embodiment systems for Microsoft Mesh and Avatars in Teams, used by millions of people.
date: '01-01-2023'
category: professional
image:
  path: /assets/img/projects/mesh-avatars.webp
  alt: Microsoft Mesh immersive event with avatars gathered around a shared presentation
links:
  - title: Immersive events in Teams
    url: https://support.microsoft.com/en-us/teams/meetings/get-started-with-immersive-events-in-microsoft-teams
  - title: Avatars in Teams
    url: https://support.microsoft.com/en-us/office/customize-your-avatar-in-microsoft-teams-be6a9703-f03d-4eb5-9908-995fdc5c91a8

---
I worked on Microsoft Mesh and Avatars for Teams from June 2022 to September 2024. A person could use the same avatar in a regular Teams meeting, a desktop immersive event, or VR. I worked on the UI, avatar editor, and rendering systems that kept that experience consistent across devices.

{% include pro/project-video.html id="fSKBHOWOcSM" title="Microsoft Mesh" %}
{% include pro/project-video.html id="Pk5BVxlKL5w" title="Avatars in Microsoft Teams" %}

## Problem

Video meetings work, but a grid of faces loses body language and a sense of shared space. Mesh and Avatars tried to bring some of that presence back while still working for people on ordinary laptops. The experience also had to meet the reliability standards Teams customers expect.

One avatar had to look and move consistently in a laptop meeting tile, a Quest session, and a crowded 3D event. Those runtimes had very different performance budgets and input models.

## What the product shipped

Avatars in Teams let people join a meeting without a camera feed. Reactions and meeting controls drive lip sync and gestures. Immersive events add customizable 3D venues for meetings, training, and company events on desktop or Meta Quest. The same avatar and wardrobe carry between those experiences. A separate editor lets people choose a body, face, hair, clothing, and accessories.

## My contributions

### Cross-platform UI system (UXTools)
- Contributed to the shared UI toolkit used by Mesh and avatar surfaces across Teams desktop, web-hosted surfaces, and immersive VR clients.
- Designed component primitives that worked under both 2D pointer input and 3D hand/controller input, so interaction patterns could be reused across endpoints instead of rebuilt per platform.
- Built common patterns for theming, accessibility, focus, and input routing that other Mesh surfaces could reuse.

### Avatar customization
- Built the avatar editor and its live preview for bodies, faces, hair, outfits, and accessories.
- Worked with design, art, and platform teams to make the editor clear for first-time users without cutting useful options.
- Tuned loading and asset swaps so changes appeared quickly without exceeding memory limits on lower-end devices.

### General avatar stack
- Worked on how the system describes an avatar, assembles its modular assets, animates it, and keeps it synchronized across clients.
- Made the same avatar definition render consistently in meeting tiles, crowded immersive events, and VR.
- Worked with platform, networking, and rendering teams as the product moved from preview to broad release.

### Performance, localization, and delivery
- Profiled CPU and GPU frame budgets on HoloLens, Quest, web, and desktop. Used LOD switching and GPU instancing to maintain target framerates on constrained hardware.
- Supported the content pipeline and weekly releases for avatar assets and editor options.
- Shipped the customization experience with localization across more than 20 languages.

## Engineering constraints

Mesh and Avatars run inside Teams, so each change had to meet Teams' reliability and performance standards.

The avatar in a meeting tile had to be the same avatar used in an immersive event or on Quest. That pushed the UI and avatar stack toward platform-neutral components. Customization also needed inclusive defaults and enough control for people to recognize themselves without turning the editor into a game. In crowded events, asset size and animation updates affected both framerate and join time, so small costs added up quickly.

## Impact

- Avatars gave Teams users another way to join meetings with their cameras off. Immersive events gave customers a 3D format for training, company meetings, and other group events.
- Other Mesh teams reused the UI system across desktop and immersive clients instead of rebuilding the same controls.

This was where I learned to care about the parts users rarely notice until they
break: input routing, asset budgets, localization, accessibility, and consistent
behavior across devices. I still pay attention to those details in Teams AI.
