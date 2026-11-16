/**
 * Kit cards, batch B2: standing and sitting pairs. Generated from docs/KIT_SCRIPTS.md: captions and sources are
 * the script's, and each drawing shows only what its caption says. Edit a drawing here; edit a caption in the script.
 */
import type { DoodleStripSpec } from 'groove-ui/doodle'

/** Kit card B2.1, Adult choking, from docs/KIT_SCRIPTS.md. Captions are the script's, word for word. */
export const adultChoking: DoodleStripSpec = {
  "id": "kit-b2-1-adult-choking",
  "title": "Adult choking",
  "review": "draft",
  "source": {
    "name": "AHA 2025 Guidelines / IFRC 2025 Guidelines",
    "url": "https://www.ahajournals.org/doi/10.1161/CIR.0000000000001370"
  },
  "panels": [
    {
      "id": "adult-choking-1",
      "caption": "Ask \"Are you choking?\" If they can cough forcefully or speak, stay with them and encourage coughing. If they cannot breathe, speak, or cough, call your local emergency number.",
      "description": "A person stands, with their hands at their throat. A helper stands alert. Also shown: a speech bubble with a question mark.",
      "doodle": {
        "id": "kit-b2-1-adult-choking-1",
        "figures": [
          {
            "role": "victim",
            "pose": "standing_choking",
            "x": 82
          },
          {
            "role": "helper",
            "pose": "standing_alert",
            "x": 122
          }
        ],
        "props": [
          {
            "prop": "speech_bubble_check",
            "x": 172,
            "y": 24
          }
        ]
      }
    },
    {
      "id": "adult-choking-2",
      "caption": "Stand behind and slightly to the side, support their chest with one arm, and lean them forward. Give 5 firm blows between the shoulder blades using the heel of your hand.",
      "description": "A person leans forward at the waist. A helper stands behind, giving blows between the shoulder blades. Also shown: an arrow, 5 times.",
      "doodle": {
        "id": "kit-b2-1-adult-choking-2",
        "figures": [
          {
            "role": "victim",
            "pose": "standing_lean_forward",
            "x": 103.2
          },
          {
            "role": "helper",
            "pose": "standing_back_blows",
            "x": 117.6
          }
        ],
        "props": [
          {
            "prop": "impact_arrow_5x",
            "x": 91.6,
            "y": 58
          }
        ],
        "highlight": {
          "figure": 1,
          "joint": "handNear"
        }
      }
    },
    {
      "id": "adult-choking-3",
      "caption": "Stand behind them, wrap your arms around their waist, place a thumb-side fist just above the navel, grasp it with your other hand, and pull inward and upward 5 times. Alternate 5 blows and 5 thrusts.",
      "description": "A person stands upright. A helper stands behind, arms around the waist. Also shown: a J-shaped arrow, 5 times.",
      "doodle": {
        "id": "kit-b2-1-adult-choking-3",
        "figures": [
          {
            "role": "victim",
            "pose": "standing_upright",
            "x": 78
          },
          {
            "role": "helper",
            "pose": "standing_abdominal_thrusts",
            "x": 114
          }
        ],
        "props": [
          {
            "prop": "j_thrust_arrow_5x",
            "x": 74,
            "y": 73
          }
        ],
        "highlight": {
          "figure": 1,
          "joint": "handNear"
        }
      }
    }
  ]
}

