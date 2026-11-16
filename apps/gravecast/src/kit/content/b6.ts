/**
 * Kit cards, batch B6: natural disasters. Generated from docs/KIT_SCRIPTS.md: captions and sources are
 * the script's, and each drawing shows only what its caption says. Edit a drawing here; edit a caption in the script.
 */
import type { DoodleStripSpec } from 'groove-ui/doodle'

/** Kit card B6.1, Flood, from docs/KIT_SCRIPTS.md. Captions are the script's, word for word. */
export const flood: DoodleStripSpec = {
  "id": "kit-b6-1-flood",
  "title": "Flood",
  "review": "draft",
  "source": {
    "name": "FEMA Ready.gov Floods",
    "url": "https://ready.gov"
  },
  "panels": [
    {
      "id": "flood-1",
      "caption": "If flooding threatens or authorities order evacuation, move immediately to higher ground or upper floors. Do not wait until water surrounds your building.",
      "description": "An adult and a child walk uphill. Also shown: rising water and a path up a hill.",
      "doodle": {
        "id": "kit-b6-1-flood-1",
        "figures": [
          {
            "role": "adult",
            "pose": "walking_uphill",
            "x": 114.1
          },
          {
            "role": "child",
            "pose": "walking_uphill",
            "x": 145.4,
            "size": "child"
          }
        ],
        "props": [
          {
            "prop": "rising_water_waves",
            "x": 44,
            "y": 122
          },
          {
            "prop": "hill_path",
            "x": 43,
            "y": 66
          }
        ]
      }
    },
    {
      "id": "flood-2",
      "caption": "Never walk, swim, or drive through floodwaters. Just 15 cm of moving water can knock an adult down, and 30 cm can sweep a vehicle away.",
      "description": "Water flowing across a road. Also shown: a car and a ruler marking 15 cm and 30 cm.",
      "doodle": {
        "id": "kit-b6-1-flood-2",
        "ground": false,
        "props": [
          {
            "prop": "car_stopped_flood",
            "x": 100,
            "y": 70
          },
          {
            "prop": "box_car",
            "x": 100,
            "y": 56
          },
          {
            "prop": "water_depth_ruler_15_30cm",
            "x": 156,
            "y": 100
          }
        ]
      }
    },
    {
      "id": "flood-3",
      "caption": "Stay away from downed power lines and electrical equipment if standing in water. Avoid contact with floodwater, which may carry sewage and sharp debris.",
      "description": "A person stands on dry stairs. Also shown: a sign: stay away from fallen wires and waves.",
      "doodle": {
        "id": "kit-b6-1-flood-3",
        "figures": [
          {
            "role": "hiker",
            "pose": "standing_dry_stairs",
            "x": 102
          }
        ],
        "props": [
          {
            "prop": "downed_wire_no_icon",
            "x": 172,
            "y": 24
          },
          {
            "prop": "water_waves",
            "x": 88,
            "y": 118,
            "scale": 1.1
          }
        ]
      }
    }
  ]
}

