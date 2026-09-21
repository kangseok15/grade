import {
  CourseRecord,
  ConversionMethod,
  GradeSummary,
  CategorySummary,
  SubjectCategory,
  SubjectGroupKey,
  CombinationGradeSummary,
  StudentProfile,
} from '../types';
import { convertByEducationOffice } from '../data/educationOfficeConversions';

export interface PercentileGradeBoundary {
  grade: number;
  label: string;
  minPercentile: number; // 누적 최소 %
  maxPercentile: number; // 누적 최대 %
  midPercentile: number; // 대표 중간 %
  ratio: number; // 해당 등급 비율 %
}

// 5등급제 등급별 누적 비율 (2028 개편안)
export const GRADE_5_BOUNDARIES: PercentileGradeBoundary[] = [
  { grade: 1, label: '1등급', minPercentile: 0, maxPercentile: 10, midPercentile: 5, ratio: 10 },
  { grade: 2, label: '2등급', minPercentile: 10, maxPercentile: 34, midPercentile: 22, ratio: 24 },
  { grade: 3, label: '3등급', minPercentile: 34, maxPercentile: 66, midPercentile: 50, ratio: 32 },
  { grade: 4, label: '4등급', minPercentile: 66, maxPercentile: 90, midPercentile: 78, ratio: 24 },
  { grade: 5, label: '5등급', minPercentile: 90, maxPercentile: 100, midPercentile: 95, ratio: 10 },
];

// 9등급제 등급별 누적 비율 (기존 체제)
export const GRADE_9_BOUNDARIES: PercentileGradeBoundary[] = [
  { grade: 1, label: '1등급', minPercentile: 0, maxPercentile: 4, midPercentile: 2, ratio: 4 },
  { grade: 2, label: '2등급', minPercentile: 4, maxPercentile: 11, midPercentile: 7.5, ratio: 7 },
  { grade: 3, label: '3등급', minPercentile: 11, maxPercentile: 23, midPercentile: 17, ratio: 12 },
  { grade: 4, label: '4등급', minPercentile: 23, maxPercentile: 40, midPercentile: 31.5, ratio: 17 },
  { grade: 5, label: '5등급', minPercentile: 40, maxPercentile: 60, midPercentile: 50, ratio: 20 },
  { grade: 6, label: '6등급', minPercentile: 60, maxPercentile: 77, midPercentile: 68.5, ratio: 17 },
  { grade: 7, label: '7등급', minPercentile: 77, maxPercentile: 89, midPercentile: 83, ratio: 12 },
  { grade: 8, label: '8등급', minPercentile: 89, maxPercentile: 96, midPercentile: 92.5, ratio: 7 },
  { grade: 9, label: '9등급', minPercentile: 96, maxPercentile: 100, midPercentile: 98, ratio: 4 },
];

/**
 * 백분위(0~100%)를 9등급 수치로 환산 (연속적 실수 등급)
 */
export function percentileToGrade9(percentile: number): number {
  if (percentile <= 0) return 1.0;
  if (percentile >= 100) return 9.0;

  for (const b of GRADE_9_BOUNDARIES) {
    if (percentile <= b.maxPercentile) {
      const span = b.maxPercentile - b.minPercentile;
      const progress = (percentile - b.minPercentile) / span;
      return +(b.grade - 1 + Math.max(0.05, Math.min(0.95, progress))).toFixed(2);
    }
  }
  return 9.0;
}

/**
 * 백분위(0~100%)를 5등급 수치로 환산 (연속적 실수 등급)
 */
export function percentileToGrade5(percentile: number): number {
  if (percentile <= 0) return 1.0;
  if (percentile >= 100) return 5.0;

  for (const b of GRADE_5_BOUNDARIES) {
    if (percentile <= b.maxPercentile) {
      const span = b.maxPercentile - b.minPercentile;
      const progress = (percentile - b.minPercentile) / span;
      return +(b.grade - 1 + Math.max(0.05, Math.min(0.95, progress))).toFixed(2);
    }
  }
  return 5.0;
}

