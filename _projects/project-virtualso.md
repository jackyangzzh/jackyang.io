---
layout: project
weight: 4
title: 'Project Virtualso'
description: >
  VR interview and presentation coaches that listen, ask follow-up questions, and react through facial expressions and gaze.
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
I built Virtualso in 2020 while studying Communication and working in Unity. It was a way to bring those interests together: VR coaches that let people practice interviews and presentations with a character that responds to them.

## Practicing the uncomfortable parts

A script lets you rehearse an answer. A recording lets you review how you delivered it. Neither gives you an unexpected follow-up question or an audience reaction to deal with in the moment.

I wanted to see whether a virtual character could add some of that pressure to solo practice. COVID-19 lockdowns had also made in-person coaching harder to access, so a repeatable exercise felt worth exploring.

## Training modes

### Virtual interview

The interview coach uses speech recognition and intent parsing to respond to an answer, choose follow-up questions, and react with facial expressions.

{% include pro/project-video.html id="I1RIFirZeaQ" title="Virtual Interview AI Agent Demonstration" %}

### Virtual presentation

The presentation mode puts you in front of an audience that reacts as you speak. My first version made those reactions too expressive. Professionals who tried it found the audience distracting, so I toned down the body language. Attention and confusion needed to be readable without becoming a performance of their own.

## What I built

- Built the Unity experience, including scenario flow, dialogue logic, telemetry, and character behavior.
- Connected Azure Cognitive Services speech recognition to a custom NLP pipeline for pacing, tone, topic changes, and confidence-related signals.
- Implemented facial animation and gaze to make the characters feel attentive.
- Built a scenario editor so coaches could change question banks, difficulty, and success metrics without editing code.

## Keeping the conversation bounded

I used intent classification and guided dialogue branches rather than open-ended generation. That gave the interviewer room to respond while keeping the exercise and its evaluation criteria predictable.

## Testing and limits

I shared working prototypes with professional career-coaching nonprofits to explore whether this kind of role-play could make practice more accessible. Presentation tests captured pacing, filler-word frequency, and confidence-related signals. I treated those as prompts for a conversation with a human coach, not an objective verdict on someone's ability.

{% include pro/project-video.html id="3KgdJZlMepo" title="Virtual Public Speaking Training Demonstration" %}

The audience feedback stuck with me. A character didn't need bigger reactions to feel present; it needed reactions that fit the moment. That question of timing has followed me from VR coaches to the meeting agents I work on today.