/** Kit card B6.2, Cyclone or hurricane, from docs/KIT_SCRIPTS.md. Captions are the script's, word for word. */
export const cyclone: DoodleStripSpec = {
  "id": "kit-b6-2-cyclone",
  "title": "Cyclone or hurricane",
  "review": "draft",
  "source": {
    "name": "FEMA Ready.gov Hurricanes",
    "url": "https://ready.gov"
  },
  "panels": [
    {
      "id": "cyclone-1a",
      "caption": "Bring loose outdoor items inside and board up or shutter windows before winds arrive.",
      "description": "A helper stands, reaching up to board a window. Also shown: a house and boards over a window.",
      "doodle": {
        "id": "kit-b6-2-cyclone-1a",
        "figures": [
          {
            "role": "helper",
            "pose": "standing_boarding_window",
            "x": 150
          }
        ],
        "props": [
          {
            "prop": "house_outline",
            "x": 92,
            "y": 128,
            "scale": 2.6
          },
          {
            "prop": "window_boards",
            "x": 124,
            "y": 38,
            "scale": 1.3
          }
        ]
      }
    },
    {
      "id": "cyclone-1b",
      "caption": "Store at least 4 litres of water per person per day, non-perishable food, flashlights, first aid kit, and a battery radio.",
      "description": "A kit box and a can. Also shown: water jugs, 4 litres per person per day, a flashlight and a radio.",
      "doodle": {
        "id": "kit-b6-2-cyclone-1b",
        "ground": false,
        "props": [
          {
            "prop": "emergency_kit_items",
            "x": 100,
            "y": 76
          },
          {
            "prop": "water_jugs_4l",
            "x": 62,
            "y": 32
          },
          {
            "prop": "flashlight",
            "x": 156,
            "y": 40
          },
          {
            "prop": "radio_simple",
            "x": 48,
            "y": 116
          }
        ]
      }
    },
    {
      "id": "cyclone-2",
      "caption": "Stay indoors away from all windows, skylights, and glass doors. Take shelter in a small interior room, closet, or hallway on the lowest floor not prone to flooding.",
      "description": "An adult and a child crouch, covering their heads. Also shown: a house with an inner room and arrows of wind.",
      "doodle": {
        "id": "kit-b6-2-cyclone-2",
        "figures": [
          {
            "role": "adult",
            "pose": "crouching_inner_room",
            "x": 85.1
          },
          {
            "role": "child",
            "pose": "crouching_inner_room",
            "x": 138.6,
            "size": "child"
          }
        ],
        "props": [
          {
            "prop": "house_outline_cutaway",
            "x": 100,
            "y": 128,
            "scale": 2
          },
          {
            "prop": "wind_arrows",
            "x": 24,
            "y": 70
          }
        ]
      }
    },
    {
      "id": "cyclone-3",
      "caption": "Do not go outside if the wind suddenly stops. You may be inside the calm eye of the storm, and violent winds will resume rapidly from the opposite direction.",
      "description": "The calm eye of a storm. Also shown: a spiral for the storm and a sign: stay inside.",
      "doodle": {
        "id": "kit-b6-2-cyclone-3",
        "ground": false,
        "props": [
          {
            "prop": "cyclone_eye_diagram",
            "x": 100,
            "y": 70
          },
          {
            "prop": "cyclone_spiral_simple",
            "x": 100,
            "y": 70,
            "scale": 1.2
          },
          {
            "prop": "no_exit_icon",
            "x": 32.7,
            "y": 24
          }
        ]
      }
    }
  ]
}

/** Kit card B6.3, Earthquake, from docs/KIT_SCRIPTS.md. Captions are the script's, word for word. */
export const earthquake: DoodleStripSpec = {
  "id": "kit-b6-3-earthquake",
  "title": "Earthquake",
  "review": "draft",
  "source": {
    "name": "FEMA Ready.gov Earthquakes",
    "url": "https://ready.gov"
  },
  "panels": [
    {
      "id": "earthquake-1",
      "caption": "As soon as shaking starts, DROP onto your hands and knees before the earthquake knocks you down.",
      "description": "A person drops onto hands and knees. Also shown: shaking lines.",
      "doodle": {
        "id": "kit-b6-3-earthquake-1",
        "figures": [
          {
            "role": "victim",
            "pose": "dropping_hands_knees",
            "x": 111
          }
        ],
        "props": [
          {
            "prop": "shake_lines",
            "x": 172,
            "y": 24
          }
        ]
      }
    },
    {
      "id": "earthquake-2",
      "caption": "COVER your head and neck with your arms, and crawl underneath a sturdy desk or table if one is nearby. Stay away from windows and tall furniture.",
      "description": "A person crouches under a table, covering their head. Also shown: a sturdy table and shaking lines.",
      "doodle": {
        "id": "kit-b6-3-earthquake-2",
        "figures": [
          {
            "role": "victim",
            "pose": "crouching_under_table",
            "x": 109
          }
        ],
        "props": [
          {
            "prop": "sturdy_table",
            "x": 97,
            "y": 128,
            "scale": 1.25
          },
          {
            "prop": "shake_lines",
            "x": 172,
            "y": 24
          }
        ]
      }
    },
    {
      "id": "earthquake-3",
      "caption": "HOLD ON to your shelter with one hand until the shaking completely stops. If outdoors, move to a clear area away from buildings, trees, and power lines.",
      "description": "A person holds on to a table leg. Also shown: a sturdy table and a label: until it stops.",
      "doodle": {
        "id": "kit-b6-3-earthquake-3",
        "figures": [
          {
            "role": "victim",
            "pose": "holding_table_leg",
            "x": 114.5
          }
        ],
        "props": [
          {
            "prop": "sturdy_table",
            "x": 98.5,
            "y": 128,
            "scale": 1.25
          },
          {
            "prop": "stop_shake_badge",
            "x": 155,
            "y": 24
          }
        ]
      }
    }
  ]
}

