---
layout: project
title: 'Project Virtualso'
caption: AI-powered VR coach for conversational interviews and presentations
description: >
  AI-powered VR rehearsal tool for interviews and presentations, combining reactive virtual agents, speech analysis, and expressive character animation.
date: '01-01-2020'
category: personal
image: 
  path: /assets/img/projects/virtualso.webp
  alt: Project Virtualso virtual interviewer with realistic facial expressions

---
Project Virtualso blends AI, natural language processing, and VR to create conversational humanoid agents that respond with expressive facial animation and body language. I used it as a proving ground for combining my communication-arts research with Unity engineering to help people rehearse high-stakes conversations.

## Problem

The project draws on my background in communication arts and VR to recreate the parts of practice that static scripts and webcam drills usually miss: timing, emotional cues, follow-up questions, and the pressure of responding in the moment.

During the COVID-19 lockdowns, many people lost access to in-person mentorship and rehearsal environments. I wanted to see whether VR agents could make interview and presentation practice feel more like a live exchange and less like a solo exercise.

## Training Modes

### Virtual Interview

Users practice interviews with a conversational agent that listens, asks follow-ups, and mirrors emotion through facial expressions and gestures—powered by intent classification and dialogue logic.

{% include pro/project-video.html id="I1RIFirZeaQ" title="Virtual Interview AI Agent Demonstration" %}

### Virtual Presentation

Presenters deliver slides in front of a virtual audience of agents that react in real time. The simulation helps people manage stage anxiety and was piloted with professionals across multiple companies, with positive qualitative feedback.

## My Role

- Designed and built the Unity experience, including scenario flow, dialogue logic, telemetry capture, and character behavior.
- Integrated Azure Cognitive Services for speech-to-text and connected it to a lightweight NLP pipeline that tracks confidence, pacing, tone, and topic shifts.
- Built the facial animation and gaze system so the agents could respond with enough expressiveness to feel useful without drifting into obviously canned behavior.

## Key Design Decisions

- Used intent classification and guided dialogue branches instead of fully open-ended generation so the interviewer could stay responsive, coachable, and easier to evaluate.
- Treated facial animation as feedback, not decoration. The agents needed to communicate attention, confusion, or encouragement clearly enough to shape user behavior.
- Built a scenario editor so coaches could script question banks, difficulty curves, and success criteria without touching code, which made the prototype more useful for real training conversations.

## Validation

- Shared prototypes with career-coaching nonprofits to explore how mixed reality role-play could shorten prep time for job seekers.
- Piloted the presentation mode with professionals across multiple companies and used the sessions to refine what kinds of audience reactions actually helped rather than distracted.
- Captured telemetry on pacing, filler-word frequency, and confidence markers that later influenced how I think about coaching analytics and onboarding feedback loops more broadly.

{% include pro/project-video.html id="3KgdJZlMepo" title="Virtual Public Speaking Training Demonstration" %}
