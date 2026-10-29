# Interval Timer

A simple interval training timer for personal use. Open the GitHub Pages URL on your phone, no download or account needed. On iPhone, Share > Add to Home Screen puts it on your home screen like an app.

## Features

- Custom work, rest, and rounds, with quick presets (30/30, 40/20, Tabata 20/10, 60/30)
- 5-second get-ready countdown
- Large color-coded display: green for work, blue for recovery, amber for get-ready
- Ticker sounds: countdown ticks, phase-change tones, and a finish fanfare (all synthesized in the browser, no audio files)
- Pause, restart, and skip controls
- Screen stays awake while the timer runs (Wake Lock API, where supported)
- Free workout music selection that plays during the session and stops when the workout ends

## Music credits

All four tracks are by Kevin MacLeod (incompetech.com), licensed under CC BY 4.0:

- Exhilarate
- Run Amok
- Volatile Reaction
- Machinations

## Run locally

Any static server works, for example: `python3 -m http.server` in this folder, then open http://localhost:8000.