/**
 * 5등급제 등급(1~5)을 9등급제 수치로 변환
 */
export function convertGrade5ToGrade9(
  grade5: number,
  method: ConversionMethod = 'busan'
): {
  grade9Equivalent: number;
  gradeRange: string;
  midPercentile: number;
  description: string;
} {
  // If method is busan, gyeonggi, gwangju, or average education office empirical data
  if (
    method === 'busan' ||
    method === 'gyeonggi' ||
    method === 'gwangju' ||
    method === 'average'
  ) {
    const res = convertByEducationOffice(grade5, method);
    return {
      grade9Equivalent: res.grade9Equivalent,
      gradeRange: `9등급 약 ${res.grade9Equivalent}등급 (누적 ${res.cumulativeRatio}%)`,
      midPercentile: res.cumulativeRatio,
      description: `${res.source} 기준 5등급제 ${grade5}등급은 누적비율 상위 ${res.cumulativeRatio}%이며, 9등급제 환산 시 약 ${res.grade9Equivalent}등급에 해당합니다.`,
    };
  }

  const g = Math.max(1, Math.min(5, Math.round(grade5)));
  const boundary = GRADE_5_BOUNDARIES[g - 1];

  let targetPercentile = boundary.midPercentile;
  if (method === 'conservative') {
    // 보수적 대학 평가 기준 (해당 등급의 하위 80% 지점 적용)
    targetPercentile = boundary.minPercentile + (boundary.maxPercentile - boundary.minPercentile) * 0.8;
  } else if (method === 'optimistic') {
    // 낙관적 기준 (해당 등급의 상위 20% 지점 적용)
    targetPercentile = boundary.minPercentile + (boundary.maxPercentile - boundary.minPercentile) * 0.2;
  }

  const grade9Equivalent = percentileToGrade9(targetPercentile);

  let gradeRange = '';
  let description = '';

  switch (g) {
    case 1:
      gradeRange = '9등급 기준 1등급 ~ 2등급 초';
      description = '5등급제 1등급(누적 10%)은 9등급제 1등급(4%)과 2등급(11%) 대부분을 포함합니다.';
      break;
    case 2:
      gradeRange = '9등급 기준 2등급 말 ~ 4등급 초';
      description = '5등급제 2등급(10~34%)은 9등급제 2등급 후반, 3등급(11~23%), 4등급(23~40%) 초반에 걸쳐 있습니다.';
      break;
    case 3:
      gradeRange = '9등급 기준 4등급 중 ~ 6등급 초';
      description = '5등급제 3등급(34~66%)은 9등급제 4등급 후반, 5등급(40~60%), 6등급(60~77%) 초반에 대응합니다.';
      break;
    case 4:
      gradeRange = '9등급 기준 6등급 중 ~ 8등급 초';
      description = '5등급제 4등급(66~90%)은 9등급제 6등급 후반, 7등급(77~89%), 8등급 초입에 해당합니다.';
      break;
    case 5:
      gradeRange = '9등급 기준 8등급 중 ~ 9등급';
      description = '5등급제 5등급(90~100%)은 9등급제 8등급 후반 및 9등급(96~100%)에 해당합니다.';
      break;
  }

  return {
    grade9Equivalent,
    gradeRange,
    midPercentile: boundary.midPercentile,
    description,
  };
}

/**
 * 9등급제 등급(1~9)을 5등급제 수치로 변환
 */
