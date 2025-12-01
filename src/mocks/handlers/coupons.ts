import { delay, HttpResponse, http } from 'msw';
import { getRandomCoupon } from '../data/coupons';
import { addCouponToUser, getCoupons, saveCoupon } from '../storage';

/**
 * GET /api/coupons/random
 * 랜덤 쿠폰 조회 (UUID 생성)
 */
const randomCouponHandler = http.get('/api/coupons/random', async () => {
  await delay(50);

  const result = getRandomCoupon();

  if (!result) {
    return HttpResponse.json({
      coupon: null,
    });
  }

  // 쿠폰 인스턴스 저장 (1분 TTL)
  saveCoupon(result.uuid, result.coupon.couponCode, result.expiresAt);

  // couponCode를 UUID로 변경하여 반환
  return HttpResponse.json({
    coupon: {
      ...result.coupon,
      couponCode: result.uuid, // UUID를 couponCode로 반환
    },
  });
});

/**
 * POST /api/coupons/claim
 * 쿠폰 받기
 */
const claimCouponHandler = http.post('/api/coupons/claim', async ({ request }) => {
  await delay(100);

  const body = (await request.json()) as {
    couponCode: string;
  };

  const { couponCode } = body;

  const result = addCouponToUser(couponCode);

  if (!result.success) {
    let message = '쿠폰을 받을 수 없습니다';
    if (result.error === 'MAX_COUPON_EXCEEDED') {
      message = '이미 최대 개수를 보유 중입니다';
    } else if (result.error === 'COUPON_NOT_FOUND') {
      message = '존재하지 않는 쿠폰입니다';
    }

    return HttpResponse.json(
      {
        error: result.error,
        message,
      },
      { status: 400 }
    );
  }

  return HttpResponse.json({
    coupon: result.coupon,
  });
});

/**
 * GET /api/coupons/my
 * 보유 쿠폰 목록 조회
 */
const getMyCouponsHandler = http.get('/api/coupons/my', async () => {
  await delay(100);

  const coupons = getCoupons();

  return HttpResponse.json({
    coupons,
  });
});

export const couponHandlers = [randomCouponHandler, claimCouponHandler, getMyCouponsHandler];
