// 부산광역시 교육청, 경기도(베리타스알파), 광주광역시 교육청 공식 5등급제 ↔ 9등급제 환산 실증 데이터

export interface EducationOfficeMapping {
  grade5: number;
  cumulativeRatio: number; // %
  grade9Equivalent: number;
  grade5Sum12?: number; // 12과목 등급 합 (경기도/베리타스알파 기준)
  grade9Grad2024?: number; // 광주 2024년 3학년 졸업생 기준
}

// 1. 부산광역시교육청 관내 실증 누적 데이터 (98개교 15,978명 실측치)
export const BUSAN_OFFICE_CONVERSION_TABLE: EducationOfficeMapping[] = [
  { grade5: 1.00, cumulativeRatio: 0.68, grade9Equivalent: 1.28 },
  { grade5: 1.04, cumulativeRatio: 1.01, grade9Equivalent: 1.38 },
  { grade5: 1.08, cumulativeRatio: 1.40, grade9Equivalent: 1.47 },
  { grade5: 1.16, cumulativeRatio: 2.23, grade9Equivalent: 1.68 },
  { grade5: 1.24, cumulativeRatio: 3.16, grade9Equivalent: 1.87 },
  { grade5: 1.33, cumulativeRatio: 4.29, grade9Equivalent: 2.07 },
  { grade5: 1.42, cumulativeRatio: 5.44, grade9Equivalent: 2.25 },
  { grade5: 1.50, cumulativeRatio: 6.49, grade9Equivalent: 2.39 },
  { grade5: 1.66, cumulativeRatio: 8.89, grade9Equivalent: 2.66 },
  { grade5: 1.83, cumulativeRatio: 12.41, grade9Equivalent: 2.98 },
  { grade5: 2.00, cumulativeRatio: 16.58, grade9Equivalent: 3.30 },
  { grade5: 2.16, cumulativeRatio: 20.64, grade9Equivalent: 3.58 },
  { grade5: 2.33, cumulativeRatio: 25.45, grade9Equivalent: 3.87 },
  { grade5: 2.50, cumulativeRatio: 31.00, grade9Equivalent: 4.18 },
  { grade5: 2.66, cumulativeRatio: 36.37, grade9Equivalent: 4.45 },
  { grade5: 2.83, cumulativeRatio: 42.75, grade9Equivalent: 4.72 },
  { grade5: 3.00, cumulativeRatio: 49.96, grade9Equivalent: 5.03 },
  { grade5: 3.16, cumulativeRatio: 56.15, grade9Equivalent: 5.30 },
  { grade5: 3.33, cumulativeRatio: 62.92, grade9Equivalent: 5.58 },
  { grade5: 3.50, cumulativeRatio: 69.29, grade9Equivalent: 5.87 },
  { grade5: 3.66, cumulativeRatio: 74.93, grade9Equivalent: 6.12 },
  { grade5: 3.83, cumulativeRatio: 80.30, grade9Equivalent: 6.40 },
  { grade5: 4.00, cumulativeRatio: 85.54, grade9Equivalent: 6.71 },
  { grade5: 4.16, cumulativeRatio: 89.21, grade9Equivalent: 6.99 },
  { grade5: 4.33, cumulativeRatio: 92.51, grade9Equivalent: 7.28 },
  { grade5: 4.50, cumulativeRatio: 94.58, grade9Equivalent: 7.54 },
  { grade5: 4.66, cumulativeRatio: 96.16, grade9Equivalent: 7.80 },
  { grade5: 4.83, cumulativeRatio: 97.48, grade9Equivalent: 8.12 },
  { grade5: 5.00, cumulativeRatio: 100.00, grade9Equivalent: 9.00 },
];

