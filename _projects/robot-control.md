---
layout: project
title: 'Robot Control Through VR'
caption: Remote robot manipulation using VR hand tracking and inverse kinematics
description: >
  Low-latency VR system for controlling robots with hand gestures via ROS integration
date: '01-01-2020'
image: 
  path: /assets/img/projects/mimicry.webp
  alt: Robot arm being controlled through VR hand gestures
sitemap: false

---
This project explores remote robot manipulation through virtual reality and inverse kinematics. It consists of two parts: mimicry control of robot arms and recreation of robot motion from data.

## Mimicry Control

In the first phase, I implemented a virtual reality system that allows users to remotely control robots using hand and arm gestures. The system passes ROS (Robot Operating System) data between Unity and the robot through network sockets with minimal latency. The video below demonstrates this capability in action.

<style>.embed-container { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; } .embed-container iframe, .embed-container object, .embed-container embed { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }</style><div class='embed-container'><iframe src='https://www.youtube.com/embed/vwSFuWbTOUY' frameborder='0' allowfullscreen title="VR Robot Control Demonstration"></iframe></div>{:loading="lazy"}

## Recreate Robot Movement

During the second phase, COVID-19 restrictions prevented lab access, so I pivoted to replicating robot movements by interpolating data from actual robotic experiments in Unity. The interpreter I designed accepts spreadsheets of joint angles with timestamps and generates animation clips that precisely replicate robot arm movements. Here is a demonstration of the system.

<style>.embed-container { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; } .embed-container iframe, .embed-container object, .embed-container embed { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }</style><div class='embed-container'><iframe src='https://www.youtube.com/embed/LLw-ksfGENA' frameborder='0' allowfullscreen title="Robot Movement Recreation from Data"></iframe></div>{:loading="lazy"}
