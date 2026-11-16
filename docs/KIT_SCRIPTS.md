# Kit doodle scripts

The content for every survival kit card: captions, sources, and the poses and props each panel needs. It works with [KIT_DOODLES.md](./KIT_DOODLES.md), which covers the build order and the doodle system, and [GRAVECAST_VISION.md](./GRAVECAST_VISION.md) §3.7.

## Review status

**Hackathon prototype:** all 31 cards are included, with no per-card labels. The survival kit shows one notice: *"Prototype. Always follow official guidance and your local emergency services."*

**Production (later):** only `verified` cards ship. The rules below are the checklist for that.

A card is `verified` when both of these are true:

1. **The content owner has checked it** against its source.
2. **Its source names one document and links to that document**, not a homepage or a mix of organisations.

| Status | Cards |
| --- | --- |
| `verified` | B1.2, B1.3, B1.5, B1.6, B2.2, B2.3, B2.4, B2.5, B3.1, B3.2, B3.3, B3.5, B3.6, B3.7, B4.1, B4.2 |
| `draft`: link goes to a homepage | B1.1, B5.1, B5.2, B5.4, B6.1, B6.2, B6.3, B6.4, B6.5 |
| `draft`: source mixes organisations or isn't one document | B1.4, B1.7, B2.1, B3.4, B5.3, B5.5 |

To move a draft card to `verified`, replace its `source` with the exact document and its direct link, then change `review`.

## Conventions

- **Pose and prop names** are snake_case ids, such as `kneeling_compressions` and `phone_sos`. The doodle system uses these exact ids. A new name means a new pose or prop is added in that batch.
- **Figures:** `victim`, `helper`, `child`, `infant`, `hiker`, and `family` are figure roles. `limb_closeup`, `face_closeup`, and `hands_closeup` are close-up framings. `prop_scene`, `aerial_view`, and `sequence` are scenes without a main figure.
- **Sub-panels:** `1a` and `1b` (or `3a`–`c`) are split panels shown side by side within one step.
- **Units:** metric first. Phone numbers are always "your local emergency number" or "your local poison information centre".

---

## Batch B1: Lying person and helper

