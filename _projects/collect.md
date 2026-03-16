---
layout: project
title: 'Collect'
description: >
  Co-founded and led product for a minimalist platform that helps people organize and share curated photo collections through an intuitive interface.
date: '01-01-2019'
image: 
  path: /assets/img/projects/collect.webp
  alt: Collect social media platform interface showing photo collections
links:
  - title: Blog Post
    url: https://jackyangzzh.medium.com/the-making-of-collect-7b794d934cb4

---
Collect is a social platform I co-founded to help people curate and share visual experiences through a minimalist UI. I owned the Unity prototype and React front end, the Firebase/Firestore data model, and onboarding experiments that supported healthy early retention through the private beta.

## Problem

Most social products optimize for feeds, volume, and habitual scrolling. Collect started from a different product question: could sharing feel more intentional if the core unit was a curated collection rather than a stream of isolated posts?

We wanted something lightweight enough for everyday use, but structured enough that people could organize photos around a trip, theme, or mood without turning the experience into portfolio software.

## What We Built

- Guided capture flow that tags each upload with collection type, mood, and location metadata using lightweight ML and heuristics.
- Collaborative boards so friends can co-curate travel mood boards or inspiration decks in real time.
- Shareable public profiles with privacy presets that made it easy to show a subset of collections during portfolio reviews.

## My Role

- Co-founded the product, defined the UX direction, and built the Unity-based prototype before later porting the experience to React for faster iteration.
- Implemented photo ingestion, collection sorting, onboarding flows, and offline-first caching on top of Firebase and Firestore.
- Ran qualitative research sessions with photographers and designers to shape the roadmap, tighten the information architecture, and test monetization ideas.

## Key Product Decisions

- Kept collections as the primary object and the social graph as a secondary layer so the app felt calmer and more purposeful than a traditional feed product.
- Chose Firebase and Firestore to move quickly on auth, sync, and offline support, accepting that more customized ranking and analytics would come later if the beta proved out.
- Focused early onboarding on a small number of high-signal actions such as first upload, first collection, and first share rather than trying to launch with a broad feature surface.

## Outcomes

- Built an invite-only beta community and simple referral loop that generated steady organic usage without paid acquisition.
- Shared the product with maker communities, including Product Hunt, to gather structured feedback on the value proposition and onboarding friction.
- Even as an early-stage beta, the project gave me end-to-end product ownership experience across research, prototyping, engineering, and iteration, and sharpened how I think about social discovery and onboarding systems.

{% include pro/project-video.html id="KhcPTrxbY3s" title="Collect Social Media Platform Demo" %}
