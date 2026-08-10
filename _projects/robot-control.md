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
This project tested two different ways to interact with an industrial robotic arm in VR. The first mapped hand and arm movements directly to the robot in real time. The second replayed recorded experiment data visually for times when the physical lab was unavailable.

## The problem

While traditional robot control tools are incredibly precise, I always found them exceptionally difficult to learn. Even though you are manipulating a physical object in 3D space, you usually control it through abstract interfaces. 

I hypothesized that directly moving your own hand in VR might make the robot's kinematics vastly easier to intuit. However, I knew I could not just sacrifice the strict safety constraints required for real-world hardware. When COVID-19 abruptly closed the physical lab, I also had to pivot quickly to figure out how researchers could still review experiments without direct access.

## What I built

I implemented the entire VR stack, which included building the core Unity application, writing the ROS bridge for network communication, and managing the inverse kinematics pipeline.

For the live teleoperation, a user simply drove the robot by moving their hand. I built a lightweight network bridge that passed ROS data between Unity and the physical robot with low enough latency to actually support deliberate manipulation. 

{% include pro/project-video.html id="vwSFuWbTOUY" title="VR Robot Control Demonstration" %}

Because I suspected users would blindly expect the hardware to match their hand motions perfectly, I built custom safety logic. 
- A custom inverse kinematics solver combines Leap Motion hand poses with the robot's joint limits specifically to avoid mechanical singularities.
- Safety interlocks heavily monitor joint velocity, collision volumes, and operator intent before any command ever leaves the VR client.
- Visual overlays actively render the reachable space and predict joint poses so the user can literally see what the robot intends to do before committing to a motion.

## The COVID-19 pivot

When lab access disappeared, I temporarily shelved the live controls and built a motion replay pipeline instead. By simply reading timestamped joint angles from over 15 existing experiment datasets, the system successfully generated exact Unity animation clips of the recorded motion.

{% include pro/project-video.html id="LLw-ksfGENA" title="Robot Movement Recreation from Data" %}

## Reflection

I began this project assuming that a one-to-one hand mapping would just intuitively work. However, I was entirely wrong. Because a robot cannot safely copy human motion blindly, predicted poses and visible constraints had to become a fundamental part of the interface so the user could immediately understand why the robot rejected or altered their movement.

In addition, the motion replay pivot proved that raw joint angle data was actually enough to recreate highly useful robot motion in Unity without requiring a video stream or the original hardware. 

Therefore, this whole project made safety and observability feel like pure interface problems rather than just robotics problems. Whenever a system controls something physical outside the headset, the user absolutely needs to see what it plans to do before it actually does it.