// 2. 경기도/베리타스알파 누적비 기준 12과목 등급 합 환산 9등급 테이블
export const GYEONGGI_CONVERSION_TABLE: EducationOfficeMapping[] = [
  { grade5: 1.00, grade5Sum12: 12, cumulativeRatio: 1.20, grade9Equivalent: 1.39 },
  { grade5: 1.083, grade5Sum12: 13, cumulativeRatio: 1.95, grade9Equivalent: 1.53 },
  { grade5: 1.167, grade5Sum12: 14, cumulativeRatio: 3.09, grade9Equivalent: 1.73 },
  { grade5: 1.25, grade5Sum12: 15, cumulativeRatio: 4.01, grade9Equivalent: 1.87 },
  { grade5: 1.333, grade5Sum12: 16, cumulativeRatio: 5.15, grade9Equivalent: 2.03 },
  { grade5: 1.417, grade5Sum12: 17, cumulativeRatio: 6.38, grade9Equivalent: 2.18 },
  { grade5: 1.50, grade5Sum12: 18, cumulativeRatio: 7.81, grade9Equivalent: 2.31 },
  { grade5: 1.583, grade5Sum12: 19, cumulativeRatio: 9.06, grade9Equivalent: 2.45 },
  { grade5: 1.667, grade5Sum12: 20, cumulativeRatio: 10.90, grade9Equivalent: 2.61 },
  { grade5: 1.75, grade5Sum12: 21, cumulativeRatio: 12.45, grade9Equivalent: 2.73 },
  { grade5: 1.833, grade5Sum12: 22, cumulativeRatio: 14.54, grade9Equivalent: 2.88 },
  { grade5: 1.917, grade5Sum12: 23, cumulativeRatio: 16.36, grade9Equivalent: 3.00 },
  { grade5: 2.00, grade5Sum12: 24, cumulativeRatio: 18.92, grade9Equivalent: 3.16 },
  { grade5: 2.083, grade5Sum12: 25, cumulativeRatio: 20.86, grade9Equivalent: 3.28 },
  { grade5: 2.167, grade5Sum12: 26, cumulativeRatio: 23.28, grade9Equivalent: 3.41 },
  { grade5: 2.25, grade5Sum12: 27, cumulativeRatio: 25.62, grade9Equivalent: 3.54 },
  { grade5: 2.333, grade5Sum12: 28, cumulativeRatio: 28.36, grade9Equivalent: 3.68 },
  { grade5: 2.417, grade5Sum12: 29, cumulativeRatio: 30.84, grade9Equivalent: 3.80 },
  { grade5: 2.50, grade5Sum12: 30, cumulativeRatio: 33.63, grade9Equivalent: 3.95 },
  { grade5: 2.583, grade5Sum12: 31, cumulativeRatio: 36.19, grade9Equivalent: 4.08 },
  { grade5: 2.667, grade5Sum12: 32, cumulativeRatio: 39.32, grade9Equivalent: 4.21 },
  { grade5: 2.75, grade5Sum12: 33, cumulativeRatio: 42.15, grade9Equivalent: 4.34 },
  { grade5: 2.833, grade5Sum12: 34, cumulativeRatio: 45.68, grade9Equivalent: 4.48 },
  { grade5: 2.917, grade5Sum12: 35, cumulativeRatio: 48.62, grade9Equivalent: 4.61 },
  { grade5: 3.00, grade5Sum12: 36, cumulativeRatio: 52.12, grade9Equivalent: 4.75 },
];

