/**
 * Kit cards, batch B5: survival basics. Generated from docs/KIT_SCRIPTS.md: captions and sources are
 * the script's, and each drawing shows only what its caption says. Edit a drawing here; edit a caption in the script.
 */
import type { DoodleStripSpec } from 'groove-ui/doodle'

/** Kit card B5.1, Safe water, from docs/KIT_SCRIPTS.md. Captions are the script's, word for word. */
export const safeWater: DoodleStripSpec = {
  "id": "kit-b5-1-safe-water",
  "title": "Safe water",
  "review": "draft",
  "source": {
    "name": "WHO Household Water Treatment and Safe Storage",
    "url": "https://who.int"
  },
  "panels": [
    {
      "id": "safe-water-1",
      "caption": "Collect the clearest flowing water available. Strain murky water through a clean cloth or coffee filter to remove dirt before disinfecting.",
      "description": "Two hands pouring water. Also shown: a water jug, a cloth filter and a clean pot.",
      "doodle": {
        "id": "kit-b5-1-safe-water-1",
        "ground": false,
        "props": [
          {
            "prop": "pouring_cloth_filter",
            "x": 100,
            "y": 56
          },
          {
            "prop": "water_jug",
            "x": 106,
            "y": 18,
            "rotate": -35
          },
          {
            "prop": "cloth_filter",
            "x": 100,
            "y": 96
          },
          {
            "prop": "clean_pot",
            "x": 100,
            "y": 112
          }
        ]
      }
    },
    {
      "id": "safe-water-2",
      "caption": "Bring filtered water to a full rolling boil for at least 1 minute (or 3 minutes at elevations above 2,000 m) to kill bacteria, viruses, and parasites.",
      "description": "A pot. Also shown: a fire, bubbles and a timer.",
      "doodle": {
        "id": "kit-b5-1-safe-water-2",
        "ground": false,
        "props": [
          {
            "prop": "boiling_pot_fire",
            "x": 100,
            "y": 50
          },
          {
            "prop": "camp_fire",
            "x": 100,
            "y": 82
          },
          {
            "prop": "boiling_bubbles",
            "x": 100,
            "y": 52,
            "scale": 1.2
          },
          {
            "prop": "timer_1_3m_badge",
            "x": 147,
            "y": 106
          }
        ]
      }
    },
    {
      "id": "safe-water-3",
      "caption": "If boiling is impossible, add unscented household liquid chlorine bleach (typically 2 drops per litre of clear water and wait 30 minutes) or place clear PET bottles in direct sunlight for 6 hours.",
      "description": "A dropper bottle and a container. Also shown: a clear bottle in the sun and a 30 minute timer.",
      "doodle": {
        "id": "kit-b5-1-safe-water-3",
        "ground": false,
        "props": [
          {
            "prop": "dropper_bottle",
            "x": 70,
            "y": 70
          },
          {
            "prop": "clear_pet_bottle",
            "x": 158,
            "y": 76
          },
          {
            "prop": "timer_30m_badge",
            "x": 165,
            "y": 24
          }
        ]
      }
    }
  ]
}

/** Kit card B5.2, Signalling for rescue, from docs/KIT_SCRIPTS.md. Captions are the script's, word for word. */
export const signalling: DoodleStripSpec = {
  "id": "kit-b5-2-signalling",
  "title": "Signalling for rescue",
  "review": "draft",
  "source": {
    "name": "ICAO Annex 12, Search and Rescue signals",
    "url": "https://icao.int"
  },
  "panels": [
    {
      "id": "signalling-1",
      "caption": "Lay out high-contrast symbols at least 3 m long in an open clearing. V means \"Require assistance\", while X means \"Require medical assistance\".",
      "description": "An open clearing seen from above, with a person at the edge. Also shown: a V and an X laid on the ground and a helicopter.",
      "doodle": {
        "id": "kit-b5-2-signalling-1",
        "ground": false,
        "props": [
          {
            "prop": "hiker_laying_signal",
            "x": 100,
            "y": 72
          },
          {
            "prop": "signal_v_and_x",
            "x": 114,
            "y": 78,
            "scale": 1.1
          },
          {
            "prop": "helicopter_simple",
            "x": 156,
            "y": 12
          }
        ]
      }
    },
    {
      "id": "signalling-2",
      "caption": "Blow a whistle in sets of 3 sharp blasts (universal distress call). During daylight, flash sunlight toward aircraft or distant ridges using a signal mirror or phone screen.",
      "description": "A person stands, with a whistle and a mirror. Also shown: a whistle with three sound waves, a mirror flashing a beam of light and a helicopter.",
      "doodle": {
        "id": "kit-b5-2-signalling-2",
        "figures": [
          {
            "role": "hiker",
            "pose": "standing_whistle_mirror",
            "x": 110
          }
        ],
        "props": [
          {
            "prop": "whistle_3x_waves",
            "x": 168,
            "y": 24
          },
          {
            "prop": "mirror_beam",
            "x": 84,
            "y": 32
          },
          {
            "prop": "helicopter_simple",
            "x": 28,
            "y": 24
          }
        ]
      }
    },
    {
      "id": "signalling-3",
      "caption": "Build a controlled signal fire in an open clearing and add green leaves or damp grass to produce thick white smoke visible from afar.",
      "description": "A person stands bent over, tending a fire. Also shown: a fire and a column of smoke.",
      "doodle": {
        "id": "kit-b5-2-signalling-3",
        "figures": [
          {
            "role": "hiker",
            "pose": "standing_tending_fire",
            "x": 113
          }
        ],
        "props": [
          {
            "prop": "camp_fire",
            "x": 67,
            "y": 128
          },
          {
            "prop": "smoke_column",
            "x": 67,
            "y": 110
          }
        ]
      }
    }
  ]
}

