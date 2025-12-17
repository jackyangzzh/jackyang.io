---
layout: project
title: 'PolySpaceVR'
caption: Open-source VR social platform for intimate group hangouts
description: >
  Lightweight, customizable VR social hub for small groups that I designed, engineered, and shipped on the Meta Quest Store.
date: '01-01-2021'
image: 
  path: /assets/img/projects/PolySpaceLogo.webp
  alt: PolySpaceVR logo featuring low-poly 3D environment design
links:
  - title: Meta Quest Store
    url: https://www.meta.com/experiences/pcvr/3258096647627881/?utm_source=yangjack.com&utm_medium=oculusredirect
  - title: GitHub
    url: https://github.com/jackyangzzh/Poly-Space-VR
sitemap: false

---
PolySpaceVR is a VR social platform purpose-built for intimate, customizable gatherings. I started the project to explore how lightweight networking, avatars, and spatial audio can make remote hangouts feel less like meetings and more like living-room conversations.

## Product Pillars

- **Comfortable performance:** Low-poly art direction, baked lighting, and GPU instancing keep framerate high on standalone Meta Quest devices.
- **Modular spaces:** Environment templates use ScriptableObjects so creators can remix layouts, props, and lighting without touching core code.
- **Social presence:** Customizable avatars, spatial audio falloff, and shared interactables (whiteboards, card tables, media surfaces) make small gatherings playful.

## Engineering Highlights

- Implemented Photon-based networking to keep voice chat, avatar poses, and interactables synchronized for up to eight participants.
- Built an in-headset world builder that lets hosts adjust lighting, prop placement, and seating arrangements before guests arrive.
- Added moderation hooks (mute, soft kick, invite lists) so facilitators can run workshops or study groups with minimal friction.

## Community Impact

- Open-sourced the project so educators and hobbyists can host their own Poly Spaces without vendor lock-in.
- Documented creator guidelines that supported monthly community drops on the store listing.
- Used the platform for internal dogfooding sessions at Holos and later as inspiration for intimacy-focused spaces inside Microsoft Mesh.

![PolySpaceVR on Meta Quest Store](/assets/img/projects/screenshot-store.webp){:loading="lazy"}
{:.figcaption}

## Inspiration

VRChat excels at serendipitous encounters but is less suited for focused hangouts or workshops. After mapping the social VR landscape, I realized there was no lightweight, small-group alternative—so I built one. Keeping the project open source ensures the community can extend the platform and co-create the spaces they want to inhabit.
