---
layout: project
weight: 2
title: 'Holos'
description: >
  Built hand interaction, multiplayer networking, and 3D content workflows for Holos's AR and VR training platform from 2019 to 2022.
date: '01-01-2022'
category: professional
image:
  path: /assets/img/projects/holos.webp
  alt: Holos immersive training scene with an aircraft cockpit model and interactive instruction panels
links:
  - title: Holos
    url: https://www.holos.io/

---
Holos is an immersive training company in Madison, Wisconsin. I worked there from February 2019 to May 2022 as we grew the product from a series of individual XR demos into a reusable training platform. While the company's focus has evolved since then, at the time we were focused on capturing expert work for spatial training.

{% include pro/project-video.html id="s3_ax616TCo" title="Holos AR/VR training platform demonstration" %}

## The challenge

I always found it surprising how much technical training depends on tacit knowledge that is incredibly hard to write down. An instructor might point to a specific spot on a component or demonstrate a subtle hand motion that makes a procedure safer, and manuals or slides unfortunately lose almost all of that information.

Even though custom VR training could theoretically capture those details, I realized it was not a practical solution because it usually took a long production cycle and required outside developers. We needed a way for subject-matter experts to stay close to the authoring process without having to become engineers themselves.

## What I built

I focused heavily on the shared simulation layer and the multiplayer networking that powered instructor and trainee sessions. Because procedures change constantly, instructors needed a very short path from editing a scene to running it. 

- Developed the multiplayer networking backend so that virtual objects stayed perfectly synchronized across connected headsets.
- Built hand tracking and gesture recognition for grabbing, placing, rotating, and operating training objects.
- Implemented object constraints and physics to ensure props behaved consistently, especially when users were assembling them or handing them off to each other.
- Created import workflows that automatically cleaned up customer models for scale, pivots, colliders, and interaction.
- Connected this authoring workflow directly to the simulation runtime so the team could deploy training content without building a brand new app for every single scenario.

## Prototyping and testing

Testing interactions with actual instructors exposed so many problems that completely escaped my notice when I was just looking at them in a headset demo. 

For instance, I initially assumed that imported models were just an afterthought compared to the core interaction logic. However, I was wrong. If we did not aggressively check collision data, origins, and scale before a model ever reached a training scene, everything broke. 

Similarly, shared manipulation required very clear ownership rules because otherwise two users would constantly fight over the same object. When I prototyped new gestures, I quickly learned that a clever, complex gesture was practically useless, since trainees could never repeat it reliably under pressure.

## Outcomes

Over my time there, I helped turn those early prototypes into a robust platform that Holos used for networked training with enterprise and government customers. I worked closely with leadership on the technical side, which eventually helped the company secure a $750K U.S. Air Force contract and a spot in Techstars.

Personally, working at Holos changed how I evaluate XR altogether. While the headset itself always gets the vast majority of the attention, the less glamorous systems like asset cleanup, network state, and input reliability are ultimately the things that dictate whether a training tool survives outside of a controlled demo.