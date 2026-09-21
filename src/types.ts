export type SubjectKey =
  | 'korean'
  | 'math'
  | 'english'
  | 'history'
  | 'elective1'
  | 'elective2';

export interface SubareaScore {
  n: string; // 영역명 (예: 어휘·개념, 사실적 이해 등)
  m: number; // 배점 (max)
  s: number; // 득점 (score)
  natAvg: number; // 전국 평균 (national average)
}

export interface SubjectScore {
  name?: string; // 선택과목명 (예: 생활과 윤리, 사회문화, 물리학Ⅰ 등)
  raw?: number; // 원점수 (성적일람표 등록 시 선택 사항)
  rawMax?: number; // 배점 (100 또는 50)
  standard?: number; // 표준점수
  percentile?: number; // 백분위
  grade: number; // 등급 (1~9)
  classRank?: string; // 학급 석차 (예: 3/19)
  schoolRank?: string; // 학교 석차 (예: 40/159)
  sub?: SubareaScore[]; // 세부영역 득점률 데이터
}

export interface ExamRecord {
  id: string;
  studentId: string;
  studentName: string;
  label: string; // 회차 이름 (예: 2026년 3월 고3 전국연합학력평가)
  examDate: string; // YYYY-MM-DD
  subjects: Partial<Record<SubjectKey, SubjectScore>>;
  weakItems: Partial<Record<SubjectKey, number[]>>;
}

export interface Student {
  id: string;
  name: string;
  school?: string;
  grade?: string; // 1, 2, 3 (선택)
  class?: string; // 선택
  number?: string; // 선택
  track?: '인문' | '자연'; // 계열 ('인문' | '자연')
  note?: string; // 학생별 목표/전형 메모
}

export interface SubjectConfig {
  key: SubjectKey;
  name: string;
  full: string;
  color: string;
  hasPct: boolean;
  hasSub: boolean;
  subareas: string[];
}

export interface AIReportSubject {
  subjectKey: SubjectKey;
  headline: string;
  bullets: string[];
}

export interface AIReportEntry {
  status: 'idle' | 'loading' | 'done' | 'error';
  subjects?: AIReportSubject[];
  message?: string;
  generatedAt?: string;
}

export type CompareBasis = 'cohort' | 'national';

export interface ItemBlueprintItem {
  from?: number;
  to?: number;
  items?: number[];
  rangeText?: string;
  label: string;
  category?: string;
  concept?: string;
  description?: string;
}