/** Kit card B6.4, Fire, from docs/KIT_SCRIPTS.md. Captions are the script's, word for word. */
export const fire: DoodleStripSpec = {
  "id": "kit-b6-4-fire",
  "title": "Fire",
  "review": "draft",
  "source": {
    "name": "FEMA Ready.gov Home Fires",
    "url": "https://ready.gov"
  },
  "panels": [
    {
      "id": "fire-1",
      "caption": "Sound the alarm, shout \"Fire!\", and evacuate immediately. Drop to your hands and knees and crawl low under rising smoke toward the nearest exit.",
      "description": "A person crawls low. Also shown: smoke along the ceiling and an exit door.",
      "doodle": {
        "id": "kit-b6-4-fire-1",
        "figures": [
          {
            "role": "victim",
            "pose": "crawling_low",
            "x": 111.2
          }
        ],
        "props": [
          {
            "prop": "smoke_ceiling",
            "x": 100,
            "y": 20
          },
          {
            "prop": "exit_door",
            "x": 30,
            "y": 128
          }
        ]
      }
    },
    {
      "id": "fire-2",
      "caption": "Feel closed doors with the back of your hand before opening. If hot, use a second exit. Always take the stairs, never an elevator.",
      "description": "A person stands, touching a door with the back of one hand. Also shown: a closed door, a sign: no elevator and stairs.",
      "doodle": {
        "id": "kit-b6-4-fire-2",
        "figures": [
          {
            "role": "victim",
            "pose": "standing_testing_door",
            "x": 111
          }
        ],
        "props": [
          {
            "prop": "closed_door_heat",
            "x": 70,
            "y": 128,
            "scale": 2.6
          },
          {
            "prop": "no_elevator_icon",
            "x": 167.3,
            "y": 24
          },
          {
            "prop": "stairs_simple",
            "x": 170,
            "y": 128
          }
        ]
      }
    },
    {
      "id": "fire-3",
      "caption": "If clothes catch fire: (a) STOP immediately where you are, (b) DROP flat to the ground covering your face, and (c) ROLL back and forth until flames are out.",
      "description": "Three small figures: one standing, one lying down, one rolling. Also shown: flames.",
      "doodle": {
        "id": "kit-b6-4-fire-3",
        "ground": false,
        "props": [
          {
            "prop": "stop_drop_roll_3step",
            "x": 100,
            "y": 66
          },
          {
            "prop": "flame_wisps",
            "x": 38,
            "y": 28
          }
        ]
      }
    }
  ]
}

/** Kit card B6.5, Extreme heat, from docs/KIT_SCRIPTS.md. Captions are the script's, word for word. */
export const extremeHeat: DoodleStripSpec = {
  "id": "kit-b6-5-extreme-heat",
  "title": "Extreme heat",
  "review": "draft",
  "source": {
    "name": "FEMA Ready.gov Extreme Heat",
    "url": "https://ready.gov"
  },
  "panels": [
    {
      "id": "extreme-heat-1",
      "caption": "Drink plenty of cool water throughout the day before you feel thirsty. Avoid alcohol, caffeine, and sugary drinks.",
      "description": "A person stands, drinking water. Also shown: a water bottle and a crossed-out coffee and soda.",
      "doodle": {
        "id": "kit-b6-5-extreme-heat-1",
        "figures": [
          {
            "role": "victim",
            "pose": "standing_drinking_water",
            "x": 102
          }
        ],
        "props": [
          {
            "prop": "water_bottle",
            "x": 92,
            "y": 38
          },
          {
            "prop": "no_coffee_soda_icon",
            "x": 167.3,
            "y": 24
          }
        ]
      }
    },
    {
      "id": "extreme-heat-2",
      "caption": "Stay indoors in air-conditioned spaces during peak sun hours (10:00–16:00). Close blinds, take cool showers, or visit a public cooling centre.",
      "description": "A person sits in a cool room. Also shown: a clock and sun for 10:00 to 16:00 and closed blinds.",
      "doodle": {
        "id": "kit-b6-5-extreme-heat-2",
        "figures": [
          {
            "role": "victim",
            "pose": "sitting_cool_room",
            "x": 108.5
          }
        ],
        "props": [
          {
            "prop": "seat_simple",
            "x": 108.5,
            "y": 128
          },
          {
            "prop": "sun_clock_10_16",
            "x": 165.3,
            "y": 24
          },
          {
            "prop": "closed_blinds",
            "x": 28,
            "y": 24
          }
        ]
      }
    },
    {
      "id": "extreme-heat-3",
      "caption": "Wear loose, lightweight, light-colored clothing and a wide-brimmed hat outdoors. Never leave children or pets inside parked cars, and check on elderly neighbours.",
      "description": "A person stands, holding the brim of a hat. Also shown: a crossed-out parked car and a hot sun.",
      "doodle": {
        "id": "kit-b6-5-extreme-heat-3",
        "figures": [
          {
            "role": "victim",
            "pose": "standing_sun_hat",
            "x": 73
          }
        ],
        "props": [
          {
            "prop": "box_car_no_icon",
            "x": 148.4,
            "y": 24
          },
          {
            "prop": "hot_sun",
            "x": 28,
            "y": 24
          }
        ]
      }
    }
  ]
}