/** Kit card B2.2, Child choking (over age 1), from docs/KIT_SCRIPTS.md. Captions are the script's, word for word. */
export const childChoking: DoodleStripSpec = {
  "id": "kit-b2-2-child-choking",
  "title": "Child choking (over age 1)",
  "review": "verified",
  "source": {
    "name": "AHA 2025 Pediatric Basic Life Support",
    "url": "https://www.ahajournals.org/doi/10.1161/CIR.0000000000001370"
  },
  "panels": [
    {
      "id": "child-choking-1",
      "caption": "If a child cannot cough, speak, or breathe, call your local emergency number and kneel behind them so you are at their level.",
      "description": "A child stands, with their hands at their throat. A helper kneels behind them. Also shown: a phone with call waves.",
      "doodle": {
        "id": "kit-b2-2-child-choking-1",
        "figures": [
          {
            "role": "child",
            "pose": "standing_choking",
            "x": 77.4,
            "size": "child"
          },
          {
            "role": "helper",
            "pose": "kneeling_behind",
            "x": 108.2
          }
        ],
        "props": [
          {
            "prop": "phone_sos",
            "x": 172,
            "y": 24
          }
        ]
      }
    },
    {
      "id": "child-choking-2",
      "caption": "Support the child's chest with one arm, lean them forward at the waist, and give 5 firm back blows between the shoulder blades with the heel of your hand.",
      "description": "A child leans forward at the waist. A helper kneels behind, giving blows between the shoulder blades. Also shown: an arrow, 5 times.",
      "doodle": {
        "id": "kit-b2-2-child-choking-2",
        "figures": [
          {
            "role": "child",
            "pose": "standing_lean_forward",
            "x": 98.1,
            "size": "child"
          },
          {
            "role": "helper",
            "pose": "kneeling_back_blows",
            "x": 106.8
          }
        ],
        "props": [
          {
            "prop": "impact_arrow_5x",
            "x": 91.8,
            "y": 77.2
          }
        ],
        "highlight": {
          "figure": 1,
          "joint": "handNear"
        }
      }
    },
    {
      "id": "child-choking-3",
      "caption": "Wrap your arms around the child's waist, place your fist just above the navel, and give 5 quick inward-and-upward thrusts. Alternate sets of 5 until the object clears or the child becomes unresponsive.",
      "description": "A child stands upright. A helper kneels behind, arms around the waist. Also shown: a J-shaped arrow, 5 times.",
      "doodle": {
        "id": "kit-b2-2-child-choking-3",
        "figures": [
          {
            "role": "child",
            "pose": "standing_upright",
            "x": 79.6,
            "size": "child"
          },
          {
            "role": "helper",
            "pose": "kneeling_abdominal_thrusts",
            "x": 104.6
          }
        ],
        "props": [
          {
            "prop": "j_thrust_arrow_5x",
            "x": 75.6,
            "y": 90.1
          }
        ],
        "highlight": {
          "figure": 1,
          "joint": "handNear"
        }
      }
    }
  ]
}