export function convertGrade9ToGrade5(
  grade9: number,
  method: ConversionMethod = 'midpoint'
): {
  grade5Equivalent: number;
  gradeRange: string;
  midPercentile: number;
  description: string;
} {
  const g = Math.max(1, Math.min(9, Math.round(grade9)));
  const boundary = GRADE_9_BOUNDARIES[g - 1];

  let targetPercentile = boundary.midPercentile;
  if (method === 'conservative') {
    targetPercentile = boundary.minPercentile + (boundary.maxPercentile - boundary.minPercentile) * 0.8;
  } else if (method === 'optimistic') {
    targetPercentile = boundary.minPercentile + (boundary.maxPercentile - boundary.minPercentile) * 0.2;
  }

  const grade5Equivalent = percentileToGrade5(targetPercentile);

  let gradeRange = '';
  let description = '';

  if (g === 1) {
    gradeRange = '5등급 기준 확실한 1등급';
    description = '상위 4% 이내로 5등급제 1등급(상위 10%) 최상단에 확정 진입합니다.';
  } else if (g === 2) {
    gradeRange = '5등급 기준 1등급 ~ 2등급 경계';
    description = '상위 4%~11%로 약 85%는 1등급, 15%는 2등급 경계선에 위치합니다.';
  } else if (g === 3) {
    gradeRange = '5등급 기준 안정적 2등급';
    description = '상위 11%~23%로 5등급제 2등급(10~34%)의 중심부에 안정적으로 속합니다.';
  } else if (g === 4) {
    gradeRange = '5등급 기준 2등급 말 ~ 3등급 초';
    description = '상위 23%~40%로 약 65%는 2등급, 35%는 3등급에 속합니다.';
  } else if (g === 5) {
    gradeRange = '5등급 기준 확정 3등급';
    description = '상위 40%~60%로 5등급제 3등급(34~66%)의 정중앙에 위치합니다.';
  } else if (g === 6) {
    gradeRange = '5등급 기준 3등급 말 ~ 4등급 초';
    description = '상위 60%~77%로 3등급과 4등급에 걸쳐 있습니다.';
  } else if (g === 7) {
    gradeRange = '5등급 기준 안정적 4등급';
    description = '상위 77%~89%로 5등급제 4등급(66~90%)에 들어옵니다.';
  } else if (g === 8) {
    gradeRange = '5등급 기준 4등급 말 ~ 5등급';
    description = '상위 89%~96%로 4등급 하단 및 5등급 상단에 속합니다.';
  } else {
    gradeRange = '5등급 기준 5등급';
    description = '상위 96%~100%로 5등급제 5등급(90~100%)에 속합니다.';
  }

  return {
    grade5Equivalent,
    gradeRange,
    midPercentile: boundary.midPercentile,
    description,
  };
}

/**
 * 성적 레코드 목록에서 GPA 및 통계 산출
 */
export function calculateGpaSummary(
  records: CourseRecord[],
  conversionMethod: ConversionMethod = 'midpoint'
): {
  totalUnits: number;
  weightedGpa5: number;
  unweightedGpa5: number;
  weightedGpa9: number;
  unweightedGpa9: number;
  gradedCourseCount: number;
  avgRawScore: number;
} {
  const graded = records.filter(
    (r) => r.rankGrade5 != null && r.rankGrade5 > 0 && r.courseType !== '예체'
  );

  if (graded.length === 0) {
    return {
      totalUnits: 0,
      weightedGpa5: 0,
      unweightedGpa5: 0,
      weightedGpa9: 0,
      unweightedGpa9: 0,
      gradedCourseCount: 0,
      avgRawScore: 0,
    };
  }

  let sumUnits = 0;
  let sumWeighted5 = 0;
  let sumUnweighted5 = 0;
  let sumWeighted9 = 0;
  let sumUnweighted9 = 0;
  let sumRawScore = 0;
  let rawScoreCount = 0;

  for (const r of graded) {
    const units = r.units || 1;
    const g5 = r.rankGrade5!;
    const g9 = r.rankGrade9 ?? convertGrade5ToGrade9(g5, conversionMethod).grade9Equivalent;

    sumUnits += units;
    sumWeighted5 += g5 * units;
    sumUnweighted5 += g5;

    sumWeighted9 += g9 * units;
    sumUnweighted9 += g9;

    if (r.rawScore != null && !isNaN(r.rawScore)) {
      sumRawScore += r.rawScore;
      rawScoreCount++;
    }
  }

  return {
    totalUnits: sumUnits,
    weightedGpa5: +(sumWeighted5 / sumUnits).toFixed(2),
    unweightedGpa5: +(sumUnweighted5 / graded.length).toFixed(2),
    weightedGpa9: +(sumWeighted9 / sumUnits).toFixed(2),
    unweightedGpa9: +(sumUnweighted9 / graded.length).toFixed(2),
    gradedCourseCount: graded.length,
    avgRawScore: rawScoreCount > 0 ? +(sumRawScore / rawScoreCount).toFixed(1) : 0,
  };
}

