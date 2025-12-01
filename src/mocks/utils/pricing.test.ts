import { describe, expect, it } from 'vitest';
import type { components } from '@/generated/api-types';
import { LINE_UUIDS, lines } from '../data/lines';
import { getStationById, STATION_UUIDS } from '../data/stations';
import { calculateFinalBookingPrice, calculateItineraryPricing, calculateLegsWithTransferDiscount } from './pricing';

type Leg = components['schemas']['Leg'];

describe('요금 계산 (Pricing)', () => {
  const linesMap = new Map(lines.map(line => [line.lineId, line]));

  // 테스트용 Leg 생성 헬퍼
  const createTestLeg = (
    lineId: string,
    fromStationId: string,
    toStationId: string,
    baseFare: number,
    options?: {
      durationMinutes?: number;
    }
  ): Leg => ({
    legId: `test-leg-${lineId}`,
    lineId,
    lineName: lines.find(l => l.lineId === lineId)?.name || '',
    fromStation: getStationById(fromStationId)!,
    toStation: getStationById(toStationId)!,
    fromStationIndex: 0,
    toStationIndex: 1,
    durationMinutes: options?.durationMinutes ?? 10,
    stopsCount: 1,
    baseFare,
    transferNumber: 0,
    transferDiscount: 0,
    couponDiscount: 0,
    finalFare: baseFare,
  });

  describe('환승 할인 계산', () => {
    it('직행 (환승 없음): 할인 0', () => {
      const legs: Leg[] = [
        createTestLeg(LINE_UUIDS.CITY_LINE, STATION_UUIDS.BIKINI_CITY, STATION_UUIDS.BUBBLE_TOWN, 14),
      ];

      const result = calculateLegsWithTransferDiscount(legs, linesMap);

      expect(result).toHaveLength(1);
      expect(result[0].transferNumber).toBe(0);
      expect(result[0].transferDiscount).toBe(0);
    });

    it('1회 환승: 시티선 10% 할인', () => {
      const legs: Leg[] = [
        createTestLeg(LINE_UUIDS.CITY_LINE, STATION_UUIDS.BIKINI_CITY, STATION_UUIDS.BUBBLE_TOWN, 14),
        createTestLeg(LINE_UUIDS.SUBURBAN_LINE, STATION_UUIDS.BUBBLE_TOWN, STATION_UUIDS.TENTACLE_ACRES, 41),
      ];

      const result = calculateLegsWithTransferDiscount(legs, linesMap);

      expect(result).toHaveLength(2);

      // 첫 구간: 환승 없음
      expect(result[0].transferNumber).toBe(0);
      expect(result[0].transferDiscount).toBe(0);

      // 두 번째 구간: 1회 환승, 외곽선 15% 할인
      expect(result[1].transferNumber).toBe(1);
      expect(result[1].transferDiscount).toBeCloseTo(41 * 0.15, 2);
    });

    it('외곽선 1회 환승: 15% 할인', () => {
      const suburbanLine = lines.find(l => l.lineId === LINE_UUIDS.SUBURBAN_LINE)!;
      expect(suburbanLine.transferDiscount1st).toBe(0.15);

      const legs: Leg[] = [
        createTestLeg(LINE_UUIDS.CITY_LINE, STATION_UUIDS.BIKINI_CITY, STATION_UUIDS.BUBBLE_TOWN, 14),
        createTestLeg(LINE_UUIDS.SUBURBAN_LINE, STATION_UUIDS.BUBBLE_TOWN, STATION_UUIDS.TENTACLE_ACRES, 41),
      ];

      const result = calculateLegsWithTransferDiscount(legs, linesMap);

      // 외곽선 구간: 41₴ × 0.15 = 6.15₴ 할인
      expect(result[1].transferDiscount).toBeCloseTo(6.15, 2);
    });

    it('투어선 1회 환승: 15% 할인', () => {
      const tourLine = lines.find(l => l.lineId === LINE_UUIDS.TOUR_LINE)!;
      expect(tourLine.transferDiscount1st).toBe(0.15);

      const legs: Leg[] = [
        createTestLeg(LINE_UUIDS.CITY_LINE, STATION_UUIDS.BIKINI_CITY, STATION_UUIDS.GLOVE_WORLD, 18),
        createTestLeg(LINE_UUIDS.TOUR_LINE, STATION_UUIDS.GLOVE_WORLD, STATION_UUIDS.KELP_FOREST, 20),
      ];

      const result = calculateLegsWithTransferDiscount(legs, linesMap);

      // 투어선 구간: 20₴ × 0.15 = 3.0₴ 할인
      expect(result[1].transferDiscount).toBeCloseTo(3.0, 2);
    });
  });

  describe('경로 전체 요금 계산', () => {
    it('직행: subtotal = baseFare, 할인 없음', () => {
      const legs: Leg[] = [
        createTestLeg(LINE_UUIDS.CITY_LINE, STATION_UUIDS.BIKINI_CITY, STATION_UUIDS.BUBBLE_TOWN, 14),
      ];

      const legsWithDiscount = calculateLegsWithTransferDiscount(legs, linesMap);
      const pricing = calculateItineraryPricing(legsWithDiscount);

      expect(pricing.subtotal).toBe(14);
      expect(pricing.transferDiscount).toBe(0);
      expect(pricing.totalBeforeCoupon).toBe(14);
    });

    it('1회 환승: 환승 할인 적용', () => {
      const legs: Leg[] = [
        createTestLeg(LINE_UUIDS.CITY_LINE, STATION_UUIDS.BIKINI_CITY, STATION_UUIDS.BUBBLE_TOWN, 14),
        createTestLeg(LINE_UUIDS.SUBURBAN_LINE, STATION_UUIDS.BUBBLE_TOWN, STATION_UUIDS.TENTACLE_ACRES, 41),
      ];

      const legsWithDiscount = calculateLegsWithTransferDiscount(legs, linesMap);
      const pricing = calculateItineraryPricing(legsWithDiscount);

      expect(pricing.subtotal).toBe(55); // 14 + 41
      expect(pricing.transferDiscount).toBeCloseTo(6.15, 2); // 41 × 0.15
      expect(pricing.totalBeforeCoupon).toBeCloseTo(48.85, 2); // 55 - 6.15
    });
  });

  describe('쿠폰 할인 계산', () => {
    it('고정 금액 할인: PEARL_PASS (2₴ 할인)', () => {
      const legs: Leg[] = [
        createTestLeg(LINE_UUIDS.CITY_LINE, STATION_UUIDS.BIKINI_CITY, STATION_UUIDS.BUBBLE_TOWN, 14),
      ];

      const pricing = calculateFinalBookingPrice(legs, 'PEARL_PASS', new Date(), linesMap);

      // 2₴ 고정 할인
      expect(pricing.couponDiscount).toBe(2);
      expect(pricing.finalTotal).toBe(12); // 14 - 2
    });

    it('퍼센트 할인: GARY_NIGHT (15% 할인, 야간)', () => {
      const legs: Leg[] = [
        createTestLeg(LINE_UUIDS.CITY_LINE, STATION_UUIDS.BIKINI_CITY, STATION_UUIDS.BUBBLE_TOWN, 14),
      ];

      const nightTime = new Date('2024-01-01T22:00:00');
      const pricing = calculateFinalBookingPrice(legs, 'GARY_NIGHT', nightTime, linesMap);

      // 14₴ × 0.15 = 2.1₴ 할인
      expect(pricing.couponDiscount).toBeCloseTo(2.1, 2);
      expect(pricing.finalTotal).toBeCloseTo(11.9, 2); // 14 - 2.1
    });

    it('퍼센트 할인: GARY_NIGHT (새벽 시간에도 적용)', () => {
      const legs: Leg[] = [
        createTestLeg(LINE_UUIDS.CITY_LINE, STATION_UUIDS.BIKINI_CITY, STATION_UUIDS.BUBBLE_TOWN, 14),
      ];

      const earlyMorning = new Date('2024-01-01T03:00:00');
      const pricing = calculateFinalBookingPrice(legs, 'GARY_NIGHT', earlyMorning, linesMap);

      expect(pricing.couponDiscount).toBeCloseTo(2.1, 2);
      expect(pricing.finalTotal).toBeCloseTo(11.9, 2);
    });

    it('퍼센트 할인: GARY_NIGHT (주간에는 미적용)', () => {
      const legs: Leg[] = [
        createTestLeg(LINE_UUIDS.CITY_LINE, STATION_UUIDS.BIKINI_CITY, STATION_UUIDS.BUBBLE_TOWN, 14),
      ];

      const noonTime = new Date('2024-01-01T12:00:00');
      const pricing = calculateFinalBookingPrice(legs, 'GARY_NIGHT', noonTime, linesMap);

      expect(pricing.couponDiscount).toBe(0);
      expect(pricing.finalTotal).toBe(14);
    });

    it('쿠폰 없음: couponDiscount = 0', () => {
      const legs: Leg[] = [
        createTestLeg(LINE_UUIDS.CITY_LINE, STATION_UUIDS.BIKINI_CITY, STATION_UUIDS.BUBBLE_TOWN, 14),
      ];

      const pricing = calculateFinalBookingPrice(legs, undefined, new Date(), linesMap);

      expect(pricing.couponDiscount).toBe(0);
      expect(pricing.finalTotal).toBe(14);
    });

    it('잘못된 쿠폰 코드: couponDiscount = 0', () => {
      const legs: Leg[] = [
        createTestLeg(LINE_UUIDS.CITY_LINE, STATION_UUIDS.BIKINI_CITY, STATION_UUIDS.BUBBLE_TOWN, 14),
      ];

      const pricing = calculateFinalBookingPrice(legs, 'INVALID_COUPON', new Date(), linesMap);

      expect(pricing.couponDiscount).toBe(0);
      expect(pricing.finalTotal).toBe(14);
    });
  });

  describe('환승 할인 + 쿠폰 할인 복합', () => {
    it('1회 환승 + 고정 금액 쿠폰 (진주패스: 각 구간마다 할인)', () => {
      const legs: Leg[] = [
        createTestLeg(LINE_UUIDS.CITY_LINE, STATION_UUIDS.BIKINI_CITY, STATION_UUIDS.BUBBLE_TOWN, 14),
        createTestLeg(LINE_UUIDS.SUBURBAN_LINE, STATION_UUIDS.BUBBLE_TOWN, STATION_UUIDS.TENTACLE_ACRES, 41),
      ];

      const pricing = calculateFinalBookingPrice(legs, 'PEARL_PASS', new Date(), linesMap);

      // 1. 환승 할인: 41 × 0.15 = 6.15₴
      // 2. 환승 할인 적용 후: 55 - 6.15 = 48.85₴
      // 3. 쿠폰 할인: 2₴ × 2개 구간 = 4₴ (각 구간마다 적용)
      // 4. 최종 금액: 48.85 - 4 = 44.85₴

      expect(pricing.subtotal).toBe(55);
      expect(pricing.transferDiscount).toBeCloseTo(6.15, 2);
      expect(pricing.couponDiscount).toBe(4); // 2₴ × 2 = 4₴
      expect(pricing.totalDiscount).toBeCloseTo(10.15, 2); // 6.15 + 4
      expect(pricing.finalTotal).toBeCloseTo(44.85, 2);
    });
  });

  describe('달팽이패스 할인 우선순위', () => {
    it('각 구간별로 환승 할인보다 높은 비율만 추가 할인', () => {
      const legs: Leg[] = [
        createTestLeg(LINE_UUIDS.CITY_LINE, STATION_UUIDS.BIKINI_CITY, STATION_UUIDS.BUBBLE_TOWN, 10),
        createTestLeg(LINE_UUIDS.CITY_LINE, STATION_UUIDS.BUBBLE_TOWN, STATION_UUIDS.GLOVE_WORLD, 20),
      ];

      const nightTime = new Date('2024-01-01T22:00:00');
      const pricing = calculateFinalBookingPrice(legs, 'GARY_NIGHT', nightTime, linesMap);

      expect(pricing.transferDiscount).toBeCloseTo(2, 2); // 두 번째 구간 10% 할인
      expect(pricing.couponDiscount).toBeCloseTo(2.5, 2); // 첫 구간 15%, 두 번째 구간 (15%-10%) 차액
      expect(pricing.finalTotal).toBeCloseTo(25.5, 2);
    });

    it('환승 할인 비율이 더 크면 추가 할인 없음', () => {
      const legs: Leg[] = [
        createTestLeg(LINE_UUIDS.CITY_LINE, STATION_UUIDS.BIKINI_CITY, STATION_UUIDS.BUBBLE_TOWN, 10),
        createTestLeg(LINE_UUIDS.SUBURBAN_LINE, STATION_UUIDS.BUBBLE_TOWN, STATION_UUIDS.TENTACLE_ACRES, 40),
        createTestLeg(LINE_UUIDS.SUBURBAN_LINE, STATION_UUIDS.TENTACLE_ACRES, STATION_UUIDS.BIKINI_CITY, 40),
      ];

      const nightTime = new Date('2024-01-01T22:00:00');
      const pricing = calculateFinalBookingPrice(legs, 'GARY_NIGHT', nightTime, linesMap);

      // 두 번째 구간 15%, 세 번째 구간 25% 환승 할인 -> 추가 할인은 첫 구간만 적용
      expect(pricing.couponDiscount).toBeCloseTo(1.5, 2);
      expect(pricing.transferDiscount).toBeCloseTo(16, 2); // 0 + 6 + 10
      expect(pricing.finalTotal).toBeCloseTo(72.5, 2); // 90 - 16 - 1.5
    });
  });

  describe('달팽이패스 탑승 시각 조건', () => {
    it('주간에 탑승한 첫 구간은 제외하고 야간에 탑승한 이후 구간만 할인', () => {
      const legs: Leg[] = [
        createTestLeg(LINE_UUIDS.CITY_LINE, STATION_UUIDS.BIKINI_CITY, STATION_UUIDS.BUBBLE_TOWN, 10, {
          durationMinutes: 10,
        }),
        createTestLeg(LINE_UUIDS.CITY_LINE, STATION_UUIDS.BUBBLE_TOWN, STATION_UUIDS.GLOVE_WORLD, 20, {
          durationMinutes: 10,
        }),
      ];

      const departureTime = new Date('2024-01-01T20:55:00');
      const pricing = calculateFinalBookingPrice(legs, 'GARY_NIGHT', departureTime, linesMap);

      // 첫 구간: 20:55 출발 → 할인 제외
      // 두 번째 구간: 21:05 출발 → 환승 10% + 달팽이패스 추가 5%
      expect(pricing.couponDiscount).toBeCloseTo(1, 2);
      expect(pricing.transferDiscount).toBeCloseTo(2, 2);
      expect(pricing.finalTotal).toBeCloseTo(27, 2);
    });

    it('외곽선 → 시티선 야간 환승: 달팽이 15% > 환승 10%', () => {
      const legs: Leg[] = [
        // 외곽선 20:50 탑승 (주간, 할인 미적용)
        createTestLeg(LINE_UUIDS.SUBURBAN_LINE, STATION_UUIDS.BIKINI_CITY, STATION_UUIDS.BUBBLE_TOWN, 40, {
          durationMinutes: 25,
        }),
        // 시티선 21:15 환승 (야간, 환승 할인 10% vs 달팽이 15%)
        createTestLeg(LINE_UUIDS.CITY_LINE, STATION_UUIDS.BUBBLE_TOWN, STATION_UUIDS.GLOVE_WORLD, 20, {
          durationMinutes: 10,
        }),
      ];

      const departureTime = new Date('2024-01-01T20:50:00');
      const pricing = calculateFinalBookingPrice(legs, 'GARY_NIGHT', departureTime, linesMap);

      // 외곽선 구간 (20:50): 달팽이 할인 미적용
      // 시티선 구간 (21:15): 환승 10% (2₴) vs 달팽이 15% (3₴) → max = 15% 적용
      // 쿠폰 할인 = 20 × (0.15 - 0.10) = 1₴ (추가 5%)
      expect(pricing.transferDiscount).toBeCloseTo(2, 2); // 20 × 0.10
      expect(pricing.couponDiscount).toBeCloseTo(1, 2); // 20 × (0.15 - 0.10)
      expect(pricing.finalTotal).toBeCloseTo(57, 2); // 60 - 2 - 1
    });
  });

  describe('소수점 처리', () => {
    it('할인 금액 소수점 2자리 이내', () => {
      const legs: Leg[] = [
        createTestLeg(LINE_UUIDS.CITY_LINE, STATION_UUIDS.BIKINI_CITY, STATION_UUIDS.BUBBLE_TOWN, 14),
        createTestLeg(LINE_UUIDS.SUBURBAN_LINE, STATION_UUIDS.BUBBLE_TOWN, STATION_UUIDS.TENTACLE_ACRES, 41),
      ];

      const legsWithDiscount = calculateLegsWithTransferDiscount(legs, linesMap);
      const pricing = calculateItineraryPricing(legsWithDiscount);

      // 모든 금액이 소수점 2자리 이내
      expect(pricing.subtotal).toBeCloseTo(pricing.subtotal, 2);
      expect(pricing.transferDiscount).toBeCloseTo(pricing.transferDiscount, 2);
      expect(pricing.totalBeforeCoupon).toBeCloseTo(pricing.totalBeforeCoupon, 2);
    });
  });

  describe('통합 시나리오 테스트', () => {
    describe('뉴캘프시티 → 구-라군 이동', () => {
      it('시티선 3정거장 + 투어선 1정거장 환승: 총 24.75₴', () => {
        // 시티선: 뉴캘프시티 → 비키니시티 (3정거장)
        // 기본 10₴ + 추가 2₴(1정거장 초과) = 12₴
        const cityLeg = createTestLeg(LINE_UUIDS.CITY_LINE, STATION_UUIDS.NEW_KELP_CITY, STATION_UUIDS.BIKINI_CITY, 12);

        // 투어선: 비키니시티 → 구-라군 (1정거장, 환승)
        // 기본 15₴, 1회 환승 할인 15% 적용
        const tourLeg = createTestLeg(LINE_UUIDS.TOUR_LINE, STATION_UUIDS.BIKINI_CITY, STATION_UUIDS.GOO_LAGOON, 15);

        const legs: Leg[] = [cityLeg, tourLeg];
        const pricing = calculateFinalBookingPrice(legs, undefined, new Date(), linesMap);

        // 시티선 요금: 12₴
        expect(pricing.subtotal).toBe(27); // 12 + 15

        // 투어선 환승 할인: 15₴ × 15% = 2.25₴
        expect(pricing.transferDiscount).toBeCloseTo(2.25, 2);

        // 최종 합계: 12₴ + 12.75₴ = 24.75₴
        expect(pricing.finalTotal).toBeCloseTo(24.75, 2);
      });
    });

    describe('달팽이 패스 시나리오', () => {
      it('야간 시티선 3정거장 이동: 10.2₴ (15% 할인)', () => {
        // 시티선 3정거장: 기본 10₴ + 추가 2₴ = 12₴
        const legs: Leg[] = [
          createTestLeg(LINE_UUIDS.CITY_LINE, STATION_UUIDS.NEW_KELP_CITY, STATION_UUIDS.BIKINI_CITY, 12),
        ];

        // 야간 시간 (21:00~05:00) 설정
        const nightTime = new Date('2024-01-01T22:00:00');
        const pricing = calculateFinalBookingPrice(legs, 'GARY_NIGHT', nightTime, linesMap);

        // 달팽이 패스 15% 할인: 12₴ × 15% = 1.8₴
        expect(pricing.couponDiscount).toBeCloseTo(1.8, 2);

        // 최종 요금: 12₴ - 1.8₴ = 10.2₴
        expect(pricing.finalTotal).toBeCloseTo(10.2, 2);
      });

      it('주간 시티선 이동: 할인 미적용', () => {
        const legs: Leg[] = [
          createTestLeg(LINE_UUIDS.CITY_LINE, STATION_UUIDS.NEW_KELP_CITY, STATION_UUIDS.BIKINI_CITY, 12),
        ];

        // 주간 시간
        const dayTime = new Date('2024-01-01T14:00:00');
        const pricing = calculateFinalBookingPrice(legs, 'GARY_NIGHT', dayTime, linesMap);

        // 할인 미적용
        expect(pricing.couponDiscount).toBe(0);
        expect(pricing.finalTotal).toBe(12);
      });
    });

    describe('투어 패스 시나리오', () => {
      it('투어선 1정거장 이동: 10.5₴ (30% 할인)', () => {
        // 투어선 1정거장: 기본 15₴
        const legs: Leg[] = [
          createTestLeg(LINE_UUIDS.TOUR_LINE, STATION_UUIDS.BIKINI_CITY, STATION_UUIDS.GLOVE_WORLD, 15),
        ];

        const pricing = calculateFinalBookingPrice(legs, 'TOUR_FUN', new Date(), linesMap);

        // 투어 패스 30% 할인: 15₴ × 30% = 4.5₴
        expect(pricing.couponDiscount).toBeCloseTo(4.5, 2);

        // 최종 요금: 15₴ - 4.5₴ = 10.5₴
        expect(pricing.finalTotal).toBeCloseTo(10.5, 2);
      });

      it('투어선 외 노선 이용 시: 할인 미적용', () => {
        // 시티선 이용
        const legs: Leg[] = [
          createTestLeg(LINE_UUIDS.CITY_LINE, STATION_UUIDS.BIKINI_CITY, STATION_UUIDS.BUBBLE_TOWN, 12),
        ];

        const pricing = calculateFinalBookingPrice(legs, 'TOUR_FUN', new Date(), linesMap);

        // 투어선이 아니므로 할인 미적용
        expect(pricing.couponDiscount).toBe(0);
        expect(pricing.finalTotal).toBe(12);
      });

      it('시티선 + 투어선 환승: 투어선 구간만 할인', () => {
        // 시티선: 12₴
        const cityLeg = createTestLeg(LINE_UUIDS.CITY_LINE, STATION_UUIDS.BIKINI_CITY, STATION_UUIDS.BUBBLE_TOWN, 12);

        // 투어선: 15₴, 1회 환승 할인 15% (2.25₴)
        const tourLeg = createTestLeg(LINE_UUIDS.TOUR_LINE, STATION_UUIDS.BUBBLE_TOWN, STATION_UUIDS.GLOVE_WORLD, 15);

        const legs: Leg[] = [cityLeg, tourLeg];
        const pricing = calculateFinalBookingPrice(legs, 'TOUR_FUN', new Date(), linesMap);

        // subtotal: 12 + 15 = 27₴
        expect(pricing.subtotal).toBe(27);

        // 환승 할인: 15₴ × 15% = 2.25₴
        expect(pricing.transferDiscount).toBeCloseTo(2.25, 2);

        // 투어선 finalFare: 15 - 2.25 = 12.75₴
        // 투어 패스 30% 할인: 12.75₴ × 30% = 3.825₴
        expect(pricing.couponDiscount).toBeCloseTo(3.825, 2);

        // 최종: 27 - 2.25 - 3.825 = 20.925₴
        expect(pricing.finalTotal).toBeCloseTo(20.925, 2);
      });
    });

    describe('추가 엣지 케이스 테스트', () => {
      describe('CASE 1: 기본 요금 및 추가 요금 계산', () => {
        it('시티선 3정거장 이동: 12₴ (기본 10₴ + 추가 2₴)', () => {
          // 3정거장 = 기본요금(2정거장) + 추가 1정거장
          const legs: Leg[] = [
            createTestLeg(LINE_UUIDS.CITY_LINE, STATION_UUIDS.BIKINI_CITY, STATION_UUIDS.BUBBLE_TOWN, 12),
          ];

          const pricing = calculateFinalBookingPrice(legs, undefined, new Date(), linesMap);

          expect(pricing.finalTotal).toBe(12);
          expect(pricing.subtotal).toBe(12);
          expect(pricing.transferDiscount).toBe(0);
          expect(pricing.couponDiscount).toBe(0);
        });

        it('시티선 2정거장 이동: 10₴ (기본 요금만)', () => {
          // 2정거장까지는 기본요금만
          const legs: Leg[] = [
            createTestLeg(LINE_UUIDS.CITY_LINE, STATION_UUIDS.BIKINI_CITY, STATION_UUIDS.FLOATERS_CEMETERY, 10),
          ];

          const pricing = calculateFinalBookingPrice(legs, undefined, new Date(), linesMap);

          expect(pricing.finalTotal).toBe(10);
        });

        it('투어선 4정거장 이동: 25₴ (기본 15₴ + 추가 10₴)', () => {
          // 4정거장 = 기본요금(2정거장) + 추가 2정거장 × 5₴
          const legs: Leg[] = [
            createTestLeg(LINE_UUIDS.TOUR_LINE, STATION_UUIDS.BIKINI_CITY, STATION_UUIDS.JELLYFISH_FIELDS, 25),
          ];

          const pricing = calculateFinalBookingPrice(legs, undefined, new Date(), linesMap);

          expect(pricing.finalTotal).toBe(25);
        });
      });

      describe('CASE 2: 환승 할인 적용', () => {
        it('시티선 → 투어선 각 1정거장 환승: 22.75₴', () => {
          // 시티선 1정거장: 10₴
          const cityLeg = createTestLeg(LINE_UUIDS.CITY_LINE, STATION_UUIDS.BUBBLE_TOWN, STATION_UUIDS.BIKINI_CITY, 10);

          // 투어선 1정거장: 15₴, 1회 환승 할인 15%
          const tourLeg = createTestLeg(LINE_UUIDS.TOUR_LINE, STATION_UUIDS.BIKINI_CITY, STATION_UUIDS.GLOVE_WORLD, 15);

          const legs: Leg[] = [cityLeg, tourLeg];
          const pricing = calculateFinalBookingPrice(legs, undefined, new Date(), linesMap);

          // 총 기본 요금: 10 + 15 = 25₴
          expect(pricing.subtotal).toBe(25);

          // 환승 할인: 15₴ × 15% = 2.25₴
          expect(pricing.transferDiscount).toBeCloseTo(2.25, 2);

          // 최종: 25 - 2.25 = 22.75₴
          expect(pricing.finalTotal).toBeCloseTo(22.75, 2);
        });

        it('외곽선 → 시티선 환승: 외곽선 기본 25₴ + 시티선 할인 후 9₴', () => {
          // 외곽선 1정거장: 25₴
          const suburbanLeg = createTestLeg(
            LINE_UUIDS.SUBURBAN_LINE,
            STATION_UUIDS.BIKINI_CITY,
            STATION_UUIDS.ROCK_BOTTOM,
            25
          );

          // 시티선 1정거장: 10₴, 1회 환승 할인 10%
          const cityLeg = createTestLeg(LINE_UUIDS.CITY_LINE, STATION_UUIDS.BIKINI_CITY, STATION_UUIDS.BUBBLE_TOWN, 10);

          const legs: Leg[] = [suburbanLeg, cityLeg];
          const pricing = calculateFinalBookingPrice(legs, undefined, new Date(), linesMap);

          // 총 기본 요금: 25 + 10 = 35₴
          expect(pricing.subtotal).toBe(35);

          // 환승 할인: 10₴ × 10% = 1₴
          expect(pricing.transferDiscount).toBeCloseTo(1, 2);

          // 최종: 35 - 1 = 34₴
          expect(pricing.finalTotal).toBeCloseTo(34, 2);
        });
      });

      describe('CASE 4: 쿠폰 우선순위 (진주 패스 vs 달팽이 패스)', () => {
        it('짧은 거리 야간: 진주 패스가 더 유리 (8₴ < 8.5₴)', () => {
          // 시티선 1정거장: 10₴
          const legs: Leg[] = [
            createTestLeg(LINE_UUIDS.CITY_LINE, STATION_UUIDS.BIKINI_CITY, STATION_UUIDS.FLOATERS_CEMETERY, 10),
          ];

          const nightTime = new Date('2024-01-01T22:00:00');

          // 진주 패스 적용
          const pricingPearl = calculateFinalBookingPrice(legs, 'PEARL_PASS', nightTime, linesMap);
          expect(pricingPearl.finalTotal).toBe(8); // 10 - 2 = 8₴

          // 달팽이 패스 적용
          const pricingGary = calculateFinalBookingPrice(legs, 'GARY_NIGHT', nightTime, linesMap);
          expect(pricingGary.finalTotal).toBeCloseTo(8.5, 2); // 10 × 0.85 = 8.5₴

          // 진주 패스가 더 유리
          expect(pricingPearl.finalTotal).toBeLessThan(pricingGary.finalTotal);
        });

        it('장거리 야간: 달팽이 패스가 더 유리', () => {
          // 외곽선 3정거장: 25 + 8 = 33₴
          const legs: Leg[] = [
            createTestLeg(LINE_UUIDS.SUBURBAN_LINE, STATION_UUIDS.BIKINI_CITY, STATION_UUIDS.BIKINI_ATOLL, 33),
          ];

          const nightTime = new Date('2024-01-01T22:00:00');

          // 진주 패스 적용
          const pricingPearl = calculateFinalBookingPrice(legs, 'PEARL_PASS', nightTime, linesMap);
          expect(pricingPearl.finalTotal).toBe(31); // 33 - 2 = 31₴

          // 달팽이 패스 적용
          const pricingGary = calculateFinalBookingPrice(legs, 'GARY_NIGHT', nightTime, linesMap);
          expect(pricingGary.finalTotal).toBeCloseTo(28.05, 2); // 33 × 0.85 = 28.05₴

          // 달팽이 패스가 더 유리
          expect(pricingGary.finalTotal).toBeLessThan(pricingPearl.finalTotal);
        });
      });

      describe('CASE 5: 투어 패스 적용 및 예외', () => {
        it('투어선 + 외곽선 환승: 투어 패스는 투어선에만 적용', () => {
          // 투어선 2정거장: 15₴ (기본요금 범위)
          const tourLeg = createTestLeg(LINE_UUIDS.TOUR_LINE, STATION_UUIDS.BIKINI_CITY, STATION_UUIDS.KELP_FOREST, 15);

          // 외곽선 1정거장: 25₴, 1회 환승 할인 15%
          const suburbanLeg = createTestLeg(
            LINE_UUIDS.SUBURBAN_LINE,
            STATION_UUIDS.BIKINI_CITY,
            STATION_UUIDS.ROCK_BOTTOM,
            25
          );

          const legs: Leg[] = [tourLeg, suburbanLeg];
          const pricing = calculateFinalBookingPrice(legs, 'TOUR_FUN', new Date(), linesMap);

          // 총 기본 요금: 15 + 25 = 40₴
          expect(pricing.subtotal).toBe(40);

          // 환승 할인: 25₴ × 15% = 3.75₴
          expect(pricing.transferDiscount).toBeCloseTo(3.75, 2);

          // 투어선 finalFare: 15₴
          // 외곽선 finalFare: 25 - 3.75 = 21.25₴
          // 투어 패스는 투어선 15₴에만 30% 할인: 15 × 0.3 = 4.5₴
          expect(pricing.couponDiscount).toBeCloseTo(4.5, 2);

          // 최종: 40 - 3.75 - 4.5 = 31.75₴
          expect(pricing.finalTotal).toBeCloseTo(31.75, 2);
        });

        it('투어선 단독 이용: 투어 패스 30% 할인', () => {
          // 투어선 2정거장: 15₴
          const legs: Leg[] = [
            createTestLeg(LINE_UUIDS.TOUR_LINE, STATION_UUIDS.BIKINI_CITY, STATION_UUIDS.KELP_FOREST, 15),
          ];

          const pricing = calculateFinalBookingPrice(legs, 'TOUR_FUN', new Date(), linesMap);

          // 투어 패스 30% 할인: 15 × 0.3 = 4.5₴
          expect(pricing.couponDiscount).toBeCloseTo(4.5, 2);

          // 최종: 15 - 4.5 = 10.5₴
          expect(pricing.finalTotal).toBeCloseTo(10.5, 2);
        });
      });

      describe('복잡한 시나리오: 다중 환승 + 쿠폰', () => {
        it('2회 환승 + 진주 패스: 각 구간별 할인 정확성', () => {
          // 시티선 1정거장: 10₴
          const leg1 = createTestLeg(LINE_UUIDS.CITY_LINE, STATION_UUIDS.BIKINI_CITY, STATION_UUIDS.BUBBLE_TOWN, 10);

          // 외곽선 1정거장: 25₴, 1회 환승 할인 15%
          const leg2 = createTestLeg(
            LINE_UUIDS.SUBURBAN_LINE,
            STATION_UUIDS.BUBBLE_TOWN,
            STATION_UUIDS.BIKINI_ATOLL,
            25
          );

          // 시티선 1정거장: 10₴, 2회 환승 할인 20%
          const leg3 = createTestLeg(LINE_UUIDS.CITY_LINE, STATION_UUIDS.BIKINI_CITY, STATION_UUIDS.BUBBLE_TOWN, 10);

          const legs: Leg[] = [leg1, leg2, leg3];
          const pricing = calculateFinalBookingPrice(legs, 'PEARL_PASS', new Date(), linesMap);

          // 총 기본 요금: 10 + 25 + 10 = 45₴
          expect(pricing.subtotal).toBe(45);

          // 환승 할인:
          // - 2번째 구간(외곽선): 25 × 15% = 3.75₴
          // - 3번째 구간(시티선): 10 × 20% = 2₴
          // - 총: 5.75₴
          expect(pricing.transferDiscount).toBeCloseTo(5.75, 2);

          // 진주 패스: 3개 구간 × 2₴ = 6₴
          expect(pricing.couponDiscount).toBe(6);

          // 최종: 45 - 5.75 - 6 = 33.25₴
          expect(pricing.finalTotal).toBeCloseTo(33.25, 2);
        });
      });
    });
  });
});
