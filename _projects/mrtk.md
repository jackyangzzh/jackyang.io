---
layout: project
title: 'MRTK for Unity'
caption: Open-source toolkit by Microsoft powering mixed reality apps in Unity
description: >
  Contributed Leap Motion integration and feature upgrades to Microsoft's Mixed Reality Toolkit 2.7 release
date: '01-01-2021'
image: 
  path: /assets/img/projects/mrtk_unity.webp
  alt: Mixed Reality Toolkit Unity development interface
links:
  - title: Release note
    url: https://learn.microsoft.com/en-us/windows/mixed-reality/mrtk-unity/mrtk2/release-notes/mrtk-27-release-notes?view=mrtkunity-2021-05#added-support-for-leap-motion-unity-modules-version-460-470-471-and-480
  - title: Github
    url: https://github.com/microsoft/MixedRealityToolkit-Unity
sitemap: false

---
MRTK is Microsoft's open-source toolkit for building XR experiences in Unity and powers much of what we ship across HoloLens, Microsoft Mesh, and partner applications.

## Scope

- Cross-platform interaction system that abstracts controllers, articulated hands, and eye tracking into a single API surface.
- UI components, spatialization helpers, and performance tooling tuned for both immersive (VR) and mixed reality (AR) runtimes.
- Large open-source community that depends on predictable releases, documentation, and backwards compatibility.

## My Contributions

- Added official Leap Motion hand-tracking support for MRTK 2.7, covering joint poses, gesture events, and hand mesh visualization.
- Hardened the input system for hybrid 2D/3D apps by profiling perf hotspots and rewriting allocation-heavy sections in C# jobs.
- Authored migration guides and sample scenes that showed developers how to adopt the new capabilities without breaking existing scenes.
- Coordinated with partner teams to verify the release against Microsoft Mesh and third-party experiences before shipping.

## Impact

- Expanded MRTK's controller support matrix, helping enterprise developers bring hand tracking to training and design reviews without rewriting input code.
- Reduced regressions in partner builds by contributing automated tests around hand joints and interactable states.
- Provided learnings that fed directly into my day job building avatar customization in Microsoft Mesh.
