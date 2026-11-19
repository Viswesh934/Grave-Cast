import { useState } from 'react'

/**
 * Coordinates stay hidden on screen until the person asks to see them: the
 * phone may be shown to others, on a big screen in a demo or over a shoulder.
 * Hiding is for the screen only. Texts, copies and map links still carry the
 * real position, so help can find the person.
 */

/** A latitude and longitude pair as written in Lantern, such as `12.97194, 77.59369`. */
const COORDINATE_PAIR = /-?\d{1,3}\.\d+,\s*-?\d{1,3}\.\d+/g

/** Said in place of coordinates while they are hidden. */
export const HIDDEN_COORDINATES = 'Coordinates hidden'

/** `text` with every coordinate pair in it replaced by a note that it is hidden. */
export const hideCoordinates = (text: string): string => text.replace(COORDINATE_PAIR, `[${HIDDEN_COORDINATES.toLowerCase()}]`)

/** Whether coordinates are shown on this screen. Hidden each time a screen opens; never remembered. */
export const useShowCoordinates = () => useState(false)