/**
 * 학기별 성적 추이 계산 (1-1, 1-2, 2-1 등)
 */
export function calculateSemesterSummaries(
  records: CourseRecord[],
  conversionMethod: ConversionMethod = 'midpoint'
): GradeSummary[] {
  const semesters = Array.from(new Set(records.map((r) => r.semester))).sort();

  return semesters.map((sem) => {
    const semRecords = records.filter((r) => r.semester === sem);
    const summary = calculateGpaSummary(semRecords, conversionMethod);
    return {
      term: sem,
      ...summary,
      courseCount: semRecords.length,
    };
  });
}

/**
 * 교과군별 성적 집계 (국어, 수학, 영어, 사회, 과학 등)
 */
export function calculateCategorySummaries(
  records: CourseRecord[],
  conversionMethod: ConversionMethod = 'midpoint'
): CategorySummary[] {
  const categories: SubjectCategory[] = [
    '국어',
    '수학',
    '영어',
    '사회',
    '과학',
    '기술가정/정보',
    '제2외국어/한문',
  ];

  return categories.map((cat) => {
    const catRecords = records.filter((r) => r.category === cat);
    const graded = catRecords.filter(
      (r) => r.rankGrade5 != null && r.rankGrade5 > 0 && r.courseType !== '예체'
    );

    let sumUnits = 0;
    let sumWeighted5 = 0;
    let sumWeighted9 = 0;
    let sumRaw = 0;
    let sumMean = 0;
    let rawCount = 0;
    let aCount = 0;

    for (const r of catRecords) {
      if (r.achievement === 'A') aCount++;
      if (r.rawScore != null) {
        sumRaw += r.rawScore;
        rawCount++;
      }
      if (r.subjectMean != null) {
        sumMean += r.subjectMean;
      }
    }

    for (const r of graded) {
      const units = r.units || 1;
      const g5 = r.rankGrade5!;
      const g9 = r.rankGrade9 ?? convertGrade5ToGrade9(g5, conversionMethod).grade9Equivalent;
      sumUnits += units;
      sumWeighted5 += g5 * units;
      sumWeighted9 += g9 * units;
    }

    return {
      category: cat,
      totalUnits: sumUnits,
      weightedGpa5: sumUnits > 0 ? +(sumWeighted5 / sumUnits).toFixed(2) : 0,
      weightedGpa9: sumUnits > 0 ? +(sumWeighted9 / sumUnits).toFixed(2) : 0,
      avgRawScore: rawCount > 0 ? +(sumRaw / rawCount).toFixed(1) : 0,
      avgMeanScore: rawCount > 0 ? +(sumMean / rawCount).toFixed(1) : 0,
      courseCount: catRecords.length,
      ratioA: catRecords.length > 0 ? Math.round((aCount / catRecords.length) * 100) : 0,
    };
  }).filter(c => c.courseCount > 0);
}

/**
 * 대입 주요 반영 교과군 조합별 성적 집계
 * 1. 전과목 (전체)
 * 2. 국영수사과한국사 (공통 필수/수시 주요)
 * 3. 국영수사(한국사) (인문계열 주요 대학 반영)
 * 4. 국영수과 (자연계열/이공계 주요 대학 반영)
 */
