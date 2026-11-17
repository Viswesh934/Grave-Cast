/** Starting the distress signal from anywhere in Lantern. The signal itself lives in DistressSignal.tsx. */

export const DISTRESS_EVENT = 'lantern:distress'

export interface DistressRequest {
  /** Start at once, with no countdown: the person chose it on purpose (the pads' SOS, or the button in Access). */
  immediate: boolean
}

/** Asks the distress signal to start. */
export const startDistress = (request: DistressRequest) => window.dispatchEvent(new CustomEvent<DistressRequest>(DISTRESS_EVENT, { detail: request }))

/** Mark an area where five quick taps are normal use (the braille pad), so they don't start the signal. */
export const NO_DISTRESS_TAPS = 'data-no-distress-taps'