// 3. 광주광역시 교육청 5등급 등급평균(고1 과정) ↔ 9등급제 환산 기준 (2025년 3학년 졸업생 & 2024년 졸업생 기준)
export const GWANGJU_OFFICE_CONVERSION_TABLE: EducationOfficeMapping[] = [
  { grade5: 1.00, cumulativeRatio: 2.00, grade9Equivalent: 1.51, grade9Grad2024: 1.55 },
  { grade5: 1.15, cumulativeRatio: 3.26, grade9Equivalent: 1.78, grade9Grad2024: 1.81 },
  { grade5: 1.30, cumulativeRatio: 5.11, grade9Equivalent: 2.10, grade9Grad2024: 2.13 },
  { grade5: 1.45, cumulativeRatio: 7.20, grade9Equivalent: 2.38, grade9Grad2024: 2.39 },
  { grade5: 1.60, cumulativeRatio: 9.29, grade9Equivalent: 2.63, grade9Grad2024: 2.62 },
  { grade5: 1.75, cumulativeRatio: 12.07, grade9Equivalent: 2.89, grade9Grad2024: 2.85 },
  { grade5: 1.90, cumulativeRatio: 15.25, grade9Equivalent: 3.16, grade9Grad2024: 3.16 },
  { grade5: 2.05, cumulativeRatio: 19.50, grade9Equivalent: 3.33, grade9Grad2024: 3.49 },
  { grade5: 2.20, cumulativeRatio: 23.44, grade9Equivalent: 3.58, grade9Grad2024: 3.73 },
  { grade5: 2.35, cumulativeRatio: 27.75, grade9Equivalent: 3.77, grade9Grad2024: 3.97 },
  { grade5: 2.50, cumulativeRatio: 31.96, grade9Equivalent: 3.97, grade9Grad2024: 4.20 },
  { grade5: 2.65, cumulativeRatio: 36.50, grade9Equivalent: 4.22, grade9Grad2024: 4.43 },
  { grade5: 2.80, cumulativeRatio: 41.66, grade9Equivalent: 4.46, grade9Grad2024: 4.66 },
  { grade5: 2.95, cumulativeRatio: 47.62, grade9Equivalent: 4.66, grade9Grad2024: 4.94 },
  { grade5: 3.10, cumulativeRatio: 53.65, grade9Equivalent: 4.95, grade9Grad2024: 5.19 },
  { grade5: 3.25, cumulativeRatio: 58.55, grade9Equivalent: 5.19, grade9Grad2024: 5.44 },
  { grade5: 3.40, cumulativeRatio: 63.80, grade9Equivalent: 5.44, grade9Grad2024: 5.66 },
  { grade5: 3.55, cumulativeRatio: 68.76, grade9Equivalent: 5.66, grade9Grad2024: 5.89 },
  { grade5: 3.70, cumulativeRatio: 73.31, grade9Equivalent: 5.89, grade9Grad2024: 6.11 },
  { grade5: 3.85, cumulativeRatio: 77.87, grade9Equivalent: 6.15, grade9Grad2024: 6.35 },
  { grade5: 4.00, cumulativeRatio: 81.83, grade9Equivalent: 6.39, grade9Grad2024: 6.57 },
  { grade5: 4.15, cumulativeRatio: 86.00, grade9Equivalent: 6.67, grade9Grad2024: 6.86 },
  { grade5: 4.30, cumulativeRatio: 89.41, grade9Equivalent: 6.87, grade9Grad2024: 7.11 },
  { grade5: 4.45, cumulativeRatio: 92.54, grade9Equivalent: 7.12, grade9Grad2024: 7.41 },
];

export interface OfficeAverageComparisonRow {
  grade5: number;
  busanGrade9: number;
  busanCumRatio: number;
  gyeonggiGrade9: number;
  gyeonggiCumRatio: number;
  gwangjuGrade9: number;
  gwangjuCumRatio: number;
  avgGrade9: number;
  avgCumRatio: number;
}

/**
 * 5등급제 성적(예: 1.17)을 교육청 실증 자료를 기반으로 선형 보간하여 9등급으로 환산
 */
