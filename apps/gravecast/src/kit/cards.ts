/**
 * The survival kit's cards. Each one is a kit card from docs/KIT_SCRIPTS.md,
 * drawn with Groove UI's doodle system. The recovery position is drawn by hand
 * (recoveryPosition.ts); the others are in content/, generated from the script,
 * with the script's captions word for word. Add a card by adding its strip here.
 */
import type { DoodleStripSpec } from 'groove-ui/doodle'
import { adultCpr, childCpr, drowning, shock, seizure, poisoning } from './content/b1'
import { adultChoking, childChoking, heartAttack, stroke, allergicReaction } from './content/b2'
import { severeBleeding, burns, fractures, snakebite, electricShock, heatStroke, hypothermia } from './content/b3'
import { infantCpr, infantChoking } from './content/b4'
import { safeWater, signalling, shelter, phoneBattery, stayingFound } from './content/b5'
import { flood, cyclone, earthquake, fire, extremeHeat } from './content/b6'
import { recoveryPosition } from './recoveryPosition'

export type KitGroup = 'First aid' | 'Survival' | 'Disasters'

export interface KitCard {
  /** The card's address: /lantern/kit/<slug>. */
  slug: string
  group: KitGroup
  strip: DoodleStripSpec
}

export const KIT_CARDS: readonly KitCard[] = [
  { slug: 'adult-cpr', group: 'First aid', strip: adultCpr },
  { slug: 'child-cpr', group: 'First aid', strip: childCpr },
  { slug: 'recovery-position', group: 'First aid', strip: recoveryPosition },
  { slug: 'drowning', group: 'First aid', strip: drowning },
  { slug: 'shock', group: 'First aid', strip: shock },
  { slug: 'seizure', group: 'First aid', strip: seizure },
  { slug: 'poisoning', group: 'First aid', strip: poisoning },
  { slug: 'adult-choking', group: 'First aid', strip: adultChoking },
  { slug: 'child-choking', group: 'First aid', strip: childChoking },
  { slug: 'heart-attack', group: 'First aid', strip: heartAttack },
  { slug: 'stroke', group: 'First aid', strip: stroke },
  { slug: 'allergic-reaction', group: 'First aid', strip: allergicReaction },
  { slug: 'severe-bleeding', group: 'First aid', strip: severeBleeding },
  { slug: 'burns', group: 'First aid', strip: burns },
  { slug: 'fractures', group: 'First aid', strip: fractures },
  { slug: 'snakebite', group: 'First aid', strip: snakebite },
  { slug: 'electric-shock', group: 'First aid', strip: electricShock },
  { slug: 'heat-stroke', group: 'First aid', strip: heatStroke },
  { slug: 'hypothermia', group: 'First aid', strip: hypothermia },
  { slug: 'infant-cpr', group: 'First aid', strip: infantCpr },
  { slug: 'infant-choking', group: 'First aid', strip: infantChoking },
  { slug: 'safe-water', group: 'Survival', strip: safeWater },
  { slug: 'signalling', group: 'Survival', strip: signalling },
  { slug: 'shelter', group: 'Survival', strip: shelter },
  { slug: 'phone-battery', group: 'Survival', strip: phoneBattery },
  { slug: 'staying-found', group: 'Survival', strip: stayingFound },
  { slug: 'flood', group: 'Disasters', strip: flood },
  { slug: 'cyclone', group: 'Disasters', strip: cyclone },
  { slug: 'earthquake', group: 'Disasters', strip: earthquake },
  { slug: 'fire', group: 'Disasters', strip: fire },
  { slug: 'extreme-heat', group: 'Disasters', strip: extremeHeat },
]

export const findKitCard = (slug: string | undefined): KitCard | undefined => KIT_CARDS.find((card) => card.slug === slug)
