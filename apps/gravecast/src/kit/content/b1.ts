/**
 * Kit cards, batch B1: lying person and helper. Generated from docs/KIT_SCRIPTS.md: captions and sources are
 * the script's, and each drawing shows only what its caption says. Edit a drawing here; edit a caption in the script.
 */
import type { DoodleStripSpec } from 'groove-ui/doodle'

/** Kit card B1.1, Adult CPR, from docs/KIT_SCRIPTS.md. Captions are the script's, word for word. */
export const adultCpr: DoodleStripSpec = {
  "id": "kit-b1-1-adult-cpr",
  "title": "Adult CPR",
  "review": "draft",
  "source": {
    "name": "AHA 2025 Guidelines for CPR and ECC",
    "url": "https://cpr.heart.org"
  },
  "panels": [
    {
      "id": "adult-cpr-1",
      "caption": "Tap shoulders and shout to check responsiveness, then check breathing for no more than 10 seconds. If unresponsive and not breathing or only gasping, call your local emergency number and send someone for an AED.",
      "description": "A person lies on their back. A helper kneels, checking for a response. Also shown: a phone with call waves and a 10 second timer.",
      "doodle": {
        "id": "kit-b1-1-adult-cpr-1",
        "figures": [
          {
            "role": "victim",
            "pose": "lying_supine",
            "x": 98.5
          },
          {
            "role": "helper",
            "pose": "kneeling_check",
            "x": 101.5
          }
        ],
        "props": [
          {
            "prop": "phone_sos",
            "x": 172,
            "y": 24
          },
          {
            "prop": "timer_10s",
            "x": 28,
            "y": 24
          }
        ]
      }
    },
    {
      "id": "adult-cpr-2",
      "caption": "Place the heel of one hand in the center of the chest with the other hand on top, fingers interlocked. Push hard and fast at least 5 cm deep at 100–120 compressions per minute, allowing full chest recoil.",
      "description": "A person lies on their back. A helper kneels, pushing on the chest with both hands. Also shown: an arrow marking 5 cm and a label: 100 to 120 a minute.",
      "doodle": {
        "id": "kit-b1-1-adult-cpr-2",
        "figures": [
          {
            "role": "victim",
            "pose": "lying_supine",
            "x": 98.5
          },
          {
            "role": "helper",
            "pose": "kneeling_compressions",
            "x": 100.2
          }
        ],
        "props": [
          {
            "prop": "depth_arrow_5cm",
            "x": 118.2,
            "y": 96
          },
          {
            "prop": "rate_badge",
            "x": 155,
            "y": 24
          }
        ],
        "highlight": {
          "figure": 1,
          "joint": "handNear"
        }
      }
    },
    {
      "id": "adult-cpr-3",
      "caption": "Tilt the head back, lift the chin, pinch the nose, and give 2 breaths (1 second each) after every 30 compressions. Continue uninterrupted until an AED arrives or medical help takes over.",
      "description": "A person lies on their back, head tilted back. A helper kneels at the head, giving rescue breaths. Also shown: a label: 30 to 2.",
      "doodle": {
        "id": "kit-b1-1-adult-cpr-3",
        "figures": [
          {
            "role": "victim",
            "pose": "lying_supine_head_tilt",
            "x": 98.7
          },
          {
            "role": "helper",
            "pose": "kneeling_breaths",
            "x": 93.4
          }
        ],
        "props": [
          {
            "prop": "loop_30_2_badge",
            "x": 172,
            "y": 24
          }
        ]
      }
    }
  ]
}

