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
  srcset:
    - [480, /assets/img/projects/mrtk_unity-480.webp]
    - [720, /assets/img/projects/mrtk_unity-720.webp]
    - [731, /assets/img/projects/mrtk_unity.webp]
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

My main public contribution is [PR #9726](https://github.com/microsoft/MixedRealityToolkit-Unity/pull/9726), an example scene for hand-tracking orientation settings. Those settings are hard to understand from a configuration panel, so the scene lets developers see how MRTK interprets a tracked hand in each supported mode.

I removed hard dependencies so the scene could load even before the Leap Motion Unity module was installed, since an example should explain the feature without sending developers through another setup process first. Maintainer reviews helped keep it consistent with the rest of MRTK.

## Integration work

Beyond the example scene, I worked on the surrounding integration:

- Profiled input system hotspots and shifted allocation-heavy workloads into C# Jobs.
- Added tests for hand-joint data and interactable states.
- Wrote migration notes and samples for teams adopting the changes.

## Working in someone else's project

Getting the sample to work on my machine turned out to be the easy part. In a shared toolkit, it also had to coexist with optional packages, other people's project setups, and code I hadn't written. In fact, the compatibility checks, tests, and maintainer feedback shaped the final PR as much as the feature itself.