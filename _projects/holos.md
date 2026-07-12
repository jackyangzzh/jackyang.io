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
Holos is an immersive training company in Madison, Wisconsin. I worked there from February 2019 to May 2022 as the product grew from individual XR demos into a training platform that customers could reuse. The current product has changed since then and now focuses on capturing expert work and turning it into spatial training.


{% include pro/project-video.html id="s3_ax616TCo" title="Holos AR/VR training platform demonstration" %}

## Problem

Technical training often depends on details that are hard to write down. An instructor may point to one spot on a component, change the order of two steps, or demonstrate a motion that makes the procedure safer. Manuals and slides lose much of that. Custom VR training could capture it, but it usually took a long production cycle and outside developers.

Holos wanted instructors and subject-matter experts to stay close to the authoring process. Reliable shared sessions and predictable hand input were basic requirements. New customer models also needed a path into training scenes that did not require engineering help every time.

## What I built (2019 to 2022)

- Built the shared simulation layer and multiplayer networking for instructor and trainee sessions. Virtual objects stayed synchronized across connected headsets.
- Developed hand tracking and gesture recognition for grabbing, placing, rotating, and operating training objects.
- Added physics and object constraints so props behaved consistently when users assembled or handed them off.
- Worked on import tools that cleaned up customer models for scale, pivots, colliders, and interaction.
- Connected the authoring workflow to the simulation runtime so the team could revise and deploy training content without building a new app for every scenario.

## Product and design work

My role covered prototype design, implementation, user testing, and release work. Testing with instructors and trainees often exposed problems that looked fine in a headset demo.

- Prototyped new training interactions, tested them, and shipped the versions that people understood.
- Used test sessions to simplify controls, adjust gesture thresholds, and improve object handling.
- Traced failures across input, networking, assets, and UX instead of treating each symptom as an isolated bug.
- Worked with engineering, design, leadership, and customer teams to meet product and partner deadlines.

## Engineering decisions

Imported models were part of the product, not an afterthought. We checked collision, origins, scale, and interaction metadata before a model reached a training scene. Shared manipulation needed clear ownership rules so two users could not fight over the same object. Hand tracking also needed obvious feedback and recoverable mistakes; a clever gesture was useless if trainees could not repeat it. Because procedures change, instructors needed a short path from an edit to a tested release.

## Impact

- Helped turn a set of XR prototypes into a reusable platform for networked training.
- Shipped interaction, physics, networking, and asset pipeline features for enterprise and government customers.
- Worked with leadership on the product and technical work that helped Holos secure a $750K U.S. Air Force contract and join Techstars.

Holos changed how I thought about XR. The headset gets the attention, but asset
cleanup, network state, input reliability, and release speed decide whether a
training tool survives outside a demo. Subject-matter experts should be able to
teach with the software without learning to build software themselves.
