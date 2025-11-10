import { HomePage } from "@/pages/HomePage";
import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWith } from "./render-with";

describe("home", () => {
  it("[테스트] 메인 화면을 띄운다", async () => {
    renderWith(<HomePage />, { route: "/" });

    await waitFor(() => {
      expect(screen.getByText("Departure")).toBeInTheDocument();
    });

    expect(screen.getByText("Arrival")).toBeInTheDocument();
    expect(screen.getByText("버스표 조회")).toBeInTheDocument();
  });
});