### B1.1 Adult CPR
- **review:** `draft` (the link is the AHA homepage; link the 2025 Guidelines document)
- **source:** AHA 2025 Guidelines for CPR and ECC (https://cpr.heart.org)
- **Panel 1 (Check and call):** Tap shoulders and shout to check responsiveness, then check breathing for no more than 10 seconds. If unresponsive and not breathing or only gasping, call your local emergency number and send someone for an AED.
  - Poses: `victim: lying_supine`, `helper: kneeling_check`
  - Props: `phone_sos`, `timer_10s`
- **Panel 2 (Chest compressions):** Place the heel of one hand in the center of the chest with the other hand on top, fingers interlocked. Push hard and fast at least 5 cm deep at 100–120 compressions per minute, allowing full chest recoil.
  - Poses: `victim: lying_supine`, `helper: kneeling_compressions`
  - Props: `depth_arrow_5cm`, `rate_badge`
- **Panel 3 (Rescue breaths and loop):** Tilt the head back, lift the chin, pinch the nose, and give 2 breaths (1 second each) after every 30 compressions. Continue uninterrupted until an AED arrives or medical help takes over.
  - Poses: `victim: lying_supine_head_tilt`, `helper: kneeling_breaths`
  - Props: `loop_30_2_badge`

### B1.2 Child CPR (age 1 to puberty)
- **review:** `verified`
- **source:** AHA 2025 Pediatric Basic Life Support (https://www.ahajournals.org/doi/10.1161/CIR.0000000000001370)
- **Panel 1 (Check and call):** Tap shoulders, shout, and look for normal breathing for up to 10 seconds. If alone with an unresponsive child, give 2 minutes (5 cycles) of CPR first before calling your local emergency number; if someone else is present, have them call immediately.
  - Poses: `child: lying_supine`, `helper: kneeling_check`
  - Props: `timer_10s`, `phone_sos`
- **Panel 2 (Chest compressions):** Use one or two hands in the center of the chest. Compress about 5 cm deep (roughly one-third of chest depth) at 100–120 compressions per minute.
  - Poses: `child: lying_supine`, `helper: kneeling_compressions_one_hand`
  - Props: `depth_arrow_5cm`
- **Panel 3 (Rescue breaths):** Open the airway with head-tilt/chin-lift, pinch the nose, seal your mouth over theirs, and give 2 rescue breaths (1 second each) so the chest rises. Repeat 30 compressions to 2 breaths.
  - Poses: `child: lying_supine_head_tilt`, `helper: kneeling_breaths`
  - Props: `loop_30_2_badge`

### B1.3 Recovery position
- **review:** `verified`
- **source:** IFRC International First Aid, Resuscitation and Education Guidelines 2025 (https://www.ifrc.org/document/ifrc-international-first-aid-resuscitation-and-education-guidelines-2025)
- **Panel 1 (Arm setup):** Use only if the person is unresponsive, breathing normally, and has no suspected spinal injury. Kneel beside them and place the arm nearest you at a right angle with palm facing up.
  - Poses: `victim: lying_supine_arm_out`, `helper: kneeling_beside`
  - Props: `angle_arrow`
- **Panel 2 (Hand and knee):** Bring the far arm across their chest and hold the back of that hand against their near cheek. Pull their far knee up until the foot is flat on the ground.
  - Poses: `victim: lying_knee_bent`, `helper: kneeling_guiding`
  - Props: `motion_arc`
- **Panel 3 (Roll and tilt):** Pull on the bent knee to roll the person onto their side toward you. Tilt their head back slightly to keep the airway open and monitor breathing continuously.
  - Poses: `victim: lying_recovery`, `helper: kneeling_monitoring`
  - Props: `airway_arrow`

### B1.4 Drowning rescue and care
- **review:** `draft` (the source names two organisations and links the WHO homepage; pin one document, and keep the initial breath count matching it)
- **source:** WHO / ERC Drowning Resuscitation Protocol (https://who.int)
- **Panel 1 (Safe reach):** Never enter deep or fast water unless trained. Reach with a pole or branch, or throw a floating object or rope to pull the person to safety.
  - Poses: `victim: swimming_distress`, `helper: standing_braced_reach`
  - Props: `water_waves`, `rescue_pole`
- **Panel 2 (5 initial rescue breaths):** Place the person flat on their back on firm ground and check breathing. Because drowning causes oxygen deprivation, give 5 initial rescue breaths before starting chest compressions.
  - Poses: `victim: lying_supine_head_tilt`, `helper: kneeling_breaths`
  - Props: `badge_5_breaths`
- **Panel 3 (30:2 CPR and warmth):** Follow with cycles of 30 chest compressions and 2 breaths. Once breathing resumes, place in the recovery position and cover with dry blankets.
  - Poses: `victim: lying_recovery_blanket`, `helper: kneeling_monitoring`
  - Props: `blanket`, `loop_30_2_badge`

### B1.5 Shock
- **review:** `verified`
- **source:** IFRC International First Aid, Resuscitation and Education Guidelines 2025 (https://www.ifrc.org/document/ifrc-international-first-aid-resuscitation-and-education-guidelines-2025)
- **Panel 1 (Recognize and call):** Look for pale, cool, clammy skin, rapid shallow breathing, weakness, or confusion. Call your local emergency number immediately and treat any obvious cause like severe bleeding.
  - Poses: `victim: lying_supine_distress`, `helper: kneeling_calling`
  - Props: `phone_sos`, `sweat_drops`
- **Panel 2 (Positioning):** Help the person lie flat on their back. If there is no head, neck, back, or leg injury, raise their legs about 30 cm to support blood flow to vital organs.
  - Poses: `victim: lying_legs_elevated`, `helper: kneeling_supporting`
  - Props: `support_bag`
- **Panel 3 (Maintain warmth):** Loosen tight clothing and cover the person with a coat or blanket to keep them warm. Do not give anything to eat or drink.
  - Poses: `victim: lying_covered`, `helper: kneeling_beside`
  - Props: `blanket`, `no_drink_icon`

### B1.6 Seizure
- **review:** `verified`
- **source:** IFRC International First Aid, Resuscitation and Education Guidelines 2025 (https://www.ifrc.org/document/ifrc-international-first-aid-resuscitation-and-education-guidelines-2025)
- **Panel 1 (Protect the head):** Ease the person to the floor and clear away hard or sharp objects. Place something soft and flat under their head and loosen tight neckwear.
  - Poses: `victim: lying_seizure`, `helper: kneeling_cushioning`
  - Props: `folded_jacket`, `cleared_chair`
- **Panel 2 (Do not restrain):** Never hold the person down, stop their movements, or put anything inside their mouth. Time the seizure from start to finish.
  - Poses: `victim: lying_seizure`, `helper: kneeling_hands_off`
  - Props: `stopwatch`, `no_restrain_icon`, `no_mouth_object_icon`
- **Panel 3 (Aftercare and emergency):** Once movements stop, roll them onto their side into the recovery position and check breathing. Call your local emergency number if the seizure lasts over 5 minutes, repeats, or happens in water or during pregnancy.
  - Poses: `victim: lying_recovery`, `helper: kneeling_monitoring`
  - Props: `timer_5m_badge`

### B1.7 Poisoning
- **review:** `draft` (the source names WHO and IFRC but links only the IFRC 2025 Guidelines; if that is what was checked, name only IFRC 2025)
- **source:** WHO / IFRC Poisoning First Aid Guidelines (https://www.ifrc.org/document/ifrc-international-first-aid-resuscitation-and-education-guidelines-2025)
- **Panel 1 (Identify and call):** Check the area for containers, pills, chemicals, or fumes, and move the person to fresh air if inhaled. Call your local poison information centre or emergency number immediately.
  - Poses: `victim: sitting_drowsy`, `helper: standing_calling`
  - Props: `chemical_bottle`, `phone_sos`
- **Panel 2 (Do not induce vomiting):** Keep the person still and seated, or in the recovery position if drowsy. Never induce vomiting or give water, milk, or activated charcoal unless instructed by a poison information centre.
  - Poses: `victim: sitting_upright`, `helper: standing_beside`
  - Props: `no_vomit_icon`, `no_drink_icon`
- **Panel 3 (Skin or eye flush):** If poison spilled on skin or eyes, remove contaminated clothing carefully and rinse continuously with clean running water for 15–20 minutes.
  - Poses: `limb_closeup: forearm_rinse`
  - Props: `water_tap`, `timer_20m_badge`

---

## Batch B2: Standing and sitting pairs

### B2.1 Adult choking
- **review:** `draft` (the source names AHA 2025 and IFRC 2025; pin one, and link it)
- **source:** AHA 2025 Guidelines / IFRC 2025 Guidelines (https://www.ahajournals.org/doi/10.1161/CIR.0000000000001370)
- **Panel 1 (Encourage coughing):** Ask "Are you choking?" If they can cough forcefully or speak, stay with them and encourage coughing. If they cannot breathe, speak, or cough, call your local emergency number.
  - Poses: `victim: standing_choking`, `helper: standing_alert`
  - Props: `speech_bubble_check`
- **Panel 2 (5 back blows):** Stand behind and slightly to the side, support their chest with one arm, and lean them forward. Give 5 firm blows between the shoulder blades using the heel of your hand.
  - Poses: `victim: standing_lean_forward`, `helper: standing_back_blows`
  - Props: `impact_arrow_5x`
- **Panel 3 (5 abdominal thrusts):** Stand behind them, wrap your arms around their waist, place a thumb-side fist just above the navel, grasp it with your other hand, and pull inward and upward 5 times. Alternate 5 blows and 5 thrusts.
  - Poses: `victim: standing_upright`, `helper: standing_abdominal_thrusts`
  - Props: `j_thrust_arrow_5x`

### B2.2 Child choking (over age 1)
- **review:** `verified`
- **source:** AHA 2025 Pediatric Basic Life Support (https://www.ahajournals.org/doi/10.1161/CIR.0000000000001370)
- **Panel 1 (Kneel to their level):** If a child cannot cough, speak, or breathe, call your local emergency number and kneel behind them so you are at their level.
  - Poses: `child: standing_choking`, `helper: kneeling_behind`
  - Props: `phone_sos`
- **Panel 2 (5 back blows):** Support the child's chest with one arm, lean them forward at the waist, and give 5 firm back blows between the shoulder blades with the heel of your hand.
  - Poses: `child: standing_lean_forward`, `helper: kneeling_back_blows`
  - Props: `impact_arrow_5x`
- **Panel 3 (5 abdominal thrusts):** Wrap your arms around the child's waist, place your fist just above the navel, and give 5 quick inward-and-upward thrusts. Alternate sets of 5 until the object clears or the child becomes unresponsive.
  - Poses: `child: standing_upright`, `helper: kneeling_abdominal_thrusts`
  - Props: `j_thrust_arrow_5x`

### B2.3 Heart attack
- **review:** `verified`
- **source:** IFRC International First Aid, Resuscitation and Education Guidelines 2025 (https://www.ifrc.org/document/ifrc-international-first-aid-resuscitation-and-education-guidelines-2025)
- **Panel 1 (Recognize and call):** Watch for chest pressure or squeezing, pain spreading to the arm, back, neck, or jaw, shortness of breath, and cold sweats. Call your local emergency number immediately.
  - Poses: `victim: sitting_chest_pain`, `helper: standing_calling`
  - Props: `pain_radiate_lines`, `phone_sos`
- **Panel 2 (Half-sitting rest):** Help the person sit comfortably on the floor or a chair with knees bent and back supported (half-sitting position) to ease strain on the heart. Loosen tight clothing.
  - Poses: `victim: sitting_half_reclined`, `helper: kneeling_supporting`
  - Props: `wall_support`
- **Panel 3 (Aspirin):** If the person is fully alert and has no aspirin allergy or medical warning against it, give one adult aspirin (150–300 mg) to chew slowly while waiting for emergency help.
  - Poses: `victim: sitting_half_reclined`, `helper: kneeling_handing_med`
  - Props: `aspirin_tablet`

### B2.4 Stroke (FAST)
- **review:** `verified`
- **source:** IFRC International First Aid, Resuscitation and Education Guidelines 2025 (https://www.ifrc.org/document/ifrc-international-first-aid-resuscitation-and-education-guidelines-2025)
- **Panel 1a (F: Face):** Check Face: ask the person to smile. Does one side of the face droop?
  - Poses: `face_closeup: asymmetric_smile`
  - Props: `droop_arrow`
- **Panel 1b (A: Arms):** Check Arms: ask them to raise both arms. Does one arm drift downward?
  - Poses: `victim: sitting_one_arm_drift`
  - Props: `drift_arrow`
- **Panel 2 (S: Speech):** Check Speech: ask them to repeat a simple sentence. Is their speech slurred, garbled, or hard to understand?
  - Poses: `victim: sitting_speaking`, `helper: standing_listening`
  - Props: `wavy_speech_bubble`
- **Panel 3 (T: Time):** Check Time: if any single sign appears, call your local emergency number immediately and note the exact time symptoms started. Keep the person seated or lying with head slightly raised.
  - Poses: `victim: sitting_half_reclined`, `helper: standing_calling`
  - Props: `clock_exact_time`, `phone_sos`

### B2.5 Severe allergic reaction (anaphylaxis)
- **review:** `verified`
- **source:** IFRC International First Aid, Resuscitation and Education Guidelines 2025 (https://www.ifrc.org/document/ifrc-international-first-aid-resuscitation-and-education-guidelines-2025)
- **Panel 1 (Spot symptoms):** Look for swelling of the lips, tongue, or throat, hives, wheezing, dizziness, or trouble breathing after exposure to a trigger. Call your local emergency number immediately.
  - Poses: `victim: sitting_breathing_distress`, `helper: standing_calling`
  - Props: `phone_sos`, `wheeze_lines`
- **Panel 2 (Use an epinephrine auto-injector):** Help the person use their prescribed epinephrine auto-injector. Remove the safety cap, press the tip firmly at 90 degrees against the outer mid-thigh (even through clothing) until it clicks, and hold for 3–10 seconds per device instructions.
  - Poses: `limb_closeup: thigh_epipen`
  - Props: `epipen_simple`
- **Panel 3 (Position and monitor):** Have them sit upright if breathing is hard, or lie flat with legs raised if dizzy. A second dose may be given after 5–15 minutes if symptoms do not improve.
  - Poses: `victim: sitting_upright_forward`, `helper: kneeling_monitoring`
  - Props: `timer_5_15m_badge`

---

## Batch B3: Close-ups of limbs and hazards

### B3.1 Severe bleeding
- **review:** `verified`
- **source:** IFRC International First Aid, Resuscitation and Education Guidelines 2025 (https://www.ifrc.org/document/ifrc-international-first-aid-resuscitation-and-education-guidelines-2025)
- **Panel 1 (Direct pressure):** Expose the wound and apply firm, continuous direct pressure using a clean cloth, gauze, or gloved hands. Call your local emergency number for life-threatening bleeding.
  - Poses: `limb_closeup: forearm_direct_pressure`
  - Props: `gauze_pad`, `pressure_arrows`
- **Panel 2 (Layer and wrap):** If blood soaks through, place another pad directly on top without removing the first. Secure tightly with a pressure bandage.
  - Poses: `limb_closeup: forearm_bandaged`
  - Props: `gauze_double`, `roller_bandage`
- **Panel 3 (Limb tourniquet):** If severe limb bleeding does not stop with direct pressure, apply a commercial tourniquet 5–8 cm above the wound (never over a joint) and tighten until bleeding stops. Note the time applied.
  - Poses: `limb_closeup: upper_arm_tourniquet`
  - Props: `tourniquet_simple`, `time_tag`

### B3.2 Thermal burns
- **review:** `verified`
- **source:** IFRC International First Aid, Resuscitation and Education Guidelines 2025 (https://www.ifrc.org/document/ifrc-international-first-aid-resuscitation-and-education-guidelines-2025)
- **Panel 1 (Cool with running water):** Stop the burning process and immediately cool the burn under cool or lukewarm running water for at least 20 minutes. Never use ice, butter, or ointments.
  - Poses: `limb_closeup: hand_under_tap`
  - Props: `water_tap`, `timer_20m_badge`, `no_ice_icon`
- **Panel 2 (Remove constrictions):** Gently remove rings, watches, bracelets, or tight clothing near the burn before swelling starts, unless stuck to the skin.
  - Poses: `limb_closeup: wrist_removing_ring`
  - Props: `ring_watch`
- **Panel 3 (Cover loosely):** Loosely cover the cooled burn with sterile non-stick gauze or clean plastic cling wrap to protect against infection. Do not pop blisters.
  - Poses: `limb_closeup: forearm_loose_wrap`
  - Props: `cling_wrap_sheet`

### B3.3 Fractures
- **review:** `verified`
- **source:** IFRC International First Aid, Resuscitation and Education Guidelines 2025 (https://www.ifrc.org/document/ifrc-international-first-aid-resuscitation-and-education-guidelines-2025)
- **Panel 1 (Immobilize in place):** Keep the injured limb still in the position you found it. Support the joints above and below the break; never try to straighten or push a bone back in.
  - Poses: `limb_closeup: forearm_supported_hands`
  - Props: `support_arrows`
- **Panel 2 (Pad and splint):** If medical help is delayed, place rigid padding along both sides of the limb and tie securely above and below the injury, never directly over the break.
  - Poses: `limb_closeup: forearm_splinted`
  - Props: `splint_boards`, `tie_strips`
- **Panel 3 (Cold pack and circulation):** Apply a cloth-wrapped cold pack to reduce swelling and check fingers or toes regularly for warmth, color, and sensation.
  - Poses: `limb_closeup: forearm_splint_ice`
  - Props: `wrapped_ice_pack`, `circulation_arrow`

### B3.4 Snakebite
- **review:** `draft` (the source names WHO and IFRC but links only the IFRC 2025 Guidelines; if that is what was checked, name only IFRC 2025)
- **source:** WHO / IFRC Snakebite First Aid Guidelines (https://www.ifrc.org/document/ifrc-international-first-aid-resuscitation-and-education-guidelines-2025)
- **Panel 1 (Move away and stay still):** Move the person away from the snake to safety and keep them completely still and calm to slow venom spread. Call your local emergency number immediately.
  - Poses: `victim: sitting_calm`, `helper: standing_calling`
  - Props: `snake_retreating`, `phone_sos`
- **Panel 2 (Immobilize below heart):** Remove rings, watches, or tight shoes near the bite before swelling begins. Keep the bitten limb immobilized and positioned at or slightly below heart level.
  - Poses: `limb_closeup: leg_immobilized_low`
  - Props: `fang_marks`, `flat_splint`
- **Panel 3 (What not to do):** Wash gently with soap and water if available, and cover loosely with a clean dressing. Never cut the wound, suck out venom, apply a tourniquet, or pack in ice.
  - Poses: `limb_closeup: leg_clean_dressing`
  - Props: `no_cut_icon`, `no_tourniquet_icon`, `no_ice_icon`

### B3.5 Electric shock
- **review:** `verified`
- **source:** IFRC International First Aid, Resuscitation and Education Guidelines 2025 (https://www.ifrc.org/document/ifrc-international-first-aid-resuscitation-and-education-guidelines-2025)
- **Panel 1 (Cut power first):** Do not touch the person while they are in contact with electricity. Turn off the main power switch, breaker, or unplug the cord first.
  - Poses: `victim: lying_near_wire`, `helper: standing_flipping_breaker`
  - Props: `breaker_box`, `frayed_wire`
- **Panel 2 (Separate safely):** If power cannot be shut off, stand on dry insulating material (wood or rubber) and push the wire away using a dry wooden broomstick or plastic object.
  - Poses: `victim: lying_supine`, `helper: standing_pushing_wire_pole`
  - Props: `dry_wood_board`, `wooden_pole`
- **Panel 3 (Check and cool burns):** Once safe, call your local emergency number, check breathing and start CPR if needed, and cool any electrical burns with cool running water.
  - Poses: `victim: lying_supine`, `helper: kneeling_check`
  - Props: `phone_sos`, `water_stream`

### B3.6 Heat stroke
- **review:** `verified`
- **source:** IFRC International First Aid, Resuscitation and Education Guidelines 2025 (https://www.ifrc.org/document/ifrc-international-first-aid-resuscitation-and-education-guidelines-2025)
- **Panel 1 (Recognize and move to shade):** Watch for confusion, slurred speech, hot skin, or collapse. Call your local emergency number immediately and move the person into shade or air conditioning.
  - Poses: `victim: sitting_dizzy`, `helper: standing_assisting_walk`
  - Props: `hot_sun`, `shade_tree`
- **Panel 2 (Rapid cooling):** Cool the person as fast as possible: immerse in cold water up to the neck, spray or sponge with cold water while fanning, or place ice packs at the neck, armpits, and groin.
  - Poses: `victim: lying_cooling`, `helper: kneeling_sponging`
  - Props: `ice_packs_core`, `fan_lines`
- **Panel 3 (No forced fluids):** Remove excess outer clothing and continue cooling until medical help arrives. Do not force a confused or semi-conscious person to drink fluids.
  - Poses: `victim: lying_cooling`, `helper: kneeling_monitoring`
  - Props: `no_drink_icon`

### B3.7 Hypothermia
- **review:** `verified`
- **source:** IFRC International First Aid, Resuscitation and Education Guidelines 2025 (https://www.ifrc.org/document/ifrc-international-first-aid-resuscitation-and-education-guidelines-2025)
- **Panel 1 (Shelter and gentle handling):** Move the person out of the wind and cold into a warm, dry shelter. Handle them gently, as rough movement can trigger dangerous heart rhythms.
  - Poses: `victim: standing_shivering`, `helper: standing_assisting_walk`
  - Props: `wind_lines`, `tent_outline`
- **Panel 2 (Remove wet layers):** Gently cut away or remove wet clothing and dry their skin. Cover their head, neck, and body with dry blankets and a windproof layer.
  - Poses: `victim: sitting_wrapped_blanket`, `helper: kneeling_covering`
  - Props: `blanket`, `beanie_hat`
- **Panel 3 (Gradual core warmth):** Place wrapped warm water bottles or heat packs at the armpits, chest, and groin. If fully awake, offer warm, sweet, non-alcoholic drinks; never apply direct high heat or rub limbs.
  - Poses: `victim: sitting_wrapped_blanket`, `helper: kneeling_handing_mug`
  - Props: `warm_mug`, `core_heat_packs`

---

## Batch B4: Infants (under age 1)

### B4.1 Infant CPR
- **review:** `verified`
- **source:** AHA 2025 Pediatric Basic Life Support (https://www.ahajournals.org/doi/10.1161/CIR.0000000000001370)
- **Panel 1 (Tap foot and call):** Tap the bottom of the infant's foot and shout to check response, then check breathing for up to 10 seconds. If alone and unresponsive, give 2 minutes of CPR first before calling your local emergency number.
  - Poses: `infant: lying_supine`, `helper: kneeling_tap_foot`
  - Props: `timer_10s`, `phone_sos`
- **Panel 2 (30 compressions, 2 thumbs or 1 hand):** Encircle the infant's chest with both hands and press the lower half of the sternum with both thumbs (or use the heel of one hand). Compress about 4 cm deep at 100–120 compressions per minute.
  - Poses: `infant: lying_supine`, `helper: kneeling_infant_compressions_thumbs`
  - Props: `depth_arrow_4cm`
- **Panel 3 (2 gentle puffs):** Tilt the head to a neutral "sniffing" position without over-extending. Seal your mouth over both the infant's nose and mouth, and give 2 gentle 1-second puffs just until the chest rises.
  - Poses: `infant: lying_neutral_head`, `helper: kneeling_infant_breaths`
  - Props: `loop_30_2_badge`

### B4.2 Infant choking
- **review:** `verified`
- **source:** AHA 2025 Pediatric Basic Life Support (https://www.ahajournals.org/doi/10.1161/CIR.0000000000001370)
- **Panel 1 (5 back blows):** If the infant cannot cry, cough, or breathe, hold them face-down along your forearm resting on your thigh, supporting the head and jaw with head lower than chest. Give 5 firm back blows between the shoulder blades.
  - Poses: `infant: forearm_facedown`, `helper: sitting_infant_back_blows`
  - Props: `impact_arrow_5x`
- **Panel 2 (5 chest thrusts):** Sandwich the infant between your forearms, turn them face-up supporting the head, and press the lower sternum with two fingers or thumbs. Give 5 firm chest thrusts about 4 cm deep.
  - Poses: `infant: forearm_faceup`, `helper: sitting_infant_chest_thrusts`
  - Props: `thrust_arrow_5x`
- **Panel 3 (Repeat or CPR):** Repeat 5 back blows and 5 chest thrusts until the object clears or the infant cries. If the infant becomes unresponsive, call your local emergency number and begin infant CPR.
  - Poses: `infant: lying_supine`, `helper: kneeling_infant_compressions_thumbs`
  - Props: `phone_sos`

---

## Batch B5: Survival basics

### B5.1 Safe water
- **review:** `draft` (the link is the WHO homepage; link the household water treatment document)
- **source:** WHO Household Water Treatment and Safe Storage (https://who.int)
- **Panel 1 (Filter sediment):** Collect the clearest flowing water available. Strain murky water through a clean cloth or coffee filter to remove dirt before disinfecting.
  - Poses: `hands_closeup: pouring_cloth_filter`
  - Props: `water_jug`, `cloth_filter`, `clean_pot`
- **Panel 2 (Rolling boil):** Bring filtered water to a full rolling boil for at least 1 minute (or 3 minutes at elevations above 2,000 m) to kill bacteria, viruses, and parasites.
  - Poses: `prop_scene: boiling_pot_fire`
  - Props: `camp_fire`, `boiling_bubbles`, `timer_1_3m_badge`
- **Panel 3 (Chemical or solar backup):** If boiling is impossible, add unscented household liquid chlorine bleach (typically 2 drops per litre of clear water and wait 30 minutes) or place clear PET bottles in direct sunlight for 6 hours.
  - Poses: `hands_closeup: dropper_bottle`
  - Props: `clear_pet_bottle`, `timer_30m_badge`

### B5.2 Signalling for rescue
- **review:** `draft` (the link is the ICAO homepage; link the Annex 12 signals reference used)
- **source:** ICAO Annex 12, Search and Rescue signals (https://icao.int)
- **Panel 1 (Ground-to-air code: V and X):** Lay out high-contrast symbols at least 3 m long in an open clearing. V means "Require assistance", while X means "Require medical assistance".
  - Poses: `aerial_view: hiker_laying_signal`
  - Props: `signal_v_and_x`, `helicopter_simple`
- **Panel 2 (Sound and mirror flash):** Blow a whistle in sets of 3 sharp blasts (universal distress call). During daylight, flash sunlight toward aircraft or distant ridges using a signal mirror or phone screen.
  - Poses: `hiker: standing_whistle_mirror`
  - Props: `whistle_3x_waves`, `mirror_beam`, `helicopter_simple`
- **Panel 3 (Signal smoke):** Build a controlled signal fire in an open clearing and add green leaves or damp grass to produce thick white smoke visible from afar.
  - Poses: `hiker: standing_tending_fire`
  - Props: `camp_fire`, `smoke_column`

### B5.3 Emergency shelter
- **review:** `draft` (the source names two organisations and links the IFRC homepage; pin one document)
- **source:** IFRC / Red Cross Wilderness and Disaster Preparedness (https://www.ifrc.org)
- **Panel 1 (Safe site selection):** Choose flat, dry high ground away from dead overhead branches, dry riverbeds, cliff edges, and insect nests.
  - Poses: `hiker: standing_pointing_clearing`
  - Props: `dead_tree_no_icon`, `dry_creek_bed`
- **Panel 2 (Ground insulation):** Cold ground drains body heat faster than air. Build an insulating mattress of dry leaves, pine needles, or cardboard at least 10–15 cm thick before lying down.
  - Poses: `hiker: lying_insulated_bed`
  - Props: `leaf_mattress_layer`
- **Panel 3 (Wind and rain roof):** Rig a tarp, poncho, or leaned branches with the closed back angled into the wind. Keep the shelter compact to trap body heat.
  - Poses: `hiker: sitting_under_tarp`
  - Props: `tarp_a_frame`, `wind_deflect_arrows`

### B5.4 Preserving phone battery
- **review:** `draft` (the link is the Ready.gov homepage; link the page used)
- **source:** Ready.gov Communication and Power Preparedness (https://ready.gov)
- **Panel 1 (Airplane mode and battery saver):** Turn on Battery Saver / Low Power mode immediately, lower screen brightness to minimum, and enable Airplane Mode when you have zero signal so the phone stops draining power searching for towers.
  - Poses: `prop_scene: phone_settings_a`
  - Props: `phone_simple`, `airplane_icon`, `battery_saver_icon`
- **Panel 2 (Turn off radios and set auto-lock):** Close background apps, switch off Wi-Fi, Bluetooth, GPS location, and vibrations, and set screen auto-lock to 15–30 seconds.
  - Poses: `prop_scene: phone_settings_b`
  - Props: `phone_simple`, `toggles_off_list`
- **Panel 3 (Keep warm and text only):** Keep your phone inside an inner pocket close to body heat in cold weather. Send short SMS text messages rather than voice calls when signal appears.
  - Poses: `hiker: standing_inner_pocket`
  - Props: `phone_in_jacket`, `sms_bubble`

### B5.5 Staying found (STOP)
- **review:** `draft` (the source names two bodies and links the IFRC homepage; pin the document where STOP is published)
- **source:** IFRC / National Search and Rescue STOP standard (https://www.ifrc.org)
- **Panel 1 (S and T: Stop and Think):** The moment you realize you are lost, Stop moving. Sit down, drink water, and Think calmly about how you got there and what landmarks you passed.
  - Poses: `hiker: sitting_on_log_thinking`
  - Props: `trail_marker`, `thought_bubble`
- **Panel 2 (O: Observe):** Observe your surroundings, check your map, compass, watch, and weather, and listen for road traffic, flowing water, or voices.
  - Poses: `hiker: standing_scanning_horizon`
  - Props: `map_and_compass`
- **Panel 3 (P: Plan and stay put):** Plan your next move. Unless certain of a short, safe route back, stay put in a visible clearing so search teams can find you faster.
  - Poses: `hiker: sitting_visible_clearing`
  - Props: `bright_tarp_marker`, `rock_cairn`

---

## Batch B6: Natural disasters

### B6.1 Flood
- **review:** `draft` (the link is the Ready.gov homepage; link the Floods page)
- **source:** FEMA Ready.gov Floods (https://ready.gov)
- **Panel 1 (Move to high ground):** If flooding threatens or authorities order evacuation, move immediately to higher ground or upper floors. Do not wait until water surrounds your building.
  - Poses: `family: walking_uphill`
  - Props: `rising_water_waves`, `hill_path`
- **Panel 2 (Turn around, don't drown):** Never walk, swim, or drive through floodwaters. Just 15 cm of moving water can knock an adult down, and 30 cm can sweep a vehicle away.
  - Poses: `prop_scene: car_stopped_flood`
  - Props: `box_car`, `water_depth_ruler_15_30cm`
- **Panel 3 (Electrical and water safety):** Stay away from downed power lines and electrical equipment if standing in water. Avoid contact with floodwater, which may carry sewage and sharp debris.
  - Poses: `hiker: standing_dry_stairs`
  - Props: `downed_wire_no_icon`, `water_waves`

### B6.2 Cyclone or hurricane
- **review:** `draft` (the link is the Ready.gov homepage; link the Hurricanes page)
- **source:** FEMA Ready.gov Hurricanes (https://ready.gov)
- **Panel 1a (Secure windows):** Bring loose outdoor items inside and board up or shutter windows before winds arrive.
  - Poses: `helper: standing_boarding_window`
  - Props: `house_outline`, `window_boards`
- **Panel 1b (Stock supplies):** Store at least 4 litres of water per person per day, non-perishable food, flashlights, first aid kit, and a battery radio.
  - Poses: `prop_scene: emergency_kit_items`
  - Props: `water_jugs_4l`, `flashlight`, `radio_simple`
- **Panel 2 (Shelter in an interior room):** Stay indoors away from all windows, skylights, and glass doors. Take shelter in a small interior room, closet, or hallway on the lowest floor not prone to flooding.
  - Poses: `family: crouching_inner_room`
  - Props: `house_outline_cutaway`, `wind_arrows`
- **Panel 3 (Beware the eye):** Do not go outside if the wind suddenly stops. You may be inside the calm eye of the storm, and violent winds will resume rapidly from the opposite direction.
  - Poses: `prop_scene: cyclone_eye_diagram`
  - Props: `cyclone_spiral_simple`, `no_exit_icon`

### B6.3 Earthquake
- **review:** `draft` (the link is the Ready.gov homepage; link the Earthquakes page)
- **source:** FEMA Ready.gov Earthquakes (https://ready.gov)
- **Panel 1 (Drop):** As soon as shaking starts, DROP onto your hands and knees before the earthquake knocks you down.
  - Poses: `victim: dropping_hands_knees`
  - Props: `shake_lines`
- **Panel 2 (Cover):** COVER your head and neck with your arms, and crawl underneath a sturdy desk or table if one is nearby. Stay away from windows and tall furniture.
  - Poses: `victim: crouching_under_table`
  - Props: `sturdy_table`, `shake_lines`
- **Panel 3 (Hold on):** HOLD ON to your shelter with one hand until the shaking completely stops. If outdoors, move to a clear area away from buildings, trees, and power lines.
  - Poses: `victim: holding_table_leg`
  - Props: `sturdy_table`, `stop_shake_badge`

### B6.4 Fire
- **review:** `draft` (the link is the Ready.gov homepage; link the Home Fires page)
- **source:** FEMA Ready.gov Home Fires (https://ready.gov)
- **Panel 1 (Alert and crawl low):** Sound the alarm, shout "Fire!", and evacuate immediately. Drop to your hands and knees and crawl low under rising smoke toward the nearest exit.
  - Poses: `victim: crawling_low`
  - Props: `smoke_ceiling`, `exit_door`
- **Panel 2 (Test doors and use stairs):** Feel closed doors with the back of your hand before opening. If hot, use a second exit. Always take the stairs, never an elevator.
  - Poses: `victim: standing_testing_door`
  - Props: `closed_door_heat`, `no_elevator_icon`, `stairs_simple`
- **Panel 3a–c (Stop, drop, and roll):** If clothes catch fire: (a) STOP immediately where you are, (b) DROP flat to the ground covering your face, and (c) ROLL back and forth until flames are out.
  - Poses: `sequence: stop_drop_roll_3step`
  - Props: `flame_wisps`

### B6.5 Extreme heat
- **review:** `draft` (the link is the Ready.gov homepage; link the Extreme Heat page)
- **source:** FEMA Ready.gov Extreme Heat (https://ready.gov)
- **Panel 1 (Hydrate continuously):** Drink plenty of cool water throughout the day before you feel thirsty. Avoid alcohol, caffeine, and sugary drinks.
  - Poses: `victim: standing_drinking_water`
  - Props: `water_bottle`, `no_coffee_soda_icon`
- **Panel 2 (Seek cool spaces):** Stay indoors in air-conditioned spaces during peak sun hours (10:00–16:00). Close blinds, take cool showers, or visit a public cooling centre.
  - Poses: `victim: sitting_cool_room`
  - Props: `sun_clock_10_16`, `closed_blinds`
- **Panel 3 (Light clothing and vehicle check):** Wear loose, lightweight, light-colored clothing and a wide-brimmed hat outdoors. Never leave children or pets inside parked cars, and check on elderly neighbours.
  - Poses: `victim: standing_sun_hat`
  - Props: `box_car_no_icon`, `hot_sun`

## Build notes

- Close-up and scene names in the scripts (forearm_*, hand_under_tap, phone_settings_* and similar) are built as props, not poses. They have no joints.
- B6.4 Fire: stop, drop and roll is panel 3, taken from the script's note.
- Seated poses sit on the `seat_simple` prop.
- B1.3 Recovery position is hand-written; the others are generated from these scripts.