/** Kit card B5.3, Emergency shelter, from docs/KIT_SCRIPTS.md. Captions are the script's, word for word. */
export const shelter: DoodleStripSpec = {
  "id": "kit-b5-3-shelter",
  "title": "Emergency shelter",
  "review": "draft",
  "source": {
    "name": "IFRC / Red Cross Wilderness and Disaster Preparedness",
    "url": "https://www.ifrc.org"
  },
  "panels": [
    {
      "id": "shelter-1",
      "caption": "Choose flat, dry high ground away from dead overhead branches, dry riverbeds, cliff edges, and insect nests.",
      "description": "A person stands, pointing to an open spot. Also shown: a sign: no dead trees and a crossed-out dry riverbed.",
      "doodle": {
        "id": "kit-b5-3-shelter-1",
        "figures": [
          {
            "role": "hiker",
            "pose": "standing_pointing_clearing",
            "x": 112
          }
        ],
        "props": [
          {
            "prop": "dead_tree_no_icon",
            "x": 161.9,
            "y": 24
          },
          {
            "prop": "dry_creek_bed",
            "x": 38.1,
            "y": 24
          }
        ]
      }
    },
    {
      "id": "shelter-2",
      "caption": "Cold ground drains body heat faster than air. Build an insulating mattress of dry leaves, pine needles, or cardboard at least 10–15 cm thick before lying down.",
      "description": "A person lies on a bed of leaves. Also shown: a thick layer of leaves.",
      "doodle": {
        "id": "kit-b5-3-shelter-2",
        "figures": [
          {
            "role": "hiker",
            "pose": "lying_insulated_bed",
            "x": 83.5,
            "y": 118
          }
        ],
        "props": [
          {
            "prop": "leaf_mattress_layer",
            "x": 84.5,
            "y": 118
          }
        ]
      }
    },
    {
      "id": "shelter-3",
      "caption": "Rig a tarp, poncho, or leaned branches with the closed back angled into the wind. Keep the shelter compact to trap body heat.",
      "description": "A person sits under a tarp. Also shown: a tarp shelter and arrows of wind.",
      "doodle": {
        "id": "kit-b5-3-shelter-3",
        "figures": [
          {
            "role": "hiker",
            "pose": "sitting_under_tarp",
            "x": 110
          }
        ],
        "props": [
          {
            "prop": "tarp_a_frame",
            "x": 98,
            "y": 128,
            "scale": 2.4
          },
          {
            "prop": "wind_deflect_arrows",
            "x": 22,
            "y": 90
          }
        ]
      }
    }
  ]
}

