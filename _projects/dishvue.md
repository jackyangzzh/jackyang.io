---
layout: project
weight: 3
title: 'DishVue'
description: >
  Built a 3D menu for iPhone, iPad, Apple Vision Pro, and the web. Restaurants scan a dish once, and diners can inspect it at table scale.
date: '01-01-2024'
category: personal
image: 
  path: /assets/img/projects/DishVue.webp
  alt: DishVue wordmark over a scanned 3D dish displayed in translucent spatial menu panels
links:
  - title: Demo
    url: https://youtu.be/7XZIU8AK3w0

---
DishVue is a 3D menu I built for iPhone, iPad, Apple Vision Pro, and the web. A restaurant scans a dish with an iPhone and adds it to the menu. Diners can then rotate the model or place it on the table at a believable scale.


{% include pro/project-video.html id="7XZIU8AK3w0" title="DishVue Spatial Menu Demo" %}

## Problem

Menu photos do a poor job of showing texture, portion size, or plating. Many AR menu tools also use a separate publishing workflow, which gives restaurant staff another system to keep in sync.

I wanted one small system to handle the whole path. Staff scan a dish on a phone, the model syncs to the menu, and diners open it on whatever device they have. On Vision Pro, they can put it on the table in front of them.

## Product workflow

DishVue ships as three clients tied to one Firebase backend:

On iPhone and iPad, restaurant staff manage the menu and scan dishes in the same app. Diners can browse that menu and preview a dish in AR. The visionOS app opens each dish in a volumetric window, with controls for rotation, scale, and drag-and-drop placement. A React client gives people on other devices access to the same menu data.

## Technical implementation

- Built the Apple clients in SwiftUI. Object Capture, wrapped in the `USDZScanner` Swift Package, generates USDZ models and thumbnails.
- Stored menu records in Firestore and model files in Firebase Storage. The app shows upload progress and keeps a local cache.
- Used `RealityView` and volumetric `WindowGroup`s on visionOS. Drag rotates a dish only around its vertical axis; magnification is capped to keep the model within useful bounds.
- Built the React client against the same schema, so the web version did not need a separate content system or custom server.

## Key decisions

I kept scanning beside the ordinary menu fields for name, price, and course. Staff should not need a separate capture tool. Firestore and Storage gave all three clients one schema without requiring a custom server. On Vision Pro, I chose volumetric windows over full immersion because the menu belongs beside the table, not around the diner. Rotation stays on the vertical axis so a plate cannot flip upside down, and scale stops at 1.5x before the model leaves the window bounds.

## Reflection

The hard parts were not the demo moments. They were shared state across SwiftUI targets, the quirks in Object Capture output, and deciding what to leave out on visionOS. DishVue works better as a small window with a couple of predictable gestures than as a full immersive scene. I like spatial interfaces most when they know when to get out of the way.