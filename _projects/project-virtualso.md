---
layout: project
weight: 4
title: 'Project Virtualso'
description: >
  Real-time conversation in AR/VR: connecting Unity, cloud speech, and character animation for interview and presentation practice.
date: '2020-01-01'
category: personal
image:
  path: /assets/img/projects/virtualso.webp
  srcset:
    - [480, /assets/img/projects/virtualso-480.webp]
    - [720, /assets/img/projects/virtualso-720.webp]
    - [854, /assets/img/projects/virtualso.webp]
  alt: Project Virtualso interview simulation with a virtual interviewer in an office
links:
  - title: GitHub
    url: https://github.com/jackyangzzh/Project-Virtualso
  - title: Interview demo
    url: https://www.youtube.com/watch?v=I1RIFirZeaQ
  - title: Presentation demo
    url: https://www.youtube.com/watch?v=3KgdJZlMepo
---
I started Virtualso in 2020 while studying Communication and building in Unity. I wanted to bring those interests together through **interview and presentation practice in AR/VR**. Rehearsing an answer is one thing; saying it while an interviewer waits, or a room of people watches, adds a different kind of pressure.

Getting a character to speak was only part of the work. I also needed to coordinate the microphone, cloud requests, audio playback, and animation so the person could tell **when to speak and when to wait**.

{% include pro/project-video.html id="I1RIFirZeaQ" title="Virtualso — virtual interview demonstration" %}

## Keeping Unity and speech in sync

I connected **IBM Watson Speech to Text → Assistant → Text to Speech** in Unity 2020.3, with the reply playing through the character's `AudioSource`. Unity updates the scene every frame, while those service calls complete asynchronously. The conversation has to work across both.

The recognizer streams audio, but only a **final transcript** goes to the dialogue service. `SimpleBot` sends it to a Watson Assistant session and passes the reply into the synthesis queue. I connected these stages through Unity `InputField` listeners, so part of the wiring lives in the scene rather than the C# code. The conversation itself is configured in Watson Assistant, and Unity handles the audio and the character.

{% include pro/diagram.html
  src="/assets/img/projects/virtualso/01-runtime.svg"
  height="925"
  mobile="/assets/img/projects/virtualso/01-runtime-mobile.svg"
  mobile_height="1510"
  title="The spoken interview runtime"
  alt="Unity SpeechToText, SimpleBot, and TextToSpeech exchange audio and text with three IBM Watson services. BotControl gates recognition; CharacterController maps playback and recognition state to Animator parameters."
  caption="The Unity components behind the interview: speech recognition, dialogue, synthesis, and the controls that coordinate them."
%}

## A turn is longer than an audio clip

I used `BotControl` to pause recognition while Assistant is processing or TTS still has work to do. Otherwise, the interviewer can hear its own reply and treat it as a new answer. (Pausing recognition doesn't stop Unity's microphone capture.)

However, this version has a bug. Synthesis removes the last text item **before** its audio arrives, so for a moment both queues are empty and nothing is playing. `IsFinished()` checks exactly those three conditions and misses the synthesis request still in flight, which means recognition can reopen too early.

I would fix that by tracking **dialogue pending, synthesis pending, queued speech, and playback** under one turn controller. A turn is complete only when all four are idle. Giving each turn an ID would also let me discard a late callback after the user cancels or restarts.

{% include pro/diagram.html
  src="/assets/img/projects/virtualso/02-turn-lifecycle.svg"
  height="933"
  mobile="/assets/img/projects/virtualso/02-turn-lifecycle-mobile.svg"
  mobile_height="1730"
  title="A turn is longer than an audio clip"
  alt="A final transcript goes through Assistant, a text queue, synthesis in flight, an audio queue, and playback. The existing completion check ignores in-flight synthesis, allowing recognition to resume before the reply is ready."
  caption="The critical gap is between dequeuing text and receiving audio. Empty queues do not prove that a turn has finished."
%}

## Measuring the wait

The capture loop reads a one-second, **22,050 Hz** microphone buffer in alternating halves, sending approximately **0.5 seconds of audio per block**. That's only the first step, though. After it, the person still waits for recognition to finalize, Assistant to respond, speech to be synthesized, and playback to begin.

The delay I care about is **from the user's last word to the character's first audible reply**. To measure it, I would timestamp each stage and look at the slow turns as well as the typical ones. Frame rate is a separate question, since the character can animate smoothly and still take too long to answer. While it does wait, I want its body language to make the delay understandable.

## Connecting speech to character behavior

I tied the interviewer's animation to the conversation state. The custom `CharacterController` maps `AudioSource.isPlaying` to `isTalking`; when playback stops, `isListening` follows the recognizer's active state. This gives the person a visible cue about what the system is doing.

For presentation practice, I used a different approach. Twelve audience randomizers choose among authored animation states on repeating timers, each sampling its interval once at startup between five and ten seconds. In other words, the audience looks alive, but it isn't reacting to anything the speaker says. I used a desktop texture to show presentation content on a monitor inside the scene.

{% include pro/diagram.html
  src="/assets/img/projects/virtualso/03-animation.svg"
  height="1008"
  mobile="/assets/img/projects/virtualso/03-animation-mobile.svg"
  mobile_height="1580"
  title="What drives the animation"
  alt="The interviewer sets talking and listening Animator flags from playback and recognizer state. Twelve presentation audience components independently update randomValue to zero, one, or two on a repeating schedule."
  caption="Conversation state drives the interviewer; timers drive the audience. The object icons represent components, not a reconstructed scene layout."
%}

{% include pro/project-video.html id="3KgdJZlMepo" title="Virtualso — presentation practice demonstration" %}

## What I learned about embodied conversation

The main lesson for me is that **voice and body need to follow the same turn state**. If I add interruption, it needs to cancel pending synthesis, queued clips, and playback together. Leaving the exercise needs to release capture and service state. A failed request also needs a visible way to retry; otherwise, the person is left waiting for a character that has nothing to say.

Audio placement is another part I would improve in Virtualso. The synthesis helper sets `spatialBlend = 0`, so playback is 2D even though the `AudioSource` belongs to the character. I would test positioned voice, headset microphone routing, and acoustic feedback together, because what sounds correct in the editor still needs to work in the headset.

Personally, this is the part of the project I find most interesting now. A queue that empties too early changes when the character seems to listen, and a slow reply changes how long someone waits before speaking again. In brief, **whether the character feels attentive comes down to those transitions.**