/** Kit card B5.4, Preserving phone battery, from docs/KIT_SCRIPTS.md. Captions are the script's, word for word. */
export const phoneBattery: DoodleStripSpec = {
  "id": "kit-b5-4-phone-battery",
  "title": "Preserving phone battery",
  "review": "draft",
  "source": {
    "name": "Ready.gov Communication and Power Preparedness",
    "url": "https://ready.gov"
  },
  "panels": [
    {
      "id": "phone-battery-1",
      "caption": "Turn on Battery Saver / Low Power mode immediately, lower screen brightness to minimum, and enable Airplane Mode when you have zero signal so the phone stops draining power searching for towers.",
      "description": "A phone screen with the brightness turned down. Also shown: a phone, an airplane mode icon and a battery saver icon.",
      "doodle": {
        "id": "kit-b5-4-phone-battery-1",
        "ground": false,
        "props": [
          {
            "prop": "phone_settings_a",
            "x": 100,
            "y": 76
          },
          {
            "prop": "phone_simple",
            "x": 100,
            "y": 70,
            "scale": 1.9
          },
          {
            "prop": "airplane_icon",
            "x": 40,
            "y": 54
          },
          {
            "prop": "battery_saver_icon",
            "x": 160,
            "y": 54
          }
        ]
      }
    },
    {
      "id": "phone-battery-2",
      "caption": "Close background apps, switch off Wi-Fi, Bluetooth, GPS location, and vibrations, and set screen auto-lock to 15–30 seconds.",
      "description": "A phone screen with apps closed. Also shown: a phone and a list of switched-off settings.",
      "doodle": {
        "id": "kit-b5-4-phone-battery-2",
        "ground": false,
        "props": [
          {
            "prop": "phone_settings_b",
            "x": 160,
            "y": 70,
            "scale": 0.9
          },
          {
            "prop": "phone_simple",
            "x": 160,
            "y": 70,
            "scale": 1.9
          },
          {
            "prop": "toggles_off_list",
            "x": 66,
            "y": 60
          }
        ]
      }
    },
    {
      "id": "phone-battery-3",
      "caption": "Keep your phone inside an inner pocket close to body heat in cold weather. Send short SMS text messages rather than voice calls when signal appears.",
      "description": "A person stands, with a hand at an inner jacket pocket. Also shown: a phone in an inner jacket pocket and a text message bubble.",
      "doodle": {
        "id": "kit-b5-4-phone-battery-3",
        "figures": [
          {
            "role": "hiker",
            "pose": "standing_inner_pocket",
            "x": 100.5
          }
        ],
        "props": [
          {
            "prop": "phone_in_jacket",
            "x": 162.4,
            "y": 24
          },
          {
            "prop": "sms_bubble",
            "x": 28,
            "y": 24
          }
        ]
      }
    }
  ]
}

/** Kit card B5.5, Staying found (STOP), from docs/KIT_SCRIPTS.md. Captions are the script's, word for word. */
export const stayingFound: DoodleStripSpec = {
  "id": "kit-b5-5-staying-found",
  "title": "Staying found (STOP)",
  "review": "draft",
  "source": {
    "name": "IFRC / National Search and Rescue STOP standard",
    "url": "https://www.ifrc.org"
  },
  "panels": [
    {
      "id": "staying-found-1",
      "caption": "The moment you realize you are lost, Stop moving. Sit down, drink water, and Think calmly about how you got there and what landmarks you passed.",
      "description": "A person sits, chin on hand, thinking. Also shown: a trail marker and a thought bubble.",
      "doodle": {
        "id": "kit-b5-5-staying-found-1",
        "figures": [
          {
            "role": "hiker",
            "pose": "sitting_on_log_thinking",
            "x": 110
          }
        ],
        "props": [
          {
            "prop": "seat_simple",
            "x": 110,
            "y": 128
          },
          {
            "prop": "trail_marker",
            "x": 170,
            "y": 128
          },
          {
            "prop": "thought_bubble",
            "x": 111.5,
            "y": 37
          }
        ]
      }
    },
    {
      "id": "staying-found-2",
      "caption": "Observe your surroundings, check your map, compass, watch, and weather, and listen for road traffic, flowing water, or voices.",
      "description": "A person stands, looking out over the distance. Also shown: a map and a compass.",
      "doodle": {
        "id": "kit-b5-5-staying-found-2",
        "figures": [
          {
            "role": "hiker",
            "pose": "standing_scanning_horizon",
            "x": 104
          }
        ],
        "props": [
          {
            "prop": "map_and_compass",
            "x": 169,
            "y": 24
          }
        ]
      }
    },
    {
      "id": "staying-found-3",
      "caption": "Plan your next move. Unless certain of a short, safe route back, stay put in a visible clearing so search teams can find you faster.",
      "description": "A person sits in an open clearing. Also shown: a bright tarp and a stack of rocks.",
      "doodle": {
        "id": "kit-b5-5-staying-found-3",
        "figures": [
          {
            "role": "hiker",
            "pose": "sitting_visible_clearing",
            "x": 110
          }
        ],
        "props": [
          {
            "prop": "bright_tarp_marker",
            "x": 167.3,
            "y": 24
          },
          {
            "prop": "rock_cairn",
            "x": 170,
            "y": 128
          }
        ]
      }
    }
  ]
}
