---
layout: project
title: 'Robot control through VR'
caption: Control robot arm through VR
description: >
  
date: '01-01-2020'
image: 
  path: /assets/img/projects/mimicry.webp
sitemap: false

---
This project explores remote manipulation of robots through virtual reality and inverse kinematics . There are two parts: mimcry control of robot arms, and re-creation of robot motion through data.

## Mimicry Control
In the first part of the research, I implemented a virtual reality system that allows users to remote control robots with their hand and arm gestures by passing ROS (Robot Operating System) data between Unity and the robot through network socket with minimal latency. The video below demonstrates this capability in action.
<style>.embed-container { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; } .embed-container iframe, .embed-container object, .embed-container embed { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }</style><div class='embed-container'><iframe src='https://www.youtube.com/embed/vwSFuWbTOUY' frameborder='0' allowfullscreen></iframe></div>{:loading="lazy"}

## Recreate Robot Movement
During the second half of the research, due to COVID-19 restriction, I could not be in the lab and research with the robot, so I switched gear into replicating movement by interpolating data from actual robotic experiments in Unity. By providing a spreadsheet of joint angles with timestamps, the interpreter I designed can create animation clips that replicate the exact robot arm movement. Here is a demo of what it looks like.
<style>.embed-container { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; } .embed-container iframe, .embed-container object, .embed-container embed { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }</style><div class='embed-container'><iframe src='https://www.youtube.com/embed/LLw-ksfGENA' frameborder='0' allowfullscreen></iframe></div>{:loading="lazy"}