---
layout: project
weight: 5
title: 'MRTK for Unity'
description: >
  Leap Motion integration work and a merged orientation example for Microsoft's Mixed Reality Toolkit 2.7.
date: '01-01-2021'
category: personal
image: 
  path: /assets/img/projects/mrtk_unity.webp
  alt: Mixed Reality Toolkit for Unity logo
links:
  - title: Merged contribution
    url: https://github.com/microsoft/MixedRealityToolkit-Unity/pull/9726
  - title: Release Notes
    url: https://learn.microsoft.com/en-us/windows/mixed-reality/mrtk-unity/mrtk2/release-notes/mrtk-27-release-notes?view=mrtkunity-2021-05#added-support-for-leap-motion-unity-modules-version-460-470-471-and-480
  - title: GitHub
    url: https://github.com/microsoft/MixedRealityToolkit-Unity

---
I contributed to the Leap Motion integration in MRTK 2.7, Microsoft's open-source Unity toolkit for XR. The work included a merged example scene showing how hand tracking behaves in different orientation modes.

{% include pro/project-video.html id="-E4QYB3zIm0" title="MRTK for Unity" %}

## My contribution in MRTK 2.7

My primary public contribution is [PR #9726](https://github.com/microsoft/MixedRealityToolkit-Unity/pull/9726). Orientation settings can be hard to understand from a configuration panel. The scene lets developers see how MRTK interprets a tracked hand in each supported mode.

I removed hard dependencies so the scene could load before the Leap Motion Unity module was installed. Maintainer reviews also helped keep the example consistent with the rest of MRTK. It needed to explain the feature without asking developers to learn another setup process.

## Integration work

Beyond the example scene, I worked on the surrounding integration:

- Profiled input system hotspots and shifted allocation-heavy workloads into C# Jobs.
- Added tests for hand-joint data and interactable states.
- Wrote migration notes and samples for teams adopting the changes.

## Working in someone else's project

A sample working on my machine wasn't enough. It had to coexist with optional packages, different project setups, and code I hadn't seen. Compatibility checks, tests, and maintainer feedback shaped the contribution as much as the feature did.