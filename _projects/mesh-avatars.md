---
layout: project
weight: 1
title: 'Microsoft Mesh & Avatars for Teams'
description: >
  My work on the shared UI, avatar editor, and rendering systems behind Microsoft Mesh and Avatars in Teams.
date: '2022-06-01'
end_date: '2024-09-01'
category: professional
image:
  path: /assets/img/projects/mesh-avatars.webp
  alt: Microsoft Mesh immersive event with avatars gathered around a shared presentation
links:
  - title: Immersive events in Teams
    url: https://support.microsoft.com/en-us/teams/meetings/get-started-with-immersive-events-in-microsoft-teams
  - title: Avatars in Teams
    url: https://support.microsoft.com/en-us/office/customize-your-avatar-in-microsoft-teams-be6a9703-f03d-4eb5-9908-995fdc5c91a8

---
I worked on Microsoft Mesh and Avatars for Teams from June 2022 to September 2024. My focus was the shared UI, avatar editor, and rendering systems. The goal was to let someone use the same avatar in a Teams meeting, a desktop immersive event, or VR without it feeling like a different character each time.

{% include pro/project-video.html id="fSKBHOWOcSM" title="Microsoft Mesh" %}
{% include pro/project-video.html id="Pk5BVxlKL5w" title="Avatars in Microsoft Teams" %}

## One avatar, several runtimes

We wanted to bring more body language and a sense of shared space into meetings. That still had to work on an ordinary laptop, not just a dedicated headset.

A small meeting tile, a crowded desktop event, and a Quest session have very different performance budgets and input models. Getting the same avatar to look and move consistently across them was harder than any single 3D scene.

## What I worked on

### Cross-platform UI (UXTools)
I contributed to the shared UI toolkit used across desktop, web-hosted surfaces, and VR clients. I designed components for both 2D pointer input and 3D hand and controller input, so other teams could reuse our theming, accessibility, focus, and input-routing patterns rather than rebuild them.

### Avatar customization
I built the main editor for bodies, faces, hair, outfits, and accessories, working with design and art teams. We needed enough choice for people to represent themselves without making the first visit overwhelming. I also tuned loading and asset swaps to keep the live preview responsive within the memory limits of lower-end hardware.

### Rendering and delivery
My work also covered avatar definitions, modular asset assembly, animation updates, and state synchronization between clients. I profiled CPU and GPU frame times across HoloLens, Quest, web, and desktop, then used level-of-detail switching and GPU instancing to stay within their different frame budgets.

## What stayed with me

I came to Mesh interested in graphics. I left with much more respect for the things people only notice when they break: input routing, asset budgets, localization, and accessibility. In a crowded event, small costs add up. That attention to reliability still shapes the AI systems I work on today.