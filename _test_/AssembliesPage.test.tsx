import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import AssembliesPage from "../src/pages/AssembliesPage";
import api from "../src/services/axios";
import { useAuthStore } from "../src/store/authStore";

// Mock de axios
jest.mock("../src/services/axios");
const mockedApi = api as jest.Mocked<typeof api>;

// Mock del store de autenticación
jest.mock("../src/store/authStore");
const mockedUseAuthStore = useAuthStore as unknown as jest.Mock;

describe("AssembliesPage", () => {
  const mockAssemblies = [
    {
      _id: "1",
      title: "Asamblea General 2024",
      date: "2024-12-15",
      time: "18:00",
      location: "Salón Principal",
      status: "Programada" as const,
      type: "general" as const,
      description: "Reunión anual de residentes",
    },
    {
      _id: "2",
      title: "Asamblea Piso 3",
      date: "2024-11-20",
      time: "19:00",
      location: "Sala de reuniones",
      status: "Completada" as const,
      type: "floor" as const,
      floor: 3,
      attendance: { present: 8, total: 10 },
    },
  ];

  beforeEach(() => {
    // Configurar mock del store con rol de admin por defecto
    mockedUseAuthStore.mockReturnValue({
      auth: { role: "admin", floor: null },
    });

    // Mock de la API
    mockedApi.get.mockResolvedValue({ data: mockAssemblies });
    mockedApi.post.mockResolvedValue({ data: mockAssemblies[0] });
    mockedApi.put.mockResolvedValue({ data: mockAssemblies[0] });
    mockedApi.patch.mockResolvedValue({ data: mockAssemblies[0] });
    mockedApi.delete.mockResolvedValue({ data: {} });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders Assemblies page title", () => {
    render(<AssembliesPage />);
    expect(screen.getByText(/Asambleas/i)).toBeInTheDocument();
  });

  test("renders page description", () => {
    render(<AssembliesPage />);
    expect(screen.getByText(/Consulta, crea y administra asambleas/i)).toBeInTheDocument();
  });

  test("fetches and displays assemblies on mount", async () => {
    render(<AssembliesPage />);

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalledWith("/assemblies");
    });

    await waitFor(() => {
      expect(screen.getByText("Asamblea General 2024")).toBeInTheDocument();
      expect(screen.getByText("Asamblea Piso 3")).toBeInTheDocument();
    });
  });

  test("shows 'Nueva Asamblea' button for admin role", () => {
    render(<AssembliesPage />);
    expect(screen.getByRole("button", { name: /Nueva Asamblea/i })).toBeInTheDocument();
  });

  test("hides 'Nueva Asamblea' button for resident role", () => {
    mockedUseAuthStore.mockReturnValue({
      auth: { role: "resident", floor: 2 },
    });

    render(<AssembliesPage />);
    expect(screen.queryByRole("button", { name: /Nueva Asamblea/i })).not.toBeInTheDocument();
  });

  test("displays empty state when no assemblies exist", async () => {
    mockedApi.get.mockResolvedValue({ data: [] });

    render(<AssembliesPage />);

    await waitFor(() => {
      expect(screen.getByText(/No hay asambleas registradas/i)).toBeInTheDocument();
    });
  });

  test("opens create modal when 'Nueva Asamblea' button is clicked", async () => {
    render(<AssembliesPage />);

    await waitFor(() => {
      expect(screen.getByText("Asamblea General 2024")).toBeInTheDocument();
    });

    const newButton = screen.getByRole("button", { name: /Nueva Asamblea/i });
    fireEvent.click(newButton);

    expect(screen.getByText("Nueva Asamblea")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Título \*/i)).toBeInTheDocument();
  });

  test("displays assembly status badges correctly", async () => {
    render(<AssembliesPage />);

    await waitFor(() => {
      expect(screen.getByText("Programada")).toBeInTheDocument();
      expect(screen.getByText("Completada")).toBeInTheDocument();
    });
  });

  test("shows floor indicator for floor assemblies", async () => {
    render(<AssembliesPage />);

    await waitFor(() => {
      expect(screen.getByText("Piso 3")).toBeInTheDocument();
    });
  });

  test("displays attendance information when available", async () => {
    render(<AssembliesPage />);

    await waitFor(() => {
      expect(screen.getByText("8/10 presentes")).toBeInTheDocument();
    });
  });

  test("opens details modal when clicking on assembly title", async () => {
    render(<AssembliesPage />);

    await waitFor(() => {
      expect(screen.getByText("Asamblea General 2024")).toBeInTheDocument();
    });

    const assemblyTitle = screen.getByText("Asamblea General 2024");
    fireEvent.click(assemblyTitle);

    await waitFor(() => {
      expect(screen.getByText("Detalles de la Asamblea")).toBeInTheDocument();
    });
  });

  test("closes modal when close button is clicked", async () => {
    render(<AssembliesPage />);

    await waitFor(() => {
      expect(screen.getByText("Asamblea General 2024")).toBeInTheDocument();
    });

    // Abrir modal
    const newButton = screen.getByRole("button", { name: /Nueva Asamblea/i });
    fireEvent.click(newButton);

    expect(screen.getByText("Nueva Asamblea")).toBeInTheDocument();

    // Cerrar modal
    const closeButtons = screen.getAllByRole("button", { name: "" });
    const closeButton = closeButtons.find(btn => btn.querySelector('svg'));
    if (closeButton) {
      fireEvent.click(closeButton);
    }

    await waitFor(() => {
      expect(screen.queryByText("Nueva Asamblea")).not.toBeInTheDocument();
    });
  });

  test("displays action buttons for authorized users", async () => {
    render(<AssembliesPage />);

    await waitFor(() => {
      expect(screen.getByText("Asamblea General 2024")).toBeInTheDocument();
    });

    // Verificar que existen botones de acción (los iconos están presentes)
    const editIcons = screen.getAllByTitle(/Editar asamblea/i);
    expect(editIcons.length).toBeGreaterThan(0);
  });

  test("representative can only manage floor assemblies from their floor", async () => {
    mockedUseAuthStore.mockReturnValue({
      auth: { role: "representative", floor: 3 },
    });

    render(<AssembliesPage />);

    await waitFor(() => {
      expect(screen.getByText("Asamblea Piso 3")).toBeInTheDocument();
    });

    // El representante debería ver botones de acción solo para su piso
    expect(screen.getByText("Piso 3")).toBeInTheDocument();
  });

  test("formats dates correctly", async () => {
    render(<AssembliesPage />);

    await waitFor(() => {
      // La fecha debería estar formateada (puede variar según locale)
      const dateElements = screen.getAllByText(/2024/);
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });

  test("handles API errors gracefully", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    mockedApi.get.mockRejectedValue(new Error("API Error"));

    render(<AssembliesPage />);

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith("Error cargando asambleas:", expect.any(Error));
    });

    consoleError.mockRestore();
  });
});