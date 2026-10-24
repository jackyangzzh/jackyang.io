---
layout: project
weight: 1
title: 'Microsoft Mesh & Avatars for Teams'
description: >
  The shared UI framework every Mesh product team adopted, plus avatar editing and rendering across mobile, desktop, and AR/VR.
date: '2022-06-01'
end_date: '2024-09-01'
category: professional
image:
  path: /assets/img/projects/mesh-avatars.webp
  srcset:
    - [480, /assets/img/projects/mesh-avatars-480.webp]
    - [720, /assets/img/projects/mesh-avatars-720.webp]
    - [960, /assets/img/projects/mesh-avatars-960.webp]
    - [1440, /assets/img/projects/mesh-avatars-1440.webp]
    - [2560, /assets/img/projects/mesh-avatars.webp]
  alt: Microsoft Mesh immersive event with avatars gathered around a shared presentation
links:
  - title: Teams Immersive (formerly Mesh)
    url: https://www.microsoft.com/en-us/microsoft-teams/immersive
  - title: Avatars in Teams
    url: https://support.microsoft.com/en-us/office/customize-your-avatar-in-microsoft-teams-be6a9703-f03d-4eb5-9908-995fdc5c91a8

---
I worked on Microsoft Mesh and Avatars for Teams from June 2022 to September 2024, across the **full Avatars stack and shared UI on mobile, desktop, and AR/VR devices**. That covered how people create their avatar, how it looks and moves once they're in a meeting, and the interface around it.

