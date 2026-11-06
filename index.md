---
layout: home
title: "Software Engineer, AI Agents & Multimodal Systems"
description: >
  Jack Yang is a software engineer at Microsoft Teams AI building real-time multimodal
  agents for Microsoft 365 Copilot. Previously, he built avatar and XR systems for Microsoft Mesh.
# Link-preview card (1200×630): the hero headline, role and waveform.
image:
  path: /assets/img/og-card.png
  alt: "Jack Yang — Real-time AI for real conversations. Software Engineer, Microsoft Teams AI, Seattle."
twitter:
  card: summary_large_image
# Alt text for the portrait in About.
photo_alt: Jack Yang, Software Engineer at Microsoft Teams AI
redirect_from:
  - /about/

# The hero headline, one entry per line (inline Markdown allowed).
headline: Real-time AI for real conversations.
headline_lines:
  - "Real-time AI"
  - "for _real_"
  - "conversations."

# The sentence beside the photo under the headline.
intro: >
  I'm Jack Yang, a software engineer at Microsoft&nbsp;Teams&nbsp;AI<br>
  building real-time multimodal agents for Microsoft&nbsp;365&nbsp;Copilot.<br>
  Before that, I built avatar and XR systems for Microsoft&nbsp;Mesh.

# How many projects (by weight) get a card on the home page; the rest are listed.
featured_count: 3

# Quick facts beside the About text.
facts:
  - label: Now
    value: Software Engineer, Microsoft Teams AI
  - label: Before
    value: Microsoft Mesh, Holos
  - label: Studying
    value: M.S. in Computer Science (HCI), Georgia Tech
  - label: Based in
    value: Seattle

# Fig. 1 in the hero: an illustrated (not recorded) hiring sync, drawn as a
# waveform that visitors can scrub. Every line about Jack comes from
# _data/resume.yml, at the same claim level ("works on", "key contributor",
# "under review"): no invented praise. The agent stays quiet through short
# gaps and speaks only once the decision has been made and there's a real
# pause. Durations are in seconds;
# `who: agent` is drawn in the signal colour.
signal:
  label: >
    Illustration of a hiring conversation as an audio waveform. A hiring
    manager and an engineering lead discuss Jack Yang's work on Copilot in
    live Teams meetings. Once they decide to talk to him and there's a real
    pause, an AI agent notes the decision and the action item.
  caption: "An illustrated hiring sync: the agent waits for the decision, and a real pause, before it speaks."
  turns:
    - who: Hiring manager
      text: "Who’s shipped real-time AI?"
      dur: 4.4
    - pause: 0.4
      text: "Gap of 0.4 s: too short to take the turn"
    - who: Eng lead
      text: "Jack Yang. He works on Copilot in live Teams meetings."
      dur: 6.3
    - pause: 0.5
      text: "Gap of 0.5 s: still their conversation"
    - who: Hiring manager
      text: "Okay. Let’s talk to him."
      dur: 2.1
    - pause: 1.6
      text: "Pause of 1.6 s, decision made: room for the agent"
    - who: agent
      text: "Noted. Talk to Jack Yang. Book time with him. Owner: you."
      dur: 5.2
---
