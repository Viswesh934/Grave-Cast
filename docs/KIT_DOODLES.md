# Kit doodles

The working list for survival kit drawings. It works with [GRAVECAST_VISION.md](./GRAVECAST_VISION.md) §3.7 and §4.

Each kit card is a comic strip. Each panel has one **doodle**: a stick-figure drawing generated from a small data file and rendered with Rough.js. The content owner writes a **doodle script** for each doodle. The script is turned into the data file.

The scripts live in [KIT_SCRIPTS.md](./KIT_SCRIPTS.md): 31 cards and 95 panels, each card with a `review` status. Pose and prop ids there are snake_case (for example `kneeling_compressions`), and the doodle system uses those exact ids. The pose and prop tables in §3 and §4 below are the starting set. KIT_SCRIPTS.md is the full list.

**Rule:** a doodle shows only what its sourced caption says. Steps, order, numbers, and warnings come from the script's source (IFRC, ILCOR, or WHO guidance). If a step has no source, it gets no doodle.

---

## 1. Build order

Foundations first, then batches. Each step ends with something visible on the Groove UI docs site.

| Step | What | Done when |
| --- | --- | --- |
| **F1. Format and figure** | TypeScript types for a doodle; the stick-figure skeleton; the core poses (§3); a Rough.js renderer with a fixed seed | One test doodle renders identically on every reload |
| **F2. Props and comic page** | The core props (§4); highlights; the comic page (every panel at once, framed and numbered, caption as real text, screen-reader description, reduced motion) | A 3-panel test strip reads at a glance, side by side on wide screens and stacked on phones |
| **F3. Script to data** | A validator: every pose and prop exists, and every doodle has a caption, a source, and a description | A bad data file fails with a clear message |
| **B1–B6** | The batches in §5, one at a time | Each doodle matches its script, and the card reads correctly with the drawings hidden |

New poses or props are added only when a batch needs them. Each one is added once and reused.

## 2. Doodle script template

Write one block per doodle. Keep it short. The caption is the only text the user reads.

```text
id:          cpr-adult-03            (card, then panel number)
card:        CPR (adult)
panel:       3 of 6
caption:     <the step, worded as in the source>
source:      <organisation, document, section or page, year>
view:        side | top | front | close-up
figures:     helper: kneeling-beside; casualty: lying-on-back
props:       floor-line, hand-marker(chest-centre)
highlight:   hands                   (the one detail the eye should go to)
motion:      none | push (repeat) | arrow
description: <one sentence for screen readers describing the drawing>
```

If a pose or prop isn't in §3 or §4, describe it in plain words under `notes:`, and it is added in that batch.

## 3. Core poses (built in F1)

The figure is a skeleton: head, neck, shoulders, elbows, hands, hips, knees, and feet. A pose is a set of joint positions. A figure can be adult, child, or infant size.

| Pose | Used by |
| --- | --- |
| standing | most cards |
| standing-pointing / standing-waving | calling for help, signalling |
| standing-phone (hand at ear) | calling for help |
| sitting / sitting-leaning-forward | heart attack, allergic reaction, burns |
| kneeling-beside (arms free) | CPR, bleeding, recovery position, seizure |
| kneeling-arms-straight-down | CPR |
| lying-on-back | CPR, shock, drowning |
| lying-on-side | recovery position |
| standing-behind (arms around another figure) | choking |
| crouching-low / covering-head | earthquake, cyclone |
| walking / carrying | flood, fire, shelter |

## 4. Core props (built in F2)

| Prop | Used by |
| --- | --- |
| floor-line, ground-line | almost every scene |
| hand-marker (a point on the body) | CPR, bleeding, choking |
| arrow (straight, curved, push) | movement and direction |
| tick / cross | every Do / Don't panel |
| phone | calling for help, saving battery, help message |
| cloth / bandage | bleeding, fractures, burns |
| tap and water / bowl | burns, making water safe |
| pot over fire, bottle in sun, cloth filter | making water safe |
| cable and switch | electric shock |
| tarp and rope | shelter |
| mirror and sun rays, whistle, ground letters | signalling |
| water level (waves) | flood, drowning |
| wind lines, table, door, flames and smoke, sun | cyclone, earthquake, fire, extreme heat |

## 5. The doodle list

Panel counts are estimates for planning. The real count comes from each card's source and your script.

### B1. Lying person and helper

These cards reuse the most: a lying figure, a kneeling helper, and a floor line.

| Card | View | Figures | Est. panels |
| --- | --- | --- | --- |
| CPR (adult) | side, close-up | adult helper, adult casualty | 5–7 |
| CPR (child) | side | adult helper, child casualty | 5–7 |
| Recovery position | side, top | adult helper, adult casualty | 4–6 |
| Drowning (after rescue) | side | adult helper, casualty | 3–5 |
| Shock | side | adult helper, casualty | 3–4 |
| Seizure | top | adult helper, casualty | 3–5 |
| Poisoning | side | adult helper, casualty, phone | 3–4 |

### B2. Standing and sitting pairs

| Card | View | Figures | Est. panels |
| --- | --- | --- | --- |
| Choking (adult) | side | two adults | 4–6 |
| Choking (child) | side | adult, child | 4–6 |
| Heart attack | front | adult sitting, helper, phone | 3–5 |
| Stroke (FAST) | front, close-up | adult, helper | 4–5 |
| Allergic reaction | front | adult, helper | 3–5 |

### B3. Close-ups of limbs and hazards

| Card | View | Figures | Est. panels |
| --- | --- | --- | --- |
| Severe bleeding | close-up | arm or leg, hands, cloth | 3–5 |
| Burns | close-up | arm, tap and water | 3–4 |
| Fractures and sprains | close-up | arm or leg, cloth | 3–4 |
| Snakebite (general) | side, close-up | adult, helper | 3–5 |
| Electric shock | side | adult, helper, cable and switch | 3–4 |
| Heat stroke | side | adult, helper, sun, water | 3–4 |
| Hypothermia | side | adult, helper, blanket | 3–4 |

### B4. Infants

Needs the infant figure size and a held-infant pose.

| Card | View | Figures | Est. panels |
| --- | --- | --- | --- |
| CPR (infant) | side, close-up | adult, infant | 5–7 |
| Choking (infant) | side | adult, infant | 4–6 |

### B5. Survival

| Card | View | Figures | Est. panels |
| --- | --- | --- | --- |
| Making water safe | side | adult, pot and fire, cloth filter, bottle in sun | 4–6 |
| Signalling for help | front, top | adult, mirror, whistle, ground letters, fire | 4–6 |
| Simple shelter | side | adult, tarp and rope | 3–5 |
| Saving phone battery | close-up | phone | 3–4 |
| Staying found when lost | front | adult | 3–4 |

### B6. Disasters (general)

| Card | View | Figures | Est. panels |
| --- | --- | --- | --- |
| Flood | side | adults, water level | 4–5 |
| Cyclone or hurricane | side | adults, wind lines | 4–5 |
| Earthquake | side | adult, table | 3–5 |
| Fire | side | adults, flames and smoke, door | 4–5 |
| Extreme heat | side | adult, sun, water | 3–4 |

**Total:** 31 cards and roughly 110–150 doodles. The total shrinks with reuse: many Do / Don't panels share drawings.

## 6. How a batch runs

1. You send the doodle scripts for one batch, or for one card at a time.
2. Any new poses or props are added first.
3. The data files are written and validated.
4. The strip is checked on the docs site, then committed.

Each batch only needs this file, the doodle types, and your scripts, so sessions stay short and predictable.
