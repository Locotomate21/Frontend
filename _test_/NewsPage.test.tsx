import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import NewsSection from "../src/pages/NewsPage";
import api from "../src/services/axios";
import { useAuthStore } from "../src/store/authStore";

// Mock de axios
jest.mock("../src/services/axios");
const mockedApi = api as jest.Mocked<typeof api>;

// Mock del store de autenticación
jest.mock("../src/store/authStore");
const mockedUseAuthStore = useAuthStore as unknown as jest.Mock;

describe("NewsSection", () => {
  const mockNews = [
    {
      _id: "1",
      title: "Nueva política de convivencia",
      content: "Se ha actualizado el reglamento de convivencia del edificio.",
      publishedAt: "2024-10-10T10:00:00Z",
      createdBy: {
        _id: "user1",
        fullName: "Juan Pérez",
        role: "admin",
      },
      type: "general" as const,
    },
    {
      _id: "2",
      title: "Reunión Piso 3",
      content: "Se convoca a reunión de vecinos del piso 3.",
      publishedAt: "2024-10-08T14:00:00Z",
      createdBy: {
        _id: "user2",
        fullName: "María González",
        role: "representative",
      },
      type: "floor" as const,
      floor: 3,
    },
  ];

  beforeEach(() => {
    // Configurar mock del store con rol de admin por defecto
    mockedUseAuthStore.mockReturnValue({
      auth: {
        _id: "user1",
        role: "admin",
        token: "mock-token",
        floor: null,
      },
    });

    // Mock de la API
    mockedApi.get.mockResolvedValue({ data: mockNews });
    mockedApi.post.mockResolvedValue({ data: mockNews[0] });
    mockedApi.patch.mockResolvedValue({ data: mockNews[0] });
    mockedApi.delete.mockResolvedValue({ data: {} });

    // Mock de window.confirm
    global.confirm = jest.fn(() => true);
    global.alert = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ========== Tests de Renderizado ==========
  test("renders news section title", () => {
    render(<NewsSection />);
    expect(screen.getByText(/Noticias y Avisos/i)).toBeInTheDocument();
  });

  test("renders page description", () => {
    render(<NewsSection />);
    expect(
      screen.getByText(/Mantente al día con las últimas actualizaciones/i)
    ).toBeInTheDocument();
  });

  test("fetches and displays news on mount", async () => {
    render(<NewsSection />);

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalledWith("/news");
    });

    await waitFor(() => {
      expect(screen.getByText("Nueva política de convivencia")).toBeInTheDocument();
      expect(screen.getByText("Reunión Piso 3")).toBeInTheDocument();
    });
  });

  test("displays news count badge", async () => {
    render(<NewsSection />);

    await waitFor(() => {
      expect(screen.getByText(/2 noticias/i)).toBeInTheDocument();
    });
  });

  // ========== Tests de Estado Vacío ==========
  test("displays empty state when no news exist", async () => {
    mockedApi.get.mockResolvedValue({ data: [] });

    render(<NewsSection />);

    await waitFor(() => {
      expect(screen.getByText(/No hay noticias disponibles/i)).toBeInTheDocument();
    });
  });

  // ========== Tests de Permisos ==========
  test("shows 'Crear noticia' button for admin role", () => {
    render(<NewsSection />);
    expect(screen.getByRole("button", { name: /Crear noticia/i })).toBeInTheDocument();
  });

  test("shows 'Crear noticia' button for president role", () => {
    mockedUseAuthStore.mockReturnValue({
      auth: { _id: "user1", role: "president", token: "mock-token" },
    });

    render(<NewsSection />);
    expect(screen.getByRole("button", { name: /Crear noticia/i })).toBeInTheDocument();
  });

  test("shows 'Crear noticia' button for secretary_general role", () => {
    mockedUseAuthStore.mockReturnValue({
      auth: { _id: "user1", role: "secretary_general", token: "mock-token" },
    });

    render(<NewsSection />);
    expect(screen.getByRole("button", { name: /Crear noticia/i })).toBeInTheDocument();
  });

  test("shows 'Crear noticia' button for representative role", () => {
    mockedUseAuthStore.mockReturnValue({
      auth: { _id: "user1", role: "representative", token: "mock-token", floor: 3 },
    });

    render(<NewsSection />);
    expect(screen.getByRole("button", { name: /Crear noticia/i })).toBeInTheDocument();
  });

  test("hides 'Crear noticia' button for resident role", () => {
    mockedUseAuthStore.mockReturnValue({
      auth: { _id: "user1", role: "resident", token: "mock-token" },
    });

    render(<NewsSection />);
    expect(screen.queryByRole("button", { name: /Crear noticia/i })).not.toBeInTheDocument();
  });

  // ========== Tests de Tipos y Badges ==========
  test("displays 'General' badge for general news", async () => {
    render(<NewsSection />);

    await waitFor(() => {
      expect(screen.getByText("General")).toBeInTheDocument();
    });
  });

  test("displays floor badge for floor-specific news", async () => {
    render(<NewsSection />);

    await waitFor(() => {
      expect(screen.getByText("Piso 3")).toBeInTheDocument();
    });
  });

  // ========== Tests de Formato de Fecha ==========
  test("displays formatted dates correctly", async () => {
    render(<NewsSection />);

    await waitFor(() => {
      const dateElements = screen.getAllByText(/oct|octubre/i);
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });

  test("displays relative time (time ago)", async () => {
    render(<NewsSection />);

    await waitFor(() => {
      const timeAgoElements = screen.getAllByText(/Hace/i);
      expect(timeAgoElements.length).toBeGreaterThan(0);
    });
  });

  // ========== Tests de Contenido Truncado ==========
  test("truncates long content in preview", async () => {
    const longNews = {
      ...mockNews[0],
      content: "A".repeat(200), // Contenido muy largo
    };
    
    mockedApi.get.mockResolvedValue({ data: [longNews] });

    render(<NewsSection />);

    await waitFor(() => {
      const content = screen.getByText(/A+\.\.\./);
      expect(content).toBeInTheDocument();
      expect(content.textContent?.length).toBeLessThan(200);
    });
  });

  // ========== Tests de Modal de Detalles ==========
  test("opens details modal when clicking on news title", async () => {
    render(<NewsSection />);

    await waitFor(() => {
      expect(screen.getByText("Nueva política de convivencia")).toBeInTheDocument();
    });

    const newsTitle = screen.getByText("Nueva política de convivencia");
    fireEvent.click(newsTitle);

    await waitFor(() => {
      expect(screen.getByText("Noticia General")).toBeInTheDocument();
    });
  });

  test("closes details modal when close button is clicked", async () => {
    render(<NewsSection />);

    await waitFor(() => {
      expect(screen.getByText("Nueva política de convivencia")).toBeInTheDocument();
    });

    // Abrir modal
    const newsTitle = screen.getByText("Nueva política de convivencia");
    fireEvent.click(newsTitle);

    await waitFor(() => {
      expect(screen.getByText("Noticia General")).toBeInTheDocument();
    });

    // Cerrar modal
    const closeButton = screen.getAllByRole("button").find(btn => 
      btn.querySelector('svg') && btn.className.includes('text-gray-400')
    );
    
    if (closeButton) {
      fireEvent.click(closeButton);
    }

    await waitFor(() => {
      expect(screen.queryByText("Noticia General")).not.toBeInTheDocument();
    });
  });

  // ========== Tests de Creación de Noticias ==========
  test("opens create modal when 'Crear noticia' button is clicked", async () => {
    render(<NewsSection />);

    await waitFor(() => {
      expect(screen.getByText("Nueva política de convivencia")).toBeInTheDocument();
    });

    const createButton = screen.getByRole("button", { name: /Crear noticia/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText("Crear noticia")).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Título de la noticia/i)).toBeInTheDocument();
    });
  });

  test("creates news successfully", async () => {
    render(<NewsSection />);

    await waitFor(() => {
      expect(screen.getByText("Nueva política de convivencia")).toBeInTheDocument();
    });

    // Abrir modal de creación
    const createButton = screen.getByRole("button", { name: /Crear noticia/i });
    fireEvent.click(createButton);

    // Llenar formulario
    const titleInput = screen.getByPlaceholderText(/Título de la noticia/i);
    const contentInput = screen.getByPlaceholderText(/Contenido de la noticia/i);

    fireEvent.change(titleInput, { target: { value: "Nueva noticia de prueba" } });
    fireEvent.change(contentInput, { target: { value: "Contenido de prueba" } });

    // Enviar formulario
    const submitButton = screen.getByRole("button", { name: /Crear noticia/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledWith(
        "/news",
        expect.objectContaining({
          title: "Nueva noticia de prueba",
          content: "Contenido de prueba",
        }),
        expect.any(Object)
      );
    });
  });

  // ========== Tests de Edición ==========
  test("opens edit modal when edit button is clicked", async () => {
    render(<NewsSection />);

    await waitFor(() => {
      expect(screen.getByText("Nueva política de convivencia")).toBeInTheDocument();
    });

    const editButtons = screen.getAllByTitle(/Editar noticia/i);
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Editar noticia")).toBeInTheDocument();
    });
  });

  test("updates news successfully", async () => {
    render(<NewsSection />);

    await waitFor(() => {
      expect(screen.getByText("Nueva política de convivencia")).toBeInTheDocument();
    });

    // Abrir modal de edición
    const editButtons = screen.getAllByTitle(/Editar noticia/i);
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Editar noticia")).toBeInTheDocument();
    });

    // Modificar título
    const titleInput = screen.getByPlaceholderText(/Título/i);
    fireEvent.change(titleInput, { target: { value: "Título actualizado" } });

    // Enviar formulario
    const submitButton = screen.getByRole("button", { name: /Guardar cambios/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedApi.patch).toHaveBeenCalled();
    });
  });

  // ========== Tests de Eliminación ==========
  test("deletes news after confirmation", async () => {
    render(<NewsSection />);

    await waitFor(() => {
      expect(screen.getByText("Nueva política de convivencia")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle(/Eliminar noticia/i);
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(global.confirm).toHaveBeenCalled();
      expect(mockedApi.delete).toHaveBeenCalledWith("/news/1", expect.any(Object));
    });
  });

  test("does not delete news when confirmation is cancelled", async () => {
    global.confirm = jest.fn(() => false);

    render(<NewsSection />);

    await waitFor(() => {
      expect(screen.getByText("Nueva política de convivencia")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle(/Eliminar noticia/i);
    fireEvent.click(deleteButtons[0]);

    expect(global.confirm).toHaveBeenCalled();
    expect(mockedApi.delete).not.toHaveBeenCalled();
  });

  // ========== Tests de Permisos de Edición/Eliminación ==========
  test("shows action buttons only for authorized users", async () => {
    render(<NewsSection />);

    await waitFor(() => {
      expect(screen.getByText("Nueva política de convivencia")).toBeInTheDocument();
    });

    const editButtons = screen.getAllByTitle(/Editar noticia/i);
    expect(editButtons.length).toBeGreaterThan(0);
  });

  test("hides action buttons for unauthorized users", async () => {
    mockedUseAuthStore.mockReturnValue({
      auth: { _id: "different-user", role: "resident", token: "mock-token" },
    });

    render(<NewsSection />);

    await waitFor(() => {
      expect(screen.getByText("Nueva política de convivencia")).toBeInTheDocument();
    });

    const editButtons = screen.queryAllByTitle(/Editar noticia/i);
    expect(editButtons.length).toBe(0);
  });

  test("representative can only edit their own news", async () => {
    mockedUseAuthStore.mockReturnValue({
      auth: { _id: "user2", role: "representative", token: "mock-token", floor: 3 },
    });

    render(<NewsSection />);

    await waitFor(() => {
      expect(screen.getByText("Reunión Piso 3")).toBeInTheDocument();
    });

    // Debe ver botones para su propia noticia
    const editButtons = screen.getAllByTitle(/Editar noticia/i);
    expect(editButtons.length).toBeGreaterThan(0);
  });

  // ========== Tests de Manejo de Errores ==========
  test("handles API errors gracefully on fetch", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    mockedApi.get.mockRejectedValue(new Error("API Error"));

    render(<NewsSection />);

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        "Error cargando noticias:",
        expect.any(Error)
      );
    });

    consoleError.mockRestore();
  });

  test("handles API errors on create", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    mockedApi.post.mockRejectedValue(new Error("API Error"));

    render(<NewsSection />);

    await waitFor(() => {
      expect(screen.getByText("Nueva política de convivencia")).toBeInTheDocument();
    });

    // Abrir modal y crear noticia
    const createButton = screen.getByRole("button", { name: /Crear noticia/i });
    fireEvent.click(createButton);

    const titleInput = screen.getByPlaceholderText(/Título de la noticia/i);
    const contentInput = screen.getByPlaceholderText(/Contenido de la noticia/i);

    fireEvent.change(titleInput, { target: { value: "Test" } });
    fireEvent.change(contentInput, { target: { value: "Test content" } });

    const submitButton = screen.getByRole("button", { name: /Crear noticia/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
      expect(global.alert).toHaveBeenCalledWith("Error al crear noticia");
    });

    consoleError.mockRestore();
  });

  // ========== Tests de Ordenamiento ==========
  test("displays news sorted by date (newest first)", async () => {
    render(<NewsSection />);

    await waitFor(() => {
      const newsTitles = screen.getAllByRole("heading", { level: 3 });
      expect(newsTitles[0]).toHaveTextContent("Nueva política de convivencia");
      expect(newsTitles[1]).toHaveTextContent("Reunión Piso 3");
    });
  });

  // ========== Tests de Indicador Visual ==========
  test("highlights the most recent news", async () => {
    render(<NewsSection />);

    await waitFor(() => {
      expect(screen.getByText("Nueva política de convivencia")).toBeInTheDocument();
    });

    // Verificar que existe el indicador visual (la barra azul)
    const newsCards = screen.getAllByRole("heading", { level: 3 })[0].closest("div");
    const indicator = newsCards?.querySelector(".bg-gradient-to-b");
    expect(indicator).toBeInTheDocument();
  });
});