/** Kit card B2.3, Heart attack, from docs/KIT_SCRIPTS.md. Captions are the script's, word for word. */
export const heartAttack: DoodleStripSpec = {
  "id": "kit-b2-3-heart-attack",
  "title": "Heart attack",
  "review": "verified",
  "source": {
    "name": "IFRC International First Aid, Resuscitation and Education Guidelines 2025",
    "url": "https://www.ifrc.org/document/ifrc-international-first-aid-resuscitation-and-education-guidelines-2025"
  },
  "panels": [
    {
      "id": "heart-attack-1",
      "caption": "Watch for chest pressure or squeezing, pain spreading to the arm, back, neck, or jaw, shortness of breath, and cold sweats. Call your local emergency number immediately.",
      "description": "A person sits with a hand on their chest. A helper stands, holding a phone to their ear. Also shown: lines of pain spreading out from the chest and a phone with call waves.",
      "doodle": {
        "id": "kit-b2-3-heart-attack-1",
        "figures": [
          {
            "role": "victim",
            "pose": "sitting_chest_pain",
            "x": 94
          },
          {
            "role": "helper",
            "pose": "standing_calling",
            "x": 129
          }
        ],
        "props": [
          {
            "prop": "pain_radiate_lines",
            "x": 89.4,
            "y": 101.7
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
      "id": "heart-attack-2",
      "caption": "Help the person sit comfortably on the floor or a chair with knees bent and back supported (half-sitting position) to ease strain on the heart. Loosen tight clothing.",
      "description": "A person sits half reclined, back supported. A helper kneels, supporting them. Also shown: a wall behind the back.",
      "doodle": {
        "id": "kit-b2-3-heart-attack-2",
        "figures": [
          {
            "role": "victim",
            "pose": "sitting_half_reclined",
            "x": 81
          },
          {
            "role": "helper",
            "pose": "kneeling_supporting",
            "x": 121
          }
        ],
        "props": [
          {
            "prop": "wall_support",
            "x": 97,
            "y": 122
          }
        ]
      }
    },
    {
      "id": "heart-attack-3",
      "caption": "If the person is fully alert and has no aspirin allergy or medical warning against it, give one adult aspirin (150–300 mg) to chew slowly while waiting for emergency help.",
      "description": "A person sits half reclined, back supported. A helper kneels, handing over a tablet. Also shown: an aspirin tablet.",
      "doodle": {
        "id": "kit-b2-3-heart-attack-3",
        "figures": [
          {
            "role": "victim",
            "pose": "sitting_half_reclined",
            "x": 76.4
          },
          {
            "role": "helper",
            "pose": "kneeling_handing_med",
            "x": 125.6
          }
        ],
        "props": [
          {
            "prop": "aspirin_tablet",
            "x": 85.6,
            "y": 76
          }
        ]
      }
    }
  ]
}

/** Kit card B2.4, Stroke (FAST), from docs/KIT_SCRIPTS.md. Captions are the script's, word for word. */
export const stroke: DoodleStripSpec = {
  "id": "kit-b2-4-stroke",
  "title": "Stroke (FAST)",
  "review": "verified",
  "source": {
    "name": "IFRC International First Aid, Resuscitation and Education Guidelines 2025",
    "url": "https://www.ifrc.org/document/ifrc-international-first-aid-resuscitation-and-education-guidelines-2025"
  },
  "panels": [
    {
      "id": "stroke-1a",
      "caption": "Check Face: ask the person to smile. Does one side of the face droop?",
      "description": "A close-up of a face smiling on one side only. Also shown: an arrow showing one side drooping.",
      "doodle": {
        "id": "kit-b2-4-stroke-1a",
        "ground": false,
        "props": [
          {
            "prop": "asymmetric_smile",
            "x": 100,
            "y": 66
          },
          {
            "prop": "droop_arrow",
            "x": 152,
            "y": 70
          }
        ]
      }
    },
    {
      "id": "stroke-1b",
      "caption": "Check Arms: ask them to raise both arms. Does one arm drift downward?",
      "description": "A person sits with both arms raised, one drifting down. Also shown: an arrow showing an arm drifting down.",
      "doodle": {
        "id": "kit-b2-4-stroke-1b",
        "figures": [
          {
            "role": "victim",
            "pose": "sitting_one_arm_drift",
            "x": 114
          }
        ],
        "props": [
          {
            "prop": "seat_simple",
            "x": 114,
            "y": 128
          },
          {
            "prop": "drift_arrow",
            "x": 87,
            "y": 87
          }
        ]
      }
    },
    {
      "id": "stroke-2",
      "caption": "Check Speech: ask them to repeat a simple sentence. Is their speech slurred, garbled, or hard to understand?",
      "description": "A person sits, speaking. A helper stands, leaning in to listen. Also shown: a speech bubble with wavy, slurred speech.",
      "doodle": {
        "id": "kit-b2-4-stroke-2",
        "figures": [
          {
            "role": "victim",
            "pose": "sitting_speaking",
            "x": 84.3
          },
          {
            "role": "helper",
            "pose": "standing_listening",
            "x": 129.7
          }
        ],
        "props": [
          {
            "prop": "seat_simple",
            "x": 84.3,
            "y": 128
          },
          {
            "prop": "wavy_speech_bubble",
            "x": 76.1,
            "y": 32.5
          }
        ]
      }
    },
    {
      "id": "stroke-3",
      "caption": "Check Time: if any single sign appears, call your local emergency number immediately and note the exact time symptoms started. Keep the person seated or lying with head slightly raised.",
      "description": "A person sits half reclined, back supported. A helper stands, holding a phone to their ear. Also shown: a clock and a phone with call waves.",
      "doodle": {
        "id": "kit-b2-4-stroke-3",
        "figures": [
          {
            "role": "victim",
            "pose": "sitting_half_reclined",
            "x": 88.4
          },
          {
            "role": "helper",
            "pose": "standing_calling",
            "x": 128.6
          }
        ],
        "props": [
          {
            "prop": "clock_exact_time",
            "x": 40.4,
            "y": 24
          },
          {
            "prop": "phone_sos",
            "x": 172,
            "y": 24
          }
        ]
      }
    }
  ]
}

/** Kit card B2.5, Severe allergic reaction (anaphylaxis), from docs/KIT_SCRIPTS.md. Captions are the script's, word for word. */
export const allergicReaction: DoodleStripSpec = {
  "id": "kit-b2-5-allergic-reaction",
  "title": "Severe allergic reaction (anaphylaxis)",
  "review": "verified",
  "source": {
    "name": "IFRC International First Aid, Resuscitation and Education Guidelines 2025",
    "url": "https://www.ifrc.org/document/ifrc-international-first-aid-resuscitation-and-education-guidelines-2025"
  },
  "panels": [
    {
      "id": "allergic-reaction-1",
      "caption": "Look for swelling of the lips, tongue, or throat, hives, wheezing, dizziness, or trouble breathing after exposure to a trigger. Call your local emergency number immediately.",
      "description": "A person sits leaning forward, struggling to breathe. A helper stands, holding a phone to their ear. Also shown: a phone with call waves and wavy lines for wheezing.",
      "doodle": {
        "id": "kit-b2-5-allergic-reaction-1",
        "figures": [
          {
            "role": "victim",
            "pose": "sitting_breathing_distress",
            "x": 97
          },
          {
            "role": "helper",
            "pose": "standing_calling",
            "x": 126
          }
        ],
        "props": [
          {
            "prop": "phone_sos",
            "x": 172,
            "y": 24
          },
          {
            "prop": "wheeze_lines",
            "x": 63.4,
            "y": 85.6
          }
        ]
      }
    },
    {
      "id": "allergic-reaction-2",
      "caption": "Help the person use their prescribed epinephrine auto-injector. Remove the safety cap, press the tip firmly at 90 degrees against the outer mid-thigh (even through clothing) until it clicks, and hold for 3–10 seconds per device instructions.",
      "description": "A close-up of a thigh. Also shown: an auto-injector.",
      "doodle": {
        "id": "kit-b2-5-allergic-reaction-2",
        "ground": false,
        "props": [
          {
            "prop": "thigh_epipen",
            "x": 100,
            "y": 66
          },
          {
            "prop": "epipen_simple",
            "x": 96,
            "y": 38,
            "rotate": -90
          }
        ]
      }
    },
    {
      "id": "allergic-reaction-3",
      "caption": "Have them sit upright if breathing is hard, or lie flat with legs raised if dizzy. A second dose may be given after 5–15 minutes if symptoms do not improve.",
      "description": "A person sits leaning forward. A helper kneels, watching their breathing. Also shown: a 5 to 15 minute timer.",
      "doodle": {
        "id": "kit-b2-5-allergic-reaction-3",
        "figures": [
          {
            "role": "victim",
            "pose": "sitting_upright_forward",
            "x": 82
          },
          {
            "role": "helper",
            "pose": "kneeling_monitoring",
            "x": 126
          }
        ],
        "props": [
          {
            "prop": "timer_5_15m_badge",
            "x": 159,
            "y": 24
          }
        ]
      }
    }
  ]
}
