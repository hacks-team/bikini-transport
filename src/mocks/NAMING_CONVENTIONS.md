# Mocks 네이밍 규칙

## 원칙: Pattern 5 - Predictable Interface

> 함수명, Props, 타입명만 보고도 내부 동작을 100% 예측할 수 있어야 한다.

## 1. 표준 관례 (Standard Convention)

### REST API 표준 CRUD 패턴

```typescript
// 📋 목록 조회
GET /resources → getResources()
// 예: getCoupons(), getBookings(), getStations()

// 📄 단건 조회
GET /resources/:id → getResourceById(id)
// 예: getBookingById(id), getItineraryById(id)
// 특수: getCouponTypeById(id) - 반환값이 타입이므로 명시

// ➕ 생성
POST /resources → createResource(data) 또는 saveResource(data)
// 예: saveBooking(data), saveCoupon(data)

// ✏️ 수정
PUT /resources/:id → updateResource(id, data)
PATCH /resources/:id → patchResource(id, data)

// ❌ 삭제
DELETE /resources/:id → deleteResource(id)
// 예: deleteCoupon(id)
```

### 특수 동작 (Special Actions)

```typescript
// 리소스에 대한 특수 동작: 동사 + 명사
applyResource(id)      // 적용
reserveResource(id)    // 예약
searchResources(query) // 검색
calculateResource(id)  // 계산
```

## 2. 일반성 (Generality)

### ❌ 도메인 특화된 이름 (피해야 함)

```typescript
// Bad: 특정 컨텍스트에 종속
getMyCoupons()        // "My"는 사용자 관점
getRealCouponCode()   // "Real"은 내부 구현 노출
createUserBooking()   // "User"는 불필요한 명시
randomPopupHandler    // "Popup"은 UI 용어
runtimeReservedSeats  // "runtime"은 구현 세부사항
```

### ✅ 본질적인 역할 기반 (권장)

```typescript
// Good: 일반적이고 재사용 가능
getCoupons()          // 쿠폰 목록 조회
getCouponTypeById(id) // UUID로 쿠폰 타입 조회 (반환값이 타입이므로 명시)
saveBooking(data)     // 예약 저장
```

## 3. 일관된 반환 타입

### 단순 성공/실패

```typescript
// Boolean 반환 (간단한 작업)
function reserveSeat(legId: string, seatNumber: string): boolean

// 실패 시 false, 성공 시 true
```

### 상세한 결과

```typescript
// Result 객체 반환 (복잡한 작업)
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string }

function addCouponToUser(couponId: string): Result<UserCoupon>
```

### ⚠️ 혼용 금지

```typescript
// ❌ Bad: 단수/복수만 다른데 반환 타입이 다름
reserveSeat(): boolean
reserveSeats(): { success: boolean; error?: string }

// ✅ Good: 일관된 패턴
reserveSeat(): boolean
reserveSeats(): boolean  // 또는 둘 다 Result<void>
```

## 4. 파일 구조 및 명명

### Handler 파일

```typescript
// 복수형 리소스명
handlers/
  ├── coupons.ts       // ✅ 복수형
  ├── bookings.ts      // ✅ 복수형
  ├── stations.ts      // ✅ 복수형
  └── itineraries.ts   // ✅ 복수형
```

### Export 명명

```typescript
// {리소스}Handlers 패턴
export const couponHandlers = [...]
export const bookingHandlers = [...]
export const stationHandlers = [...]
```

### Handler 함수 명명

```typescript
// {동작}{리소스}Handler 패턴
const getMyCouponsHandler = http.get('/api/coupons/my', ...)  // 경로와 일치
const createBookingHandler = http.post('/api/bookings', ...)
const searchItinerariesHandler = http.get('/api/itineraries/search', ...)  // 복수형 사용
```

## 5. Storage 함수 분류

### CRUD 기본 함수

```typescript
// Create/Save
saveCoupon(uuid, code, expiresAt): void
saveBooking(data): Booking
saveItineraries(itineraries): void

// Read
getCoupons(): UserCoupon[]
getCouponTypeById(couponId): string | undefined  // 반환값이 타입이므로 명시
getBookings(): Booking[]
getBookingById(id): Booking | undefined
getItineraryById(id): Itinerary | undefined

// Update (없음 - 현재 프로젝트에서 미사용)

// Delete
applyCoupon(id): boolean  // 쿠폰 사용 = 삭제
```

### 비즈니스 로직 함수

```typescript
// 특수 동작
addCouponToUser(couponId): Result<UserCoupon>
reserveSeat(legId, seatNumber): boolean
reserveSeats(selections): { success: boolean; error?: string }
getReservedSeats(legId): string[]
```

