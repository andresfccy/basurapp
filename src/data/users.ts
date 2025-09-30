export type CitizenUserStatus = 'Activo' | 'Pendiente' | 'Deshabilitado'

export type CitizenUser = {
  id: string
  name: string
  email: string
  phone: string
  status: CitizenUserStatus
  createdAt: string
}

export const citizenUsers: CitizenUser[] = [
  {
    id: 'usr-1001',
    name: 'Andrea Morales',
    email: 'andrea.morales@example.com',
    phone: '+57 300 123 4567',
    status: 'Activo',
    createdAt: '2025-03-14',
  },
  {
    id: 'usr-1002',
    name: 'Santiago Ruiz',
    email: 'santiago.ruiz@basurapp.com',
    phone: '+57 311 987 6543',
    status: 'Pendiente',
    createdAt: '2025-04-02',
  },
  {
    id: 'usr-1003',
    name: 'Laura García',
    email: 'laura.garcia@basurapp.com',
    phone: '+57 312 555 0199',
    status: 'Deshabilitado',
    createdAt: '2025-02-28',
  },
]

export type CollectorStatus = 'Activo' | 'De vacaciones' | 'Deshabilitado'

export type CollectorCompany = {
  id: string
  name: string
}

export type Collector = {
  id: string
  name: string
  email: string
  phone: string
  assignedZones: string[]
  activeRoutes: number
  status: CollectorStatus
  lastCheckIn: string
  companyId: CollectorCompany['id']
  companyName: string
}

export const collectorCompanies: CollectorCompany[] = [
  { id: 'comp-9001', name: 'EcoLogística Andina' },
  { id: 'comp-9002', name: 'Reciclarte SAS' },
  { id: 'comp-9003', name: 'GreenCycle Bogotá' },
]

export const collectors: Collector[] = [
  {
    id: 'col-5001',
    name: 'Laura García',
    email: 'laura.garcia@basurapp.com',
    phone: '+57 312 555 0199',
    assignedZones: ['Chapinero', 'Fontibón'],
    activeRoutes: 8,
    status: 'Activo',
    lastCheckIn: '2025-09-10 08:45',
    companyId: 'comp-9001',
    companyName: 'EcoLogística Andina',
  },
  {
    id: 'col-5002',
    name: 'Carlos López',
    email: 'carlos.lopez@basurapp.com',
    phone: '+57 310 777 1188',
    assignedZones: ['Suba'],
    activeRoutes: 5,
    status: 'De vacaciones',
    lastCheckIn: '2025-09-01 18:05',
    companyId: 'comp-9002',
    companyName: 'Reciclarte SAS',
  },
  {
    id: 'col-5003',
    name: 'Valentina Rojas',
    email: 'valentina.rojas@basurapp.com',
    phone: '+57 301 444 3355',
    assignedZones: ['Engativá', 'Kennedy'],
    activeRoutes: 10,
    status: 'Deshabilitado',
    lastCheckIn: '2025-08-22 17:20',
    companyId: 'comp-9003',
    companyName: 'GreenCycle Bogotá',
  },
]