export function calculateSubjectGroupCombinations(
  records: CourseRecord[],
  conversionMethod: ConversionMethod = 'busan'
): CombinationGradeSummary[] {
  // Helper to check subject types
  const isKorean = (r: CourseRecord) => r.category === '국어';
  const isMath = (r: CourseRecord) => r.category === '수학';
  const isEnglish = (r: CourseRecord) => r.category === '영어';
  const isSocialOrHistory = (r: CourseRecord) =>
    r.category === '사회' || r.subjectName.includes('한국사') || r.subjectName.includes('역사');
  const isScience = (r: CourseRecord) => r.category === '과학';

  // 1. 전과목
  const allRecords = records;

  // 2. 국·영·수·사·과·한국사
  const kmesHistRecords = records.filter(
    (r) => isKorean(r) || isEnglish(r) || isMath(r) || isSocialOrHistory(r) || isScience(r)
  );

  // 3. 국·영·수·사(한국사)
  const kmeHistRecords = records.filter(
    (r) => isKorean(r) || isEnglish(r) || isMath(r) || isSocialOrHistory(r)
  );

  // 4. 국·영·수·과
  const kmesRecords = records.filter(
    (r) => isKorean(r) || isEnglish(r) || isMath(r) || isScience(r)
  );

  const groups: {
    key: SubjectGroupKey;
    label: string;
    description: string;
    dataset: CourseRecord[];
  }[] = [
    {
      key: 'all',
      label: '전과목',
      description: '전체 이수 교과목 반영 (예체능 제외 정량 등급 산출 과목)',
      dataset: allRecords,
    },
    {
      key: 'korean_math_eng_soc_sci_hist',
      label: '국·영·수·사·과·한국사',
      description: '서울 주요 상위권 대학 학생부교과 및 정량 평가 핵심 6개 교과군',
      dataset: kmesHistRecords,
    },
    {
      key: 'korean_math_eng_soc_hist',
      label: '국·영·수·사(한국사)',
      description: '인문·사회·상경계열 주요 대학 학생부교과 전형 대표 반영 교과군',
      dataset: kmeHistRecords,
    },
    {
      key: 'korean_math_eng_sci',
      label: '국·영·수·과',
      description: '자연·이공·의약학계열 주요 대학 학생부교과 전형 대표 반영 교과군',
      dataset: kmesRecords,
    },
  ];

  return groups.map((g) => {
    const summary = calculateGpaSummary(g.dataset, conversionMethod);
    return {
      key: g.key,
      label: g.label,
      description: g.description,
      totalUnits: summary.totalUnits,
      courseCount: summary.gradedCourseCount,
      weightedGpa5: summary.weightedGpa5,
      unweightedGpa5: summary.unweightedGpa5,
      weightedGpa9: summary.weightedGpa9,
      unweightedGpa9: summary.unweightedGpa9,
      avgRawScore: summary.avgRawScore,
    };
  });
}

/**
 * 성적 추세 분석 (상승형, 유지형, 하강형) 및 발전 가능성 진단
 */
