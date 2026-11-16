/**
 * What "Help near you" looks for, and how far. Each kind is a set of OpenStreetMap
 * tags. Distances are how far from the person to search, chosen so a city doesn't
 * return thousands of pharmacies and a town still finds its nearest hospital.
 */
export type PlaceKind = 'hospital' | 'clinic' | 'pharmacy' | 'police' | 'fire' | 'shelter' | 'water'

export interface KindInfo {
  id: PlaceKind
  /** One of them, for a place with no name: "Hospital". */
  label: string
  /** The heading over the list. */
  group: string
  /** OpenStreetMap key and value pairs. Any one of them makes a place this kind. */
  tags: readonly (readonly [key: string, value: string])[]
  /** How far to search, in metres. */
  radiusM: number
  /** The most to keep, nearest first. */
  keep: number
}

export const KINDS: readonly KindInfo[] = [
  { id: 'hospital', label: 'Hospital', group: 'Hospitals', tags: [['amenity', 'hospital']], radiusM: 15000, keep: 10 },
  { id: 'clinic', label: 'Clinic', group: 'Clinics', tags: [['amenity', 'clinic']], radiusM: 8000, keep: 10 },
  { id: 'pharmacy', label: 'Pharmacy', group: 'Pharmacies', tags: [['amenity', 'pharmacy']], radiusM: 5000, keep: 10 },
  { id: 'police', label: 'Police station', group: 'Police', tags: [['amenity', 'police']], radiusM: 10000, keep: 8 },
  { id: 'fire', label: 'Fire station', group: 'Fire stations', tags: [['amenity', 'fire_station']], radiusM: 10000, keep: 8 },
  {
    id: 'shelter',
    label: 'Shelter or assembly point',
    group: 'Shelters and assembly points',
    tags: [
      ['emergency', 'assembly_point'],
      ['social_facility', 'shelter'],
    ],
    radiusM: 15000,
    keep: 15,
  },
  { id: 'water', label: 'Drinking water', group: 'Drinking water', tags: [['amenity', 'drinking_water']], radiusM: 3000, keep: 10 },
]