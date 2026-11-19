import { useState } from 'react'

/**
 * Coordinates are censored on screen until the person taps them: the phone
 * may be shown to others, on a big screen in a demo or over a shoulder.
 * Censoring is for the screen only. Texts, copies and map links still carry
 * the real position, so help can find the person.
 */

/** A latitude and longitude pair as written in Lantern, such as `12.97194, 77.59369`. */
const COORDINATE_PAIR = /(-?\d{1,3}\.\d+,\s*-?\d{1,3}\.\d+)/

/** One piece of a text: plain words, or a coordinate pair to censor. */
export type TextPiece = { kind: 'words' | 'coordinates'; text: string }

/** Splits `text` into its words and its coordinate pairs, in order. */
export const splitCoordinates = (text: string): TextPiece[] =>
  text
    .split(COORDINATE_PAIR)
    .filter((piece) => piece !== '')
    .map((piece) => ({ kind: COORDINATE_PAIR.test(piece) ? 'coordinates' : 'words', text: piece }))

/** Whether coordinates are shown on this screen. Censored each time a screen opens; never remembered. */
export const useShowCoordinates = () => useState(false)
