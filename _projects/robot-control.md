---
layout: project
title: 'Robot Control Through VR'
description: >
  Low-latency VR control system I built to pipe hand gestures through ROS and drive industrial robotic arms.
date: '01-01-2020'
category: research
image: 
  path: /assets/img/projects/mimicry.webp
  alt: Robot arm being controlled through VR hand gestures

---
This project explores remote robot manipulation through VR and inverse kinematics. It spans two tracks—real-time mimicry control and data-driven motion playback—to test both direct teleoperation and remote experiment review.

## Problem

Industrial robot control is powerful but often intimidating to prototype, especially when operators need both precision and spatial intuition. I wanted to test whether VR could make robot manipulation feel more natural by letting people drive a robotic arm with their own hand and arm movement, without losing the safety and predictability required for real hardware.

## My Role

- Built the Unity application, ROS bridge, interaction model, and inverse-kinematics pipeline for VR-based teleoperation.
- Integrated Leap Motion hand tracking, robot joint constraints, and visual overlays so operators could understand what the robot was about to do before committing a motion.
- Later pivoted the project into a motion-replay workflow when physical lab access was restricted during COVID-19.

## Live Teleoperation

In the first phase, I built a VR system that lets users drive robotic arms with natural hand and arm gestures. ROS data flows between Unity and the robot over a lightweight network bridge, keeping latency low enough for precise manipulation.

## Key Engineering Decisions

- Custom inverse-kinematics solver blends Leap Motion hand poses with robot joint limits to avoid singularities.
- Safety interlocks monitor joint velocity, collision volumes, and operator intent before commands leave the VR client.
- Visual overlays show reachable space and predicted joint poses so users can plan motions before committing.

The core tradeoff was realism versus safety. A one-to-one hand mapping feels intuitive, but physical robots cannot mirror human movement blindly. I treated prediction, constraint visualization, and intent filtering as part of the user experience, not just backend safety logic.

{% include pro/project-video.html id="vwSFuWbTOUY" title="VR Robot Control Demonstration" %}

## Motion Replay Pivot

When COVID-19 closed the lab, I pivoted to a data-replay pipeline. The interpreter ingests timestamped joint angles from spreadsheets and generates Unity animation clips that reproduce captured robot motion.

## What It Proved

- Researchers could review real-world experiments inside VR without needing lab access, making it easier to annotate mistakes and plan retries.
- Demonstrated that low-bandwidth data exports are sufficient to recreate believable robot motion inside Unity—an insight that later guided my remote-collaboration prototypes at UW Graphics Group.
- Helped me think more rigorously about the relationship between embodiment, safety, and observability in XR systems that control things outside the headset.

{% include pro/project-video.html id="LLw-ksfGENA" title="Robot Movement Recreation from Data" %}
