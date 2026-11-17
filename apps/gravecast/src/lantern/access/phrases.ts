/**
 * Keys of the dial pad for deaf and hard-of-hearing people: short things they may
 * need to tell someone. They are plain statements and requests, not facts or
 * advice, so they need no source. Key 0 opens the write screen instead.
 */
export interface DialKey {
  /** The key's number, 1 to 9. */
  n: number
  /** The short word on the key. */
  label: string
  /** What is shown across the screen. */
  text: string
}

export const DIAL_KEYS: readonly DialKey[] = [
  { n: 1, label: 'I am deaf', text: 'I am deaf. Please write it down.' },
  { n: 2, label: 'Lip-read', text: 'I can lip-read. Please face me and speak slowly.' },
  { n: 3, label: 'Help', text: 'I need help.' },
  { n: 4, label: 'Doctor', text: 'I need a doctor.' },
  { n: 5, label: 'Ambulance', text: 'Please call an ambulance for me.' },
  { n: 6, label: 'Emergency', text: 'Please call the emergency number for me.' },
  { n: 7, label: 'Hospital?', text: 'Where is the nearest hospital?' },
  { n: 8, label: 'Write back', text: 'Please write your answer on this phone.' },
  { n: 9, label: 'Thank you', text: 'Thank you.' },
]
