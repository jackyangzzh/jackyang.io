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
DishVue is a 3D menu I built for iPhone, iPad, Apple Vision Pro, and the web. I wanted to see if I could build one system that handles the whole path from scanning a dish to displaying it on the table.

{% include pro/project-video.html id="7XZIU8AK3w0" title="DishVue Spatial Menu Demo" %}

## The problem

Even though menu photos are everywhere, they rarely show food texture well, and they almost completely fail to convey true portion size. Many AR menu tools already exist, but because they usually require a separate publishing workflow, restaurant staff end up with yet another system to keep in sync.

I wanted to consolidate this process. If staff scan a dish on a phone, the model should automatically sync to the menu, and diners should be able to open it on whatever device they have. And because Vision Pro allows for spatial computing, diners can actually put the dish on the table in front of them to see its true scale.

## How it works

Because I wanted to keep the infrastructure simple, DishVue ships as three clients tied to one Firebase backend.

On iPhone and iPad, restaurant staff manage the menu and scan dishes within the same app. Diners can browse that menu and preview a dish in AR. The visionOS app opens each dish in a volumetric window, where diners can rotate, scale, and drag-and-drop the plate. A React client gives people on other devices access to the same menu data.

## Technical implementation

- Built the Apple clients in SwiftUI. Because staff should not need a separate capture tool, I wrapped Object Capture in the `USDZScanner` Swift Package to generate USDZ models and thumbnails locally.
- Stored menu records in Firestore and model files in Firebase Storage, which provides a single schema across all three clients without requiring a custom server. The app shows upload progress and keeps a local cache.
- Built the visionOS app with `RealityView` and volumetric `WindowGroup`s. While it is tempting to use full immersion, I chose volumetric windows because the menu belongs beside the table rather than entirely around the diner.
- Handled interactions on Vision Pro: drag rotates a dish only around its vertical axis so a plate cannot flip upside down, and scale stops at 1.5x before the model leaves the window bounds.
- Developed the React client against the same schema, so the web version simply consumes the existing data without a separate content system.

## Reflection

I initially thought the hard parts of this project would be the impressive spatial demo moments on Vision Pro. However, it turned out that managing shared state across SwiftUI targets and dealing with the quirks in Object Capture output were the actual challenges. Deciding what to leave out on visionOS was also much harder than I expected.

DishVue works better as a small window with a couple of predictable gestures, even though it could have been a full immersive scene. Personally, I find spatial interfaces most compelling when they know when to get out of the way.