---
layout: project
weight: 3
title: 'DishVue'
description: >
  A spatial-menu prototype connecting on-device dish capture, Firebase publishing, and 3D viewing on iPhone, iPad, and Apple Vision Pro.
date: '2024-01-01'
category: personal
image: 
  path: /assets/img/projects/DishVue.webp
  srcset:
    - [480, /assets/img/projects/DishVue-480.webp]
    - [720, /assets/img/projects/DishVue-720.webp]
    - [960, /assets/img/projects/DishVue-960.webp]
    - [1440, /assets/img/projects/DishVue-1440.webp]
    - [1672, /assets/img/projects/DishVue.webp]
  alt: DishVue wordmark over a scanned 3D dish displayed in translucent spatial menu panels
links:
  - title: Demo
    url: https://youtu.be/7XZIU8AK3w0

---
I built DishVue to connect the work behind a spatial menu: **scan a dish, publish its model, and let a diner inspect it**. The native prototype spans iPhone, iPad, and Apple Vision Pro, with separate experiments in browser-based 3D viewing.

{% include pro/project-video.html id="7XZIU8AK3w0" title="DishVue Spatial Menu Demo" %}

## Beyond the menu photo

A photo can make a dish look appealing without telling you much about its size or texture. AR menus can help, but a separate publishing workflow gives restaurant staff **another system to maintain**.

I wanted staff to capture and publish a dish from the same app, then let diners inspect it in a movable window beside the table.

## One menu record, several views

The SwiftUI apps share a menu model: Firestore holds names, prices, categories, and asset URLs; Firebase Storage holds USDZ models and thumbnails. Native snapshot listeners refresh the menu, while visionOS uses `Model3D` for cards and `RealityView` for the selected dish.

**The web path remains a prototype.** A Firebase-backed React menu exists, but the current entry point renders a standalone GLB viewer rather than that menu.

{% include pro/diagram.html
  src="/assets/img/projects/dishvue/01-runtime.svg"
  title="One menu. Multiple views."
  height="667"
  alt="iPhone and iPad capture and edit dishes, then share records and assets through Firebase with visionOS. A React menu component can read Firestore but is not mounted; the active web app displays a separate bundled GLB model."
  caption="The connected native flow and the separate web experiments. Dashed outlines identify a component outside the active web route."
%}

## Keep capture close to editing

I integrated **USDZScanner, Alfian Losari's wrapper around Apple's Object Capture sample**. On supported devices, capture collects images and checkpoints, releases the camera session, and hands the image directory to photogrammetry. Quick Look previews the reconstructed USDZ before returning it to the menu editor.

The model and generated thumbnail upload separately from the menu record. Source photographs stay on-device in this pipeline. Keeping those stages distinct makes the publishing challenge clear: **a finished scan is not yet a published menu item**.

{% include pro/diagram.html
  src="/assets/img/projects/dishvue/03-capture.svg"
  title="From capture to menu."
  height="667"
  alt="Capture images and checkpoints, release the capture session, reconstruct with photogrammetry, process the USDZ output, preview in Quick Look, then upload the model and thumbnail. Cancellation and failure have restart paths; unsupported capture hardware triggers a precondition failure."
  caption="Capture, reconstruction, preview, and publication have separate lifecycles. The source photographs are not part of the upload."
%}

## Keep the spatial interaction small

The visionOS detail view opens a **0.6 × 0.6 × 0.6 metre volumetric window**. Rotation follows the vertical axis to keep the plate upright; magnification is limited to 1–1.5×. System window controls handle repositioning, and menu cards can export USDZ through drag-and-drop.

The scale cap keeps interaction restrained, but does not measure model bounds or establish real-world size. Calibrated assets and device measurements would be needed before promising either exact portions or a guaranteed fit.

{% include pro/diagram.html
  src="/assets/img/projects/dishvue/06-spatial.svg"
  title="A small window. A closer look."
  height="667"
  alt="An illustrative plated dish floats inside a rounded glass volume labelled 0.6 metre window, with an orbit indicating vertical-axis rotation. Magnification is clamped between 1 and 1.5; physical-size claims require measured asset dimensions and comparison with a real plate. Window movement and USDZ export are separate from tabletop anchoring."
  caption="A bounded window shapes the interaction; its dimensions alone do not calibrate the dish inside it."
%}

## What I would carry forward

The next engineering work is reliable publication, cache invalidation when models change, and staff permissions enforced by the backend. The interaction I would keep is **a small window with a few predictable gestures**: a diner still has a meal and a conversation to pay attention to.
