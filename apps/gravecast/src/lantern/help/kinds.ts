/**
 * What "Help near you" looks for, how far, and which Amazon Location Service
 * categories count as each kind. Distances are chosen so a city doesn't return
 * hundreds of pharmacies and a town still finds its nearest hospital.
 *
 * Shelters and drinking water are not here: AWS has no category for them. They
 * come back when a second source is added (see the vision doc, section 9).
 */
export type PlaceKind = 'hospital' | 'clinic' | 'pharmacy' | 'police' | 'fire'

export interface KindInfo {
  id: PlaceKind
  /** One of them, for a place with no name: "Hospital". */
  label: string
  /** The heading over the list. */
  group: string
  /** How far to search, in metres. */
  radiusM: number
  /** The most to keep, nearest first. */
  keep: number
  /** Amazon Location Service category IDs for Places SearchNearby. */
  aws: readonly string[]
}

export const KINDS: readonly KindInfo[] = [
  { id: 'hospital', label: 'Hospital', group: 'Hospitals', radiusM: 15000, keep: 10, aws: ['hospital', 'hospital_emergency_room'] },
  { id: 'clinic', label: 'Clinic', group: 'Clinics', radiusM: 8000, keep: 10, aws: ['urgent_care_center'] },
  { id: 'pharmacy', label: 'Pharmacy', group: 'Pharmacies', radiusM: 5000, keep: 10, aws: ['pharmacy', 'drugstore'] },
  { id: 'police', label: 'Police station', group: 'Police', radiusM: 10000, keep: 8, aws: ['police_station'] },
  { id: 'fire', label: 'Fire station', group: 'Fire stations', radiusM: 10000, keep: 8, aws: ['fire_department'] },
]
