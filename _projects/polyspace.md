---
layout: project
weight: 8
title: 'Poly Space VR'
description: >
  Built and open-sourced a social VR app that caps rooms at eight people to keep voice and avatar sync reliable, with an in-headset editor for hosts. Released on the Oculus PC VR store.
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
Poly Space VR is an open-source app for small social VR rooms that I released on the Oculus PC VR store. 

## The problem

Even though huge public VR worlds can be technically impressive, I always found them too noisy and chaotic for just hanging out with a few friends. On the other hand, enterprise meeting tools felt far too much like work. 

I initially assumed a successful social VR app needed to support massive crowds. However, I quickly realized that scaling up participant counts inherently sacrifices voice and pose synchronization quality on consumer connections. I decided to explicitly cap rooms at eight people because providing a reliable, lag-free session for a small group mattered substantially more to me than hosting a large, broken crowd.

## Product strategy

Because I needed to keep scene costs strictly down, I aggressively relied on low-poly models and baked lighting. Given the hardware constraints of PC VR users, I used GPU instancing to handle repeated objects without tanking the framerate. 

While I wanted creators to customize their own spaces, they should not have to write custom networking code to do so. Therefore, I built a system based on ScriptableObject templates that lets hosts entirely rearrange a room and swap out its contents at runtime. Spatial audio and detailed avatars made people feel physically present, while interactive shared objects gave them something to actually do together during a conversation.

## My role

- Took the project completely from the first concept through to its store release.
- Implemented the Photon networking backend, guaranteeing that voice chat, avatar poses, and physics interactables stayed perfectly synchronized for up to eight participants.
- Built an intuitive in-headset world editor along with essential moderation controls for room hosts.

## Reflection

Making definitive tradeoffs is hard. While it is always tempting to push visual fidelity higher, I strictly chose stable framerates over detail and intentionally kept scene complexity low. 

I also chose to fully open-source the codebase, meaning educators and hobbyists could freely fork the project to host their own private spaces. To support the community, I published creator guidelines and ran a monthly submission process where we selected community-built rooms to include in the official store build.

In another word, Poly Space VR became my personal test bed. It was constrained enough that I could rewrite the whole networking stack or adjust moderation tools and immediately see how that one decision affected the entire room's social dynamic. I still rely heavily on the networking and social presence lessons I learned here in the professional platforms I work on today.