export function analyzeTrajectory(summaries: GradeSummary[]): {
  trend: '상승형' | '유지형' | '하강형' | '변동형';
  description: string;
  strengthPoints: string[];
  recommendations: string[];
} {
  if (summaries.length < 2) {
    const single = summaries[0];
    const isTopTier = single.weightedGpa5 <= 1.3;
    return {
      trend: '유지형',
      description: isTopTier
        ? `1학년 1학기 평균 ${single.weightedGpa5}등급의 최상위권 성적을 달성했습니다. 2028 대입 개편 5등급제 체제에서 1등급(상위 10%)을 완벽히 확보한 우수한 출발점입니다.`
        : `1학년 1학기 평균 ${single.weightedGpa5}등급을 기록 중입니다. 1학년 2학기 및 향후 학기 성적을 바탕으로 성적 추이 그래프와 발전 가능성이 종합 분석됩니다.`,
      strengthPoints: isTopTier
        ? ['1학년 공통과목 전반에서의 최우수 내신 선점 (1등급군 확보)', '수학·과학·국어 등 주요 과목 상위 성취도 A 달성']
        : ['1학년 공통과목 이수를 통한 기초 학업 역량 형성', '성취도 분포 비율 대비 안정적 원점수 획득'],
      recommendations: [
        '1학년 2학기에도 공통과목(국·수·영·통사·통과) 1등급 및 성취도 A 유지를 최우선 목표로 설정',
        '2학년 진급 시 선택하게 될 일반/융합 선택과목에 대한 사전 대비 및 전공 희망 계열 탐색',
      ],
    };
  }

  const firstGpa = summaries[0].weightedGpa5;
  const lastGpa = summaries[summaries.length - 1].weightedGpa5;
  const diff = +(firstGpa - lastGpa).toFixed(2); // 등급은 낮을수록 좋음 (1등급이 최고)

  let trend: '상승형' | '유지형' | '하강형' | '변동형';
  let description = '';
  const strengthPoints: string[] = [];
  const recommendations: string[] = [];

  if (diff >= 0.08) {
    trend = '상승형';
    description = `1학년 대비 2학년 성적이 ${diff}등급 향상되는 뚜렷한 우상향 곡선을 나타내고 있습니다. 학생부종합전형에서 '학업 발전 가능성'과 '자기주도적 노력' 면에서 매우 강력한 가산 평가를 받을 수 있는 전형적 패턴입니다.`;
    strengthPoints.push('학년이 올라갈수록 난이도가 높아지는 전공 관련 교과에서 성적 향상');
    strengthPoints.push('학생부종합전형 정성평가 시 학업발전역량 최우수 평가 가능');
    recommendations.push('3학년 1학기까지 현재의 상승세를 유지할 경우 상위권 대학 학생부종합전형 적극 지원 권장');
    recommendations.push('심화 선택 및 융합선택 과목 세부능력및특기사항(세특)을 전공 적합성에 맞게 강화');
  } else if (diff <= -0.15) {
    trend = '하강형';
    description = `1학년에 비해 2학년 성적이 다소 하락(${Math.abs(diff)}등급 하락)하는 추세를 보입니다. 선택과목 난이도 상승 또는 이수자 수 감소로 인한 등급 분산이 원인일 수 있으므로 취약 과목 보완이 시급합니다.`;
    strengthPoints.push('1학년 공통과목에서의 탄탄한 기본 학업 역량 보유');
    recommendations.push('등급 낙폭이 큰 특정 교과(예: 수학, 탐구)의 원점수 및 과목평균 격차 분석 후 집중 보완');
    recommendations.push('5등급제 체제에서는 2등급(상위 34%) 방어가 대입에서 치명적이지 않도록 1등급 회복에 주력');
  } else {
    // 0에 가까움
    trend = '유지형';
    description = `학기별 편차 없이 ${firstGpa} ~ ${lastGpa}등급 대를 안정적으로 유지하고 있는 최상위/우수 유지형 패턴입니다. 학업 역량의 기복이 적고 성실성이 높게 평가됩니다.`;
    strengthPoints.push('전 학기 고른 성취도와 안정적인 내신 관리 역량 입증');
    strengthPoints.push('시험 난이도나 환경 변화에 흔들리지 않는 학습 지구력');
    recommendations.push('현재 등급을 유지하면서, 전공 관련 교과의 성취비율 A와 세특 탐구 보고서 완성도에 집중');
  }

  return { trend, description, strengthPoints, recommendations };
}

/**
 * 숭신고 미래인재반 동일 학년 집단과 비교한 구체적 5줄 종합 상담 의견 자동 생성
 */
