---
layout: project
title: 'Kitchen Kraving'
description: >
  Fast-paced VR kitchen sim developed at Carnegie Mellon ETC where I led interactions and shipped on the Oculus Store.
date: '01-01-2015'
image: 
  path: /assets/img/projects/kitchen.webp
  alt: Kitchen Kraving VR game screenshot showing virtual kitchen environment
links:
  - title: GitHub
    url: https://github.com/jackyangzzh/KitchenKraving

---
Kitchen Kraving is a frantic VR kitchen sim I built at Carnegie Mellon with a small team of artists, programmers, and sound designers. It was my first shipped title and an early lesson in how to make fast, physical interactions feel readable and fun inside VR.

## Problem

Cooking games are naturally tactile and chaotic, which makes them a good fit for VR, but that same chaos can also make them hard to read. Our challenge was to build a fast-paced kitchen game where players could juggle orders, tools, and movement under pressure without the interaction model turning into noise.

Because we were targeting Oculus Rift DK2-era hardware, the design also had to stay performance-conscious. The game needed to feel playful and reactive while still holding framerate and keeping interactions clear.

## Core Loop

- Players juggle multiple recipes, prep stations, and plating timers under constant time pressure.
- A mischievous twist lets you sneak bites of food to keep stamina up, but you risk getting caught by the boss during surprise inspections.
- Haptic cues, spatial audio, and exaggerated hand animations keep the experience playful even when the kitchen chaos escalates.

## My Role

- Led interaction design and gameplay implementation as part of a small interdisciplinary ETC team.
- Programmed VR interactions, tactile feedback, and gesture recognizers that determine whether food is being prepped or secretly eaten.
- Built the kitchen state machine that orchestrates orders, timers, boss check-ins, and scoring—ensuring the pace scales with the player's proficiency.
- Collaborated with artists on shader tuning and lighting passes to maintain 90 FPS on Oculus Rift DK2 hardware.

## Key Design Decisions

- Used exaggerated feedback, strong audio cues, and clear object affordances so players could recover quickly when the kitchen got hectic.
- Treated gesture recognition as a gameplay tool rather than a tech demo; the important thing was not realism, but whether actions felt fair, fast, and legible under pressure.
- Tuned the pacing system so difficulty came from overlapping tasks and surprise interruptions, not from imprecise controls.

## Outcome

- Demoed during Carnegie Mellon ETC showcases and later published on the Oculus Store as a free download for Rift DK2 owners.
- Gave me hands-on experience designing for VR ergonomics, feedback timing, and performance budgets long before those constraints became part of my day-to-day professional work.

{% include pro/project-video.html id="Gw54KtgTQhQ" title="Kitchen Kraving VR Game Gameplay Trailer" %}
