export type SubjectCategory =
  | '국어'
  | '수학'
  | '영어'
  | '사회'
  | '과학'
  | '기술가정/정보'
  | '제2외국어/한문'
  | '예술'
  | '체육'
  | '기타';

export type CourseType = '공통' | '일반' | '융합' | '진로' | '전문' | '예체';

export type Achievement = 'A' | 'B' | 'C' | 'D' | 'E' | 'P';

export interface AchievementRatios {
  A: number;
  B: number;
  C: number;
  D: number;
  E: number;
}

export interface CourseRecord {
  id: string;
  semester: string; // '1-1' | '1-2' | '2-1' | '2-2' | '3-1' | '3-2'
  category: SubjectCategory;
  subjectName: string;
  courseType: CourseType;
  units: number; // 단위수
  rawScore?: number; // 원점수
  subjectMean?: number; // 과목평균
  achievement: Achievement; // 성취도
  rankGrade5?: number | null; // 5등급제 등급 (1~5)
  rankGrade9?: number | null; // 9등급제 등급 (1~9)
  studentCount?: number; // 수강자수
  achievementRatios?: AchievementRatios; // 성취비율 A~E
  isSelected?: boolean; // 대학 반영 및 선택 여부
}

export interface StudentProfile {
  id: string;
  name: string;
  school: string;
  grade: number;
  classNum: number;
  studentNum: number;
  track: string; // '인문' | '자연' | '일반' | '통합'
  memo?: string;
  records: CourseRecord[];
}

export type ConversionMethod =
  | 'midpoint'
  | 'conservative'
  | 'optimistic'
  | 'busan'
  | 'gyeonggi'
  | 'gwangju'
  | 'average';

export interface GradeSummary {
  term: string;
  totalUnits: number;
  weightedGpa5: number;
  unweightedGpa5: number;
  weightedGpa9: number;
  unweightedGpa9: number;
  courseCount: number;
  avgRawScore: number;
}

export interface CategorySummary {
  category: SubjectCategory;
  totalUnits: number;
  weightedGpa5: number;
  weightedGpa9: number;
  avgRawScore: number;
  avgMeanScore: number;
  courseCount: number;
  ratioA: number;
}

export type SubjectGroupKey =
  | 'all' // 전과목
  | 'korean_math_eng_soc_sci_hist' // 국영수사과한국사
  | 'korean_math_eng_soc_hist' // 국영수사(한국사)
  | 'korean_math_eng_sci'; // 국영수과

export interface CombinationGradeSummary {
  key: SubjectGroupKey;
  label: string;
  description: string;
  totalUnits: number;
  courseCount: number;
  weightedGpa5: number;
  unweightedGpa5: number;
  weightedGpa9: number;
  unweightedGpa9: number;
  avgRawScore: number;
}
