---
layout: project
weight: 1
title: 'Microsoft Mesh & Avatars for Teams'
description: >
  The shared UI, avatar editor, and rendering systems I worked on for Microsoft Mesh and Avatars in Teams, shipped weekly in 20+ languages to millions of users.
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
I worked on Microsoft Mesh and Avatars for Teams from June 2022 to September 2024. My focus was the shared UI, avatar editor, and rendering systems, which shipped weekly in more than 20 languages to millions of users. The goal was to let someone use the same avatar in a Teams meeting, a desktop immersive event, or VR without it feeling like a different character each time.

{% include pro/project-video.html id="fSKBHOWOcSM" title="Microsoft Mesh" %}

## One avatar, several runtimes

We wanted to bring more body language and a sense of shared space into meetings. That had to work on an ordinary laptop as well as a headset.

A small meeting tile, a crowded desktop event, and a Quest session have different performance budgets and input models. Getting the same avatar to look and move consistently across them was harder than any single 3D scene.

{% include pro/project-video.html id="Pk5BVxlKL5w" title="Avatars in Microsoft Teams" %}

## What I worked on

### Cross-platform UI (UXTools)
I contributed to the shared UI toolkit used across desktop, web-hosted surfaces, and VR clients. I designed components for both 2D pointer input and 3D hand and controller input, so other teams could reuse our theming, accessibility, focus, and input-routing patterns instead of rebuilding them.

### Avatar customization
I built the main editor for bodies, faces, hair, outfits, and accessories, working with design and art teams. We needed enough choice for people to represent themselves without making the first visit overwhelming. I also tuned loading and asset swaps to keep the live preview responsive within the memory limits of lower-end hardware.

<figure>
<img src="/assets/img/projects/mesh-avatars-outfit-selection.webp" alt="Microsoft Teams avatar builder showing the Choose an outfit step on a large screen behind Satya Nadella during a Microsoft presentation" loading="lazy" width="1694" height="948">
<figcaption class="figcaption">The outfit-selection page I built for Teams avatar customization, shown by Satya Nadella (Microsoft CEO) at Ignite. <a href="https://youtu.be/FZhbJZEgKQ4?si=-ymHCWmR4zGCshEm&amp;t=2703">Watch the segment at 45:03</a>.</figcaption>
</figure>

### Rendering and delivery
I was a key contributor to the avatar rendering and performance pipeline, which covered avatar definitions, modular asset assembly, animation updates, and state synchronization between clients. I profiled CPU and GPU frame times across HoloLens, Quest, web, and desktop, then used level-of-detail switching and GPU instancing to stay within their different frame budgets.

## What stayed with me

I came to Mesh interested in graphics, and I left with much more respect for the things people only notice when they break: input routing, asset budgets, localization, and accessibility. In a crowded event, every small cost gets multiplied by the number of people in the room. That attention to reliability still shapes the AI systems I work on today.