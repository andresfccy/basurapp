export type PickupStatus = 'pending' | 'confirmed' | 'rejected' | 'completed'
export type PickupKind = 'organico' | 'inorganicos' | 'peligrosos'
export type PickupTimeSlot = '08:00 - 12:00' | '12:00 - 16:00' | '16:00 - 20:00'

export type Pickup = {
  id: string
  scheduledAt: string // ISO string
  status: PickupStatus
  staff?: string | null
  staffUsername?: string | null
  requestedBy?: string
  kind: PickupKind
  locality: string
  address: string
  timeSlot: PickupTimeSlot
  collectedWeightKg?: number | null
  archived?: boolean
  completedAt?: string | null
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
