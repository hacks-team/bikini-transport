import { HomePage } from "@/pages/HomePage";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderWith } from "./render-with";

describe("home", () => {
  it("[테스트] 출발지를 누르면 정류장 리스트가 들어 있는 바텀싯이 올라온다", async () => {
    const user = userEvent.setup();
    renderWith(<HomePage />, { route: "/" });

    await waitFor(() => {
      expect(screen.getByText("Departure")).toBeInTheDocument();
    });

    // 초기 상태에서 바텀싯이 닫혀있는지 확인
    const allBottomSheets = screen.queryAllByTestId("bottom-sheet");
    const stationSearchBottomSheet = allBottomSheets.find((sheet) =>
      sheet.textContent?.includes("정류장 검색")
    );
    if (stationSearchBottomSheet) {
      expect(stationSearchBottomSheet).toHaveAttribute("data-state", "closed");
    }

    const departureButton = screen.getByText("Departure").closest("button");
    expect(departureButton).toBeInTheDocument();

    await user.click(departureButton!);

    // 버튼 클릭 후 바텀싯이 열리는지 확인
    await waitFor(() => {
      const allBottomSheets = screen.getAllByTestId("bottom-sheet");
      const stationSearchBottomSheet = allBottomSheets.find((sheet) =>
        sheet.textContent?.includes("정류장 검색")
      );
      expect(stationSearchBottomSheet).toBeInTheDocument();
      expect(stationSearchBottomSheet).toHaveAttribute("data-state", "open");
    });

    expect(screen.getByText("정류장 검색")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("버스 정류장을 검색해주세요")
    ).toBeInTheDocument();
  });

  it("[테스트] 도착지를 누르면 정류장 리스트가 들어 있는 바텀싯이 올라온다", async () => {
    const user = userEvent.setup();
    renderWith(<HomePage />, { route: "/" });

    await waitFor(() => {
      expect(screen.getByText("Arrival")).toBeInTheDocument();
    });

    // 초기 상태에서 바텀싯이 닫혀있는지 확인
    const allBottomSheets = screen.queryAllByTestId("bottom-sheet");
    const stationSearchBottomSheet = allBottomSheets.find((sheet) =>
      sheet.textContent?.includes("정류장 검색")
    );
    if (stationSearchBottomSheet) {
      expect(stationSearchBottomSheet).toHaveAttribute("data-state", "closed");
    }

    const arrivalButton = screen.getByText("Arrival").closest("button");
    expect(arrivalButton).toBeInTheDocument();

    await user.click(arrivalButton!);

    // 버튼 클릭 후 바텀싯이 열리는지 확인
    await waitFor(() => {
      const allBottomSheets = screen.getAllByTestId("bottom-sheet");
      const stationSearchBottomSheet = allBottomSheets.find((sheet) =>
        sheet.textContent?.includes("정류장 검색")
      );
      expect(stationSearchBottomSheet).toBeInTheDocument();
      expect(stationSearchBottomSheet).toHaveAttribute("data-state", "open");
    });

    expect(screen.getByText("정류장 검색")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("버스 정류장을 검색해주세요")
    ).toBeInTheDocument();
  });
});
