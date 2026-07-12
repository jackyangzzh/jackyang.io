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
Project Virtualso is a set of VR coaches for interview and presentation practice. The characters listen and respond through dialogue, facial animation, gaze, and body language. It was one of my first attempts to combine what I studied in Communication with what I was building in Unity.

## Problem

Scripts and webcam drills miss the uncomfortable parts of live practice: timing, follow-up questions, emotional reactions, and the pressure to answer on the spot. I wanted to see whether a virtual character could bring some of that pressure into a repeatable exercise.

During the COVID-19 lockdowns, in-person coaching and rehearsal became harder to access. That made the experiment more relevant, especially for people preparing alone.

## Training modes

### Virtual interview

The interview coach listens, asks follow-up questions, and reacts with facial expressions and gestures. Intent classification and dialogue rules decide what it says next.

{% include pro/project-video.html id="I1RIFirZeaQ" title="Virtual Interview AI Agent Demonstration" %}

### Virtual presentation

The presentation mode puts the speaker in front of a virtual audience that reacts during the talk. I tested it with professionals from several companies. Their feedback led me to tone down distracting reactions, make attention and confusion easier to read, and improve the feedback shown after a session.

## What I built

- Built the Unity experience, scenario flow, dialogue rules, telemetry, and character behavior.
- Connected Azure Cognitive Services speech recognition to an NLP pipeline that tracks confidence, pacing, tone, and topic changes.
- Built facial animation and gaze responses. The goal was enough expression to communicate attention without making every reaction feel canned.

## Key design decisions

I used intent classification and guided branches rather than open-ended generation. That kept the interviewer responsive and made each session easier to evaluate. Facial animation carried feedback, so attention or confusion had to be readable without becoming theatrical. I also built a scenario editor for question banks, difficulty, and success criteria so a coach could change an exercise without editing code.

## Validation

- Shared prototypes with career coaching nonprofits to see whether role-play could give job seekers more practice.
- Tested the presentation mode with professionals from several companies, then adjusted audience behavior and session pacing from their feedback.
- Captured pacing, filler word frequency, and confidence signals. I treated that data as an aid to human coaching, not a replacement for it.

These were exploratory pilots, not a controlled outcome study. Subtle reactions
worked best. Anything too theatrical felt fake and quickly pulled attention
away from the speaker.

{% include pro/project-video.html id="3KgdJZlMepo" title="Virtual Public Speaking Training Demonstration" %}

Virtualso was my first serious attempt at a problem I still work on: how can an
AI join a live conversation without taking it over?