### 초기화 함수

```typescript
initializeCoupons(): void
initializeStorage(): void
```

## 6. React Hook 충돌 회피

### ⚠️ 주의사항

React에서 `use`로 시작하는 함수는 Hook으로 인식됩니다.

```typescript
// ❌ Bad: React Hook으로 인식됨
function useCoupon(id: string): boolean

// ✅ Good: 다른 동사 사용
function applyCoupon(id: string): boolean
function consumeCoupon(id: string): boolean
function redeemCoupon(id: string): boolean
```

## 7. OpenAPI operationId 규칙

### 일관성 유지

```yaml
# operationId는 handler 함수명과 동일하게
paths:
  /coupons:
    get:
      operationId: getCoupons  # ✅ 일반적
      # NOT: getMyCoupons (도메인 특화)

  /coupons/claim:
    post:
      operationId: claimCoupon  # ⚠️ 특수 동작 (허용)
      # OR: addCouponToUser (더 명확)

  /bookings:
    post:
      operationId: createBooking  # ✅ 표준
```

## 8. Utils 함수 (순수 함수)

### 파일명

```typescript
utils/
  ├── booking-utils.ts   // ✅ 리소스-utils 패턴
  ├── pricing.ts         // ✅ 단일 책임
  └── pathfinding.ts     // ✅ 단일 책임
```

### 함수 명명

```typescript
// 순수 함수: 명확한 동사 + 목적어
export function sortBookings(list, sortBy): Booking[]
export function filterBookingsByStatus(list, status): Booking[]
export function calculateFinalBookingPrice(...): PricingResult

// 편의 함수: by + 기준
export const byDateDesc = (a, b) => ...
export const byPriceAsc = (a, b) => ...
export const byStatus = (status) => (booking) => ...
```

## 9. 마이그레이션 체크리스트

### Before → After

#### Storage Functions
- [x] `getMyCoupons()` → `getCoupons()`
- [x] `getRealCouponCode(uuid)` → `getCouponTypeById(couponId)`
- [x] `storeCouponInstance()` → `saveCoupon()`
- [x] `claimCoupon()` → `addCouponToUser()`
- [x] `useCoupon()` → `applyCoupon()`
- [x] `createBooking()` → `saveBooking()`
- [x] `getAllBookings()` → `getBookings()`
- [x] `sortBookings()` → moved to `utils/booking-utils.ts`
- [x] `filterBookingsByStatus()` → moved to `utils/booking-utils.ts`
- [x] `realCouponCode` (필드명) → `couponType` (구현 세부사항 제거)
- [x] `runtimeReservedSeats` → `simulatedReservedSeats` (구현 세부사항 제거)
- [x] `getOrCreateRuntimeReservations()` → `getOrCreateSimulatedReservations()` (구현 세부사항 제거)

#### Handler Functions
- [x] `randomPopupHandler` → `randomCouponHandler` (UI 용어 제거)
- [x] Import 경로 업데이트
- [x] 함수 호출 업데이트
- [x] TypeScript 컴파일 검증

## 10. 요약

### 핵심 원칙

1. **표준 관례**: HTTP 메서드 + 리소스명 패턴
2. **일반성**: 도메인 특화보다 본질적 역할
3. **일관성**: 동일한 패턴을 모든 리소스에 적용
4. **예측 가능성**: 함수명만 보고도 동작 이해 가능
5. **React 호환성**: `use` 접두사 회피

### 좋은 네이밍의 예

```typescript
// ✅ 예측 가능하고 일관적
getCoupons()              // 복수 → 배열 반환
getCouponTypeById(id)     // 반환값이 타입이므로 명시 (couponType 반환)
saveBooking(data)         // save → 생성 후 객체 반환
applyCoupon(id)           // apply → boolean (성공/실패)
reserveSeats(selections)  // 복수 → 여러 개 처리
getMyCouponsHandler       // 경로(/coupons/my)와 일치하는 핸들러명
searchItinerariesHandler  // 복수형 리소스명 사용
```

### 나쁜 네이밍의 예

```typescript
// ❌ 예측 불가능하고 비일관적
getMyCoupons()            // "My"는 누구? 컨텍스트 의존적
getRealCouponCode()       // "Real"이 뭐? 구현 세부사항 노출
useCoupon()               // React Hook으로 오인
createUserBooking()       // "User"는 불필요
storeCouponInstance()     // store vs save 혼용
randomPopupHandler        // "Popup"은 UI 용어, API 핸들러에 부적절
runtimeReservedSeats      // "runtime"은 구현 세부사항 노출
realCouponCode            // "real"은 구현 세부사항 노출
```
