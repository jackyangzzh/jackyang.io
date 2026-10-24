---
layout: project
weight: 6
title: 'Robot Control Through VR'
description: >
  A real-time VR control loop for a UR5 robotic arm, built in the UW Graphics Group, plus a tool for replaying arm motion from 15+ lab-experiment datasets.
date: '2020-09-01'
end_date: '2022-05-01'
category: research
image: 
  path: /assets/img/projects/mimicry.webp
  srcset:
    - [480, /assets/img/projects/mimicry-480.webp]
    - [720, /assets/img/projects/mimicry-720.webp]
    - [854, /assets/img/projects/mimicry.webp]
  alt: VR simulation of an industrial robotic arm moving objects between worktables
links:
  - title: Teleoperation demo
    url: https://www.youtube.com/watch?v=vwSFuWbTOUY
  - title: Motion replay demo
    url: https://www.youtube.com/watch?v=LLw-ksfGENA

---
I was a graphics researcher in the UW Graphics Group from September 2020 to May 2022. There, I built a **real-time VR control loop** that maps hand movements to a UR5 robotic arm. When the pandemic interrupted lab access, I also built a Unity tool for **replaying arm motion from 15+ lab-experiment datasets**. Starting from an existing desktop demo, I integrated **Vive input, ROS communication, RelaxedIK, and Unity motion playback**.

{% include pro/project-video.html id="vwSFuWbTOUY" title="VR Robot Control Demonstration" %}

## From hand movement to joint motion

When the operator moves the Vive controller, Unity on Windows sends a position goal through **ROS# and rosbridge** to RelaxedIK on Linux. The joint angles come back the same way and animate the arm model. Replay takes a second path: recorded joint values drive local animation clips, so it doesn't need the solver at all.

I didn't write the inverse kinematics. **RelaxedIK supplied the solver**, which relaxes pose accuracy when it competes with smooth, continuous, collision-free joint motion. My work was connecting it to the VR interaction and the visualization.

{% include pro/diagram.html
  src="/assets/img/projects/robot-control/01-system-architecture.svg"
  title="Live control and recorded playback"
  height="580"
  alt="Live Vive input becomes a position goal, passes through ROS# and rosbridge to external RelaxedIK, and returns as joint angles for the Unity UR5 display. A separate CSV path constructs animation curves for local arm and gripper playback."
  caption="Two paths to the same model: solve a live goal, or replay recorded joints."
%}

## Holding the goal still

A clutch switches between following the controller and holding the target, so the operator can reposition their hand without moving the goal, a bit like lifting a mouse off the desk. ROS# converts Unity coordinates into ROS coordinates. My version publishes **position goals only, with a fixed orientation**, and it doesn't calibrate the VR space against the robot's physical origin. That would be a separate task.

{% include pro/diagram.html
  src="/assets/img/projects/robot-control/02-coordinate-time-contract.svg"
  title="Coordinates, goal state, and callbacks"
  height="630"
  alt="Unity position x, y, z maps to ROS z, minus x, y. The published orientation is the identity quaternion. Tracking adds controller displacement to the previous goal; holding retains the goal. Separate callbacks compute, publish, receive, and apply motion."
  caption="How Unity coordinates map to ROS, how the clutch holds the goal, and which callback does what."
%}

## Replaying experiments without the lab

After lab access stopped, I shifted to inspecting earlier experiments in VR. The importer maps six recorded arm angles and a gripper value onto the UR5 model and builds Unity animation curves from them, with restart and slider-seek controls.

It reconstructs the motion, but not the timing. The importer spreads the rows evenly across about ten seconds instead of using the recorded timestamps, so **the original timing is lost**, and the arm and gripper don't play back fully in sync. If I picked this up again, the first thing I would add is one clock, based on the recorded time, for both.

{% include pro/project-video.html id="LLw-ksfGENA" title="Robot Movement Recreation from Data" %}
