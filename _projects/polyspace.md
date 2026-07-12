---
layout: project
weight: 8
title: 'Poly Space VR'
description: >
  Built and open-sourced a social VR app for small groups, then released it on the Oculus PC VR store.
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
Poly Space VR is an open-source app for small social VR rooms. I built it because large public worlds felt noisy and enterprise tools felt too much like work. The app was released on the Oculus PC VR store, now part of the Meta store.

## Problem

I wanted a place for a few friends to talk, study, or host a small event without entering a huge public world. The room still needed enough tools and personality to feel like a place, not another video meeting.

I capped the scope around small groups so I could focus on reliable synchronization and rooms that hosts could customize.

## Product strategy

I used low-poly models and baked lighting to keep scene costs down. GPU instancing handled repeated objects without dragging down the framerate on Oculus PC VR hardware. ScriptableObject templates let creators rearrange a room and swap its contents without touching networking code. Avatars and spatial audio made people feel present, while shared objects gave them something to do together.

## My role

- Took the project from the first concept through its store release.
- Implemented Photon networking to keep voice chat, avatar poses, and interactables synchronized for up to eight participants.
- Built the in-headset world editor, creator tools, and basic moderation controls for hosts.

## Key tradeoffs

I chose stable framerate over visual detail and kept scene complexity low. Rooms supported small groups because reliable synchronization mattered more than a high participant count. I also open-sourced the code while keeping simple host controls such as mute, soft kick, and invite lists.

## Outcomes

- Educators and hobbyists could fork the project and host their own Poly Spaces.
- I published creator guidelines and a monthly submission process for choosing a community room for the store build.
- We used the app for internal sessions at Holos, which gave me a place to test networking and social interaction ideas before applying them to professional work.

![Poly Space VR listing on the Oculus PC VR store](/assets/img/projects/screenshot-store.webp){:loading="lazy"}
{:.figcaption}

Poly Space VR became my test bed for networking, room-building tools, moderation,
and social presence. It was small enough that I could change the whole stack and
see how one decision affected the rest of the room. I carried that experience
into the larger social products I worked on later.
