export interface Room {
  number: string;
  floor: number;
  occupied: boolean;
  currentResident?: string;
  servicesCount?: number;
}

export interface Service {
  id: number;
  description: string;
  status: string;
  roomNumber: string;
  floor: number;
  reportedBy: string;
  dateReported: string;
}

export interface FloorRanking {
  floor: number;
  totalServices: number;
  totalIncidents: number;
}

export interface Stats {
  activeResidents: number;
  occupancyRate: number;
  occupiedRooms: number;
  totalRooms: number;
  pendingRequests: number;
  monthlyIncidents: number;
}

export interface AdminDashboardData {
  stats: Stats;
  rooms: Room[];
  services: Service[];
  floorRanking: FloorRanking[];
}