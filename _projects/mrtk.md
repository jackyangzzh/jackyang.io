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
MRTK is Microsoft's open-source Unity toolkit for XR. It gives developers common APIs for input, interaction, UI, and spatial behavior across different headsets and controllers.

{% include pro/project-video.html id="-E4QYB3zIm0" title="MRTK for Unity" %}

## Contribution in MRTK 2.7

My public contribution is [PR #9726](https://github.com/microsoft/MixedRealityToolkit-Unity/pull/9726), which added an example scene for Leap Motion orientation modes. The [MRTK 2.7 release notes](https://learn.microsoft.com/en-us/windows/mixed-reality/mrtk-unity/mrtk2/release-notes/mrtk-27-release-notes?view=mrtkunity-2021-05#added-support-for-leap-motion-unity-modules-version-460-470-471-and-480) credit `@jackyangzzh` for the `LeapMotionOrientationExample` scene.

The scene shows how MRTK interprets a tracked hand under each orientation setting.

- Built the orientation display and example scene, then revised them through maintainer review.
- Removed a hard dependency so the display could load before the Leap Motion Unity module was installed.
- Kept the sample consistent with existing MRTK patterns rather than adding a separate setup path.

## Additional work

I also worked on the surrounding Leap Motion integration and release quality:

- Profiled input system hotspots and moved allocation-heavy work to C# Jobs.
- Added tests around hand-joint data and interactable states to reduce regressions.
- Wrote migration notes and samples for teams adopting the changes.
- Tested the changes against partner scenarios before release.

## Open-source constraints

Toolkit code has to work outside the app it was written for. A change that worked in my sample could still break another team's project, so compatibility and regression risk shaped the implementation. The documentation had to explain the same constraints.

The Leap Motion path also needed to behave like the rest of MRTK. Developers should be able to find it in the samples, and a missing optional package should not stop the project from loading. Upgrade notes covered the changes that existing projects needed to make.

## Impact

- The public example made MRTK 2.7's Leap Motion settings easier to understand and configure.
- Performance work, tests, and migration notes reduced the work required by teams adopting the changes.

The work made the less visible parts of an open-source release concrete for me.
A useful example was only one part of the contribution. Optional packages and
maintainer review had just as much influence on the final code.
