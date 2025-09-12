export interface Room {
  number: string;
  floor: number;
  occupied: boolean;
  currentResident?: string;
  reportsCount?: number;
}

export interface Report {
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
  totalReports: number;
  totalIncidents: number;
}

export interface Stats {
  totalResidents: number;
  activeResidents: number;
  totalRooms: number;
  occupiedRooms: number;
  freeRooms: number;
  reportsCount: number;
}

export interface AdminDashboardData {
  stats: Stats;
  rooms: Room[];
  reports: Report[];   // ✅ corregido
  floorRanking: FloorRanking[];
}
