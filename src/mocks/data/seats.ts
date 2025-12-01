import type { components } from '@/generated/api-types';

type Seat = components['schemas']['Seat'];
type SeatLayout = components['schemas']['SeatLayout'];

/**
 * 좌석 배치 템플릿
 *
 * 모든 버스는 동일한 좌석 배치를 사용합니다:
 * - 6행 x 5열 = 총 30개 요소 (좌석 24개 + 통로 6개)
 * - 좌석 번호: 1A~6D
 * - 좌석 배치: A, B | 통로 | C, D
 */
const SEAT_ROWS = 6;
const SEAT_COLUMNS = 5;
const AISLE_COLUMN = 2; // 통로 위치 (고정)

/**
 * 좌석 번호 생성 (1A, 1B, 1C, 1D, ...)
 * 통로(column=2)는 좌석 번호 없음
 */
function generateSeatNumber(row: number, column: number): string | undefined {
  // 통로는 좌석 번호 없음
  if (column === AISLE_COLUMN) {
    return undefined;
  }

  // column을 좌석 문자로 매핑: 0→A, 1→B, 3→C, 4→D
  const columnMap: Record<number, string> = {
    0: 'A',
    1: 'B',
    3: 'C',
    4: 'D',
  };

  const columnLetter = columnMap[column];
  return `${row + 1}${columnLetter}`;
}

/**
 * 기본 좌석 배치 생성 (좌석 + 통로)
 */
function generateSeats(): Seat[] {
  const seats: Seat[] = [];

  for (let row = 0; row < SEAT_ROWS; row++) {
    for (let column = 0; column < SEAT_COLUMNS; column++) {
      if (column === AISLE_COLUMN) {
        // 통로 요소
        seats.push({
          type: 'AISLE',
          row,
          column,
        });
      } else {
        // 좌석 요소
        const seatNumber = generateSeatNumber(row, column);
        seats.push({
          type: 'SEAT',
          seatNumber: seatNumber!,
          row,
          column,
          status: 'AVAILABLE' as const,
        });
      }
    }
  }

  return seats;
}

/**
 * 특정 구간의 좌석 레이아웃 생성
 *
 * @param legId - 구간 ID
 * @param reservedSeats - 이미 예약된 좌석 번호 목록
 */
export function createSeatLayout(legId: string, reservedSeats: string[] = []): SeatLayout {
  const seats = generateSeats().map(seat => {
    // 통로는 예약 상태 없음
    if (seat.type === 'AISLE') {
      return seat;
    }

    // 좌석만 예약 상태 확인
    // API 응답에서는 AVAILABLE 또는 RESERVED만 반환 (SELECTED는 클라이언트 상태)
    const isReserved = reservedSeats.includes(seat.seatNumber!);
    return {
      ...seat,
      status: (isReserved ? 'RESERVED' : 'AVAILABLE') as 'AVAILABLE' | 'RESERVED',
    };
  });

  return {
    legId,
    rows: SEAT_ROWS,
    columns: SEAT_COLUMNS,
    seats,
  };
}

/**
 * 랜덤 좌석 예약 시뮬레이션
 *
 * 일부 좌석을 랜덤하게 예약 상태로 만들어 현실적인 상황 연출
 */
export function simulateRandomReservations(count: number = 5): string[] {
  const allSeats = generateSeats();
  // 좌석만 필터링 (통로 제외)
  const seatOnly = allSeats.filter(seat => seat.type === 'SEAT');
  const shuffled = [...seatOnly].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(seat => seat.seatNumber!);
}
