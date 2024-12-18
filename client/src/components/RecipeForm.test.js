// RecipeForm.test.js
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import RecipeForm from "./RecipeForm";
import axios from "axios";
import { act } from "react";

// Mock axios
jest.mock("axios");

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("RecipeForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(global, "alert").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
    // Set default alert mock
    global.alert = jest.fn();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("renders form fields correctly", () => {
    render(
      <BrowserRouter>
        <RecipeForm />
      </BrowserRouter>
    );

    expect(screen.getByRole("textbox", { name: /name/i })).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: /category/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: /station/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: /ingredients/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: /instructions/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /yield/i })).toBeInTheDocument();
  });

  test("submits form data correctly", async () => {
    axios.post.mockResolvedValueOnce({ data: { id: 1 } });

    await act(async () => {
      render(
        <BrowserRouter>
          <RecipeForm />
        </BrowserRouter>
      );
    });

    // Fill out form
    await act(async () => {
      fireEvent.change(screen.getByRole("textbox", { name: /name/i }), {
        target: { value: "Test Recipe" },
      });
      fireEvent.change(screen.getByRole("combobox", { name: /category/i }), {
        target: { value: "Entree" },
      });
      fireEvent.change(screen.getByRole("textbox", { name: /station/i }), {
        target: { value: "Grill" },
      });
      fireEvent.change(screen.getByRole("textbox", { name: /ingredients/i }), {
        target: { value: "2 cups flour\n1 tsp salt" },
      });
      fireEvent.change(screen.getByRole("textbox", { name: /instructions/i }), {
        target: { value: "Mix ingredients" },
      });
      fireEvent.change(screen.getByRole("textbox", { name: /yield/i }), {
        target: { value: "4 servings" },
      });

      // Submit form
      fireEvent.click(screen.getByRole("button", { name: /create recipe/i }));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("/recipes", {
        name: "Test Recipe",
        category: "Entree",
        station: "Grill",
        ingredients: ["2 cups flour", "1 tsp salt"],
        instructions: "Mix ingredients",
        yield: "4 servings",
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith("/recipes");
  });

  test("handles form submission error", async () => {
    axios.post.mockRejectedValue(new Error("Failed to create recipe"));

    render(
      <BrowserRouter>
        <RecipeForm />
      </BrowserRouter>
    );

    // Fill out the form with valid inputs
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: "Test Recipe" },
      });
      fireEvent.change(screen.getByLabelText(/category/i), {
        target: { value: "Sauce" },
      });
      fireEvent.change(screen.getByLabelText(/ingredients/i), {
        target: { value: "1 cup flour\n2 cups sugar" },
      });
      fireEvent.change(screen.getByLabelText(/instructions/i), {
        target: { value: "Mix ingredients." },
      });

      fireEvent.submit(screen.getByRole("form"));
    });

    // Expect an error alert to be shown
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining("Error")
      );
    });

    // Ensure console.error was called
    expect(console.error).toHaveBeenCalled();
  });

  test("back button navigates to previous page", () => {
    render(
      <BrowserRouter>
        <RecipeForm />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /back/i }));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test("validates required fields", async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <RecipeForm />
        </BrowserRouter>
      );
    });

    // Submit form without filling required fields
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /create recipe/i }));
    });

    // Check that form wasn't submitted
    expect(axios.post).not.toHaveBeenCalled();

    // Check for required field validation
    expect(screen.getByRole("textbox", { name: /name/i })).toBeInvalid();
    expect(screen.getByRole("textbox", { name: /ingredients/i })).toBeInvalid();
  });
});
