---
layout: project
weight: 6
title: 'Robot Control Through VR'
description: >
  Built a VR teleoperation and motion replay system for a robotic arm using Unity, ROS, hand tracking, and inverse kinematics.
date: '01-01-2020'
category: research
image: 
  path: /assets/img/projects/mimicry.webp
  alt: VR simulation of an industrial robotic arm moving objects between worktables
links:
  - title: Teleoperation demo
    url: https://www.youtube.com/watch?v=vwSFuWbTOUY
  - title: Motion replay demo
    url: https://www.youtube.com/watch?v=LLw-ksfGENA

---
This project tested two ways to work with a robotic arm in VR. The first mapped hand and arm movement to the robot. The second replayed recorded experiments when the lab was unavailable.

## Problem

Robot control tools are precise, but they can be hard to learn. I wanted to see whether moving your own hand in VR could make the robot easier to understand without sacrificing the constraints needed for real hardware.

## My role

- Built the Unity application, ROS bridge, interaction model, and inverse kinematics pipeline.
- Integrated Leap Motion hand tracking, robot joint constraints, and visual overlays so operators could understand what the robot was about to do before committing a motion.
- Built a motion replay workflow after COVID-19 restricted access to the physical lab.

## Live teleoperation

The first version let a user drive the robot with hand and arm movement. A small network bridge passed ROS data between Unity and the robot with low enough latency for precise manipulation.

## Key engineering decisions

- A custom inverse kinematics solver combines Leap Motion hand poses with robot joint limits to avoid singularities.
- Safety interlocks monitor joint velocity, collision volumes, and operator intent before commands leave the VR client.
- Visual overlays show reachable space and predicted joint poses so users can plan motions before committing.

A one-to-one hand mapping feels intuitive, but a robot cannot copy human motion blindly. Predicted poses and visible constraints were part of the interface because users needed to understand why the robot would reject or alter a movement.

{% include pro/project-video.html id="vwSFuWbTOUY" title="VR Robot Control Demonstration" %}

## Motion-replay pivot

When COVID-19 closed the lab, I built a replay pipeline instead. It read timestamped joint angles from more than 15 experiment datasets and generated Unity animation clips of the recorded motion.

## What it demonstrated

- Researchers could review experiments in VR, annotate mistakes, and plan another run without entering the lab.
- Joint angle data was enough to recreate useful robot motion in Unity; the replay did not need a video stream or the original hardware.

The project made safety and observability feel like interface problems as well
as robotics problems. When a system controls something outside the headset, the
user needs to see what it plans to do before it does it.

{% include pro/project-video.html id="LLw-ksfGENA" title="Robot Movement Recreation from Data" %}
