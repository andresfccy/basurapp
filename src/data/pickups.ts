export type PickupStatus = 'pending' | 'confirmed' | 'rejected' | 'completed'
export type PickupKind = 'organico' | 'inorganicos' | 'peligrosos'
export type PickupTimeSlot = '08:00 - 12:00' | '12:00 - 16:00' | '16:00 - 20:00'

export type Pickup = {
  id: string
  scheduledAt: string // ISO string
  status: PickupStatus
  staff?: string | null
  staffUsername?: string | null
  kind: PickupKind
  locality: string
  address: string
  timeSlot: PickupTimeSlot
  collectedWeightKg?: number | null
  archived?: boolean
}

export const bogotaLocalities = [
  'Usaquén',
  'Chapinero',
  'Santa Fe',
  'San Cristóbal',
  'Usme',
  'Tunjuelito',
  'Bosa',
  'Kennedy',
  'Fontibón',
  'Engativá',
  'Suba',
  'Barrios Unidos',
  'Teusaquillo',
  'Los Mártires',
  'Antonio Nariño',
  'Puente Aranda',
  'La Candelaria',
  'Rafael Uribe Uribe',
  'Ciudad Bolívar',
  'Sumapaz',
] as const

export const pickupTimeSlots: PickupTimeSlot[] = ['08:00 - 12:00', '12:00 - 16:00', '16:00 - 20:00']

// Datos simulados para los paneles de ciudadano y recolector.
export const upcomingPickups: Pickup[] = [
  {
    id: 'pk-001',
    scheduledAt: '2025-09-23T08:30:00-05:00',
    status: 'pending',
    staff: null,
    staffUsername: null,
    kind: 'organico',
    locality: 'Suba',
    address: 'Calle 132 #56-21',
    timeSlot: '08:00 - 12:00',
  },
  {
    id: 'pk-002',
    scheduledAt: '2025-09-25T14:15:00-05:00',
    status: 'confirmed',
    staff: 'Laura García',
    staffUsername: 'recolector',
    kind: 'inorganicos',
    locality: 'Chapinero',
    address: 'Carrera 9 #72-34',
    timeSlot: '12:00 - 16:00',
  },
  {
    id: 'pk-003',
    scheduledAt: '2025-10-02T09:00:00-05:00',
    status: 'pending',
    staff: null,
    staffUsername: null,
    kind: 'peligrosos',
    locality: 'Kennedy',
    address: 'Diagonal 40 sur #78-15',
    timeSlot: '08:00 - 12:00',
  },
  {
    id: 'pk-004',
    scheduledAt: '2025-10-15T07:45:00-05:00',
    status: 'rejected',
    staff: null,
    staffUsername: null,
    kind: 'organico',
    locality: 'Engativá',
    address: 'Avenida 68 #90-20',
    timeSlot: '08:00 - 12:00',
  },
  {
    id: 'pk-005',
    scheduledAt: '2025-09-18T16:45:00-05:00',
    status: 'completed',
    staff: 'Laura García',
    staffUsername: 'recolector',
    kind: 'inorganicos',
    locality: 'Fontibón',
    address: 'Calle 23 #103-42',
    timeSlot: '16:00 - 20:00',
    collectedWeightKg: 184.5,
  },
]
