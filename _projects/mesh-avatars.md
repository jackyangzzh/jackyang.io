---
layout: project
weight: 1
title: 'Microsoft Mesh & Avatars for Teams'
description: >
  Work across the full Avatars stack and shared UI for Microsoft Mesh and Teams, spanning mobile, desktop, and AR/VR devices.
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
I worked on Microsoft Mesh and Avatars for Teams from June 2022 to September 2024, across the **full Avatars stack and shared UI on mobile, desktop, and AR/VR devices**. My work connected how people create their avatar, how it looks and moves, and how they interact with the surrounding interface.

Microsoft Mesh later evolved into **[Teams Immersive](https://www.microsoft.com/en-us/microsoft-teams/immersive)**. This case study covers my work on the earlier Mesh and Avatars generation; the diagrams use Microsoft's current product imagery to illustrate the engineering concepts.

{% include pro/project-video.html id="fSKBHOWOcSM" title="Microsoft Mesh" %}

## One avatar, several runtimes

We wanted to bring more body language and a sense of shared space into meetings. Someone should be able to recognize the same person in a Teams meeting tile, a desktop immersive event, or VR.

Those experiences have **different performance budgets and input models**. A small meeting tile emphasizes the face; a crowded 3D space adds many moving characters; a headset adds stereoscopic rendering. The challenge was keeping identity and behavior consistent while adapting to each surface. My mobile work was part of that broader Avatars and shared UI scope; the available product features varied by client.

{% include pro/project-video.html id="Pk5BVxlKL5w" title="Avatars in Microsoft Teams" %}

## An editor with a responsive preview
I built the **main editor for bodies, faces, hair, outfits, and accessories**, working with design and art teams. We needed enough choice for people to represent themselves without making the first visit overwhelming. I also tuned loading and asset swaps to **keep the live preview responsive** within the memory limits of lower-end hardware.

That preview connected the UI to the avatar pipeline. Consider someone choosing three outfits quickly: their selections arrive in order, but asset loads may finish out of order. The latest choice must remain the source of truth, even if an earlier request completes later. Meanwhile, the old and new assets can briefly overlap in memory. Responsiveness depends on both getting the right result and controlling the cost of reaching it.

The same distinction matters when the catalog changes. Saved appearance choices have to remain meaningful as assets and color options evolve. Microsoft's [May 2024 release notes](https://github.com/MicrosoftDocs/mesh-docs/blob/d5976881449234d9a9f436a6b51d92e82cae097d/mesh/Resources/avatars-release-notes.md) describe a wardrobe refresh that changed some clothing colors. The editor is part of a continuing content lifecycle, not just a one-time character creator.

<figure>
<img src="/assets/img/projects/mesh-avatars-outfit-selection.webp" srcset="/assets/img/projects/mesh-avatars-outfit-selection-480.webp 480w, /assets/img/projects/mesh-avatars-outfit-selection-720.webp 720w, /assets/img/projects/mesh-avatars-outfit-selection-960.webp 960w, /assets/img/projects/mesh-avatars-outfit-selection-1440.webp 1440w, /assets/img/projects/mesh-avatars-outfit-selection.webp 1694w" sizes="(min-width: 86em) 52rem, (min-width: 54em) 46rem, (min-width: 42em) 40rem, 100vw" alt="Microsoft Teams avatar builder showing the Choose an outfit step on a large screen behind Satya Nadella during a Microsoft presentation" loading="lazy" decoding="async" width="1694" height="948">
<figcaption class="figcaption">The outfit-selection page I built for Teams avatar customization, shown by Satya Nadella (Microsoft CEO) at Ignite. <a href="https://youtu.be/FZhbJZEgKQ4?si=-ymHCWmR4zGCshEm&amp;t=2703">Watch the segment at 45:03</a>.</figcaption>
</figure>

## Identity, expression, and presentation

My work covered **avatar definitions, modular asset assembly, customization, animation, state synchronization, and rendering**. These systems had to agree on the person being represented, even as the presentation changed between devices.

It helps to separate three lifecycles. **Appearance** is the person's chosen body, face, hair, clothing, and accessories. **Expression** changes during a conversation. **Presentation** is the geometry, materials, animation, and level of detail the current device can afford. Changing the presentation should preserve the identity someone chose.

Expression also has more than one source. Microsoft's research team [described shipping voice-driven movement into Teams avatars and Mesh in June 2024](https://www.microsoft.com/en-us/research/people/coskerdarren/). A speaking animation and a deliberately selected reaction carry different kinds of intent. An outfit persists beyond the meeting; a reaction belongs to a moment. State synchronization has to respect those lifetimes, especially when someone joins partway through a session.

{% include pro/diagram.html
  src="/assets/img/projects/mesh/01-avatar-scope.svg"
  mobile="/assets/img/projects/mesh/01-avatar-scope-mobile.svg"
  height="800"
  mobile_height="1252"
  title="One person, three kinds of state"
  alt="Microsoft Teams Immersive avatars alongside three conceptual responsibilities: persistent appearance, temporary expression, and device-specific presentation."
  caption="A conceptual model of avatar responsibilities. Product imagery: <a href='https://www.microsoft.com/en-us/microsoft-teams/immersive'>Microsoft Teams Immersive</a>."
%}

## Shared UI across touch, desktop, and XR

I worked on **UXTools, the shared UI toolkit**, across mobile, desktop, web-hosted surfaces, and AR/VR clients. That included reusable components for **touch, pointer, keyboard, hand, and controller input**, along with common patterns for theming, accessibility, focus, and input routing.

Choosing an outfit should mean the same thing whether someone taps a screen, clicks a control, or selects it in 3D. The shared contract is the action and its state: which item is selected, which control has focus, whether an action is available, and what feedback follows activation. The device determines how someone reaches that action.

A pointer can hover before clicking. Touch needs a usable target without hover. Keyboard navigation needs a predictable focus order. Hands and controllers need targeting and feedback that remain legible in space. Reusable controls have to carry those differences through selection, disabled states, and focus transitions. This is why shared UI work extends beyond matching the appearance of a button.

{% include pro/diagram.html
  src="/assets/img/projects/mesh/02-shared-interaction.svg"
  mobile="/assets/img/projects/mesh/02-shared-interaction-mobile.svg"
  height="800"
  mobile_height="1252"
  title="Different input, same intent"
  alt="Touch, pointer and keyboard, and hands and controllers feed shared focus, selection, activation, feedback, and accessibility behavior. A Microsoft Teams Immersive scene illustrates avatar expression."
  caption="Conceptual input flow across the devices I worked on. Product imagery: <a href='https://www.microsoft.com/en-us/microsoft-teams/immersive'>Microsoft Teams Immersive</a>."
%}

## Rendering within the whole experience

I profiled **CPU and GPU frame times** across HoloLens, Quest, web, and desktop, and worked on **level-of-detail switching and GPU instancing**. The avatar shared its budget with the environment, interface, and other participants. Small costs became much more visible in a crowded event.

The useful questions differ by bottleneck. On the CPU, animation, scene updates, and draw submission compete for time. On the GPU, geometry, skinning, shading, and stereo rendering contribute to the cost. Memory includes resident assets and temporary overlap during loading. A smooth idle scene can still hitch when someone joins or swaps an outfit, so steady rendering and transitions both matter.

Microsoft's [2024 Mesh performance guidance](https://github.com/MicrosoftDocs/mesh-docs/blob/d5976881449234d9a9f436a6b51d92e82cae097d/mesh/develop/debug-and-optimize-performance/performance-guidelines.md) targeted **72 fps on Quest**, leaving about **13.9 milliseconds for an entire frame**. That published platform target sets the scale of the constraint: avatars share that time with the rest of the scene and UI.

Level of detail is also a continuity problem. Reducing distant detail saves work, but an obvious transition can interrupt someone's sense of the person in front of them. The [July 2024 avatar release notes](https://github.com/MicrosoftDocs/mesh-docs/blob/d5976881449234d9a9f436a6b51d92e82cae097d/mesh/Resources/avatars-release-notes.md) record a fix for aggressive visual-quality popping, especially on Quest—a public example of the fidelity and stability tradeoff.

{% include pro/diagram.html
  src="/assets/img/projects/mesh/03-frame-budget.svg"
  mobile="/assets/img/projects/mesh/03-frame-budget-mobile.svg"
  height="800"
  mobile_height="1252"
  title="The avatar shares the frame"
  alt="A Microsoft Teams Immersive scene with many avatars illustrates the shared CPU, GPU, and memory demands. The historical 2024 Mesh Quest target of 72 frames per second allows approximately 13.9 milliseconds per frame."
  caption="Historical Mesh frame target, illustrated with a current Teams Immersive scene. Conceptual cost categories. Product imagery: <a href='https://www.microsoft.com/en-us/microsoft-teams/immersive'>Microsoft Teams Immersive</a>."
%}

## Keeping the experience consistent after launch

I supported **weekly avatar and editor releases in more than 20 languages**. A shared component change can affect several clients, input methods, themes, and translated layouts at once. Accessibility belongs in that same interaction contract: users need to reach a control, understand its state, and operate it with their input method. Microsoft's [June 2024 release notes](https://github.com/MicrosoftDocs/mesh-docs/blob/d5976881449234d9a9f436a6b51d92e82cae097d/mesh/Resources/avatars-release-notes.md) include a keyboard-navigation fix for avatar customization sliders, a concrete example of how small control behavior affects the whole editing flow.

## What stayed with me

I came to Mesh interested in graphics, and I left with much more respect for the things people only notice when they break: **input routing, asset budgets, localization, and accessibility**. In a crowded event, every small cost gets multiplied by the number of people in the room. That attention to reliability still shapes the AI systems I work on today.
