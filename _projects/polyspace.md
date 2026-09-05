---
layout: project
weight: 8
title: 'Poly Space VR'
description: >
  An open-source social VR app for up to eight people, with voice chat, shared objects, and an in-headset room editor. Released on the Oculus PC VR store.
date: '01-01-2021'
category: personal
image: 
  path: /assets/img/projects/PolySpaceLogo.webp
  alt: Poly Space VR logo
links:
  - title: Meta PC VR Store
    url: https://www.meta.com/experiences/pcvr/poly-space-vr/3258096647627881/
  - title: GitHub
    url: https://github.com/jackyangzzh/Poly-Space-VR

---
I built Poly Space VR from the first prototype through its Oculus PC VR store release, then open-sourced it. It's a social app for small groups, with voice chat, shared objects, and a room editor you can use without leaving the headset.

## Why eight people?

I wanted somewhere to hang out with a few friends. Large public VR worlds often felt too noisy, and enterprise meeting tools felt too much like work.

I capped rooms at eight people to keep voice, avatar poses, and shared physics manageable on consumer connections. A smaller session that held together mattered more to me than a larger participant count.

## Keeping the room responsive

Low-poly models, baked lighting, and GPU instancing kept scene costs down. Photon handled networking for voice, avatar poses, and physics interactions.

Hosts could rearrange a room and swap its contents at runtime using ScriptableObject templates. They didn't need to write networking code to customize a space. Spatial audio, avatars, and shared objects gave people ways to interact beyond standing in a circle and talking.

## Building for hosts

I built the in-headset editor and moderation controls, along with the networking and interaction systems. Keeping those tools inside VR meant hosts could change a room while they were in it.

I also published creator guidelines and ran a monthly submission process to bring community-built rooms into the store build. Open-sourcing the project let educators and hobbyists fork it for their own spaces.

## What I kept small

Room size and scene complexity were deliberate limits. More visual detail wasn't worth making a conversation harder to follow.

Poly Space became a place to try changes to networking, interactions, and moderation, then see how they affected a small group. Those experiments gave me practical experience I later brought to larger social platforms.