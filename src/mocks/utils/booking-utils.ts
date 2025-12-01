import type { components } from '@/generated/api-types';

type Booking = components['schemas']['Booking'];

/**
 * 예약 목록 정렬
 *
 * 순수 함수로 원본을 변경하지 않고 새 배열 반환
 */
export function sortBookings(
  bookingsList: Booking[],
  sortBy: 'date_desc' | 'date_asc' | 'price_desc' | 'price_asc' = 'date_desc'
): Booking[] {
  const sorted = [...bookingsList];

  switch (sortBy) {
    case 'date_desc':
      return sorted.sort((a, b) => new Date(b.departureTime).getTime() - new Date(a.departureTime).getTime());
    case 'date_asc':
      return sorted.sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime());
    case 'price_desc':
      return sorted.sort((a, b) => b.pricing.finalTotal - a.pricing.finalTotal);
    case 'price_asc':
      return sorted.sort((a, b) => a.pricing.finalTotal - b.pricing.finalTotal);
    default:
      return sorted;
  }
}

/**
 * 예약 상태 필터링
 *
 * 순수 함수로 원본을 변경하지 않고 새 배열 반환
 */
export function filterBookingsByStatus(
  bookingsList: Booking[],
  status?: 'CONFIRMED' | 'CANCELLED'
): Booking[] {
  if (!status) {
    return bookingsList;
  }
  return bookingsList.filter(b => b.status === status);
}

/**
 * 편의 함수: 날짜 내림차순 정렬 (최신순)
 */
export const byDateDesc = (a: Booking, b: Booking) =>
  new Date(b.departureTime).getTime() - new Date(a.departureTime).getTime();

/**
 * 편의 함수: 날짜 오름차순 정렬 (오래된 순)
 */
export const byDateAsc = (a: Booking, b: Booking) =>
  new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();

/**
 * 편의 함수: 가격 내림차순 정렬 (비싼 순)
 */
export const byPriceDesc = (a: Booking, b: Booking) => b.pricing.finalTotal - a.pricing.finalTotal;

/**
 * 편의 함수: 가격 오름차순 정렬 (저렴한 순)
 */
export const byPriceAsc = (a: Booking, b: Booking) => a.pricing.finalTotal - b.pricing.finalTotal;

/**
 * 편의 함수: 상태 필터
 */
export const byStatus = (status: 'CONFIRMED' | 'CANCELLED') => (booking: Booking) =>
  booking.status === status;