/** Kit card B1.2, Child CPR (age 1 to puberty), from docs/KIT_SCRIPTS.md. Captions are the script's, word for word. */
export const childCpr: DoodleStripSpec = {
  "id": "kit-b1-2-child-cpr",
  "title": "Child CPR (age 1 to puberty)",
  "review": "verified",
  "source": {
    "name": "AHA 2025 Pediatric Basic Life Support",
    "url": "https://www.ahajournals.org/doi/10.1161/CIR.0000000000001370"
  },
  "panels": [
    {
      "id": "child-cpr-1",
      "caption": "Tap shoulders, shout, and look for normal breathing for up to 10 seconds. If alone with an unresponsive child, give 2 minutes (5 cycles) of CPR first before calling your local emergency number; if someone else is present, have them call immediately.",
      "description": "A child lies on their back. A helper kneels, checking for a response. Also shown: a 10 second timer and a phone with call waves.",
      "doodle": {
        "id": "kit-b1-2-child-cpr-1",
        "figures": [
          {
            "role": "child",
            "pose": "lying_supine",
            "x": 99.3,
            "size": "child"
          },
          {
            "role": "helper",
            "pose": "kneeling_check",
            "x": 111
          }
        ],
        "props": [
          {
            "prop": "timer_10s",
            "x": 172,
            "y": 24
          },
          {
            "prop": "phone_sos",
            "x": 28,
            "y": 24
          }
        ]
      }
    },
    {
      "id": "child-cpr-2",
      "caption": "Use one or two hands in the center of the chest. Compress about 5 cm deep (roughly one-third of chest depth) at 100–120 compressions per minute.",
      "description": "A child lies on their back. A helper kneels, pushing on the chest with one hand. Also shown: an arrow marking 5 cm.",
      "doodle": {
        "id": "kit-b1-2-child-cpr-2",
        "figures": [
          {
            "role": "child",
            "pose": "lying_supine",
            "x": 99.3,
            "size": "child"
          },
          {
            "role": "helper",
            "pose": "kneeling_compressions_one_hand",
            "x": 107.1
          }
        ],
        "props": [
          {
            "prop": "depth_arrow_5cm",
            "x": 125.1,
            "y": 97.8
          }
        ],
        "highlight": {
          "figure": 1,
          "joint": "handNear"
        }
      }
    },
    {
      "id": "child-cpr-3",
      "caption": "Open the airway with head-tilt/chin-lift, pinch the nose, seal your mouth over theirs, and give 2 rescue breaths (1 second each) so the chest rises. Repeat 30 compressions to 2 breaths.",
      "description": "A child lies on their back, head tilted back. A helper kneels at the head, giving rescue breaths. Also shown: a label: 30 to 2.",
      "doodle": {
        "id": "kit-b1-2-child-cpr-3",
        "figures": [
          {
            "role": "child",
            "pose": "lying_supine_head_tilt",
            "x": 99.5,
            "size": "child"
          },
          {
            "role": "helper",
            "pose": "kneeling_breaths",
            "x": 106.4
          }
        ],
        "props": [
          {
            "prop": "loop_30_2_badge",
            "x": 172,
            "y": 24
          }
        ]
      }
    }
  ]
}

/** Kit card B1.4, Drowning rescue and care, from docs/KIT_SCRIPTS.md. Captions are the script's, word for word. */
export const drowning: DoodleStripSpec = {
  "id": "kit-b1-4-drowning",
  "title": "Drowning rescue and care",
  "review": "draft",
  "source": {
    "name": "WHO / ERC Drowning Resuscitation Protocol",
    "url": "https://who.int"
  },
  "panels": [
    {
      "id": "drowning-1",
      "caption": "Never enter deep or fast water unless trained. Reach with a pole or branch, or throw a floating object or rope to pull the person to safety.",
      "description": "A person is in the water with both arms raised. A helper stands braced, reaching out. Also shown: waves and a rescue pole.",
      "doodle": {
        "id": "kit-b1-4-drowning-1",
        "figures": [
          {
            "role": "victim",
            "pose": "swimming_distress",
            "x": 26,
            "y": 140
          },
          {
            "role": "helper",
            "pose": "standing_braced_reach",
            "x": 168
          }
        ],
        "props": [
          {
            "prop": "water_waves",
            "x": 52,
            "y": 120,
            "scale": 1.3
          },
          {
            "prop": "rescue_pole",
            "x": 81,
            "y": 50.5,
            "scale": 1.66,
            "rotate": 19.3
          }
        ]
      }
    },
    {
      "id": "drowning-2",
      "caption": "Place the person flat on their back on firm ground and check breathing. Because drowning causes oxygen deprivation, give 5 initial rescue breaths before starting chest compressions.",
      "description": "A person lies on their back, head tilted back. A helper kneels at the head, giving rescue breaths. Also shown: a label: 5 breaths.",
      "doodle": {
        "id": "kit-b1-4-drowning-2",
        "figures": [
          {
            "role": "victim",
            "pose": "lying_supine_head_tilt",
            "x": 98.7
          },
          {
            "role": "helper",
            "pose": "kneeling_breaths",
            "x": 93.4
          }
        ],
        "props": [
          {
            "prop": "badge_5_breaths",
            "x": 165,
            "y": 24
          }
        ]
      }
    },
    {
      "id": "drowning-3",
      "caption": "Follow with cycles of 30 chest compressions and 2 breaths. Once breathing resumes, place in the recovery position and cover with dry blankets.",
      "description": "A person lies on their side in the recovery position, under a blanket. A helper kneels, watching their breathing. Also shown: a blanket and a label: 30 to 2.",
      "doodle": {
        "id": "kit-b1-4-drowning-3",
        "figures": [
          {
            "role": "victim",
            "pose": "lying_recovery_blanket",
            "x": 101.5
          },
          {
            "role": "helper",
            "pose": "kneeling_monitoring",
            "x": 103.2
          }
        ],
        "props": [
          {
            "prop": "blanket",
            "x": 117.5,
            "y": 120
          },
          {
            "prop": "loop_30_2_badge",
            "x": 172,
            "y": 24
          }
        ]
      }
    }
  ]
}

