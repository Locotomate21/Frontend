import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AdminDashboard from "../src/pages/dashboards/AdminDashboard";

test("renders Admin Dashboard title", () => {
  const mockData = {
    stats: {
      totalResidents: 0,
      activeResidents: 0,
      totalRooms: 0,
      occupiedRooms: 0,
      freeRooms: 0,
      reportsCount: 0,
    },
    rooms: [],
    reports: [],
    floorRanking: [],
  };

  const mockSetActiveSection = jest.fn();

  render(
    <AdminDashboard
      data={mockData}
      activeSection="overview"
      setActiveSection={mockSetActiveSection}
    />
  );

  expect(screen.getByText(/Residentes Activos/i)).toBeInTheDocument();
});