---
layout: project
weight: 6
title: 'Robot Control Through VR'
description: >
  A research prototype for controlling a robotic arm with hand movements in VR, plus a replay tool for recorded lab experiments.
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
I built the VR side of a robotic-arm research project: first a live control interface, then a tool for replaying recorded experiments. The work covered the Unity app, a ROS bridge, and inverse kinematics.

## Making the robot's movement easier to read

A robot operates in 3D space, but its controls can feel abstract. I wanted to explore whether moving your own hand in VR could make the arm's motion easier to understand.

The robot couldn't simply copy a human hand. It had joint limits, collision risks, and movement constraints that the interface needed to make visible.

## Live teleoperation

The live interface mapped hand movements to the arm through a lightweight ROS bridge between Unity and the physical robot. I worked on keeping communication responsive enough for deliberate manipulation, while checking commands against the robot's constraints.

{% include pro/project-video.html id="vwSFuWbTOUY" title="VR Robot Control Demonstration" %}

The prototype included:

- A custom inverse kinematics solver combining Leap Motion hand poses with joint limits and checks for mechanical singularities.
- Safety interlocks checking joint velocity, collision volumes, and operator intent before commands left the VR client.
- Overlays showing reachable space and predicted joint poses, so the operator could see the proposed movement before committing to it.

## When the lab closed

When COVID-19 closed the lab, I shifted from live control to replay. Researchers still needed to inspect earlier experiments without access to the physical arm.

I built a pipeline that read timestamped joint angles from more than 15 experiment datasets and turned them into Unity animation clips. It let us reconstruct the recorded motion without a video stream or the original hardware.

{% include pro/project-video.html id="LLw-ksfGENA" title="Robot Movement Recreation from Data" %}

## Making constraints part of the interface

One-to-one hand mapping wasn't enough. If the robot rejected or changed a movement, the operator needed to understand why. Predicted poses and visible limits were part of the control interface, not optional debugging tools.

That became the most useful lesson from the project: when software controls something physical, showing what it plans to do matters as much as accepting the next command.