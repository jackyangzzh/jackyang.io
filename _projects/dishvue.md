---
layout: project
weight: 3
title: 'DishVue'
description: >
  A 3D menu spanning iPhone, iPad, Apple Vision Pro, and the web. Scan a dish once, then let diners see it at table scale.
date: '01-01-2024'
category: personal
image: 
  path: /assets/img/projects/DishVue.webp
  alt: DishVue wordmark over a scanned 3D dish displayed in translucent spatial menu panels
links:
  - title: Demo
    url: https://youtu.be/7XZIU8AK3w0

---
I built DishVue to connect the whole process of making a 3D menu: scan a dish, publish it, and let someone see it on the table in front of them. The demo spans iPhone, iPad, Apple Vision Pro, and the web.

{% include pro/project-video.html id="7XZIU8AK3w0" title="DishVue Spatial Menu Demo" %}

## Beyond the menu photo

A photo can make a dish look appealing without telling you much about its size or texture. AR menus can help, but a separate publishing workflow gives restaurant staff another system to maintain.

I wanted staff to scan a dish on a phone and have the model appear in the same menu that diners browse. On Vision Pro, the dish could sit beside the table at its real scale rather than being another flat image.

## How it works

DishVue has three clients sharing one Firebase backend.

The iPhone and iPad app handles scanning, menu management, and AR previews. The visionOS app opens dishes in volumetric windows, with controls to rotate, scale, and drag-and-drop a plate. A React client makes the same menu available on the web.

## The decisions that mattered

- **Keep capture in the app.** I built the Apple clients in SwiftUI and wrapped Object Capture in the `USDZScanner` Swift Package. Staff can generate USDZ models and thumbnails locally without opening a separate tool.
- **Share the data model.** Menu records live in Firestore and model files in Firebase Storage. All three clients use the same schema, with upload progress and a local cache in the app.
- **Use a window, not a whole world.** The visionOS client uses `RealityView` and volumetric `WindowGroup`s. A menu belongs beside the table, not around the entire diner.
- **Constrain the gestures.** Dragging rotates a dish around its vertical axis so a plate can't flip upside down. Scaling stops at 1.5x to keep the model inside the window.

## What took the work

The spatial demo was the visible part. Most of the work went into shared state across SwiftUI targets, quirks in Object Capture output, and deciding which interactions to leave out.

DishVue worked better as a small window with a few predictable gestures than as a full immersive scene. That's the kind of spatial interface I like: useful without demanding all of your attention.