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
I built DishVue to connect the steps behind a spatial menu: **scan a dish, publish its model, and let a diner inspect it**. The native prototype runs on iPhone, iPad, and Apple Vision Pro, and I also experimented with viewing the models in a browser.

{% include pro/project-video.html id="7XZIU8AK3w0" title="DishVue Spatial Menu Demo" %}

## Why a 3D menu?

Personally, I always found restaurant menus a bit boring. Most of them are static: a list of names and prices, maybe a photo. I have always been a fan of how Japanese restaurants put **food replicas** on display, so you know what you are getting yourself into and what to order before you sit down.

A photo helps a little, but it doesn't tell you much about a dish's size or texture. AR menus can do more. However, if the 3D models are made somewhere else, that is **one more system for restaurant staff to maintain**.

So I wanted DishVue to be the digital version of that display. Staff capture and publish a dish from the same app, and diners look at it in a movable window beside the table.

## One menu record, several views

The SwiftUI apps share one menu model. Firestore holds names, prices, categories, and asset URLs, and Firebase Storage holds the USDZ models and thumbnails. The native apps listen for changes and refresh the menu. On visionOS, each card uses `Model3D`, and the selected dish opens in a `RealityView`.

I also started a web version, but **it is still a prototype**. There is a Firebase-backed React menu, but it isn't wired in yet; the live web page only shows a standalone GLB model.

{% include pro/diagram.html
  src="/assets/img/projects/dishvue/01-runtime.svg"
  title="One menu. Multiple views."
  height="667"
  alt="iPhone and iPad capture and edit dishes, then share records and assets through Firebase with visionOS. A React menu component can read Firestore but is not mounted; the active web app displays a separate bundled GLB model."
  caption="The native apps share one menu through Firebase. The dashed React menu is built but not connected to the live web page."
%}

## Capturing a dish in the same app

I integrated **USDZScanner, Alfian Losari's wrapper around Apple's Object Capture sample**. On supported devices, the app captures images and checkpoints, releases the camera, and hands the image folder to photogrammetry. Staff can check the reconstructed USDZ in Quick Look before it goes back into the menu editor.

The model and a generated thumbnail upload separately from the menu record, and the source photos never leave the device. Because those stages are separate, **a scan can finish and still not be on the menu**, which is the part I would work on next.

{% include pro/diagram.html
  src="/assets/img/projects/dishvue/03-capture.svg"
  title="From capture to menu."
  height="667"
  alt="Capture images and checkpoints, release the capture session, reconstruct with photogrammetry, process the USDZ output, preview in Quick Look, then upload the model and thumbnail. Cancellation and failure have restart paths; unsupported capture hardware triggers a precondition failure."
  caption="Capture, reconstruction, preview, and upload each run on their own. The source photos stay on the device."
%}

## A small window for a closer look

On Vision Pro, the dish opens in a **0.6 × 0.6 × 0.6 metre volumetric window**. You can rotate it around the vertical axis, so the plate always stays upright, and zoom between 1× and 1.5×. The system window controls handle moving it, and you can drag a menu card out to export its USDZ.

What it can't do yet is show the dish at its real size. The zoom cap keeps the interaction small, but the app never measures the scanned model, so I wouldn't promise a diner that the portion on screen matches the plate on the table. That would need calibrated assets and real measurements first.

{% include pro/diagram.html
  src="/assets/img/projects/dishvue/06-spatial.svg"
  title="A small window. A closer look."
  height="667"
  alt="An illustrative plated dish floats inside a rounded glass volume labelled 0.6 metre window, with an orbit indicating vertical-axis rotation. Magnification is clamped between 1 and 1.5; physical-size claims require measured asset dimensions and comparison with a real plate. Window movement and USDZ export are separate from tabletop anchoring."
  caption="The dish is illustrative. The window limits the interaction, but it doesn’t make the dish true to scale."
%}

## What I would carry forward

The next engineering work is reliable publishing, cache invalidation when a model changes, and staff permissions enforced by the backend. The interaction I would keep is **a small window with a few predictable gestures**, since a diner still has a meal and a conversation to pay attention to.
