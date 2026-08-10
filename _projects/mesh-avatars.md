---
layout: project
weight: 1
title: 'Microsoft Mesh & Avatars for Teams'
description: >
  Helped build the UI, avatar editor, and real-time embodiment systems for Microsoft Mesh and Avatars in Teams, used by millions of people.
date: '01-01-2023'
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
I worked on Microsoft Mesh and Avatars for Teams from June 2022 to September 2024. Because we wanted users to have a consistent identity, a person could use the exact same avatar in a regular Teams meeting, a desktop immersive event, or VR. I primarily focused on the UI, the avatar editor, and the rendering systems that maintained that consistency across so many different devices.

{% include pro/project-video.html id="fSKBHOWOcSM" title="Microsoft Mesh" %}
{% include pro/project-video.html id="Pk5BVxlKL5w" title="Avatars in Microsoft Teams" %}

## The challenge

While video meetings clearly work, a grid of faces inevitably loses body language and any real feeling of being in a shared space. Even though we wanted to bring that sense of presence back into calls, the system still had to run reliably on ordinary laptops because of the steep performance expectations Teams customers have. 

I initially assumed the hardest part would be the immersive 3D events themselves. However, I found that making the same avatar look and move consistently in a tiny laptop meeting tile, a crowded desktop event, and a high-framerate Quest session was far more demanding. Those runtimes have wildly different performance budgets and input models.

## My specific contributions

### Cross-platform UI (UXTools)
Because we could not afford to rebuild interaction patterns for every single endpoint, I contributed heavily to the shared UI toolkit used across Teams desktop, web-hosted surfaces, and immersive VR clients. I designed component primitives to handle both 2D pointer input and 3D hand controller input seamlessly, meaning other Mesh surfaces could easily reuse our theming, accessibility, focus, and input routing patterns.

### Avatar customization
I built the main avatar editor for bodies, faces, hair, outfits, and accessories. Even though it is tempting to expose every technical slider, I worked closely with design and art teams to ensure the editor was clear for first-time users without stripping away the options people genuinely needed to represent themselves. I spent significant time tuning loading logic and asset swaps so that changes appeared instantly in the live preview without blowing past the memory limits on lower-end hardware.

### The avatar stack and delivery
I also worked deep in the stack to define how the system actually describes an avatar, assembles its modular assets, updates its animations, and synchronizes its state across completely different clients. Since these avatars run inside Teams meetings, I extensively profiled CPU and GPU frametimes across HoloLens, Quest, web, and desktop. Using LOD switching and aggressive GPU instancing, I helped maintain smooth framerates even on highly constrained devices. 

## The takeaway

Working on Mesh fundamentally changed my engineering priorities. I went in caring about graphics, but I came out realizing that the parts users rarely notice until they break, such as input routing, asset budgets, localization, and accessibility, are the actual product. Because small costs add up incredibly fast in crowded events, the core challenge was always optimization rather than feature sprawl. Personally, I still carry that intense focus on cross-device consistency and performance into the AI systems I build today.