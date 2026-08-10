---
layout: project
weight: 4
title: 'Project Virtualso'
description: >
  Built VR coaches for interview and presentation practice using speech recognition, guided dialogue, facial animation, and gaze.
date: '01-01-2020'
category: personal
image: 
  path: /assets/img/projects/virtualso.webp
  alt: Project Virtualso interview simulation with a virtual interviewer in an office
links:
  - title: Interview demo
    url: https://www.youtube.com/watch?v=I1RIFirZeaQ
  - title: Presentation demo
    url: https://www.youtube.com/watch?v=3KgdJZlMepo

---
Project Virtualso is a set of VR coaches for interview and presentation practice. Because I was studying Communication while building in Unity, this was one of my first real attempts to practically combine the two fields.

## The problem

I have always found that standard scripts and webcam drills completely miss the most uncomfortable parts of live practice: dealing with timing, fielding unexpected follow-up questions, reading emotional reactions, and handling the raw pressure to answer on the spot. 

Even though standard video recordings let you check your posture, I suspected that only an interactive virtual character could actually simulate the psychological pressure of a real conversation. Since the COVID-19 lockdowns made in-person coaching much harder to access, I decided to test this hypothesis by building a repeatable VR exercise for people preparing alone.

## Training modes

### Virtual interview

The interview coach actually listens to your answer, parses intent, asks appropriate follow-up questions, and reacts with facial expressions. 

{% include pro/project-video.html id="I1RIFirZeaQ" title="Virtual Interview AI Agent Demonstration" %}

### Virtual presentation

In this mode, you stand in front of a virtual audience that dynamically reacts while you speak. When I first built this, I assumed that highly expressive audience reactions would be the best way to give the speaker feedback. However, when I tested it with actual professionals, they immediately pointed out that the reactions were far too distracting. Based on their feedback, I significantly toned down the overall body language so that attention and confusion were readable but not theatrical.

## What I built

- Built the entire Unity experience, encompassing scenario flow, dialogue logic, telemetry, and character behaviors.
- Connected Azure Cognitive Services speech recognition directly into a custom NLP pipeline that tracks the speaker's confidence, pacing, tone, and topical shifts in real time.
- Implemented facial animation and gaze systems to give the virtual characters a sense of presence.

## Key design decisions

While open-ended generative AI was an option, I strictly used intent classification and guided dialogue branches instead. Because open generation often becomes unpredictable, using a guided model ensured that the interviewer remained responsive while keeping the evaluation criteria concrete and measurable. 

Since I did not want coaches to have to edit code just to change an exercise, I also built a scenario editor that lets them easily modify question banks, difficulty curves, and success metrics.

## Validation

- I shared working prototypes with professional career coaching nonprofits to explore whether role-play could give job seekers more accessible practice.
- After testing the presentation mode, I captured pacing, filler word frequency, and confidence signals.
- Importantly, I purposely treated this data as an aid for human coaching instead of a replacement for it.

{% include pro/project-video.html id="3KgdJZlMepo" title="Virtual Public Speaking Training Demonstration" %}

Personally, Virtualso was a massive learning experience. I learned the hard way that anything too dramatic or theatrical feels immediately fake and completely ruins the speaker's immersion. Ultimately, this project became my first serious attempt at a design problem I still grapple with today: how can an AI join a live conversation without completely taking it over?