export function generateCohortComparativeComment(
  student: StudentProfile,
  allStudents: StudentProfile[] = [],
  conversionMethod: ConversionMethod = 'average'
): string {
  const cohort = allStudents.filter((s) => s.grade === student.grade);
  const cohortCount = cohort.length > 0 ? cohort.length : 1;

  const studentSummary = calculateGpaSummary(student.records, conversionMethod);
  const semesterSummaries = calculateSemesterSummaries(student.records, conversionMethod);
  const trajectory = analyzeTrajectory(semesterSummaries);

  // Calculate cohort GPA and Raw
  let totalCohortGpaSum = 0;
  let totalCohortRawSum = 0;
  let validCohortCount = 0;

  const cohortStats = cohort.map((peer) => {
    const sum = calculateGpaSummary(peer.records, conversionMethod);
    if (sum.totalUnits > 0) {
      totalCohortGpaSum += sum.weightedGpa5;
      totalCohortRawSum += sum.avgRawScore;
      validCohortCount += 1;
    }
    return {
      id: peer.id,
      name: peer.name,
      gpa5: sum.weightedGpa5,
      raw: sum.avgRawScore,
    };
  });

  const cohortAvgGpa =
    validCohortCount > 0
      ? +(totalCohortGpaSum / validCohortCount).toFixed(2)
      : studentSummary.weightedGpa5;
  const cohortAvgRaw =
    validCohortCount > 0
      ? +(totalCohortRawSum / validCohortCount).toFixed(1)
      : studentSummary.avgRawScore;

  // Student rank in cohort (sorted by gpa5 asc, then raw desc)
  cohortStats.sort((a, b) => a.gpa5 - b.gpa5 || b.raw - a.raw);
  const studentRankIndex = cohortStats.findIndex((s) => s.id === student.id);
  const studentRank = studentRankIndex !== -1 ? studentRankIndex + 1 : 1;
  const rankPercent = Math.max(
    1,
    Math.round((studentRank / cohortCount) * 100)
  );

  // Subject-specific comparisons (Math, Science, Korean, English, Social)
  const getSubjectMetrics = (records: CourseRecord[], cat: string) => {
    const list = records.filter(
      (r) =>
        r.category === cat ||
        (cat === '사회' &&
          (r.subjectName.includes('한국사') || r.subjectName.includes('역사')))
    );
    const validRaw = list.filter((r) => typeof r.rawScore === 'number');
    const u = validRaw.reduce((a, c) => a + c.units, 0);
    const s = validRaw.reduce((a, c) => a + c.units * (c.rawScore || 0), 0);
    return u > 0 ? +(s / u).toFixed(1) : 0;
  };

  const sMath = getSubjectMetrics(student.records, '수학');
  const sSci = getSubjectMetrics(student.records, '과학');
  const sKor = getSubjectMetrics(student.records, '국어');
  const sEng = getSubjectMetrics(student.records, '영어');
  const sSoc = getSubjectMetrics(student.records, '사회');

  // Cohort subject averages
  const getCohortSubjectAvg = (cat: string) => {
    let sum = 0;
    let count = 0;
    cohort.forEach((p) => {
      const avg = getSubjectMetrics(p.records, cat);
      if (avg > 0) {
        sum += avg;
        count++;
      }
    });
    return count > 0 ? +(sum / count).toFixed(1) : 0;
  };

  const cMath = getCohortSubjectAvg('수학');
  const cSci = getCohortSubjectAvg('과학');
  const cKor = getCohortSubjectAvg('국어');
  const cEng = getCohortSubjectAvg('영어');
  const cSoc = getCohortSubjectAvg('사회');

  const diffRaw = +(studentSummary.avgRawScore - cohortAvgRaw).toFixed(1);
  const rawDiffStr = diffRaw > 0 ? `+${diffRaw}점` : diffRaw === 0 ? '동일' : `${diffRaw}점`;

  // Determine top strengths and areas for reinforcement
  const diffs = [
    { name: '수학', s: sMath, c: cMath, diff: +(sMath - cMath).toFixed(1) },
    { name: '과학', s: sSci, c: cSci, diff: +(sSci - cSci).toFixed(1) },
    { name: '국어', s: sKor, c: cKor, diff: +(sKor - cKor).toFixed(1) },
    { name: '영어', s: sEng, c: cEng, diff: +(sEng - cEng).toFixed(1) },
    { name: '사회', s: sSoc, c: cSoc, diff: +(sSoc - cSoc).toFixed(1) },
  ].filter((d) => d.s > 0 && d.c > 0);

  diffs.sort((a, b) => b.diff - a.diff);
  const bestSubject = diffs[0];
  const secondBest = diffs.length > 1 ? diffs[1] : null;
  const lowestSubject = diffs[diffs.length - 1];

  // Exactly 5 concrete comparative lines
  const line1 = `1. [학업 성취 및 교내 위치] 숭신고 미래인재반 ${student.grade}학년 비교집단(${cohortCount}명) 중 전과목 5등급제 ${studentSummary.weightedGpa5}등급(원점수 ${studentSummary.avgRawScore}점)을 기록하여 미래인재반 평균(${cohortAvgGpa}등급, ${cohortAvgRaw}점) 대비 ${rawDiffStr} 격차로 상위 ${rankPercent}%에 위치함.`;

  const line2 = bestSubject
    ? `2. [핵심 교과 우위 분석] 특히 ${bestSubject.name} 교과(원점수 ${bestSubject.s}점 vs 동급생 평균 ${bestSubject.c}점, 격차 ${bestSubject.diff > 0 ? `+${bestSubject.diff}` : bestSubject.diff}점)${secondBest && secondBest.diff > 0 ? ` 및 ${secondBest.name} 교과(+${secondBest.diff}점)` : ''}에서 다른 학생들 대비 뚜렷한 비교우위를 선점하여 심화 지필평가와 탐구 해결력이 탁월함.`
    : `2. [핵심 교과 우위 분석] 주요 핵심 교과군 전반에서 미래인재반 평균 이상의 원점수를 고르게 획득하며 동급생 대비 안정적인 학업 기초체력을 입증함.`;

  const line3 =
    lowestSubject && lowestSubject.name !== bestSubject?.name
      ? `3. [상대적 보완 및 균형 학습] 상대적으로 ${lowestSubject.name} 교과(원점수 ${lowestSubject.s}점 vs 동급생 평균 ${lowestSubject.c}점, 격차 ${lowestSubject.diff > 0 ? `+${lowestSubject.diff}` : lowestSubject.diff}점)는 다른 학생들과의 편차가 적으므로, 2학기 수행평가 완결성과 지필 고득점을 집중 보완해 전 과목 1등급 방어에 주력해야 함.`
      : `3. [상대적 보완 및 균형 학습] 전 교과목 A성취도 및 1등급 유지를 위해 상대적 취약 단원의 오답 피드백과 교과 세특 탐구 완성도를 높이는 전략적 학습 안배가 요구됨.`;

  const line4 = `4. [성적 추이 및 대입 경쟁력] 학기별 성적 추이에서 '${trajectory.trend}' 흐름을 나타내며, 미래인재반 내부 경쟁뿐 아니라 전국 단위 2028 대입(9등급 환산 약 ${studentSummary.weightedGpa9}등급)에서도 학생부교과 및 학생부종합전형 서류평가에서 매우 높은 변별력을 확보하고 있음.`;

  const line5 = `5. [종합 진학 지도 전략] 목표하는 ${student.track} 계열 특성에 맞추어, 동급생 대비 우수한 교과 성적을 바탕으로 심화 융합 탐구활동과 학생부 세특을 유기적으로 연계하여 주요 상위권 대학 전형의 핵심 대표 자원으로 적극 추천 및 지도함.`;

  return `${line1}\n${line2}\n${line3}\n${line4}\n${line5}`;
}

/**
 * 학생들을 학번 순(학년 -> 반 -> 번호 -> 이름)으로 정렬하는 함수
 */
export function sortStudentsByHakbeon(students: StudentProfile[]): StudentProfile[] {
  return [...students].sort((a, b) => {
    if (a.grade !== b.grade) return a.grade - b.grade;
    if (a.classNum !== b.classNum) return a.classNum - b.classNum;
    if (a.studentNum !== b.studentNum) return a.studentNum - b.studentNum;
    return a.name.localeCompare(b.name, 'ko');
  });
}
