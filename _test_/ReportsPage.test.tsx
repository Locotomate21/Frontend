import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ReportsPage from "../src/pages/ReportsPage";
import axios from "axios";
import { useAuthStore } from "../src/store/authStore";

// Mock de axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock del store de autenticación
jest.mock("../src/store/authStore");
const mockedUseAuthStore = useAuthStore as unknown as jest.Mock;

// Mock de window.alert
global.alert = jest.fn();

describe("ReportsPage", () => {
  const mockReports = [
    {
      _id: "1",
      reason: "Filtración en el baño",
      description: "Hay una filtración constante en el baño de la habitación",
      actionTaken: "",
      urgent: true,
      date: "2024-10-10T10:00:00Z",
      room: "201",
      location: "room",
      studentCode: 20165,
      resident: {
        _id: "r1",
        fullName: "Juan Pérez",
        studentCode: 20165,
        room: { number: 201, floor: 2 },
      },
      createdBy: { fullName: "Admin User" },
    },
    {
      _id: "2",
      reason: "Luz fundida en pasillo",
      description: "La luz del pasillo del piso 3 no funciona",
      actionTaken: "Finalizado",
      urgent: false,
      date: "2024-10-08T14:00:00Z",
      room: "piso_3_pasillo",
      location: "common_area",
      studentCode: 20166,
      resident: {
        _id: "r2",
        fullName: "María García",
        studentCode: 20166,
        room: { number: 301, floor: 3 },
      },
      createdBy: { fullName: "Representative" },
    },
  ];

  beforeEach(() => {
    // Configurar mock del store con rol de admin
    mockedUseAuthStore.mockReturnValue({
      auth: {
        role: "admin",
        fullName: "Admin User",
        token: "mock-token",
      },
    });

    // Mock de axios
    mockedAxios.get.mockResolvedValue({ data: mockReports });
    mockedAxios.post.mockResolvedValue({ data: mockReports[0] });
    mockedAxios.patch.mockResolvedValue({ data: { ...mockReports[0], actionTaken: "Finalizado" } });
    mockedAxios.delete.mockResolvedValue({ data: {} });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ========== TESTS BÁSICOS DE RENDERIZADO ==========
  test("renders page title and description", async () => {
    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText("Reportes de Mantenimiento")).toBeInTheDocument();
      expect(
        screen.getByText(/Gestión de reportes y seguimiento de acciones/i)
      ).toBeInTheDocument();
    });
  });

  test("fetches and displays reports", async () => {
    render(<ReportsPage />);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "http://localhost:3000/report",
        expect.objectContaining({
          headers: { Authorization: "Bearer mock-token" },
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Filtración en el baño")).toBeInTheDocument();
      expect(screen.getByText("Luz fundida en pasillo")).toBeInTheDocument();
    });
  });

  test("shows empty state when no reports exist", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });

    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText(/No hay reportes disponibles/i)).toBeInTheDocument();
    });
  });

  // ========== TESTS DE PERMISOS ==========
  test("shows 'Nuevo Reporte' button for admin", async () => {
    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Nuevo Reporte/i })).toBeInTheDocument();
    });
  });

  test("hides 'Nuevo Reporte' button for resident", async () => {
    mockedUseAuthStore.mockReturnValue({
      auth: {
        role: "resident",
        fullName: "Resident User",
        token: "mock-token",
      },
    });

    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText("Filtración en el baño")).toBeInTheDocument();
    });

    expect(screen.queryByRole("button", { name: /Nuevo Reporte/i })).not.toBeInTheDocument();
  });

  // ========== TESTS DE ESTADOS ==========
  test("displays status badges correctly", async () => {
    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText("Urgente")).toBeInTheDocument();
      expect(screen.getByText("Finalizado")).toBeInTheDocument();
    });
  });

  test("shows urgent indicator for urgent reports", async () => {
    const { container } = render(<ReportsPage />);

    await waitFor(() => {
      const urgentIndicator = container.querySelector(".from-red-500");
      expect(urgentIndicator).toBeInTheDocument();
    });
  });

  // ========== TESTS DE MODALES ==========
  test("opens details modal when clicking report title", async () => {
    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText("Filtración en el baño")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Filtración en el baño"));

    await waitFor(() => {
      expect(screen.getByText("Detalles del Reporte")).toBeInTheDocument();
    });
  });

  test("opens create modal when clicking 'Nuevo Reporte'", async () => {
    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Nuevo Reporte/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Nuevo Reporte/i }));

    expect(screen.getByText("Nuevo Reporte")).toBeInTheDocument();
  });

  test("opens edit modal when clicking edit button", async () => {
    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText("Filtración en el baño")).toBeInTheDocument();
    });

    const editButtons = screen.getAllByTitle(/Editar reporte/i);
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Editar Reporte")).toBeInTheDocument();
    });
  });

  // ========== TESTS DE CREACIÓN ==========
  test("creates new report successfully", async () => {
    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Nuevo Reporte/i })).toBeInTheDocument();
    });

    // Abrir modal
    fireEvent.click(screen.getByRole("button", { name: /Nuevo Reporte/i }));

    // Llenar formulario
    fireEvent.change(screen.getByPlaceholderText(/Código de estudiante/i), {
      target: { value: "20165" },
    });

    fireEvent.change(screen.getByPlaceholderText(/Título del problema/i), {
      target: { value: "Nuevo problema de prueba" },
    });

    fireEvent.change(screen.getByPlaceholderText(/Descripción detallada del daño.../i), {
      target: { value: "Descripción de prueba" },
    });

    // Enviar
    fireEvent.click(screen.getByRole("button", { name: /Crear Reporte/i }));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://localhost:3000/report",
        expect.objectContaining({
          studentCode: 20165,
          reason: "Nuevo problema de prueba",
        }),
        expect.any(Object)
      );
    });
  });

  test("shows alert when creating report without student code", async () => {
    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Nuevo Reporte/i })).toBeInTheDocument();
    });

    // Abrir modal
    fireEvent.click(screen.getByRole("button", { name: /Nuevo Reporte/i }));

    // Intentar crear sin código de estudiante
    fireEvent.click(screen.getByRole("button", { name: /Crear Reporte/i }));

    expect(global.alert).toHaveBeenCalledWith(
      "Debes ingresar un código de estudiante válido."
    );
  });

  // ========== TESTS DE EDICIÓN ==========
  test("updates report successfully", async () => {
    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText("Filtración en el baño")).toBeInTheDocument();
    });

    // Abrir modal de edición
    const editButtons = screen.getAllByTitle(/Editar reporte/i);
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Editar Reporte")).toBeInTheDocument();
    });

    // Modificar razón
    const reasonInput = screen.getByPlaceholderText(/Motivo del reporte/i);
    fireEvent.change(reasonInput, { target: { value: "Razón actualizada" } });

    // Guardar
    fireEvent.click(screen.getByRole("button", { name: /Actualizar Reporte/i }));

    await waitFor(() => {
      expect(mockedAxios.patch).toHaveBeenCalled();
    });
  });

  // ========== TESTS DE FINALIZACIÓN ==========
  test("marks report as finished", async () => {
    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText("Filtración en el baño")).toBeInTheDocument();
    });

    // Buscar botón de finalizar
    const finishButtons = screen.getAllByTitle(/Marcar como finalizado/i);
    fireEvent.click(finishButtons[0]);

    await waitFor(() => {
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        "http://localhost:3000/report/1",
        { actionTaken: "Finalizado" },
        expect.any(Object)
      );
    });
  });

  // ========== TESTS DE ELIMINACIÓN ==========
  test("deletes report successfully", async () => {
    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText("Filtración en el baño")).toBeInTheDocument();
    });

    // Buscar botón de eliminar
    const deleteButtons = screen.getAllByTitle(/Eliminar reporte/i);
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        "http://localhost:3000/report/1",
        expect.any(Object)
      );
    });
  });

  // ========== TESTS DE FORMATO Y UI ==========
  test("formats dates correctly", async () => {
    render(<ReportsPage />);

    await waitFor(() => {
      const dateElements = screen.getAllByText(/oct|2024/i);
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });

  test("displays resident information", async () => {
    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
      expect(screen.getByText("María García")).toBeInTheDocument();
    });
  });

  test("displays room information", async () => {
    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Hab\. 201, Piso 2/i)).toBeInTheDocument();
      expect(screen.getByText(/Hab\. 301, Piso 3/i)).toBeInTheDocument();
    });
  });

  test("truncates long descriptions", async () => {
    const longDescription = "A".repeat(150);
    mockedAxios.get.mockResolvedValue({
      data: [{ ...mockReports[0], description: longDescription }],
    });

    render(<ReportsPage />);

    await waitFor(() => {
      const truncatedText = screen.getByText(/A+\.\.\./);
      expect(truncatedText.textContent?.length).toBeLessThan(150);
    });
  });

  // ========== TESTS DE UBICACIÓN ==========
  test("shows location selector in create modal", async () => {
    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Nuevo Reporte/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Nuevo Reporte/i }));

    expect(screen.getByText("Ubicación del daño")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  test("changes form fields based on location selection", async () => {
    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Nuevo Reporte/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Nuevo Reporte/i }));

    const locationSelect = screen.getByRole("combobox");
    
    // Cambiar a área común
    fireEvent.change(locationSelect, { target: { value: "common_area" } });

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Área común/i)).toBeInTheDocument();
    });
  });

  // ========== TESTS DE CHECKBOX URGENTE ==========
  test("allows marking report as urgent", async () => {
    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Nuevo Reporte/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Nuevo Reporte/i }));

    const urgentCheckbox = screen.getByText(/Marcar como urgente/i).previousSibling as HTMLInputElement;
    
    fireEvent.click(urgentCheckbox);

    expect(urgentCheckbox.checked).toBe(true);
  });

  // ========== TESTS DE PERMISOS DE EDICIÓN ==========
  test("shows action buttons only for authorized users", async () => {
    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText("Filtración en el baño")).toBeInTheDocument();
    });

    const editButtons = screen.getAllByTitle(/Editar reporte/i);
    expect(editButtons.length).toBeGreaterThan(0);
  });

  test("hides action buttons for unauthorized users", async () => {
    mockedUseAuthStore.mockReturnValue({
      auth: {
        role: "resident",
        fullName: "Different User",
        token: "mock-token",
      },
    });

    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText("Filtración en el baño")).toBeInTheDocument();
    });

    const editButtons = screen.queryAllByTitle(/Editar reporte/i);
    expect(editButtons.length).toBe(0);
  });
});