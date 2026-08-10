---
layout: project
weight: 5
title: 'MRTK for Unity'
description: >
  Contributed Leap Motion support and an orientation example to Microsoft's Mixed Reality Toolkit 2.7.
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
MRTK is Microsoft's open-source Unity toolkit for XR. Because it gives developers common APIs for input, interaction, UI, and spatial behavior across completely different headsets, it has become a foundational layer for many spatial computing projects.

{% include pro/project-video.html id="-E4QYB3zIm0" title="MRTK for Unity" %}

## My contribution in MRTK 2.7

When I started contributing, I assumed the hardest part would be writing the core integration code itself. However, I quickly realized that building a useful example scene and maintaining regression stability were actually far more complex aspects of open-source toolkit work. 

My primary public contribution is [PR #9726](https://github.com/microsoft/MixedRealityToolkit-Unity/pull/9726), which adds an example scene that demonstrates Leap Motion orientation modes. Because settings like orientation can be highly abstract, I wanted to provide a tangible scene that explicitly shows how MRTK interprets a tracked hand under every possible orientation configuration. 

While building this scene, I intentionally removed any hard dependencies so the display could load correctly even before the Leap Motion Unity module was installed. I also went through multiple maintainer review cycles to ensure the sample stayed rigorously consistent with existing MRTK patterns, since I did not want developers to have to learn a totally separate setup path just for this one feature.

## Additional engineering

Beyond the example scene, I pushed several changes to the surrounding Leap Motion integration to ensure release quality:

- Profiled input system hotspots and shifted allocation-heavy workloads into C# Jobs.
- Added strict tests around hand-joint data and interactable states because I wanted to aggressively reduce potential regressions.
- Wrote migration notes and provided samples for external teams adopting these new changes.

## Open-source constraints

Contributing to MRTK fundamentally changed my perspective on shipping code. While in a standalone app you simply write code to solve your own problem, toolkit code absolutely has to work in wildly unpredictable external environments. Even though a change worked perfectly in my sample, it could still easily break another team's project, meaning compatibility and regression risk constantly shaped the final implementation.

In brief, this work made the less visible parts of an open-source release painfully concrete for me. A useful example was just one tiny piece of the overall contribution. Ultimately, optional packages, strict testing, and maintainer reviews had just as much influence on the final shipped code as the feature itself.