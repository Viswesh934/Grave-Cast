/**
 * "Last seen" notes: help messages saved on this phone, newest first. They stay
 * here, and are never sent anywhere by the app.
 */

export interface SavedNote {
  id: string
  text: string
  /** When it was saved, in milliseconds since 1970. */
  at: number
}

const KEY = 'gravecast-lantern-last-seen'
/** Enough to keep a trail, small enough to read. */
const MAX_NOTES = 20

export const loadNotes = (): SavedNote[] => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (note): note is SavedNote => typeof note?.id === 'string' && typeof note?.text === 'string' && typeof note?.at === 'number',
    )
  } catch {
    return []
  }
}

const store = (notes: SavedNote[]): SavedNote[] => {
  try {
    localStorage.setItem(KEY, JSON.stringify(notes))
  } catch {
    // Storage is full or blocked; the list still shows until the page closes.
  }
  return notes
}

export const saveNote = (text: string): SavedNote[] =>
  store([{ id: crypto.randomUUID(), text, at: Date.now() }, ...loadNotes()].slice(0, MAX_NOTES))

export const deleteNote = (id: string): SavedNote[] => store(loadNotes().filter((note) => note.id !== id))
