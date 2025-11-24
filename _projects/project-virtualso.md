---
layout: project
title: 'Project Virtualso'
caption: AI-powered VR coach for conversational interviews and presentations
description: >
  Training platform I prototyped that blends AI, NLP, and expressive virtual agents to rehearse interviews and public speaking
date: '01-01-2020'
image: 
  path: /assets/img/projects/virtualso.webp
  alt: Project Virtualso virtual interviewer with realistic facial expressions
sitemap: false

---
Project Virtualso blends AI, natural language processing, and VR to create conversational humanoid agents that respond with believable facial expressions and body language. I treated it as a proving ground for combining my communication-arts research with Unity engineering to help people rehearse high-stakes conversations.

## Inspiration

The build draws on my background in communication arts and VR to recreate nuanced human interactions. During the COVID-19 lockdowns, many people lost access to in-person mentorship, so I prototyped training simulations for job interviews and public speaking.

## Virtual Interview

Users practice interviews with a conversational humanoid that listens, asks follow-ups, and mirrors emotion through facial expressions and gestures powered by NLP intent classifiers.

<style>.embed-container { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; } .embed-container iframe, .embed-container object, .embed-container embed { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }</style><div class='embed-container'><iframe src='https://www.youtube.com/embed/I1RIFirZeaQ' frameborder='0' allowfullscreen title="Virtual Interview AI Agent Demonstration"></iframe></div>{:loading="lazy"}

## Virtual Presentation

Presenters deliver slides in front of a virtual audience of AI agents that react in real time. The simulation helps people manage stage anxiety and has been tested by professionals across multiple companies with consistently positive feedback.

## Under the Hood

- Real-time speech-to-text through Azure Cognitive Services feeds a lightweight NLP pipeline that classifies tone, confidence, and topic changes.
- Custom blendshape rig drives nuanced facial expressions and gaze behavior based on detected emotions, creating a feedback loop users can respond to.
- Scenario editor lets coaches script question banks, difficulty curves, and success criteria without editing code.

## Results

- Shared prototypes with career-coaching nonprofits to understand how mixed reality role-play could shorten prep for job seekers.
- Captured telemetry on pacing, filler-word frequency, and confidence markers that later influenced how I approach analytics inside Microsoft Mesh onboarding flows.

<style>.embed-container { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; } .embed-container iframe, .embed-container object, .embed-container embed { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }</style><div class='embed-container'><iframe src='https://www.youtube.com/embed/3KgdJZlMepo' frameborder='0' allowfullscreen title="Virtual Public Speaking Training Demonstration"></iframe></div>{:loading="lazy"}
