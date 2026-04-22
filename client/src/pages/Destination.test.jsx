import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Destination from "./Destination";
import { api } from "../services/http";

jest.mock("../services/http", () => ({
  api: jest.fn(),
}));

jest.mock("../components/RobotNotifier", () => {
  return function RobotNotifier({ message }) {
    return <div data-testid="robot-message">{message}</div>;
  };
});

describe("Destination page", () => {
  test("renders destination details and seasonality", async () => {
    api
      .mockResolvedValueOnce({
        id: 10,
        name: "Bali",
        country: "Indonesia",
        about: "Island destination",
        safety_score: 4,
        visa_type: "visa-free",
        avg_daily_cost: 2500,
        tags: [{ id: 1, name: "Beach" }],
        images: [{ image_url: "https://img.local/bali-db.jpg", is_cover: false }],
        seasonality: [
          { month: 4, suitability: 5 },
          { month: 5, suitability: 4 },
        ],
      })
      .mockResolvedValueOnce({
        results: [{ urls: { regular: "https://img.local/bali-unsplash.jpg" } }],
      });

    render(
      <MemoryRouter initialEntries={["/destinations/10?start=2026-04-10&end=2026-05-10"]}>
        <Routes>
          <Route path="/destinations/:id" element={<Destination />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Loading…")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Bali")).toBeInTheDocument();
    });

    expect(screen.getByText("Indonesia")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Island destination")).toBeInTheDocument();
    expect(screen.getByText("Seasonality")).toBeInTheDocument();
    expect(screen.getByText("Apr")).toBeInTheDocument();
    expect(screen.getByText("May")).toBeInTheDocument();
    expect(screen.getByText("Safety")).toBeInTheDocument();
    expect(screen.getAllByText("4/5").length).toBeGreaterThan(0);

    await waitFor(() => {
      expect(screen.getByAltText("Bali view 1")).toHaveAttribute(
        "src",
        "https://img.local/bali-unsplash.jpg"
      );
    });
    expect(screen.getByTestId("robot-message")).toBeInTheDocument();
  });
});
