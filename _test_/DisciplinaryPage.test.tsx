import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import DisciplinaryPage from "../src/pages/DisciplinaryPage";
import jwtDecode from "jwt-decode";

// Mock de jwt-decode
jest.mock("jwt-decode");
const mockedJwtDecode = jwtDecode as jest.MockedFunction<typeof jwtDecode>;

// Mock de fetch
global.fetch = jest.fn();
const mockedFetch = global.fetch as jest.MockedFunction<typeof fetch>;

// Mock de localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock de window.confirm y alert
global.confirm = jest.fn(() => true);
global.alert = jest.fn();

describe("DisciplinaryPage", () => {
  const mockMeasures = [
    {
      _id: "1",
      title: "Ruido excesivo",
      description: "Generación de ruido después de las 10 PM",
      status: "Activa",
      residentId: { _id: "r1", fullName: "Juan Pérez" },
      createdAt: "2024-10-01T10:00:00Z",
      createdBy: { fullName: "Admin User", role: "admin" },
    },
    {
      _id: "2",
      title: "Falta de limpieza",
      description: "No mantener el área común limpia",
      status: "Resuelta",
      residentId: { _id: "r2", fullName: "María García" },
      createdAt: "2024-09-28T14:00:00Z",
      createdBy: { fullName: "Representative", role: "representative" },
    },
  ];

  beforeEach(() => {
    // Setup localStorage con token
    localStorageMock.setItem("token", "mock-token");

    // Mock de jwt-decode para devolver un admin
    mockedJwtDecode.mockReturnValue({
      sub: "user1",
      role: "admin",
      fullName: "Admin User",
    });

    // Mock de fetch para devolver medidas
    mockedFetch.mockResolvedValue({
      ok: true,
      json: async () => mockMeasures,
      text: async () => JSON.stringify(mockMeasures),
    } as Response);
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  // ========== TESTS BÁSICOS DE RENDERIZADO ==========
  test("renders page title and description", async () => {
    render(<DisciplinaryPage />);

    await waitFor(() => {
      expect(screen.getByText("Medidas Disciplinarias")).toBeInTheDocument();
      expect(
        screen.getByText(/Gestión de medidas correctivas y seguimiento de acciones/i)
      ).toBeInTheDocument();
    });
  });

  test("shows loading state initially", () => {
    render(<DisciplinaryPage />);
    expect(screen.getByText(/Cargando medidas disciplinarias.../i)).toBeInTheDocument();
  });

  test("fetches and displays measures", async () => {
    render(<DisciplinaryPage />);

    await waitFor(() => {
      expect(screen.getByText("Ruido excesivo")).toBeInTheDocument();
      expect(screen.getByText("Falta de limpieza")).toBeInTheDocument();
    });
  });

  // ========== TESTS DE PERMISOS ==========
  test("shows 'Nueva Medida' button for admin", async () => {
    render(<DisciplinaryPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Nueva Medida/i })).toBeInTheDocument();
    });
  });

  test("hides 'Nueva Medida' button for resident", async () => {
    mockedJwtDecode.mockReturnValue({
      sub: "user2",
      role: "resident",
      fullName: "Resident User",
    });

    render(<DisciplinaryPage />);

    await waitFor(() => {
      expect(screen.getByText("Ruido excesivo")).toBeInTheDocument();
    });

    expect(screen.queryByRole("button", { name: /Nueva Medida/i })).not.toBeInTheDocument();
  });

  // ========== TESTS DE FILTROS ==========
  test("shows filter dropdown", async () => {
    render(<DisciplinaryPage />);

    await waitFor(() => {
      const filterSelect = screen.getByRole("combobox");
      expect(filterSelect).toBeInTheDocument();
    });
  });

  test("filters measures by status", async () => {
    render(<DisciplinaryPage />);

    await waitFor(() => {
      expect(screen.getByText("Ruido excesivo")).toBeInTheDocument();
      expect(screen.getByText("Falta de limpieza")).toBeInTheDocument();
    });

    // Filtrar solo activas
    const filterSelect = screen.getByRole("combobox");
    fireEvent.change(filterSelect, { target: { value: "Activa" } });

    expect(screen.getByText("Ruido excesivo")).toBeInTheDocument();
    expect(screen.queryByText("Falta de limpieza")).not.toBeInTheDocument();
  });

  // ========== TESTS DE ESTADOS ==========
  test("displays status badges correctly", async () => {
    render(<DisciplinaryPage />);

    await waitFor(() => {
      expect(screen.getByText("Activa")).toBeInTheDocument();
      expect(screen.getByText("Resuelta")).toBeInTheDocument();
    });
  });

  test("shows empty state when no measures exist", async () => {
    mockedFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response);

    render(<DisciplinaryPage />);

    await waitFor(() => {
      expect(
        screen.getByText(/No hay medidas disciplinarias disponibles/i)
      ).toBeInTheDocument();
    });
  });

  // ========== TESTS DE MODALES ==========
  test("opens details modal when clicking measure title", async () => {
    render(<DisciplinaryPage />);

    await waitFor(() => {
      expect(screen.getByText("Ruido excesivo")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Ruido excesivo"));

    await waitFor(() => {
      expect(screen.getByText("Detalles de la Medida Disciplinaria")).toBeInTheDocument();
    });
  });

  test("opens create modal when clicking 'Nueva Medida'", async () => {
    render(<DisciplinaryPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Nueva Medida/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Nueva Medida/i }));

    expect(screen.getByText("Nueva Medida Disciplinaria")).toBeInTheDocument();
  });

  // ========== TESTS DE ACCIONES ==========
  test("creates new measure successfully", async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockMeasures,
    } as Response);

    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockMeasures[0], _id: "3" }),
    } as Response);

    render(<DisciplinaryPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Nueva Medida/i })).toBeInTheDocument();
    });

    // Abrir modal
    fireEvent.click(screen.getByRole("button", { name: /Nueva Medida/i }));

    // Llenar formulario
    fireEvent.change(screen.getByPlaceholderText(/Título de la medida/i), {
      target: { value: "Nueva medida de prueba" },
    });

    fireEvent.change(
      screen.getByPlaceholderText(/Descripción detallada de la medida disciplinaria.../i),
      { target: { value: "Descripción de prueba" } }
    );

    fireEvent.change(screen.getByPlaceholderText(/Código de estudiante/i), {
      target: { value: "20165" },
    });

    // Enviar
    fireEvent.click(screen.getByRole("button", { name: /Crear Medida/i }));

    await waitFor(() => {
      expect(mockedFetch).toHaveBeenCalledWith(
        "http://localhost:3000/disciplinary-measures",
        expect.objectContaining({
          method: "POST",
        })
      );
    });
  });

  test("updates measure status", async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockMeasures,
    } as Response);

    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockMeasures[0], status: "Resuelta" }),
    } as Response);

    render(<DisciplinaryPage />);

    await waitFor(() => {
      expect(screen.getByText("Ruido excesivo")).toBeInTheDocument();
    });

    // Buscar botón de cambiar estado
    const statusButtons = screen.getAllByTitle(/Marcar como resuelta/i);
    fireEvent.click(statusButtons[0]);

    await waitFor(() => {
      expect(mockedFetch).toHaveBeenCalledWith(
        "http://localhost:3000/disciplinary-measures/1",
        expect.objectContaining({
          method: "PATCH",
        })
      );
    });
  });

  test("deletes measure after confirmation", async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockMeasures,
    } as Response);

    mockedFetch.mockResolvedValueOnce({
      ok: true,
    } as Response);

    render(<DisciplinaryPage />);

    await waitFor(() => {
      expect(screen.getByText("Ruido excesivo")).toBeInTheDocument();
    });

    // Buscar botón de eliminar
    const deleteButtons = screen.getAllByTitle(/Eliminar medida/i);
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(global.confirm).toHaveBeenCalled();
      expect(mockedFetch).toHaveBeenCalledWith(
        "http://localhost:3000/disciplinary-measures/1",
        expect.objectContaining({
          method: "DELETE",
        })
      );
    });
  });

  // ========== TESTS DE FORMATO Y UI ==========
  test("formats dates correctly", async () => {
    render(<DisciplinaryPage />);

    await waitFor(() => {
      // Verifica que haya elementos de fecha
      const dateElements = screen.getAllByText(/oct|2024/i);
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });

  test("displays resident information", async () => {
    render(<DisciplinaryPage />);

    await waitFor(() => {
      expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
      expect(screen.getByText("María García")).toBeInTheDocument();
    });
  });

  test("shows created by information", async () => {
    render(<DisciplinaryPage />);

    await waitFor(() => {
      const createdByElements = screen.getAllByText(/Creada por:/i);
      expect(createdByElements.length).toBeGreaterThan(0);
    });
  });
});