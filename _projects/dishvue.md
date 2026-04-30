---
layout: project
title: 'DishVue'
description: >
  Multi-platform digital menu that captures real dishes as 3D models on iOS and lets diners explore them in volumetric space on Apple Vision Pro.
date: '01-01-2024'
category: personal
image: 
  path: /assets/img/projects/DishVue.webp
  alt: DishVue product hero showing a 3D-scanned otoro nigiri inside a liquid-glass volumetric window with the DishVue wordmark
links:
  - title: Demo
    url: https://youtu.be/7XZIU8AK3w0

---
DishVue is a digital-menu system I built to replace flat food photos with scanned 3D dishes that travel across iPhone, iPad, Apple Vision Pro, and the web. Restaurants capture each dish once with their phone, and diners pick it up, rotate it, and place it on the table in front of them.


{% include pro/project-video.html id="7XZIU8AK3w0" title="DishVue Spatial Menu Demo" %}

## Problem

Menu photography is the lowest-fidelity part of most dining experiences. Static 2D images undersell texture, portion size, and plating, while existing AR menu tools tend to be heavy, vendor-locked, or disconnected from how restaurants actually update their menus.

I wanted to see how far I could push a small team workflow: a single content pipeline where a restaurant scans a dish on their phone, the model immediately syncs to a shared backend, and customers see it on whatever device they happen to be on—including a Vision Pro headset placed at the table.

## What I Built

DishVue ships as three clients tied to one Firebase backend:

- **iOS / iPadOS (admin + customer).** A SwiftUI app with an admin toggle that swaps a read-only menu for a CRUD form. Admins capture dishes in-app via Apple's Object Capture (wrapped in the `USDZScanner` Swift Package), watch USDZ + thumbnail uploads stream into Firebase Storage with live progress, and preview the result through AR Quick Look via `SFSafariViewController`.
- **visionOS.** A volumetric experience that opens each dish in its own `WindowGroup(id: "item")` with `.windowStyle(.volumetric)` and a 0.6 m default volume. A `RealityView` loads the remote USDZ; a drag gesture rotates the dish on the Y axis, a magnify gesture scales it between 1.0× and 1.5×. Diners can also drag a dish straight out of the menu list into their space using `NSItemProvider` with an on-device USDZ cache so the same model never re-downloads.
- **Web (React).** A lightweight browse client for diners on non-Apple devices, reading from the same Firestore collection.

## Key Decisions

- **Treat 3D capture as part of the content workflow, not a separate tool.** Admins scan a dish in the same screen where they edit its name, price, and course. The scanner is just another input next to the text fields.
- **One schema, three clients, no custom server.** Sticking to Firestore + Storage meant I could ship a real spatial app without standing up a backend—every client subscribes to the same data and renders it natively.
- **Volumetric windows over full immersion on Vision Pro.** A spatial menu only works if it sits next to the rest of your environment. Using volumetric `WindowGroup`s instead of an `ImmersiveSpace` keeps DishVue feeling like a tabletop menu rather than a takeover experience.
- **Gesture grammar matched to the object.** Rotation is locked to the Y axis so diners can spin a plate without flipping their food upside down, and scaling is capped at 1.5× to prevent the model from blowing past the volume bounds.

## Reflection

DishVue pushed me through the parts of spatial computing that don't show up in demos: shared data models across SwiftUI targets, Object Capture's content quirks, and the discipline of designing for restraint on visionOS. The biggest takeaway was how much spatial UX benefits from *less*—a calm volumetric window with two well-tuned gestures reads as far more polished than an immersive scene fighting for attention.