Mesh has since become **[Teams Immersive](https://www.microsoft.com/en-us/microsoft-teams/immersive)**. Everything here is about the earlier Mesh and Avatars generation I worked on; the diagrams borrow Microsoft's current product imagery to illustrate it.

{% include pro/project-video.html id="fSKBHOWOcSM" title="Microsoft Mesh" %}

## One avatar, several runtimes

We wanted to bring more body language and a sense of shared space into meetings, and you should be able to recognize the same person whether they show up in a Teams meeting tile, a desktop immersive event, or VR.

The difficulty is that those experiences have very **different performance budgets and input models**. A meeting tile is mostly about the face. A crowded 3D event has many moving characters, and a headset adds stereo rendering. Therefore, the avatar had to adapt to each surface without turning into a different person. My mobile work sat inside that same Avatars and shared UI scope, though the features available varied by client.

{% include pro/project-video.html id="Pk5BVxlKL5w" title="Avatars in Microsoft Teams" %}

## An editor with a responsive preview

I built the **main editor for bodies, faces, hair, outfits, and accessories**, working with design and art teams. We needed enough choice for people to represent themselves without making the first visit overwhelming. I also tuned loading and asset swaps to **keep the live preview responsive** within the memory limits of lower-end hardware.

The preview is where the UI meets the avatar pipeline. Say someone clicks through three outfits quickly. The clicks arrive in order, but the asset loads may not finish in order, so the latest choice has to win even when an earlier load lands after it. Meanwhile, the old and new assets sit in memory together for a moment.

The catalog also keeps changing after launch, and a saved avatar has to still make sense when assets and colors change underneath it. Microsoft's [May 2024 release notes](https://github.com/MicrosoftDocs/mesh-docs/blob/d5976881449234d9a9f436a6b51d92e82cae097d/mesh/Resources/avatars-release-notes.md), for example, describe a wardrobe refresh that changed some clothing colors.

<figure>
<img src="/assets/img/projects/mesh-avatars-outfit-selection.webp" srcset="/assets/img/projects/mesh-avatars-outfit-selection-480.webp 480w, /assets/img/projects/mesh-avatars-outfit-selection-720.webp 720w, /assets/img/projects/mesh-avatars-outfit-selection-960.webp 960w, /assets/img/projects/mesh-avatars-outfit-selection-1440.webp 1440w, /assets/img/projects/mesh-avatars-outfit-selection.webp 1694w" sizes="(min-width: 86em) 52rem, (min-width: 54em) 46rem, (min-width: 42em) 40rem, 100vw" alt="Microsoft Teams avatar builder showing the Choose an outfit step on a large screen behind Satya Nadella during a Microsoft presentation" loading="lazy" decoding="async" width="1694" height="948">
<figcaption class="figcaption">The outfit-selection page I built for Teams avatar customization, shown by Satya Nadella (Microsoft CEO) at Ignite. <a href="https://youtu.be/FZhbJZEgKQ4?si=-ymHCWmR4zGCshEm&amp;t=2703">Watch the segment at 45:03</a>.</figcaption>
</figure>

## Three kinds of avatar state

My work covered **avatar definitions, modular asset assembly, customization, animation, state synchronization, and rendering**. All of them had to agree on who the avatar is, even when each device draws it differently.

I find it helpful to separate three kinds of state with different lifetimes. **Appearance** is what the person chose: body, face, hair, clothing, and accessories. **Expression** changes moment to moment during a conversation. **Presentation** is whatever geometry, materials, animation, and level of detail the current device can afford. A headset can drop to a lower level of detail, but it should never change the outfit someone picked.

Expression also comes from more than one place. Microsoft's research team [described shipping voice-driven movement into Teams avatars and Mesh in June 2024](https://www.microsoft.com/en-us/research/people/coskerdarren/), and a reaction is something the person picks on purpose. An outfit lasts beyond the meeting, but a reaction only matters for a moment. So someone who joins halfway through should see everyone's outfits right away, with no reason to replay a reaction from earlier.

{% include pro/diagram.html
  src="/assets/img/projects/mesh/01-avatar-scope.svg"
  mobile="/assets/img/projects/mesh/01-avatar-scope-mobile.svg"
  height="800"
  mobile_height="1252"
  title="One person, three kinds of state"
  alt="Microsoft Teams Immersive avatars alongside three conceptual responsibilities: persistent appearance, temporary expression, and device-specific presentation."
  caption="A conceptual model of avatar responsibilities. Product imagery: <a href='https://www.microsoft.com/en-us/microsoft-teams/immersive'>Microsoft Teams Immersive</a>."
%}

## One UI toolkit, five kinds of input

I engineered **UXTools, the shared UI framework** behind Mesh and Avatars in Teams, and it was **adopted by every Mesh product team**. It ran across mobile, desktop, web-hosted surfaces, and AR/VR clients, with reusable components for **touch, pointer, keyboard, hand, and controller input** and common patterns for theming, accessibility, focus, and input routing.

Choosing an outfit should mean the same thing whether someone taps it, clicks it, or reaches for it in 3D. So the part we shared across devices was the action and its state: what's selected, what has focus, whether the action is available, and what feedback comes after. The device only decides how someone gets there.

The differences show up in the details. A mouse can hover before clicking, but a finger can't, so touch targets have to work without hover. A keyboard user needs a predictable focus order, and a hand or controller in VR needs targets and feedback that stay readable in space. A shared control has to carry all of that through selection, disabled states, and focus changes. In my experience, that is most of the work; making a button look the same everywhere is the easy part.

{% include pro/diagram.html
  src="/assets/img/projects/mesh/02-shared-interaction.svg"
  mobile="/assets/img/projects/mesh/02-shared-interaction-mobile.svg"
  height="800"
  mobile_height="1252"
  title="Different input, same intent"
  alt="Touch, pointer and keyboard, and hands and controllers feed shared focus, selection, activation, feedback, and accessibility behavior. A Microsoft Teams Immersive scene illustrates avatar expression."
  caption="Conceptual input flow across the devices I worked on. Product imagery: <a href='https://www.microsoft.com/en-us/microsoft-teams/immersive'>Microsoft Teams Immersive</a>."
%}

## Sharing a 13.9 ms frame

Microsoft's [2024 Mesh performance guidance](https://github.com/MicrosoftDocs/mesh-docs/blob/d5976881449234d9a9f436a6b51d92e82cae097d/mesh/develop/debug-and-optimize-performance/performance-guidelines.md) targeted **72 fps on Quest**, which leaves about **13.9 milliseconds for an entire frame**. The avatars never had that time to themselves. They shared it with the environment, the UI, and everyone else in the room.

I was a **key contributor to the avatar rendering and performance pipeline**. I profiled CPU and GPU frame times across HoloLens, Quest, web, and desktop, and worked on **level-of-detail switching and GPU instancing**. Where the time goes depends on the bottleneck. On the CPU, it's animation, scene updates, and draw submission. On the GPU, it's geometry, skinning, shading, and stereo rendering. Memory matters too, especially the moment when old and new assets overlap during a load. That is why a scene can run smoothly at idle and still hitch when someone joins or swaps an outfit.

Level of detail has its own catch. Dropping detail on distant avatars saves time, but if the switch is visible, the person you're looking at suddenly pops. The [July 2024 avatar release notes](https://github.com/MicrosoftDocs/mesh-docs/blob/d5976881449234d9a9f436a6b51d92e82cae097d/mesh/Resources/avatars-release-notes.md) list a fix for exactly that: aggressive visual-quality popping, especially on Quest.

{% include pro/diagram.html
  src="/assets/img/projects/mesh/03-frame-budget.svg"
  mobile="/assets/img/projects/mesh/03-frame-budget-mobile.svg"
  height="800"
  mobile_height="1252"
  title="The avatar shares the frame"
  alt="A Microsoft Teams Immersive scene with many avatars illustrates the shared CPU, GPU, and memory demands. The historical 2024 Mesh Quest target of 72 frames per second allows approximately 13.9 milliseconds per frame."
  caption="Historical Mesh frame target, illustrated with a current Teams Immersive scene. Conceptual cost categories. Product imagery: <a href='https://www.microsoft.com/en-us/microsoft-teams/immersive'>Microsoft Teams Immersive</a>."
%}

## Shipping every week

I supported **weekly avatar and editor releases in more than 20 languages** for millions of users. With a shared toolkit, one component change can reach several clients, input methods, themes, and translated layouts in the same release. Accessibility is part of that same contract: people need to reach a control, understand its state, and operate it with whatever input they have. Microsoft's [June 2024 release notes](https://github.com/MicrosoftDocs/mesh-docs/blob/d5976881449234d9a9f436a6b51d92e82cae097d/mesh/Resources/avatars-release-notes.md) include a keyboard-navigation fix for the avatar customization sliders, and a slider you can't reach by keyboard makes part of the editor unusable for someone who relies on one.

## What stayed with me

I came to Mesh interested in graphics, and I left with much more respect for the things people only notice when they break: **input routing, asset budgets, localization, and accessibility**. In a crowded event, every small cost gets multiplied by the number of people in the room. That attention to reliability still shapes the AI systems I work on today.
