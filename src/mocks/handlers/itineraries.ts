import { delay, HttpResponse, http } from 'msw';
import { lines } from '../data/lines';
import { getCouponTypeById, getItineraryById } from '../storage';
import { searchItineraries } from '../utils/pathfinding';
import { calculateFinalBookingPrice } from '../utils/pricing';

/**
 * GET /api/itineraries/search
 * 경로 검색
 */
const searchItinerariesHandler = http.get('/api/itineraries/search', async ({ request }: { request: Request }) => {
  await delay(300); // 경로 검색은 좀 더 시간이 걸림

  const url = new URL(request.url);
  const fromStationId = url.searchParams.get('fromStationId') || '';
  const toStationId = url.searchParams.get('toStationId') || '';
  const departureTimeParam = url.searchParams.get('departureTime') || '';

  if (!fromStationId || !toStationId) {
    return HttpResponse.json(
      {
        error: 'INVALID_REQUEST',
        message: '출발지와 도착지를 입력해주세요',
      },
      { status: 400 }
    );
  }

  if (!departureTimeParam) {
    return HttpResponse.json(
      {
        error: 'INVALID_REQUEST',
        message: '출발 시간을 입력해주세요',
      },
      { status: 400 }
    );
  }

  if (fromStationId === toStationId) {
    return HttpResponse.json(
      {
        error: 'SAME_STATION',
        message: '출발지와 도착지가 동일합니다',
      },
      { status: 400 }
    );
  }

  const parsedDepartureTime = new Date(departureTimeParam);
  if (Number.isNaN(parsedDepartureTime.getTime())) {
    return HttpResponse.json(
      {
        error: 'INVALID_REQUEST',
        message: '출발 시간 형식이 올바르지 않습니다',
      },
      { status: 400 }
    );
  }

  // 경로 검색 (내부적으로 storage에 저장됨)
  const recommendations = searchItineraries(fromStationId, toStationId, parsedDepartureTime);

  // 추천 경로를 객체 형식으로 반환
  return HttpResponse.json(recommendations);
});

/**
 * POST /api/itineraries/:itineraryId/calculate-fare
 * 요금 계산 (결제 전 미리보기)
 */
const calculateFareHandler = http.post<
  { itineraryId: string },
  { couponCode?: string | null; departureTime?: string }
>(
  '/api/itineraries/:itineraryId/calculate-fare',
  async ({ request, params }) => {
    await delay(200);

    const itineraryId = params.itineraryId as string | undefined;
    if (!itineraryId) {
      return HttpResponse.json(
        {
          error: 'INVALID_REQUEST',
          message: 'itineraryId가 필요합니다',
        },
        { status: 400 }
      );
    }

    const storedItinerary = getItineraryById(itineraryId);
    if (!storedItinerary) {
      return HttpResponse.json(
        {
          error: 'ITINERARY_NOT_FOUND',
          message: '저장된 경로를 찾을 수 없습니다',
        },
        { status: 404 }
      );
    }

    let couponType: string | undefined;
    let couponUuid: string | undefined;
    let departureTime: Date = new Date();
    try {
      const body = (await request.json()) as { couponCode?: string | null; departureTime?: string };
      couponUuid = body?.couponCode || undefined;

      // UUID로 쿠폰 타입 조회 (소유한 쿠폰)
      if (couponUuid) {
        couponType = getCouponTypeById(couponUuid);
        // 소유하지 않은 쿠폰이면 할인 적용 안함
      }

      // 출발 시각 파싱 (달팽이패스 등 시간 조건 쿠폰 계산용)
      if (body?.departureTime) {
        const parsedTime = new Date(body.departureTime);
        if (!Number.isNaN(parsedTime.getTime())) {
          departureTime = parsedTime;
        }
      }
    } catch {
      couponType = undefined;
      couponUuid = undefined;
    }

    // 쿠폰 적용 요금 계산 (departureTime 사용)
    const linesMap = new Map(lines.map(line => [line.lineId, line]));
    const pricing = calculateFinalBookingPrice(storedItinerary.legs, couponType || undefined, departureTime, linesMap);

    const routeFare = pricing.subtotal - pricing.transferDiscount;

    return HttpResponse.json({
      itineraryId: storedItinerary.itineraryId,
      baseFare: pricing.subtotal,
      transferDiscount: pricing.transferDiscount,
      routeFare,
      couponDiscount: pricing.couponDiscount,
      finalTotal: pricing.finalTotal,
      appliedCouponCode: couponUuid || null, // UUID 반환 (프론트엔드에서 선택한 쿠폰과 매칭 가능)
    });
  }
);

/**
 * GET /api/itineraries/:itineraryId
 * itineraryId로 여정 조회
 */
const getItineraryByIdHandler = http.get<{ itineraryId: string }>(
  '/api/itineraries/:itineraryId',
  async ({ params }) => {
    await delay(100);

    const itineraryId = params.itineraryId as string | undefined;
    if (!itineraryId) {
      return HttpResponse.json(
        {
          error: 'INVALID_REQUEST',
          message: 'itineraryId가 필요합니다',
        },
        { status: 400 }
      );
    }

    const itinerary = getItineraryById(itineraryId);
    if (!itinerary) {
      return HttpResponse.json(
        {
          error: 'ITINERARY_NOT_FOUND',
          message: '여정을 찾을 수 없습니다',
        },
        { status: 404 }
      );
    }

    return HttpResponse.json(itinerary);
  }
);

export const itineraryHandlers = [searchItinerariesHandler, calculateFareHandler, getItineraryByIdHandler];
