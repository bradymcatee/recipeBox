import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import RecipeCard from "./RecipeCard";

// Mock axios
jest.mock("axios");

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const originalModule = jest.requireActual("react-router-dom");
  return {
    ...originalModule,
    useNavigate: () => mockNavigate,
  };
});

describe("RecipeCard", () => {
  const mockRecipe = {
    id: 1,
    name: "Test Recipe",
    category: "Entree",
    station: "Grill",
    yield: "4 servings",
    instructions: "Step 1\nStep 2",
    ingredients: ["1 cup flour", "2 tsp sugar"],
  };

  const renderWithRouter = (id = "1") => {
    return render(
      <MemoryRouter initialEntries={[`/recipe/${id}`]}>
        <Routes>
          <Route path="/recipe/:id" element={<RecipeCard />} />
        </Routes>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue({ data: mockRecipe });
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  test("shows loading state initially", () => {
    axios.get.mockImplementationOnce(() => new Promise(() => {}));
    renderWithRouter();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test("shows error state when recipe not found", async () => {
    axios.get.mockRejectedValueOnce(new Error("Not found"));
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText(/recipe not found/i)).toBeInTheDocument();
    });
  });

  test("displays recipe details correctly", async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText("Test Recipe")).toBeInTheDocument();
      expect(screen.getByText("Entree")).toBeInTheDocument();
      expect(screen.getByText("Grill")).toBeInTheDocument();
      expect(screen.getByText("4 servings")).toBeInTheDocument();
      expect(screen.getByText(/Step 1/)).toBeInTheDocument();
      expect(screen.getByText("1 cup flour")).toBeInTheDocument();
      expect(screen.getByText("2 tsp sugar")).toBeInTheDocument();
    });
  });

  test("back button navigates to previous page", async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText("Test Recipe")).toBeInTheDocument();
    });

    const backButton = screen.getByRole("button", { name: /back/i });
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test("edit button navigates to edit page", async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText("Test Recipe")).toBeInTheDocument();
    });

    const editButton = screen.getByRole("button", { name: "Edit Recipe" });
    fireEvent.click(editButton);

    expect(mockNavigate).toHaveBeenCalledWith("/recipes/edit/1");
  });

  test("print button triggers window.print", async () => {
    const originalPrint = window.print;
    window.print = jest.fn();

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText("Test Recipe")).toBeInTheDocument();
    });

    const printButton = screen.getByRole("button", { name: /print recipe/i });
    fireEvent.click(printButton);

    expect(window.print).toHaveBeenCalled();
    window.print = originalPrint; // Restore original
  });

  test("handles API error gracefully", async () => {
    const alertMock = jest.fn();
    global.alert = alertMock;

    axios.get.mockRejectedValueOnce(new Error("API Error"));
    renderWithRouter();

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith("Error loading recipe");
    });
  });

  test("handles recipe with missing optional fields", async () => {
    const minimalRecipe = {
      id: 1,
      name: "Minimal Recipe",
      ingredients: [],
    };

    axios.get.mockResolvedValueOnce({ data: minimalRecipe });
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText("Minimal Recipe")).toBeInTheDocument();
    });
  });
});
