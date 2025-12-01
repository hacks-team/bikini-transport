import { describe, expect, it } from 'vitest';
import { getStationById, getStationsByIds, STATION_UUIDS, stations } from './stations';

describe('역(정류장) 데이터 (Stations)', () => {
  describe('전체 역 개수', () => {
    it('11개 역이 존재해야 함', () => {
      expect(stations).toHaveLength(11);
    });
  });

  describe('세계관 한글명 검증', () => {
    it('비키니 시티 (Bikini Bottom)', () => {
      const station = getStationById(STATION_UUIDS.BIKINI_CITY);
      expect(station).toBeDefined();
      expect(station!.name).toBe('비키니 시티');
    });

    it('구-라군 (Goo Lagoon)', () => {
      const station = getStationById(STATION_UUIDS.GOO_LAGOON);
      expect(station).toBeDefined();
      expect(station!.name).toBe('구-라군');
    });

    it('징징빌라 (Tentacle Acres)', () => {
      const station = getStationById(STATION_UUIDS.TENTACLE_ACRES);
      expect(station).toBeDefined();
      expect(station!.name).toBe('징징빌라');
    });

    it('뉴 켈프 시티 (New Kelp City)', () => {
      const station = getStationById(STATION_UUIDS.NEW_KELP_CITY);
      expect(station).toBeDefined();
      expect(station!.name).toBe('뉴 켈프 시티');
    });

    it('버블타운 (Bubble Town)', () => {
      const station = getStationById(STATION_UUIDS.BUBBLE_TOWN);
      expect(station).toBeDefined();
      expect(station!.name).toBe('버블타운');
    });

    it('글러브월드 (Glove World)', () => {
      const station = getStationById(STATION_UUIDS.GLOVE_WORLD);
      expect(station).toBeDefined();
      expect(station!.name).toBe('글러브월드');
    });

    it('메롱시티 (Rock Bottom)', () => {
      const station = getStationById(STATION_UUIDS.ROCK_BOTTOM);
      expect(station).toBeDefined();
      expect(station!.name).toBe('메롱시티');
    });

    it("플로터스 묘지 (Floater's Cemetery)", () => {
      const station = getStationById(STATION_UUIDS.FLOATERS_CEMETERY);
      expect(station).toBeDefined();
      expect(station!.name).toBe('플로터스 묘지');
    });

    it('켈프 숲 (Kelp Forest) - 세계관 통일', () => {
      const station = getStationById(STATION_UUIDS.KELP_FOREST);
      expect(station).toBeDefined();
      expect(station!.name).toBe('켈프 숲');
      // 이전 "다시마숲"에서 "켈프 숲"으로 변경됨
    });

    it('해파리 초원 (Jellyfish Fields)', () => {
      const station = getStationById(STATION_UUIDS.JELLYFISH_FIELDS);
      expect(station).toBeDefined();
      expect(station!.name).toBe('해파리 초원');
    });

    it('비키니 환초 (Bikini Atoll)', () => {
      const station = getStationById(STATION_UUIDS.BIKINI_ATOLL);
      expect(station).toBeDefined();
      expect(station!.name).toBe('비키니 환초');
    });
  });

  describe('getStationById', () => {
    it('존재하는 역 조회', () => {
      const station = getStationById(STATION_UUIDS.BIKINI_CITY);
      expect(station).toBeDefined();
      expect(station!.stationId).toBe(STATION_UUIDS.BIKINI_CITY);
      expect(station!.name).toBe('비키니 시티');
    });

    it('존재하지 않는 역 조회 시 undefined 반환', () => {
      const station = getStationById('invalid-station-id');
      expect(station).toBeUndefined();
    });
  });

  describe('getStationsByIds', () => {
    it('여러 역 ID로 역 목록 조회', () => {
      const stationIds = [STATION_UUIDS.BIKINI_CITY, STATION_UUIDS.GLOVE_WORLD, STATION_UUIDS.KELP_FOREST];
      const result = getStationsByIds(stationIds);

      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('비키니 시티');
      expect(result[1].name).toBe('글러브월드');
      expect(result[2].name).toBe('켈프 숲');
    });

    it('존재하지 않는 ID는 필터링됨', () => {
      const stationIds = [STATION_UUIDS.BIKINI_CITY, 'invalid-id', STATION_UUIDS.GOO_LAGOON];
      const result = getStationsByIds(stationIds);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('비키니 시티');
      expect(result[1].name).toBe('구-라군');
    });

    it('빈 배열 입력 시 빈 배열 반환', () => {
      const result = getStationsByIds([]);
      expect(result).toEqual([]);
    });
  });

  describe('노선별 역 분류', () => {
    it('시티선 전용 역: 플로터스 묘지', () => {
      const station = getStationById(STATION_UUIDS.FLOATERS_CEMETERY);
      expect(station).toBeDefined();
      expect(station!.name).toBe('플로터스 묘지');
    });

    it('외곽선 전용 역: 메롱시티, 징징빌라, 비키니 환초', () => {
      const suburbanOnlyStations = [
        getStationById(STATION_UUIDS.ROCK_BOTTOM),
        getStationById(STATION_UUIDS.TENTACLE_ACRES),
        getStationById(STATION_UUIDS.BIKINI_ATOLL),
      ];

      expect(suburbanOnlyStations).toHaveLength(3);
      expect(suburbanOnlyStations[0]!.name).toBe('메롱시티');
      expect(suburbanOnlyStations[1]!.name).toBe('징징빌라');
      expect(suburbanOnlyStations[2]!.name).toBe('비키니 환초');
    });

    it('투어선 전용 역: 켈프 숲, 구-라군, 해파리 초원', () => {
      const tourOnlyStations = [
        getStationById(STATION_UUIDS.KELP_FOREST),
        getStationById(STATION_UUIDS.GOO_LAGOON),
        getStationById(STATION_UUIDS.JELLYFISH_FIELDS),
      ];

      expect(tourOnlyStations).toHaveLength(3);
      expect(tourOnlyStations[0]!.name).toBe('켈프 숲');
      expect(tourOnlyStations[1]!.name).toBe('구-라군');
      expect(tourOnlyStations[2]!.name).toBe('해파리 초원');
    });

    it('환승역: 비키니 시티 (시티선, 외곽선, 투어선)', () => {
      const station = getStationById(STATION_UUIDS.BIKINI_CITY);
      expect(station).toBeDefined();
      expect(station!.name).toBe('비키니 시티');
    });

    it('2개 노선 교차: 버블타운 (시티선, 외곽선)', () => {
      const station = getStationById(STATION_UUIDS.BUBBLE_TOWN);
      expect(station).toBeDefined();
      expect(station!.name).toBe('버블타운');
    });

    it('2개 노선 교차: 글러브월드 (시티선, 투어선)', () => {
      const station = getStationById(STATION_UUIDS.GLOVE_WORLD);
      expect(station).toBeDefined();
      expect(station!.name).toBe('글러브월드');
    });
  });
});