export function convertByEducationOffice(
  grade5: number,
  table: 'busan' | 'gyeonggi' | 'gwangju' | 'average' = 'busan'
): {
  grade9Equivalent: number;
  cumulativeRatio: number;
  source: string;
} {
  if (table === 'average') {
    const busanRes = convertByEducationOffice(grade5, 'busan');
    const gyeonggiRes = convertByEducationOffice(grade5, 'gyeonggi');
    const gwangjuRes = convertByEducationOffice(grade5, 'gwangju');

    const grade9Avg = +(
      (busanRes.grade9Equivalent + gyeonggiRes.grade9Equivalent + gwangjuRes.grade9Equivalent) /
      3
    ).toFixed(2);
    const cumRatioAvg = +(
      (busanRes.cumulativeRatio + gyeonggiRes.cumulativeRatio + gwangjuRes.cumulativeRatio) /
      3
    ).toFixed(2);

    return {
      grade9Equivalent: grade9Avg,
      cumulativeRatio: cumRatioAvg,
      source: '3개 교육청 실측 통합 평균 (부산·경기·광주)',
    };
  }

  let dataset: EducationOfficeMapping[];
  let sourceName = '';

  if (table === 'busan') {
    dataset = BUSAN_OFFICE_CONVERSION_TABLE;
    sourceName = '부산시교육청 진로진학센터 (15,978명 표본)';
  } else if (table === 'gyeonggi') {
    dataset = GYEONGGI_CONVERSION_TABLE;
    sourceName = '경기도 누적비 기준 (12과목 등급합)';
  } else {
    dataset = GWANGJU_OFFICE_CONVERSION_TABLE;
    sourceName = '광주시교육청 (고1 과정 누적비)';
  }

  if (grade5 <= dataset[0].grade5) {
    return {
      grade9Equivalent: dataset[0].grade9Equivalent,
      cumulativeRatio: dataset[0].cumulativeRatio,
      source: sourceName,
    };
  }

  const last = dataset[dataset.length - 1];
  if (grade5 >= last.grade5) {
    if (table === 'gyeonggi' && grade5 > 3.0) {
      // 3.00 이상 구간 5.00(9.00등급, 100%)까지 보외
      const factor = (Math.min(5.0, grade5) - 3.0) / 2.0;
      const grade9 = 4.75 + factor * (9.0 - 4.75);
      const cumRatio = 52.12 + factor * (100.0 - 52.12);
      return {
        grade9Equivalent: +grade9.toFixed(2),
        cumulativeRatio: +cumRatio.toFixed(2),
        source: sourceName,
      };
    }
    if (table === 'gwangju' && grade5 > 4.45) {
      // 4.45 이상 구간 5.00(9.00등급, 100%)까지 보외
      const factor = (Math.min(5.0, grade5) - 4.45) / 0.55;
      const grade9 = 7.12 + factor * (9.0 - 7.12);
      const cumRatio = 92.54 + factor * (100.0 - 92.54);
      return {
        grade9Equivalent: +grade9.toFixed(2),
        cumulativeRatio: +cumRatio.toFixed(2),
        source: sourceName,
      };
    }
    return {
      grade9Equivalent: last.grade9Equivalent,
      cumulativeRatio: last.cumulativeRatio,
      source: sourceName,
    };
  }

  // 선형 보간 (Linear Interpolation)
  for (let i = 0; i < dataset.length - 1; i++) {
    const curr = dataset[i];
    const next = dataset[i + 1];
    if (grade5 >= curr.grade5 && grade5 <= next.grade5) {
      const span = next.grade5 - curr.grade5;
      const factor = span === 0 ? 0 : (grade5 - curr.grade5) / span;

      const grade9 = curr.grade9Equivalent + factor * (next.grade9Equivalent - curr.grade9Equivalent);
      const cumRatio = curr.cumulativeRatio + factor * (next.cumulativeRatio - curr.cumulativeRatio);

      return {
        grade9Equivalent: +grade9.toFixed(2),
        cumulativeRatio: +cumRatio.toFixed(2),
        source: sourceName,
      };
    }
  }

  return {
    grade9Equivalent: 5.0,
    cumulativeRatio: 50.0,
    source: sourceName,
  };
}

// 4. 부산, 경기, 광주 3개 교육청 실측 표본의 통합 평균 비교 테이블
export const AVERAGE_OFFICE_CONVERSION_TABLE: OfficeAverageComparisonRow[] = [
  1.0, 1.05, 1.1, 1.15, 1.2, 1.25, 1.3, 1.35, 1.4, 1.45, 1.5,
  1.6, 1.7, 1.8, 1.9, 2.0, 2.1, 2.2, 2.3, 2.4, 2.5,
  2.6, 2.7, 2.8, 2.9, 3.0, 3.2, 3.5, 4.0, 4.5, 5.0,
].map((g) => {
  const b = convertByEducationOffice(g, 'busan');
  const gg = convertByEducationOffice(g, 'gyeonggi');
  const gj = convertByEducationOffice(g, 'gwangju');
  const avg = convertByEducationOffice(g, 'average');
  return {
    grade5: g,
    busanGrade9: b.grade9Equivalent,
    busanCumRatio: b.cumulativeRatio,
    gyeonggiGrade9: gg.grade9Equivalent,
    gyeonggiCumRatio: gg.cumulativeRatio,
    gwangjuGrade9: gj.grade9Equivalent,
    gwangjuCumRatio: gj.cumulativeRatio,
    avgGrade9: avg.grade9Equivalent,
    avgCumRatio: avg.cumulativeRatio,
  };
});
