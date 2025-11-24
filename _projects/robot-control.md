---
layout: project
title: 'Robot Control Through VR'
caption: Remote robot manipulation through VR hand tracking and inverse kinematics
description: >
  Low-latency VR control system I built to pipe hand gestures through ROS and drive industrial robot arms
date: '01-01-2020'
image: 
  path: /assets/img/projects/mimicry.webp
  alt: Robot arm being controlled through VR hand gestures
sitemap: false

---
This project explores remote robot manipulation through virtual reality and inverse kinematics. It includes two tracks: real-time mimicry control and data-driven playback of robot motion, both of which informed my later work on hand interaction fidelity in Microsoft Mesh.

## Mimicry Control

In the first phase, I built a VR system that lets users drive robot arms with natural hand and arm gestures. ROS data flows between Unity and the robot over lightweight sockets, keeping latency low enough for precise manipulation.

**Key details**

- Custom inverse-kinematics solver blends Leap Motion hand poses with robot joint limits to avoid singularities.
- Safety interlocks monitor joint velocity, collision volumes, and operator intent before commands leave the VR client.
- Visual overlays show reachable space and predicted joint poses so users can plan motions before committing.

<style>.embed-container { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; } .embed-container iframe, .embed-container object, .embed-container embed { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }</style><div class='embed-container'><iframe src='https://www.youtube.com/embed/vwSFuWbTOUY' frameborder='0' allowfullscreen title="VR Robot Control Demonstration"></iframe></div>{:loading="lazy"}

## Recreate Robot Movement

When COVID-19 closed the lab, I pivoted to a data-replay pipeline. The interpreter ingests timestamped joint angles from spreadsheets and generates Unity animation clips that faithfully reproduce the captured robot motion.

**What it unlocked**

- Researchers could review real-world experiments inside VR without needing lab access, making it easier to annotate mistakes and plan retries.
- Demonstrated that low-bandwidth data exports are enough to recreate believable robot motion inside Unity, which later guided my remote collaboration prototypes at UW Graphics Group.

<style>.embed-container { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; } .embed-container iframe, .embed-container object, .embed-container embed { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }</style><div class='embed-container'><iframe src='https://www.youtube.com/embed/LLw-ksfGENA' frameborder='0' allowfullscreen title="Robot Movement Recreation from Data"></iframe></div>{:loading="lazy"}
