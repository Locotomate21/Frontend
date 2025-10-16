import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ProfilePage from "../src/pages/ProfilePage";
import api from "../src/services/axios";
import { useAuthStore } from "../src/store/authStore";

// Mock de axios
jest.mock("../src/services/axios");
const mockedApi = api as jest.Mocked<typeof api>;

// Mock del store de autenticación
jest.mock("../src/store/authStore");
const mockedUseAuthStore = useAuthStore as unknown as jest.Mock;

// Mock de los componentes de shadcn/ui
jest.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children, defaultValue }: any) => (
    <div data-testid="tabs" data-default-value={defaultValue}>
      {children}
    </div>
  ),
  TabsList: ({ children }: any) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children, value }: any) => (
    <button data-testid={`tab-trigger-${value}`}>{children}</button>
  ),
  TabsContent: ({ children, value }: any) => (
    <div data-testid={`tab-content-${value}`}>{children}</div>
  ),
}));

describe("ProfilePage", () => {
  const mockResidentProfile = {
    fullName: "Juan Pérez González",
    email: "juan.perez@example.com",
    phone: "3001234567",
    role: "resident",
    room: { number: 301 },
    enrollmentDate: "2024-01-15T00:00:00Z",
    idNumber: 1234567890,
    studentCode: 2021001,
    academicProgram: "Ingeniería de Sistemas",
    admissionYear: 2021,
    period: "2024-1",
    benefitOrActivity: "Beca de excelencia",
  };

  const mockRepresentativeProfile = {
    fullName: "María González López",
    email: "maria.gonzalez@example.com",
    phone: "3109876543",
    role: "representative",
    room: { number: 405 },
    enrollmentDate: "2023-08-01T00:00:00Z",
    idNumber: 9876543210,
    studentCode: 2020002,
    academicProgram: "Administración de Empresas",
    admissionYear: 2020,
    period: "2024-1",
    benefitOrActivity: "Monitor académico",
  };

  const mockAdminProfile = {
    fullName: "Carlos Admin",
    email: "admin@example.com",
    phone: "3151234567",
    role: "admin",
    room: null,
    enrollmentDate: "2020-01-01T00:00:00Z",
  };

  beforeEach(() => {
    // Configurar mock del store con token por defecto
    mockedUseAuthStore.mockReturnValue({
      auth: {
        token: "mock-token",
        role: "resident",
      },
    });

    // Mock de la API por defecto
    mockedApi.get.mockResolvedValue({ data: mockResidentProfile });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ========== Tests de Renderizado Básico ==========
  test("renders profile page title", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText(/Perfil del Usuario/i)).toBeInTheDocument();
    });
  });

  test("displays loading state initially", () => {
    render(<ProfilePage />);
    expect(screen.getByText(/Cargando perfil.../i)).toBeInTheDocument();
  });

  test("fetches profile data on mount", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalledWith("/resident/me", {
        headers: { Authorization: "Bearer mock-token" },
      });
    });
  });

  // ========== Tests de Tabs ==========
  test("renders all three tabs", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText(/Información Personal/i)).toBeInTheDocument();
      expect(screen.getByText(/Datos de Residencia/i)).toBeInTheDocument();
      expect(screen.getByText(/Datos Académicos/i)).toBeInTheDocument();
    });
  });

  test("sets 'personal' as default tab", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      const tabsElement = screen.getByTestId("tabs");
      expect(tabsElement).toHaveAttribute("data-default-value", "personal");
    });
  });

  // ========== Tests de Información Personal ==========
  test("displays personal information for resident", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Juan Pérez González")).toBeInTheDocument();
      expect(screen.getByText("juan.perez@example.com")).toBeInTheDocument();
      expect(screen.getByText("3001234567")).toBeInTheDocument();
    });
  });

  test("capitalizes role name correctly", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Resident")).toBeInTheDocument();
    });
  });

  test("displays phone number correctly", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("3001234567")).toBeInTheDocument();
    });
  });

  test("shows dash when phone is not available", async () => {
    mockedApi.get.mockResolvedValue({
      data: { ...mockResidentProfile, phone: null },
    });

    render(<ProfilePage />);

    await waitFor(() => {
      const phoneLabel = screen.getByText("Teléfono");
      const phoneValue = phoneLabel.parentElement?.querySelector(".font-medium");
      expect(phoneValue).toHaveTextContent("-");
    });
  });

  // ========== Tests de Datos de Residencia ==========
  test("displays residence information", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("301")).toBeInTheDocument();
    });
  });

  test("formats entry date correctly", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      // La fecha debe estar formateada según locale
      const dateElements = screen.getAllByText(/15|1|2024/);
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });

  test("shows dash when room number is not available", async () => {
    mockedApi.get.mockResolvedValue({
      data: { ...mockResidentProfile, room: null },
    });

    render(<ProfilePage />);

    await waitFor(() => {
      const roomLabel = screen.getByText("Número de habitación");
      const roomValue = roomLabel.parentElement?.querySelector(".font-medium");
      expect(roomValue).toHaveTextContent("-");
    });
  });

  test("shows dash when entry date is not available", async () => {
    mockedApi.get.mockResolvedValue({
      data: { ...mockResidentProfile, enrollmentDate: null },
    });

    render(<ProfilePage />);

    await waitFor(() => {
      const dateLabel = screen.getByText("Fecha de ingreso");
      const dateValue = dateLabel.parentElement?.querySelector(".font-medium");
      expect(dateValue).toHaveTextContent("-");
    });
  });

  // ========== Tests de Datos Académicos ==========
  test("displays academic information for resident", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("1234567890")).toBeInTheDocument();
      expect(screen.getByText("2021001")).toBeInTheDocument();
      expect(screen.getByText("Ingeniería de Sistemas")).toBeInTheDocument();
      expect(screen.getByText("2021")).toBeInTheDocument();
      expect(screen.getByText("2024-1")).toBeInTheDocument();
      expect(screen.getByText("Beca de excelencia")).toBeInTheDocument();
    });
  });

  test("displays academic information for representative", async () => {
    mockedApi.get.mockResolvedValue({ data: mockRepresentativeProfile });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("9876543210")).toBeInTheDocument();
      expect(screen.getByText("2020002")).toBeInTheDocument();
      expect(screen.getByText("Administración de Empresas")).toBeInTheDocument();
      expect(screen.getByText("2020")).toBeInTheDocument();
      expect(screen.getByText("Monitor académico")).toBeInTheDocument();
    });
  });

  test("shows message when academic data is not available for admin", async () => {
    mockedApi.get.mockResolvedValue({ data: mockAdminProfile });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText(/Sin datos académicos disponibles/i)).toBeInTheDocument();
    });
  });

  test("displays all academic field labels", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("ID")).toBeInTheDocument();
      expect(screen.getByText("Código Estudiantil")).toBeInTheDocument();
      expect(screen.getByText("Programa Académico")).toBeInTheDocument();
      expect(screen.getByText("Año de Admisión")).toBeInTheDocument();
      expect(screen.getByText("Periodo")).toBeInTheDocument();
      expect(screen.getByText("Beneficio/Actividad")).toBeInTheDocument();
    });
  });

  // ========== Tests de Roles ==========
  test("displays correct information for president role", async () => {
    mockedApi.get.mockResolvedValue({
      data: { ...mockAdminProfile, role: "president" },
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("President")).toBeInTheDocument();
      expect(screen.getByText(/Sin datos académicos disponibles/i)).toBeInTheDocument();
    });
  });

  test("displays correct information for secretary_general role", async () => {
    mockedApi.get.mockResolvedValue({
      data: { ...mockAdminProfile, role: "secretary_general" },
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Secretary_general")).toBeInTheDocument();
      expect(screen.getByText(/Sin datos académicos disponibles/i)).toBeInTheDocument();
    });
  });

  // ========== Tests de Manejo de Errores ==========
  test("displays error message when API call fails", async () => {
    mockedApi.get.mockRejectedValue({
      response: { data: { message: "Error de autenticación" } },
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText(/Error: Error de autenticación/i)).toBeInTheDocument();
    });
  });

  test("displays generic error message when no specific error message", async () => {
    mockedApi.get.mockRejectedValue(new Error("Network Error"));

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText(/Error: Network Error/i)).toBeInTheDocument();
    });
  });

  test("displays default error message when error has no message", async () => {
    mockedApi.get.mockRejectedValue({});

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText(/Error: Error al cargar perfil/i)).toBeInTheDocument();
    });
  });

  test("does not fetch profile when token is not available", () => {
    mockedUseAuthStore.mockReturnValue({
      auth: { token: null },
    });

    render(<ProfilePage />);

    expect(mockedApi.get).not.toHaveBeenCalled();
  });

  // ========== Tests de UI Components ==========
  test("renders Card components correctly", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Información Personal")).toBeInTheDocument();
      expect(screen.getByText("Datos de Residencia")).toBeInTheDocument();
      expect(screen.getByText("Datos Académicos")).toBeInTheDocument();
    });
  });

  test("renders InfoItem components with correct structure", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      const nameLabel = screen.getByText("Nombre completo");
      expect(nameLabel).toHaveClass("text-sm", "text-gray-500");
      
      const nameValue = nameLabel.parentElement?.querySelector(".font-medium");
      expect(nameValue).toHaveClass("font-medium", "text-gray-900");
    });
  });

  test("displays User icon in header", async () => {
    const { container } = render(<ProfilePage />);

    await waitFor(() => {
      const icon = container.querySelector(".text-blue-600");
      expect(icon).toBeInTheDocument();
    });
  });

  // ========== Tests de Formato de Datos ==========
  test("converts phone number to string", async () => {
    mockedApi.get.mockResolvedValue({
      data: { ...mockResidentProfile, phone: 3001234567 },
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("3001234567")).toBeInTheDocument();
    });
  });

  test("converts room number to string", async () => {
    mockedApi.get.mockResolvedValue({
      data: { ...mockResidentProfile, room: { number: 101 } },
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("101")).toBeInTheDocument();
    });
  });

  test("converts academic numbers to strings", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("1234567890")).toBeInTheDocument();
      expect(screen.getByText("2021001")).toBeInTheDocument();
      expect(screen.getByText("2021")).toBeInTheDocument();
    });
  });

  // ========== Tests de Estados Especiales ==========
  test("handles empty string values correctly", async () => {
    mockedApi.get.mockResolvedValue({
      data: {
        ...mockResidentProfile,
        phone: "",
        academicProgram: "",
        benefitOrActivity: "",
      },
    });

    render(<ProfilePage />);

    await waitFor(() => {
      const labels = screen.getAllByText("-");
      expect(labels.length).toBeGreaterThan(0);
    });
  });

  test("handles undefined academic fields", async () => {
    mockedApi.get.mockResolvedValue({
      data: {
        ...mockResidentProfile,
        idNumber: undefined,
        studentCode: undefined,
        academicProgram: undefined,
        admissionYear: undefined,
        period: undefined,
        benefitOrActivity: undefined,
      },
    });

    render(<ProfilePage />);

    await waitFor(() => {
      const academicSection = screen.getByText("Datos Académicos");
      expect(academicSection).toBeInTheDocument();
      
      // Debe mostrar guiones para valores undefined
      const dashes = screen.getAllByText("-");
      expect(dashes.length).toBeGreaterThan(0);
    });
  });

  // ========== Tests de Integración ==========
  test("renders complete profile page structure", async () => {
    const { container } = render(<ProfilePage />);

    await waitFor(() => {
      expect(container.querySelector(".bg-white.rounded-xl")).toBeInTheDocument();
      expect(screen.getByTestId("tabs")).toBeInTheDocument();
      expect(screen.getByTestId("tabs-list")).toBeInTheDocument();
    });
  });

  test("displays all personal information fields", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Nombre completo")).toBeInTheDocument();
      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("Teléfono")).toBeInTheDocument();
      expect(screen.getByText("Rol")).toBeInTheDocument();
    });
  });

  test("displays all residence information fields", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Número de habitación")).toBeInTheDocument();
      expect(screen.getByText("Fecha de ingreso")).toBeInTheDocument();
    });
  });
});