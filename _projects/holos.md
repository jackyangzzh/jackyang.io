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
  alt: Holos immersive training scene with an aircraft cockpit model and interactive instruction panels
links:
  - title: Holos
    url: https://www.holos.io/

---
I was an AR/VR Interaction Engineer at Holos in Madison, Wisconsin, from February 2019 to May 2022. During that time, we turned individual XR demos into a reusable training platform. My work centered on interaction, multiplayer sessions, and getting customer models into usable training scenes.

{% include pro/project-video.html id="s3_ax616TCo" title="Holos AR/VR training platform demonstration" %}

## Capturing what a manual leaves out

An instructor can point to a spot on a component or demonstrate a hand motion that's hard to explain in a manual. We wanted to capture those details in spatial training.

Building a custom VR app for each procedure took too long and depended on outside developers. The platform needed to keep subject-matter experts involved in authoring without asking them to become engineers.

## What I built

I worked on the shared simulation layer and networking for instructor and trainee sessions. Procedures change, so editing a scene and running it needed to be closely connected.

- Developed the multiplayer backend to synchronize virtual objects across connected headsets.
- Built hand tracking and gesture recognition for grabbing, placing, rotating, and operating training objects.
- Implemented object constraints and physics for assembly and handoffs between users.
- Created import workflows to clean up model scale, pivots, colliders, and interaction settings.
- Connected authoring to the simulation runtime so new training content didn't require a separate app.

## What instructor testing exposed

Imported models turned out to matter much more than I'd expected. A scene could look convincing in a demo and still fail in use because an object's scale, origin, or collision data was wrong. Those checks belonged in the import process, not in a last-minute cleanup pass.

Shared objects needed clear ownership rules so two people wouldn't fight over the same prop. Gestures needed a similar kind of restraint: a clever gesture wasn't useful if a trainee couldn't repeat it reliably under pressure.

## Outcomes

I helped turn the early prototypes into a platform used for networked training with enterprise and government customers. I also worked with leadership on the product and engineering work that helped Holos secure a $750K U.S. Air Force contract and a place in Techstars.

The headset gets most of the attention in XR. At Holos, asset cleanup, network state, and reliable input were what made the difference between a convincing demo and a tool someone could use for training.