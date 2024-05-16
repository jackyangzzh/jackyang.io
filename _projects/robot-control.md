---
layout: project
title: 'Robot control through VR'
caption: Control robot arm remotely in VR
description: >
  
date: '01-01-2020'
image: 
  path: /assets/img/projects/mimicry.webp
sitemap: false

---
This project explores remote manipulation of robots through virtual reality and inverse kinematics . There are two parts: mimcry control of robot arms, and re-creation of robot motion through data.

## Mimicry Control
In the first part of the research, I implemented a virtual reality system that allows users to remote control robots with their hand and arm gestures by passing ROS (Robot Operating System) data between Unity and the robot through network socket with minimal latency. The video below demonstrates this capability in action.
<iframe width="560" height="315" src="https://www.youtube.com/embed/vwSFuWbTOUY?si=hxstaPddypvPRl3-" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>{:loading="lazy"}

## Recreate Robot Movement
During the second half of the research, due to COVID-19 restriction, I could not be in the lab and research with the robot, so I switched gear into replicating movement by interpolating data from actual robotic experiments in Unity. By providing a spreadsheet of joint angles with timestamps, the interpreter I designed can create animation clips that replicate the exact robot arm movement. Here is a demo of what it looks like.
<iframe width="560" height="315" src="https://www.youtube.com/embed/LLw-ksfGENA?si=uuUmwi7ooqV15yn2" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>{:loading="lazy"}