/** Kit card B1.5, Shock, from docs/KIT_SCRIPTS.md. Captions are the script's, word for word. */
export const shock: DoodleStripSpec = {
  "id": "kit-b1-5-shock",
  "title": "Shock",
  "review": "verified",
  "source": {
    "name": "IFRC International First Aid, Resuscitation and Education Guidelines 2025",
    "url": "https://www.ifrc.org/document/ifrc-international-first-aid-resuscitation-and-education-guidelines-2025"
  },
  "panels": [
    {
      "id": "shock-1",
      "caption": "Look for pale, cool, clammy skin, rapid shallow breathing, weakness, or confusion. Call your local emergency number immediately and treat any obvious cause like severe bleeding.",
      "description": "A person lies on their back, looking unwell. A helper kneels, holding a phone to their ear. Also shown: a phone with call waves and drops of sweat.",
      "doodle": {
        "id": "kit-b1-5-shock-1",
        "figures": [
          {
            "role": "victim",
            "pose": "lying_supine_distress",
            "x": 73.5
          },
          {
            "role": "helper",
            "pose": "kneeling_calling",
            "x": 149.5
          }
        ],
        "props": [
          {
            "prop": "phone_sos",
            "x": 172,
            "y": 24
          },
          {
            "prop": "sweat_drops",
            "x": 28.5,
            "y": 96.5
          }
        ]
      }
    },
    {
      "id": "shock-2",
      "caption": "Help the person lie flat on their back. If there is no head, neck, back, or leg injury, raise their legs about 30 cm to support blood flow to vital organs.",
      "description": "A person lies on their back, legs raised. A helper kneels, supporting them. Also shown: a bag under the feet, 30 cm up.",
      "doodle": {
        "id": "kit-b1-5-shock-2",
        "figures": [
          {
            "role": "victim",
            "pose": "lying_legs_elevated",
            "x": 74.5
          },
          {
            "role": "helper",
            "pose": "kneeling_supporting",
            "x": 148.5
          }
        ],
        "props": [
          {
            "prop": "support_bag",
            "x": 118.5,
            "y": 124
          }
        ]
      }
    },
    {
      "id": "shock-3",
      "caption": "Loosen tight clothing and cover the person with a coat or blanket to keep them warm. Do not give anything to eat or drink.",
      "description": "A person lies on their back, covered. A helper kneels beside them. Also shown: a blanket and a crossed-out drink.",
      "doodle": {
        "id": "kit-b1-5-shock-3",
        "figures": [
          {
            "role": "victim",
            "pose": "lying_covered",
            "x": 74.5
          },
          {
            "role": "helper",
            "pose": "kneeling_beside",
            "x": 148.5
          }
        ],
        "props": [
          {
            "prop": "blanket",
            "x": 90.5,
            "y": 120
          },
          {
            "prop": "no_drink_icon",
            "x": 172,
            "y": 24,
            "label": "no food or drink"
          }
        ]
      }
    }
  ]
}

