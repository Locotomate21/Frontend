// Interfaces alineadas con el StatsResponseDto del backend
export interface AdminStats {
  totalResidents: number;
  activeResidents: number;
  totalRooms: number;
  occupiedRooms: number;
  freeRooms: number;
  reportsCount: number;
}

// Mock de ejemplo (puedes ajustarlo a lo que devuelve tu backend en pruebas)
export const adminDashboardMock: AdminStats = {
  totalResidents: 6,
  activeResidents: 4,
  totalRooms: 8,
  occupiedRooms: 4,
  freeRooms: 4,
  reportsCount: 3,
};