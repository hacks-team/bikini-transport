import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { HomePage } from '@/pages/HomePage';
import { renderWith } from './render-with';

describe('home', () => {
  it('[테스트] 출발지 바텀싯에서 정류장을 선택하면 출발지에 해당 정류장이 반영된다.', async () => {
    const user = userEvent.setup();
    renderWith(<HomePage />, { route: '/' });

    const 출발Button = screen.getByRole('button', { name: /출발/i });
    await user.click(출발Button);

    // 바텀싯이 열릴 때까지 대기
    await waitFor(() => {
      // 바텀싯의 텍스트가 나타나는지 확인
      const stationSearchText = screen.queryByText('정류장 검색');
      expect(stationSearchText).not.toBeNull();

      // 검색 입력 필드가 나타나는지 확인
      const searchInput = screen.queryByPlaceholderText('버스 정류장을 검색해주세요');
      expect(searchInput).not.toBeNull();
    });

    // 바텀싯 안의 정류장 선택
    // 정류장 리스트가 렌더링될 때까지 기다림
    const 메롱시티Text = await screen.findByText('메롱시티', {}, { timeout: 1000 });

    // 버튼을 찾아서 클릭
    const 메롱시티Button = 메롱시티Text.closest('button');
    expect(메롱시티Button).not.toBeNull();
    await user.click(메롱시티Button!);

    // 출발지 버튼이 업데이트될 때까지 기다림
    await waitFor(() => {
      const departureButtonAfterSelect = screen.getByRole('button', { name: /출발/i });
      expect(departureButtonAfterSelect.textContent).toContain('메롱시티');
    });
  });

  it('[테스트] 출발지와 도착지 스왑 버튼을 누르면 출발지와 도착지가 바뀐다.', async () => {
    const user = userEvent.setup();
    renderWith(<HomePage />, { route: '/' });

    // 스왑 전 상태 확인
    const departureButtonBeforeSwap = screen.getByRole('button', { name: /출발/i });
    const arrivalButtonBeforeSwap = screen.getByRole('button', { name: /도착/i });
    expect(departureButtonBeforeSwap.textContent).toContain('비키니시티');
    expect(arrivalButtonBeforeSwap.textContent).toContain('구-라군');

    // 스왑 버튼 찾기
    const swapButton = screen.getByTestId('swap-button');
    await user.click(swapButton);

    // 스왑 후 상태 확인
    await waitFor(() => {
      const departureButtonAfterSwap = screen.getByRole('button', { name: /출발/i });
      const arrivalButtonAfterSwap = screen.getByRole('button', { name: /도착/i });
      expect(departureButtonAfterSwap.textContent).toContain('구-라군');
      expect(arrivalButtonAfterSwap.textContent).toContain('비키니시티');
    });
  });

  // it('[테스트] 달력 아이콘을 클릭하면 DateTimePicker가 열린다', async () => {
  //   const user = userEvent.setup();
  //   renderWith(<HomePage />, { route: '/' });

  //   await waitFor(() => {
  //     expect(screen.getByText('DATE')).toBeInTheDocument();
  //   });

  //   // 달력 아이콘 찾기
  //   const calendarIcon = screen.getByTestId('calendar-outlined');
  //   expect(calendarIcon).toBeInTheDocument();

  //   // 달력 아이콘을 포함한 버튼 찾기
  //   const dateButton = calendarIcon.closest('button');
  //   expect(dateButton).toBeInTheDocument();

  //   await user.click(dateButton!);

  //   // DateTimePicker가 렌더링되는지 확인
  //   await waitFor(() => {
  //     expect(screen.getByText('오늘')).toBeInTheDocument();
  //     expect(screen.getByText('오전')).toBeInTheDocument();
  //     expect(screen.getByText('오후')).toBeInTheDocument();
  //   });
  // });

  // it('[테스트] DateTimePicker에서 날짜를 선택하면 선택한 날짜가 화면에 표시된다', async () => {
  //   const user = userEvent.setup();
  //   renderWith(<HomePage />, { route: '/' });

  //   await waitFor(() => {
  //     expect(screen.getByText('DATE')).toBeInTheDocument();
  //   });

  //   // 달력 아이콘 클릭
  //   await user.click(dateButton!);

  //   // DateTimePicker가 열려있는 동안 날짜가 표시되는지 확인
  //   const dateDisplayText = dateButton?.textContent;
  //   expect(dateDisplayText).toMatch(/\w+ \d+ \d{2}:\d{2} (AM|PM)/);
  // });
});