/** Kit card B1.6, Seizure, from docs/KIT_SCRIPTS.md. Captions are the script's, word for word. */
export const seizure: DoodleStripSpec = {
  "id": "kit-b1-6-seizure",
  "title": "Seizure",
  "review": "verified",
  "source": {
    "name": "IFRC International First Aid, Resuscitation and Education Guidelines 2025",
    "url": "https://www.ifrc.org/document/ifrc-international-first-aid-resuscitation-and-education-guidelines-2025"
  },
  "panels": [
    {
      "id": "seizure-1",
      "caption": "Ease the person to the floor and clear away hard or sharp objects. Place something soft and flat under their head and loosen tight neckwear.",
      "description": "A person lies on the floor, limbs moving. A helper kneels, placing something soft under their head. Also shown: a folded jacket and a chair pushed aside.",
      "doodle": {
        "id": "kit-b1-6-seizure-1",
        "figures": [
          {
            "role": "victim",
            "pose": "lying_seizure",
            "x": 99.5
          },
          {
            "role": "helper",
            "pose": "kneeling_cushioning",
            "x": 102.5
          }
        ],
        "props": [
          {
            "prop": "folded_jacket",
            "x": 56.5,
            "y": 123.5
          },
          {
            "prop": "cleared_chair",
            "x": 172,
            "y": 24
          }
        ]
      }
    },
    {
      "id": "seizure-2",
      "caption": "Never hold the person down, stop their movements, or put anything inside their mouth. Time the seizure from start to finish.",
      "description": "A person lies on the floor, limbs moving. A helper kneels with hands held back. Also shown: a stopwatch, a sign: do not hold down and a sign: nothing in the mouth.",
      "doodle": {
        "id": "kit-b1-6-seizure-2",
        "figures": [
          {
            "role": "victim",
            "pose": "lying_seizure",
            "x": 73
          },
          {
            "role": "helper",
            "pose": "kneeling_hands_off",
            "x": 150
          }
        ],
        "props": [
          {
            "prop": "stopwatch",
            "x": 172,
            "y": 24
          },
          {
            "prop": "no_restrain_icon",
            "x": 43.5,
            "y": 24
          },
          {
            "prop": "no_mouth_object_icon",
            "x": 46.2,
            "y": 66
          }
        ]
      }
    },
    {
      "id": "seizure-3",
      "caption": "Once movements stop, roll them onto their side into the recovery position and check breathing. Call your local emergency number if the seizure lasts over 5 minutes, repeats, or happens in water or during pregnancy.",
      "description": "A person lies on their side in the recovery position. A helper kneels, watching their breathing. Also shown: a 5 minute timer.",
      "doodle": {
        "id": "kit-b1-6-seizure-3",
        "figures": [
          {
            "role": "victim",
            "pose": "lying_recovery",
            "x": 101.5
          },
          {
            "role": "helper",
            "pose": "kneeling_monitoring",
            "x": 103.2
          }
        ],
        "props": [
          {
            "prop": "timer_5m_badge",
            "x": 153.6,
            "y": 24,
            "label": "over 5 min"
          }
        ]
      }
    }
  ]
}

/** Kit card B1.7, Poisoning, from docs/KIT_SCRIPTS.md. Captions are the script's, word for word. */
export const poisoning: DoodleStripSpec = {
  "id": "kit-b1-7-poisoning",
  "title": "Poisoning",
  "review": "draft",
  "source": {
    "name": "WHO / IFRC Poisoning First Aid Guidelines",
    "url": "https://www.ifrc.org/document/ifrc-international-first-aid-resuscitation-and-education-guidelines-2025"
  },
  "panels": [
    {
      "id": "poisoning-1",
      "caption": "Check the area for containers, pills, chemicals, or fumes, and move the person to fresh air if inhaled. Call your local poison information centre or emergency number immediately.",
      "description": "A person sits slumped and drowsy. A helper stands, holding a phone to their ear. Also shown: a chemical bottle and a phone with call waves.",
      "doodle": {
        "id": "kit-b1-7-poisoning-1",
        "figures": [
          {
            "role": "victim",
            "pose": "sitting_drowsy",
            "x": 91.5
          },
          {
            "role": "helper",
            "pose": "standing_calling",
            "x": 131.5
          }
        ],
        "props": [
          {
            "prop": "chemical_bottle",
            "x": 30,
            "y": 128
          },
          {
            "prop": "phone_sos",
            "x": 172,
            "y": 24
          }
        ]
      }
    },
    {
      "id": "poisoning-2",
      "caption": "Keep the person still and seated, or in the recovery position if drowsy. Never induce vomiting or give water, milk, or activated charcoal unless instructed by a poison information centre.",
      "description": "A person sits upright. A helper stands nearby. Also shown: a sign: do not make them vomit and a crossed-out drink.",
      "doodle": {
        "id": "kit-b1-7-poisoning-2",
        "figures": [
          {
            "role": "victim",
            "pose": "sitting_upright",
            "x": 96.5
          },
          {
            "role": "helper",
            "pose": "standing_beside",
            "x": 126.5
          }
        ],
        "props": [
          {
            "prop": "no_vomit_icon",
            "x": 167.3,
            "y": 24
          },
          {
            "prop": "no_drink_icon",
            "x": 28,
            "y": 24,
            "label": "no water or milk"
          }
        ]
      }
    },
    {
      "id": "poisoning-3",
      "caption": "If poison spilled on skin or eyes, remove contaminated clothing carefully and rinse continuously with clean running water for 15–20 minutes.",
      "description": "A close-up of a forearm. Also shown: a running tap and a timer.",
      "doodle": {
        "id": "kit-b1-7-poisoning-3",
        "ground": false,
        "props": [
          {
            "prop": "forearm_rinse",
            "x": 100,
            "y": 72
          },
          {
            "prop": "water_tap",
            "x": 84,
            "y": 40
          },
          {
            "prop": "timer_20m_badge",
            "x": 156.8,
            "y": 24,
            "label": "15–20 min"
          }
        ]
      }
    }
  ]
}
