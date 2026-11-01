// figure.js — animated exercise figure for the interval timer circuits.
//
// A stylized side-view pictogram figure, drawn with SVG lines, so a
// beginner can follow the movement without a video. Each movement pattern
// is a function of time returning joint positions; legs use 2-bone IK so
// knees bend plausibly. Jumping jacks use a separate front-view figure.
// The app drives it from the timer phases: work shows the current station,
// rest shows the next station dimmed, get-ready shows the first station.
//
// No dependency on the timer page: createExerciseFigure(container) builds
// its own SVG. renderOne(pattern, t, opts) draws a single static frame,
// which the QA demo page uses to screenshot every pattern.
(function (global) {
  "use strict";
  var SVGNS = "http://www.w3.org/2000/svg";
  var GROUND_Y = 182;

  // Knee/elbow between joint A and target B, with segment lengths l1, l2.
  // bend -1 puts the joint forward (knees), +1 puts it back (rear leg, arms).
  function ik(ax, ay, bx, by, l1, l2, bend) {
    var dx = bx - ax, dy = by - ay;
    var d = Math.sqrt(dx * dx + dy * dy) || 0.0001;
    var cl = Math.min(d, l1 + l2 - 0.01);
    var ux = dx / d, uy = dy / d;
    var a = (l1 * l1 - l2 * l2 + cl * cl) / (2 * cl);
    var h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    var mx = ax + a * ux, my = ay + a * uy;
    return { x: mx - uy * h * bend, y: my + ux * h * bend };
  }
  // Smooth 0 -> 1 -> 0 over one rep of dur seconds.
  function rep(t, dur) {
    var p = (((t % dur) + dur) % dur) / dur;
    return (1 - Math.cos(2 * Math.PI * p)) / 2;
  }
  function pt(x, y) { return { x: x, y: y }; }

  // Each pattern returns { side: joints } or { front: {...} } plus an
  // optional flip (mirror) and weight point. Joints: hip, shoulder, head,
  // ankleF/KneeF/elbowF/wristF (front limbs), ankleB/kneeB/elbowB/wristB.
  var PATTERNS = {
    squat: function (t, weight) {
      var depth = rep(t, 2.2);
      var hip = pt(102 - 14 * depth, 96 + 44 * depth);
      var ankle = pt(108, 180);
      var shoulder = pt(hip.x + 4 + 12 * depth, hip.y - 48);
      var wrist = pt(shoulder.x + 30, shoulder.y + 22);
      return { side: {
        hip: hip, shoulder: shoulder, head: pt(shoulder.x + 2, shoulder.y - 18),
        ankleF: ankle, kneeF: ik(hip.x, hip.y, ankle.x, ankle.y, 46, 46, -1),
        ankleB: ankle, kneeB: ik(hip.x, hip.y, ankle.x, ankle.y, 46, 46, -1),
        elbowF: ik(shoulder.x, shoulder.y, wrist.x, wrist.y, 34, 32, 1), wristF: wrist,
        elbowB: ik(shoulder.x, shoulder.y, wrist.x, wrist.y, 34, 32, 1), wristB: wrist,
        weight: weight === "chest" ? pt(shoulder.x + 14, shoulder.y + 8) : null } };
    },
    lunge: function (t) {
      var depth = rep(t, 2.6);
      var flip = Math.floor(t / 2.6) % 2 === 1;
      var hip = pt(104 + 6 * depth, 96 + 32 * depth);
      var ankleF = pt(142, 180), ankleB = pt(66, 180);
      var shoulder = pt(hip.x + 2, hip.y - 48);
      var wrist = pt(shoulder.x + 6, shoulder.y + 62);
      return { flip: flip, side: {
        hip: hip, shoulder: shoulder, head: pt(shoulder.x + 2, shoulder.y - 18),
        ankleF: ankleF, kneeF: ik(hip.x, hip.y, ankleF.x, ankleF.y, 46, 46, -1),
        ankleB: ankleB, kneeB: ik(hip.x, hip.y, ankleB.x, ankleB.y, 46, 46, 1),
        elbowF: ik(shoulder.x, shoulder.y, wrist.x, wrist.y, 34, 32, 1), wristF: wrist,
        elbowB: ik(shoulder.x, shoulder.y, wrist.x, wrist.y, 34, 32, 1), wristB: wrist,
        weight: null } };
    },
    pushup: function (t) {
      var depth = rep(t, 2.0);
      var ankle = pt(42, 174);
      var wrist = pt(152, 180);
      var shoulder = pt(138 + 6 * depth, 128 + 26 * depth);
      var hip = pt((ankle.x + shoulder.x) / 2, (ankle.y + shoulder.y) / 2 - 6);
      // Plank legs stay straight; the IK bend made them look frog-like.
      var knee = pt((hip.x + ankle.x) / 2, (hip.y + ankle.y) / 2);
      return { side: {
        hip: hip, shoulder: shoulder, head: pt(shoulder.x + 16, shoulder.y - 8),
        ankleF: ankle, kneeF: knee,
        ankleB: ankle, kneeB: knee,
        elbowF: ik(shoulder.x, shoulder.y, wrist.x, wrist.y, 34, 32, 1), wristF: wrist,
        elbowB: ik(shoulder.x, shoulder.y, wrist.x, wrist.y, 34, 32, 1), wristB: wrist,
        weight: null } };
    },
    plank: function (t) {
      var bob = 2 * Math.sin(t * Math.PI * 2 * 0.25);
      var ankle = pt(42, 174);
      var wrist = pt(152, 180);
      var shoulder = pt(138, 128 + bob);
      var hip = pt((ankle.x + shoulder.x) / 2, (ankle.y + shoulder.y) / 2 - 6 + bob);
      var knee = pt((hip.x + ankle.x) / 2, (hip.y + ankle.y) / 2);
      return { side: {
        hip: hip, shoulder: shoulder, head: pt(shoulder.x + 16, shoulder.y - 8),
        ankleF: ankle, kneeF: knee,
        ankleB: ankle, kneeB: knee,
        elbowF: ik(shoulder.x, shoulder.y, wrist.x, wrist.y, 34, 32, 1), wristF: wrist,
        elbowB: ik(shoulder.x, shoulder.y, wrist.x, wrist.y, 34, 32, 1), wristB: wrist,
        weight: null } };
    },
    bridge: function (t) {
      var depth = rep(t, 2.2);
      var shoulder = pt(62, 168);
      var hip = pt(108, 168 - 36 * depth);
      var ankle = pt(152, 180);
      var wrist = pt(88, 176);
      return { side: {
        hip: hip, shoulder: shoulder, head: pt(46, 168),
        ankleF: ankle, kneeF: ik(hip.x, hip.y, ankle.x, ankle.y, 46, 46, -1),
        ankleB: ankle, kneeB: ik(hip.x, hip.y, ankle.x, ankle.y, 46, 46, -1),
        elbowF: ik(shoulder.x, shoulder.y, wrist.x, wrist.y, 34, 32, 1), wristF: wrist,
        elbowB: ik(shoulder.x, shoulder.y, wrist.x, wrist.y, 34, 32, 1), wristB: wrist,
        weight: null } };
    },
    jacks: function (t) {
      var spread = rep(t, 1.1);
      return { front: { spread: spread } };
    },
    deadbug: function (t) {
      var swap = Math.floor(t / 2.4) % 2 === 1;
      var shoulder = pt(70, 168);
      var hip = pt(112, 168);
      // One leg extended, one in tabletop; they swap each rep.
      var extAnkle = pt(172, 168), topKnee = pt(112, 128), topAnkle = pt(142, 128);
      var ankleF = swap ? topAnkle : extAnkle;
      var kneeF = swap ? topKnee : ik(hip.x, hip.y, extAnkle.x, extAnkle.y, 46, 46, -1);
      var ankleB = swap ? extAnkle : topAnkle;
      var kneeB = swap ? ik(hip.x, hip.y, extAnkle.x, extAnkle.y, 46, 46, -1) : topKnee;
      var wrist = pt(70, 110);
      return { side: {
        hip: hip, shoulder: shoulder, head: pt(54, 168),
        ankleF: ankleF, kneeF: kneeF, ankleB: ankleB, kneeB: kneeB,
        elbowF: ik(shoulder.x, shoulder.y, wrist.x, wrist.y, 34, 32, 1), wristF: wrist,
        elbowB: ik(shoulder.x, shoulder.y, wrist.x, wrist.y, 34, 32, 1), wristB: wrist,
        weight: null } };
    },
    bicycle: function (t) {
      var shoulder = pt(70, 166 + 2 * Math.sin(t * Math.PI * 2 * 0.8));
      var hip = pt(110, 168);
      var th1 = t * Math.PI * 2 / 1.2, th2 = th1 + Math.PI;
      var ankleF = pt(118 + 28 * Math.cos(th1), 148 + 26 * Math.sin(th1));
      var ankleB = pt(118 + 28 * Math.cos(th2), 148 + 26 * Math.sin(th2));
      var wrist = pt(70, 112);
      return { side: {
        hip: hip, shoulder: shoulder, head: pt(54, 166),
        ankleF: ankleF, kneeF: ik(hip.x, hip.y, ankleF.x, ankleF.y, 46, 46, -1),
        ankleB: ankleB, kneeB: ik(hip.x, hip.y, ankleB.x, ankleB.y, 46, 46, -1),
        elbowF: ik(shoulder.x, shoulder.y, wrist.x, wrist.y, 34, 32, 1), wristF: wrist,
        elbowB: ik(shoulder.x, shoulder.y, wrist.x, wrist.y, 34, 32, 1), wristB: wrist,
        weight: null } };
    },
    climbers: function (t) {
      var drive = Math.floor(t / 0.6) % 2 === 1;
      var ankleBack = pt(42, 174);
      var wrist = pt(152, 180);
      var shoulder = pt(138, 128);
      var hip = pt((ankleBack.x + shoulder.x) / 2, (ankleBack.y + shoulder.y) / 2 - 6);
      // Drive foot lands under the chest with the knee forward; the back
      // leg stays straight. The old drive target sat too close to the hip
      // and folded the leg into a loop.
      var ankleDrive = pt(118, 172);
      var ankleF = drive ? ankleDrive : ankleBack;
      var ankleB = drive ? ankleBack : ankleDrive;
      var kneeBack = pt((hip.x + ankleBack.x) / 2, (hip.y + ankleBack.y) / 2);
      return { side: {
        hip: hip, shoulder: shoulder, head: pt(shoulder.x + 16, shoulder.y - 8),
        ankleF: ankleF, kneeF: drive ? ik(hip.x, hip.y, ankleF.x, ankleF.y, 46, 46, -1) : kneeBack,
        ankleB: ankleB, kneeB: drive ? kneeBack : ik(hip.x, hip.y, ankleB.x, ankleB.y, 46, 46, -1),
        elbowF: ik(shoulder.x, shoulder.y, wrist.x, wrist.y, 34, 32, 1), wristF: wrist,
        elbowB: ik(shoulder.x, shoulder.y, wrist.x, wrist.y, 34, 32, 1), wristB: wrist,
        weight: null } };
    },
    sideplank: function (t) {
      var pulse = 1.5 * Math.sin(t * Math.PI * 2 * 0.25);
      var shoulder = pt(104, 138 + pulse);
      var hip = pt(78, 160 + pulse);
      var ankle = pt(48, 178 + pulse);
      var elbow = pt(100, 176);
      var wristTop = pt(104, 96 + pulse);
      // Front arm props the body: upper arm down to the elbow, forearm
      // flat on the ground. The old version hid the forearm entirely.
      var wristGround = pt(122, 176);
      return { side: {
        hip: hip, shoulder: shoulder, head: pt(108, 122 + pulse),
        ankleF: ankle, kneeF: pt((hip.x + ankle.x) / 2, (hip.y + ankle.y) / 2),
        ankleB: ankle, kneeB: pt((hip.x + ankle.x) / 2, (hip.y + ankle.y) / 2),
        elbowF: elbow, wristF: wristGround,
        elbowB: ik(shoulder.x, shoulder.y, wristTop.x, wristTop.y, 34, 32, 1), wristB: wristTop,
        weight: null } };
    },
    calf: function (t) {
      var rise = rep(t, 1.2);
      var lift = 10 * rise;
      var ankle = pt(108, 180 - lift);
      var hip = pt(102, 96 - lift);
      var shoulder = pt(104, 50 - lift);
      var wrist = pt(106, 116 - lift);
      var knee = pt((hip.x + ankle.x) / 2, (hip.y + ankle.y) / 2);
      return { side: {
        hip: hip, shoulder: shoulder, head: pt(106, 32 - lift),
        ankleF: ankle, kneeF: knee,
        ankleB: ankle, kneeB: knee,
        elbowF: ik(shoulder.x, shoulder.y, wrist.x, wrist.y, 34, 32, 1), wristF: wrist,
        elbowB: ik(shoulder.x, shoulder.y, wrist.x, wrist.y, 34, 32, 1), wristB: wrist,
        weight: null } };
    },
    wallsit: function (t) {
      var tremble = Math.sin(t * 30) * 1;
      var hip = pt(96 + tremble, 142);
      var knee = pt(132, 142);
      var ankle = pt(132, 180);
      var shoulder = pt(96 + tremble, 94);
      var wrist = pt(100, 140);
      return { wall: true, side: {
        hip: hip, shoulder: shoulder, head: pt(98 + tremble, 76),
        ankleF: ankle, kneeF: knee, ankleB: ankle, kneeB: knee,
        elbowF: ik(shoulder.x, shoulder.y, wrist.x, wrist.y, 34, 32, 1), wristF: wrist,
        elbowB: ik(shoulder.x, shoulder.y, wrist.x, wrist.y, 34, 32, 1), wristB: wrist,
        weight: null } };
    },
    row: function (t, weight) {
      var pull = rep(t, 2.0);
      var hip = pt(88, 122);
      var ankle = pt(108, 180);
      var shoulder = pt(122, 86);
      var wrist = pt(128 - 22 * pull, 150 - 34 * pull);
      return { side: {
        hip: hip, shoulder: shoulder, head: pt(shoulder.x + 10, shoulder.y - 14),
        ankleF: ankle, kneeF: ik(hip.x, hip.y, ankle.x, ankle.y, 46, 46, -1),
        ankleB: ankle, kneeB: ik(hip.x, hip.y, ankle.x, ankle.y, 46, 46, -1),
        elbowF: ik(shoulder.x, shoulder.y, wrist.x, wrist.y, 34, 32, 1), wristF: wrist,
        elbowB: ik(shoulder.x, shoulder.y, wrist.x, wrist.y, 34, 32, 1), wristB: wrist,
        weight: weight ? wrist : null } };
    },
    deadlift: function (t) {
      var depth = rep(t, 2.4);
      var hip = pt(102 - 16 * depth, 96 + 30 * depth);
      var ankle = pt(108, 180);
      var shoulder = pt(hip.x + 8 + 40 * depth, hip.y - 48 + 16 * depth);
      var wrist = pt(shoulder.x + 2, shoulder.y + 54);
      return { side: {
        hip: hip, shoulder: shoulder, head: pt(shoulder.x + 12, shoulder.y - 10),
        ankleF: ankle, kneeF: ik(hip.x, hip.y, ankle.x, ankle.y, 46, 46, -1),
        ankleB: ankle, kneeB: ik(hip.x, hip.y, ankle.x, ankle.y, 46, 46, -1),
        elbowF: ik(shoulder.x, shoulder.y, wrist.x, wrist.y, 34, 32, 1), wristF: wrist,
        elbowB: ik(shoulder.x, shoulder.y, wrist.x, wrist.y, 34, 32, 1), wristB: wrist,
        weight: null } };
    },
    press: function (t) {
      var press = rep(t, 2.0);
      var hip = pt(102, 96);
      var ankle = pt(108, 180);
      var shoulder = pt(104, 50);
      var wrist = pt(106, 44 - 36 * press);
      return { side: {
        hip: hip, shoulder: shoulder, head: pt(106, 32),
        ankleF: ankle, kneeF: ik(hip.x, hip.y, ankle.x, ankle.y, 46, 46, -1),
        ankleB: ankle, kneeB: ik(hip.x, hip.y, ankle.x, ankle.y, 46, 46, -1),
        elbowF: ik(shoulder.x, shoulder.y, wrist.x, wrist.y, 34, 32, 1), wristF: wrist,
        elbowB: ik(shoulder.x, shoulder.y, wrist.x, wrist.y, 34, 32, 1), wristB: wrist,
        weight: null } };
    },
    floorpress: function (t, weight) {
      var press = rep(t, 2.0);
      var shoulder = pt(70, 168);
      var hip = pt(112, 168);
      var ankle = pt(152, 180);
      var wrist = pt(88, 148 - 40 * press);
      return { side: {
        hip: hip, shoulder: shoulder, head: pt(54, 168),
        ankleF: ankle, kneeF: ik(hip.x, hip.y, ankle.x, ankle.y, 46, 46, -1),
        ankleB: ankle, kneeB: ik(hip.x, hip.y, ankle.x, ankle.y, 46, 46, -1),
        elbowF: ik(shoulder.x, shoulder.y, wrist.x, wrist.y, 34, 32, 1), wristF: wrist,
        elbowB: ik(shoulder.x, shoulder.y, wrist.x, wrist.y, 34, 32, 1), wristB: wrist,
        weight: weight ? wrist : null } };
    },
    farmerhold: function (t) {
      var sway = 2 * Math.sin(t * Math.PI * 2 * 0.5);
      var hip = pt(102 + sway, 96);
      var ankle = pt(108 + sway, 180);
      var shoulder = pt(104 + sway, 50);
      var wrist = pt(106 + sway, 116);
      return { side: {
        hip: hip, shoulder: shoulder, head: pt(106 + sway, 32),
        ankleF: ankle, kneeF: ik(hip.x, hip.y, ankle.x, ankle.y, 46, 46, -1),
        ankleB: ankle, kneeB: ik(hip.x, hip.y, ankle.x, ankle.y, 46, 46, -1),
        elbowF: ik(shoulder.x, shoulder.y, wrist.x, wrist.y, 34, 32, 1), wristF: wrist,
        elbowB: ik(shoulder.x, shoulder.y, wrist.x, wrist.y, 34, 32, 1), wristB: wrist,
        weight: wrist } };
    }
  };

  var STATION_VISUAL = {
    "Squats": { pattern: "squat" },
    "Push-Ups": { pattern: "pushup" },
    "Lunges": { pattern: "lunge" },
    "Plank": { pattern: "plank" },
    "Glute Bridge": { pattern: "bridge" },
    "Jumping Jacks": { pattern: "jacks" },
    "Dead Bug": { pattern: "deadbug" },
    "Bicycle Crunch": { pattern: "bicycle" },
    "Mountain Climbers": { pattern: "climbers" },
    "Side Plank Left": { pattern: "sideplank", flip: true },
    "Side Plank Right": { pattern: "sideplank", flip: false },
    "Calf Raises": { pattern: "calf" },
    "Wall Sit": { pattern: "wallsit" },
    "Step-Back Lunge": { pattern: "lunge" },
    "Goblet Squat": { pattern: "squat", weight: "chest" },
    "Dumbbell Press": { pattern: "floorpress", weight: "wrists" },
    "Bent Row": { pattern: "row", weight: "wrist" },
    "Romanian Deadlift": { pattern: "deadlift" },
    "Overhead Press": { pattern: "press" },
    "Farmer Hold": { pattern: "farmerhold", weight: "wrists" }
  };

  function line(el, a, b) {
    el.setAttribute("x1", a.x); el.setAttribute("y1", a.y);
    el.setAttribute("x2", b.x); el.setAttribute("y2", b.y);
  }
  function createExerciseFigure(container) {
    var svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("viewBox", "0 0 220 200");
    svg.style.display = "block";
    svg.style.width = "100%";
    svg.style.height = "auto";
    function el(tag, attrs) {
      var e = document.createElementNS(SVGNS, tag);
      for (var k in attrs) e.setAttribute(k, attrs[k]);
      return e;
    }
    function limb(color, width) {
      return el("line", { stroke: color, "stroke-width": width, "stroke-linecap": "round" });
    }
    var ground = el("line", { x1: 8, y1: GROUND_Y, x2: 212, y2: GROUND_Y, stroke: "#374151", "stroke-width": 2 });
    var wall = el("line", { x1: 58, y1: 40, x2: 58, y2: GROUND_Y, stroke: "#4b5563", "stroke-width": 4 });
    wall.style.display = "none";
    var mirror = el("g", {});
    var legB1 = limb("#6b7280", 7), legB2 = limb("#6b7280", 7);
    var armB1 = limb("#6b7280", 6), armB2 = limb("#6b7280", 6);
    var legF1 = limb("#ffffff", 9), legF2 = limb("#ffffff", 9);
    var armF1 = limb("#ffffff", 8), armF2 = limb("#ffffff", 8);
    var torso = limb("#ffffff", 11);
    var head = el("circle", { r: 12, fill: "#ffffff" });
    var weight = el("circle", { r: 8, fill: "#f59e0b" });
    weight.style.display = "none";
    mirror.appendChild(legB1); mirror.appendChild(legB2);
    mirror.appendChild(armB1); mirror.appendChild(armB2);
    mirror.appendChild(legF1); mirror.appendChild(legF2);
    mirror.appendChild(armF1); mirror.appendChild(armF2);
    mirror.appendChild(torso); mirror.appendChild(head); mirror.appendChild(weight);
    var gFront = el("g", {});
    var headF = el("circle", { r: 12, fill: "#ffffff" });
    var torsoF = limb("#ffffff", 11);
    var armFL = limb("#ffffff", 8), armFR = limb("#ffffff", 8);
    var legFL = limb("#ffffff", 9), legFR = limb("#ffffff", 9);
    gFront.appendChild(headF); gFront.appendChild(torsoF);
    gFront.appendChild(armFL); gFront.appendChild(armFR);
    gFront.appendChild(legFL); gFront.appendChild(legFR);
    svg.appendChild(ground); svg.appendChild(wall); svg.appendChild(mirror); svg.appendChild(gFront);
    container.appendChild(svg);

    var currentPattern = "squat", currentWeight = null, currentFlip = false;
    var dimmed = false, patternTime = 0, running = false, paused = false;
    var rafId = null, lastTs = 0;

    function render(t) {
      var fn = PATTERNS[currentPattern];
      if (!fn) return;
      var out = fn(t, currentWeight);
      var flip = currentFlip || !!out.flip;
      mirror.setAttribute("transform", flip ? "translate(220,0) scale(-1,1)" : "");
      wall.style.display = out.wall ? "block" : "none";
      svg.style.opacity = dimmed ? "0.45" : "1";
      if (out.front) {
        mirror.style.display = "none";
        gFront.style.display = "block";
        var s = out.front.spread;
        headF.setAttribute("cx", 110); headF.setAttribute("cy", 30);
        line(torsoF, pt(110, 52), pt(110, 104));
        line(armFL, pt(110, 56), pt(110 - (14 + 22 * s), 104 - 96 * s));
        line(armFR, pt(110, 56), pt(110 + (14 + 22 * s), 104 - 96 * s));
        line(legFL, pt(110, 104), pt(110 - 28 * s, 180));
        line(legFR, pt(110, 104), pt(110 + 28 * s, 180));
        weight.style.display = "none";
        return;
      }
      mirror.style.display = "block";
      gFront.style.display = "none";
      var j = out.side;
      line(legB1, j.hip, j.kneeB); line(legB2, j.kneeB, j.ankleB);
      line(armB1, j.shoulder, j.elbowB); line(armB2, j.elbowB, j.wristB);
      line(legF1, j.hip, j.kneeF); line(legF2, j.kneeF, j.ankleF);
      line(armF1, j.shoulder, j.elbowF); line(armF2, j.elbowF, j.wristF);
      line(torso, j.hip, j.shoulder);
      head.setAttribute("cx", j.head.x); head.setAttribute("cy", j.head.y);
      if (j.weight) {
        weight.setAttribute("cx", j.weight.x); weight.setAttribute("cy", j.weight.y);
        weight.style.display = "block";
      } else {
        weight.style.display = "none";
      }
    }
    function loop(ts) {
      if (!rafId) return;
      rafId = requestAnimationFrame(loop);
      if (running && !paused) {
        var dt = (ts - lastTs) / 1000;
        lastTs = ts;
        if (dt > 0 && dt < 1) patternTime += dt;
        render(patternTime);
      } else {
        lastTs = ts;
      }
    }
    return {
      setStation: function (station, dim) {
        var v = STATION_VISUAL[station];
        if (!v) return;
        currentPattern = v.pattern;
        currentWeight = v.weight || null;
        currentFlip = !!v.flip;
        dimmed = !!dim;
        patternTime = 0;
        render(0);
      },
      setPattern: function (name, opts) {
        opts = opts || {};
        currentPattern = name;
        currentWeight = opts.weight || null;
        currentFlip = !!opts.flip;
        dimmed = !!opts.dim;
        patternTime = 0;
        render(0);
      },
      renderOne: function (name, t, opts) {
        opts = opts || {};
        currentPattern = name;
        currentWeight = opts.weight || null;
        currentFlip = !!opts.flip;
        dimmed = !!opts.dim;
        render(t);
      },
      start: function () {
        if (rafId) return;
        running = true;
        lastTs = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
        rafId = requestAnimationFrame(loop);
      },
      stop: function () {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
        running = false;
      },
      setPaused: function (p) { paused = !!p; }
    };
  }

  global.createExerciseFigure = createExerciseFigure;
  global.ExerciseFigurePatterns = PATTERNS;
  global.ExerciseFigureStations = STATION_VISUAL;
})(typeof window !== "undefined" ? window : this);
