# Interval Timer

A simple interval training timer for personal use. Open the GitHub Pages URL on your phone, no download or account needed. On iPhone, Share > Add to Home Screen puts it on your home screen like an app.

## Features

- Custom work, rest, and rounds, with quick presets (30/30, 40/20, Tabata 20/10, 60/30)
- 5-second get-ready countdown
- Large color-coded display: green for work, blue for recovery, amber for get-ready
- Ticker sounds: countdown ticks, phase-change tones, and a finish fanfare (all synthesized in the browser, no audio files)
- Voice cues: the phone says "Go" at the start of every work interval, "Rest" at the start of every rest, and "Workout complete" at the end, so you can train without looking at the screen (built-in speech, no audio files)
- Pause, restart, and skip controls
- Screen stays awake while the timer runs (Wake Lock API, where supported)
- Free workout music selection that plays during the session and stops when the workout ends; rest periods automatically switch to a relaxing track, and the high-intensity track picks back up at the next work interval. Music starts at Go, not during the get-ready countdown, so get-ready is clock ticks only.
- Workout music: high-energy rock tracks (Kick Shock, All This, Breakdown, Death of Kings)
- Rest music: calm guitar tunes (Greensleeves, Slow Burn, The Parting), plus Meditation Impromptu 01 on piano

## Music credits

All tracks are by Kevin MacLeod (incompetech.com), licensed under CC BY 4.0:

- Workout rock: Kick Shock, All This, Breakdown, Death of Kings
- Rest: Greensleeves, Slow Burn, The Parting, Meditation Impromptu 01

## Run locally

Any static server works, for example: `python3 -m http.server` in this folder, then open http://localhost:8000.
