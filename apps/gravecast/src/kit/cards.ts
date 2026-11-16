/**
 * The survival kit's cards. Each one is a kit card from docs/KIT_SCRIPTS.md,
 * drawn with Groove UI's doodle system. Add a card by adding its strip here.
 */
import type { DoodleStripSpec } from 'groove-ui/doodle'
import { recoveryPosition } from './recoveryPosition'

export type KitGroup = 'First aid' | 'Survival' | 'Disasters'

export interface KitCard {
  /** The card's address: /emergency/kit/<slug>. */
  slug: string
  group: KitGroup
  strip: DoodleStripSpec
}

export const KIT_CARDS: readonly KitCard[] = [{ slug: 'recovery-position', group: 'First aid', strip: recoveryPosition }]

export const findKitCard = (slug: string | undefined): KitCard | undefined => KIT_CARDS.find((card) => card.slug === slug)