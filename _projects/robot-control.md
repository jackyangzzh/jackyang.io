---
layout: project
weight: 6
title: 'Robot Control Through VR'
description: >
  A Unity/Vive research prototype connecting hand movements to a robotic arm model, with ROS integration and replay of recorded experiments.
date: '2020-01-01'
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
I built the VR interface for a UR5 research project, then a tool for replaying recorded experiments when the pandemic interrupted lab access. Starting from an existing desktop demo, I integrated **Vive input, ROS communication, RelaxedIK, and Unity motion playback**.

{% include pro/project-video.html id="vwSFuWbTOUY" title="VR Robot Control Demonstration" %}

## From hand movement to joint motion

The live path sends a controller-driven position goal from Unity on Windows through **ROS# and rosbridge** to RelaxedIK on Linux. Joint solutions return to animate the arm model. Replay takes a second path: recorded joint values drive local animation clips without a live solver.

{% include pro/diagram.html
  src="/assets/img/projects/robot-control/01-system-architecture.svg"
  title="Live control and recorded playback"
  height="580"
  alt="Live Vive input becomes a position goal, passes through ROS# and rosbridge to external RelaxedIK, and returns as joint angles for the Unity UR5 display. A separate CSV path constructs animation curves for local arm and gripper playback."
  caption="Two paths to the same model: solve a live goal or replay recorded joints."
%}

## Keep frames and intent consistent

A clutch switches between following controller movement and holding the target, letting the operator reposition their hand without shifting the goal. ROS# converts Unity coordinates into ROS coordinates. The reviewed implementation publishes **position goals with fixed orientation**; aligning physical origins remains a separate calibration task.

{% include pro/diagram.html
  src="/assets/img/projects/robot-control/02-coordinate-time-contract.svg"
  title="Coordinates, goal state, and callbacks"
  height="630"
  alt="Unity position x, y, z maps to ROS z, minus x, y. The published orientation is the identity quaternion. Tracking adds controller displacement to the previous goal; holding retains the goal. Separate callbacks compute, publish, receive, and apply motion."
  caption="Coordinate conversion, persistent goal state, and callback responsibilities."
%}

## Build around an existing solver

**RelaxedIK supplied the inverse kinematics.** Its upstream method balances pose agreement with smoothness, joint continuity, and avoidance objectives, relaxing pose accuracy when those objectives compete. My work connected that solver to the VR interaction and visualization.

{% include pro/diagram.html
  src="/assets/img/projects/robot-control/03-relaxedik-role.svg"
  title="RelaxedIK's role"
  height="508"
  alt="A desired position and fixed orientation enter upstream RelaxedIK. A weighted optimization balances pose agreement, smoothness, joint continuity, self-collision avoidance, and singularity avoidance to produce a joint-angle vector. Integration-specific weights and performance remain unverified."
  caption="The upstream solver turns a desired pose into a joint solution."
%}

## Reconstruct recorded experiments

After lab access stopped, I shifted toward inspecting earlier experiments in VR. The importer maps six recorded arm angles and a gripper scalar onto the UR5 hierarchy, building Unity animation curves with restart and slider-seek controls.

The prototype reconstructs the motion sequence, but assigns time by row index across roughly ten seconds. **Original timing is not preserved**, and arm/gripper playback is not fully synchronized. A shared recorded-time clock would be the first improvement I'd make.

{% include pro/diagram.html
  src="/assets/img/projects/robot-control/05-replay-pipeline.svg"
  title="Replay construction and controls"
  height="640"
  alt="Recorded arm angles and gripper values map to model-specific Unity animation curves. Key time is ten seconds times the row index divided by row count, ignoring recorded timestamps. Arm and gripper Play methods differ; slider seek holds both at a normalized clip position."
  caption="From CSV fields to model transforms, with explicit timing and playback limits."
%}

{% include pro/project-video.html id="LLw-ksfGENA" title="Robot Movement Recreation from Data" %}
