// RecipesTable.test.js
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import RecipesTable from "./RecipesTable";
import axios from "axios";

jest.mock("axios");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("RecipesTable", () => {
  const mockRecipes = [
    { id: 1, name: "Recipe 1", category: "Entree", station: "Grill" },
    { id: 2, name: "Recipe 2", category: "Dessert", station: "Pastry" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    global.alert = jest.fn();
  });

  test("shows loading state initially", async () => {
    axios.get.mockImplementationOnce(() => new Promise(() => {}));

    await act(async () => {
      render(
        <BrowserRouter>
          <RecipesTable />
        </BrowserRouter>
      );
    });

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test("renders recipes table after loading", async () => {
    axios.get.mockResolvedValueOnce({ data: mockRecipes });

    await act(async () => {
      render(
        <BrowserRouter>
          <RecipesTable />
        </BrowserRouter>
      );
    });

    await waitFor(() => {
      expect(
        screen.getByRole("columnheader", { name: /name/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("columnheader", { name: /category/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("columnheader", { name: /station/i })
      ).toBeInTheDocument();
      expect(screen.getByText("Recipe 1")).toBeInTheDocument();
      expect(screen.getByText("Recipe 2")).toBeInTheDocument();
    });
  });

  test("filters recipes by search term", async () => {
    axios.get.mockResolvedValueOnce({ data: mockRecipes });

    await act(async () => {
      render(
        <BrowserRouter>
          <RecipesTable />
        </BrowserRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Recipe 1")).toBeInTheDocument();
    });

    // Changed to use getByPlaceholderText directly since the input doesn't have a role
    const searchInput = screen.getByPlaceholderText(/search recipes/i);

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "Recipe 1" } });
    });

    expect(screen.getByText("Recipe 1")).toBeInTheDocument();
    expect(screen.queryByText("Recipe 2")).not.toBeInTheDocument();
  });

  test("filters recipes by category", async () => {
    axios.get.mockResolvedValueOnce({ data: mockRecipes });

    await act(async () => {
      render(
        <BrowserRouter>
          <RecipesTable />
        </BrowserRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Recipe 1")).toBeInTheDocument();
    });

    const categorySelect = screen.getByRole("combobox");

    await act(async () => {
      fireEvent.change(categorySelect, { target: { value: "Entree" } });
    });

    expect(screen.getByText("Recipe 1")).toBeInTheDocument();
    expect(screen.queryByText("Recipe 2")).not.toBeInTheDocument();
  });

  test("sorts recipes by clicking column headers", async () => {
    axios.get.mockResolvedValueOnce({ data: mockRecipes });

    await act(async () => {
      render(
        <BrowserRouter>
          <RecipesTable />
        </BrowserRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getAllByRole("row")).toHaveLength(3); // header + 2 recipes
    });

    const nameHeader = screen.getByRole("columnheader", { name: /name/i });

    // Changed to look for specific cell content instead of entire row
    const cells = screen.getAllByRole("cell");
    expect(cells[0]).toHaveTextContent("Recipe 1");
    expect(cells[4]).toHaveTextContent("Recipe 2");

    // Second click - sort descending
    await act(async () => {
      fireEvent.click(nameHeader);
    });

    const cellsAfterSecondClick = screen.getAllByRole("cell");
    expect(cellsAfterSecondClick[0]).toHaveTextContent("Recipe 2");
    expect(cellsAfterSecondClick[4]).toHaveTextContent("Recipe 1");
  });

  test("handles recipe deletion", async () => {
    axios.get.mockResolvedValueOnce({ data: mockRecipes });
    axios.delete.mockResolvedValueOnce({});
    global.confirm = jest.fn(() => true);

    await act(async () => {
      render(
        <BrowserRouter>
          <RecipesTable />
        </BrowserRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Recipe 1")).toBeInTheDocument();
    });

    const deleteButton = screen.getAllByRole("button", { name: /delete/i })[0];

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    expect(global.confirm).toHaveBeenCalled();
    expect(axios.delete).toHaveBeenCalledWith("/recipes/1");
  });

  test("cancels deletion when user clicks cancel", async () => {
    axios.get.mockResolvedValueOnce({ data: mockRecipes });
    global.confirm = jest.fn(() => false);

    await act(async () => {
      render(
        <BrowserRouter>
          <RecipesTable />
        </BrowserRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Recipe 1")).toBeInTheDocument();
    });

    const deleteButton = screen.getAllByRole("button", { name: /delete/i })[0];

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    expect(global.confirm).toHaveBeenCalled();
    expect(axios.delete).not.toHaveBeenCalled();
  });

  test("shows error message when API fails", async () => {
    axios.get.mockRejectedValueOnce(new Error("API Error"));

    await act(async () => {
      render(
        <BrowserRouter>
          <RecipesTable />
        </BrowserRouter>
      );
    });

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith("Error loading recipes");
    });
  });
});
