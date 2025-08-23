export interface Room {
  number: string;
  floor: number;
  occupied: boolean;
  currentResident?: string;
  servicesCount?: number;
}

export interface Service {
  id: string;
  roomNumber: string;
  floor: number;
  description: string;
  status: 'Pendiente' | 'En Progreso' | 'Finalizado';
  reportedBy: string;
  dateReported: string;
}

export interface FloorRanking {
  floor: number;
  totalServices: number;
  totalIncidents: number;
}

export interface AdminDashboardData {
  stats: {
    activeResidents: number;
    newResidentsThisMonth: number;
    occupancyRate: number;
    occupiedRooms: number;
    totalRooms: number;
    pendingRequests: number;
    pendingRequestsVariation: number;
    monthlyIncidents: number;
  };
  rooms: Room[];
  services: Service[];
  floorRanking: FloorRanking[];
}

export const adminDashboardMock: AdminDashboardData = {
  stats: {
    activeResidents: 145,
    newResidentsThisMonth: 10,
    occupancyRate: 90,
    occupiedRooms: 145,
    totalRooms: 160,
    pendingRequests: 12,
    pendingRequestsVariation: 5,
    monthlyIncidents: 5,
  },
  rooms: [
    { number: '101', floor: 1, occupied: true, currentResident: 'Juan Perez', servicesCount: 1 },
    { number: '102', floor: 1, occupied: true, currentResident: 'Ana Gomez', servicesCount: 0 },
    { number: '201', floor: 2, occupied: true, currentResident: 'Luis Torres', servicesCount: 2 },
    { number: '234', floor: 2, occupied: false },
  ],
  services: [
    {
      id: 's1',
      roomNumber: '101',
      floor: 1,
      description: 'Fuga de agua',
      status: 'Pendiente',
      reportedBy: 'Juan Perez',
      dateReported: '2025-08-14',
    },
    {
      id: 's2',
      roomNumber: '201',
      floor: 2,
      description: 'Luz quemada',
      status: 'En Progreso',
      reportedBy: 'Luis Torres',
      dateReported: '2025-08-10',
    },
  ],
  floorRanking: [
    { floor: 1, totalServices: 1, totalIncidents: 1 },
    { floor: 2, totalServices: 2, totalIncidents: 2 },
    { floor: 3, totalServices: 0, totalIncidents: 0 },
    { floor: 4, totalServices: 0, totalIncidents: 0 },
    { floor: 5, totalServices: 0, totalIncidents: 0 },
  ],
};