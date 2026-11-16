/**
 * Kit cards, batch B4: infants. Generated from docs/KIT_SCRIPTS.md: captions and sources are
 * the script's, and each drawing shows only what its caption says. Edit a drawing here; edit a caption in the script.
 */
import type { DoodleStripSpec } from 'groove-ui/doodle'

/** Kit card B4.1, Infant CPR, from docs/KIT_SCRIPTS.md. Captions are the script's, word for word. */
export const infantCpr: DoodleStripSpec = {
  "id": "kit-b4-1-infant-cpr",
  "title": "Infant CPR",
  "review": "verified",
  "source": {
    "name": "AHA 2025 Pediatric Basic Life Support",
    "url": "https://www.ahajournals.org/doi/10.1161/CIR.0000000000001370"
  },
  "panels": [
    {
      "id": "infant-cpr-1",
      "caption": "Tap the bottom of the infant's foot and shout to check response, then check breathing for up to 10 seconds. If alone and unresponsive, give 2 minutes of CPR first before calling your local emergency number.",
      "description": "An infant lies on their back. A helper kneels, tapping the foot. Also shown: a 10 second timer and a phone with call waves.",
      "doodle": {
        "id": "kit-b4-1-infant-cpr-1",
        "figures": [
          {
            "role": "infant",
            "pose": "lying_supine",
            "x": 71.3,
            "size": "infant"
          },
          {
            "role": "helper",
            "pose": "kneeling_tap_foot",
            "x": 128.6
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
      "id": "infant-cpr-2",
      "caption": "Encircle the infant's chest with both hands and press the lower half of the sternum with both thumbs (or use the heel of one hand). Compress about 4 cm deep at 100–120 compressions per minute.",
      "description": "An infant lies on their back. A helper kneels, pressing the chest with both thumbs. Also shown: an arrow marking 4 cm.",
      "doodle": {
        "id": "kit-b4-1-infant-cpr-2",
        "figures": [
          {
            "role": "infant",
            "pose": "lying_supine",
            "x": 86.2,
            "size": "infant"
          },
          {
            "role": "helper",
            "pose": "kneeling_infant_compressions_thumbs",
            "x": 113.7
          }
        ],
        "props": [
          {
            "prop": "depth_arrow_4cm",
            "x": 121.7,
            "y": 105.5
          }
        ],
        "highlight": {
          "figure": 1,
          "joint": "handNear"
        }
      }
    },
    {
      "id": "infant-cpr-3",
      "caption": "Tilt the head to a neutral \"sniffing\" position without over-extending. Seal your mouth over both the infant's nose and mouth, and give 2 gentle 1-second puffs just until the chest rises.",
      "description": "An infant lies on their back, head in a neutral position. A helper kneels, giving breaths. Also shown: a label: 30 to 2.",
      "doodle": {
        "id": "kit-b4-1-infant-cpr-3",
        "figures": [
          {
            "role": "infant",
            "pose": "lying_neutral_head",
            "x": 93.1,
            "size": "infant"
          },
          {
            "role": "helper",
            "pose": "kneeling_infant_breaths",
            "x": 109
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

/** Kit card B4.2, Infant choking, from docs/KIT_SCRIPTS.md. Captions are the script's, word for word. */
export const infantChoking: DoodleStripSpec = {
  "id": "kit-b4-2-infant-choking",
  "title": "Infant choking",
  "review": "verified",
  "source": {
    "name": "AHA 2025 Pediatric Basic Life Support",
    "url": "https://www.ahajournals.org/doi/10.1161/CIR.0000000000001370"
  },
  "panels": [
    {
      "id": "infant-choking-1",
      "caption": "If the infant cannot cry, cough, or breathe, hold them face-down along your forearm resting on your thigh, supporting the head and jaw with head lower than chest. Give 5 firm back blows between the shoulder blades.",
      "description": "An infant lies face down along a forearm. A helper sits, giving back blows to an infant. Also shown: an arrow, 5 times.",
      "doodle": {
        "id": "kit-b4-2-infant-choking-1",
        "figures": [
          {
            "role": "infant",
            "pose": "forearm_facedown",
            "x": 100.3,
            "y": 99,
            "size": "infant"
          },
          {
            "role": "helper",
            "pose": "sitting_infant_back_blows",
            "x": 118.3
          }
        ],
        "props": [
          {
            "prop": "seat_simple",
            "x": 118.3,
            "y": 128
          },
          {
            "prop": "impact_arrow_5x",
            "x": 96.8,
            "y": 92.5
          }
        ]
      }
    },
    {
      "id": "infant-choking-2",
      "caption": "Sandwich the infant between your forearms, turn them face-up supporting the head, and press the lower sternum with two fingers or thumbs. Give 5 firm chest thrusts about 4 cm deep.",
      "description": "An infant lies face up along a forearm. A helper sits, giving chest thrusts to an infant. Also shown: thrust arrow 5x.",
      "doodle": {
        "id": "kit-b4-2-infant-choking-2",
        "figures": [
          {
            "role": "infant",
            "pose": "forearm_faceup",
            "x": 100.3,
            "y": 99,
            "size": "infant"
          },
          {
            "role": "helper",
            "pose": "sitting_infant_chest_thrusts",
            "x": 118.3
          }
        ],
        "props": [
          {
            "prop": "seat_simple",
            "x": 118.3,
            "y": 128
          },
          {
            "prop": "thrust_arrow_5x",
            "x": 92,
            "y": 94.3
          }
        ]
      }
    },
    {
      "id": "infant-choking-3",
      "caption": "Repeat 5 back blows and 5 chest thrusts until the object clears or the infant cries. If the infant becomes unresponsive, call your local emergency number and begin infant CPR.",
      "description": "An infant lies on their back. A helper kneels, pressing the chest with both thumbs. Also shown: a phone with call waves.",
      "doodle": {
        "id": "kit-b4-2-infant-choking-3",
        "figures": [
          {
            "role": "infant",
            "pose": "lying_supine",
            "x": 86.2,
            "size": "infant"
          },
          {
            "role": "helper",
            "pose": "kneeling_infant_compressions_thumbs",
            "x": 113.7
          }
        ],
        "props": [
          {
            "prop": "phone_sos",
            "x": 172,
            "y": 24
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
