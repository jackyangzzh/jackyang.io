---
layout: project
title: 'MRTK for Unity'
description: >
  Contributed Leap Motion integration and feature upgrades to Microsoft's Mixed Reality Toolkit 2.7 release.
date: '01-01-2021'
image: 
  path: /assets/img/projects/mrtk_unity.webp
  alt: Mixed Reality Toolkit Unity development interface
links:
  - title: Release Notes
    url: https://learn.microsoft.com/en-us/windows/mixed-reality/mrtk-unity/mrtk2/release-notes/mrtk-27-release-notes?view=mrtkunity-2021-05#added-support-for-leap-motion-unity-modules-version-460-470-471-and-480
  - title: GitHub
    url: https://github.com/microsoft/MixedRealityToolkit-Unity

---
MRTK is Microsoft's open-source toolkit for building XR experiences in Unity. It underpins experiences across HoloLens, Microsoft Mesh, and partner applications.

{% include pro/project-video.html id="-E4QYB3zIm0" title="MRTK for Unity" %}

## Problem

MRTK succeeds only if developers can rely on it as shared infrastructure rather than a moving target. By the time of the 2.7 release, one of the important gaps was broader hand-tracking support and better performance hygiene for teams building hybrid 2D and 3D experiences across multiple devices.

## What MRTK Covers

- Cross-platform interaction system that abstracts controllers, articulated hands, and eye tracking into a unified API surface.
- UI components, spatialization helpers, and performance tooling tuned for both immersive (VR) and mixed reality (AR) runtimes.
- Large open-source community that depends on predictable releases, documentation, and backward compatibility.

## My Contributions

- Added official Leap Motion hand-tracking support for MRTK 2.7, covering joint poses, gesture events, and hand mesh visualization.
- Hardened the input system for hybrid 2D/3D apps by profiling performance hotspots and rewriting allocation-heavy sections using C# Jobs.
- Authored migration guides and sample scenes showing developers how to adopt new capabilities without breaking existing scenes.
- Coordinated with partner teams to verify the release against Microsoft Mesh and third-party experiences before shipping.

## Shipping Constraints

Working on toolkit code is different from product code: the target is not one polished experience, but a stable foundation that many teams can build on. That meant every feature had to be evaluated against compatibility, documentation burden, and regression risk, not just whether it worked in one app.

The Leap Motion integration was especially important because it extended MRTK's input coverage without asking developers to re-architect their scenes around a one-off custom path. Making the feature real meant not only adding support, but making it feel native to the toolkit.

## Impact

- Expanded MRTK's controller support matrix, helping enterprise developers bring hand tracking to training and design review scenarios without rewriting input code.
- Reduced regressions in partner builds by contributing automated tests around hand joints and interactable states.
- Gave me direct experience shipping platform-level XR infrastructure where API stability, samples, and release quality matter as much as the feature itself.
