---
layout: project
weight: 2
title: 'Holos'
description: >
  Hand interaction, multiplayer networking, and 3D content workflows I built for Holos's AR and VR training platform.
date: '2019-02-01'
end_date: '2022-05-01'
category: professional
image:
  path: /assets/img/projects/holos.webp
  srcset:
    - [480, /assets/img/projects/holos-480.webp]
    - [720, /assets/img/projects/holos-720.webp]
    - [960, /assets/img/projects/holos-960.webp]
    - [1440, /assets/img/projects/holos-1440.webp]
    - [2000, /assets/img/projects/holos.webp]
  alt: Holos immersive training scene with an aircraft cockpit model and interactive instruction panels
links:
  - title: Holos
    url: https://www.holos.io/
  - title: Developer tutorials (2021)
    url: https://github.com/holosinc/intro-to-dev/tree/44bc3063b1fffed7d9ef92a9bb66891bd5949c37
  - title: Primitive fitting
    url: https://github.com/holosinc/primitivefitting

---
I was an AR/VR Interaction Engineer at Holos in Madison, Wisconsin, from February 2019 to May 2022. Over those three years, we **turned one-off XR demos into a reusable training platform**. My work centered on interaction, multiplayer sessions, and getting customer models into usable training scenes.

{% include pro/project-video.html id="s3_ax616TCo" title="Holos AR/VR training platform demonstration" %}

## Capturing what a manual leaves out

An instructor can point to a spot on a component or demonstrate a hand motion that's hard to explain in a manual. We wanted to **capture those details in spatial training**.

Building a custom VR app for each procedure took too long and depended on outside developers. Holos combined **3D models and animation with text, images, audio, and video** in spatial lessons. Instructors could arrange those materials around the task they were teaching, **without having to become engineers**.

## What I built

I worked on the **shared simulation layer and networking** for instructor and trainee sessions. Procedures change, so editing a scene and running it needed to be closely connected.

- Developed the **multiplayer backend** to synchronize virtual objects across connected headsets.
- Built **hand interaction in Unity with Leap Motion**, including gesture recognition for grabbing, placing, rotating, and operating training objects.
- Implemented **object constraints and physics** for assembly and handoffs between users.
- Created **import workflows** to clean up model scale, pivots, colliders, and interaction settings.
- Connected authoring to the simulation runtime so **new training content didn't require a separate app**.

<figure class="tutorial-demo">
  <img src="/assets/img/projects/holos/trailer-card-browser.gif" width="600" height="338" loading="lazy" decoding="async" alt="Holos's 2017 trailer showing a tracked hand operating a floating card browser and hand-based interface.">
</figure>

<figure class="tutorial-demo">
  <img src="/assets/img/projects/holos/trailer-spatial-interaction.gif" width="600" height="338" loading="lazy" decoding="async" alt="Holos's 2017 trailer showing tracked hands interacting with floating content and objects in a virtual room.">
</figure>

## Simplifying geometry for interaction

I also helped with Holos's [**primitive-fitting tool**](https://github.com/holosinc/primitivefitting). It approximates voxelized 3D models with **spheres, cuboids, and capsules**, with conversion methods for Unity collider parameters.

The Python/PyTorch pipeline fits enabled shapes to the largest remaining connected component, selects the best candidate using an exact score, and removes covered voxels before repeating. It then restores the source model's scale and position. The useful tradeoff is **coverage versus geometric detail**: a simple collider is easier to work with, but a coarse fit can hide an opening or change where a hand makes contact.

{% include pro/diagram.html
  src="/assets/img/projects/holos/01-primitive-fitting.svg"
  height="790"
  mobile="/assets/img/projects/holos/01-primitive-fitting-mobile.svg"
  mobile_height="1500"
  title="From model to collider shapes"
  alt="An OBJ model is voxelized externally. The tool fills a voxel grid, fits enabled sphere, cuboid, and capsule candidates to the largest remaining component, selects the best exact score, and removes covered voxels. It repeats until a stopping condition, restores source coordinates, and exposes Unity collider parameters."
  caption="The public fitting pipeline, from voxel input to Unity collider parameters. Shape icons are schematic."
%}

## Teaching the development workflow

In 2021, I wrote [**Unity and Leap Motion tutorials**](https://github.com/holosinc/intro-to-dev/tree/44bc3063b1fffed7d9ef92a9bb66891bd5949c37) for Project LAUNCH and HyperX students. The lessons covered hand tracking, PC VR and Oculus Quest setup, and using a **Mock HMD** to develop a scene when a student didn't have a headset.

I created these **hand-interaction demos** for the tutorial:

<figure class="tutorial-demo">
  <img src="/assets/img/projects/holos/interaction_objects.gif" width="600" height="338" loading="lazy" decoding="async" alt="Hand-interaction demo I created in Unity: tracked hands manipulating virtual objects.">
  <figcaption><strong>Interaction Objects.</strong> My demo of tracked hands manipulating objects in Unity. <a href="https://github.com/holosinc/intro-to-dev/raw/44bc3063b1fffed7d9ef92a9bb66891bd5949c37/Docs/interaction_objects.gif">Original tutorial GIF ↗</a></figcaption>
</figure>

<figure class="tutorial-demo">
  <img src="/assets/img/projects/holos/dynamic_ui.gif" width="600" height="338" loading="lazy" decoding="async" alt="Dynamic UI demo I created in Unity: direct hand interaction with a movable interface.">
  <figcaption><strong>Dynamic UI.</strong> My demo of direct hand interaction with a movable interface. <a href="https://github.com/holosinc/intro-to-dev/raw/44bc3063b1fffed7d9ef92a9bb66891bd5949c37/Docs/dynamic_ui.gif">Original tutorial GIF ↗</a></figcaption>
</figure>

## Outcomes

I helped turn the early prototypes into a platform used for networked training with **enterprise and government customers**. I also worked with leadership on the product and engineering work that helped Holos secure an approximately [**$750K U.S. Air Force SBIR Phase II contract**](https://www.sbir.gov/awards/180960) in 2019 and a place in the [**2020 Techstars Space Accelerator**](https://www.holos.io/team).

The contract's [announced scope](https://www.holos.io/announcements/holos-awarded-750-000-sbir-phase-ii-contract-from-u-s-air-force) included **F-35 maintenance and repair training** with Edwards Air Force Base's 412th Test Wing.

Even though the headset gets most of the attention in XR, at Holos the difference between a convincing demo and a tool someone could train with came down to **asset cleanup, network state, and reliable input**.
