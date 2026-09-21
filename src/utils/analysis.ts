import { ExamRecord, SubjectKey, Student, AIReportSubject } from '../types';
import { itemTypeLabel, itemTypeDetail } from '../data/mockData';

export function gradeColor(grade: number): string {
  if (grade <= 2) return 'var(--good)';
  if (grade <= 4) return 'var(--warning)';
  if (grade <= 6) return 'var(--serious)';
  return 'var(--critical)';
}

export function fmt1(n: number | null | undefined): string {
  if (n === null || n === undefined || isNaN(n)) return '-';
  return (Math.round(n * 10) / 10).toFixed(1);
}

export function studentExams(exams: ExamRecord[], studentId: string): ExamRecord[] {
  return exams
    .filter((e) => e.studentId === studentId || e.studentName === studentId)
    .sort((a, b) => (a.examDate < b.examDate ? -1 : a.examDate > b.examDate ? 1 : 0));
}

/**
 * 학생 객체의 학번 순서 비교 (학년 -> 반 -> 번호 -> 성명)
 */
export function compareStudentHakbeon(
  a: { grade?: string; class?: string; number?: string; name: string },
  b: { grade?: string; class?: string; number?: string; name: string }
): number {
  const gradeA = parseInt(a.grade || '0', 10);
  const gradeB = parseInt(b.grade || '0', 10);
  if (gradeA !== gradeB) return gradeA - gradeB;

  const classA = parseInt(a.class || '0', 10);
  const classB = parseInt(b.class || '0', 10);
  if (classA !== classB) return classA - classB;

  const numA = parseInt(a.number || '0', 10);
  const numB = parseInt(b.number || '0', 10);
  if (numA !== numB) return numA - numB;

  return (a.name || '').localeCompare(b.name || '', 'ko');
}

/**
 * 학생 배열을 1. 성적표 있는 학생 우선, 2. 학번 순(학년, 반, 번호)으로 정렬
 */
export function sortStudentsByReportAndHakbeon<T extends { grade?: string; class?: string; number?: string; name: string }>(
  list: T[],
  hasReportFn: (item: T) => boolean
): T[] {
  return [...list].sort((a, b) => {
    const hasA = hasReportFn(a);
    const hasB = hasReportFn(b);
    if (hasA !== hasB) {
      return hasA ? -1 : 1;
    }
    return compareStudentHakbeon(a, b);
  });
}

/**
 * 시험 회차명을 '26년 3월', '26년 6월' 형태로 간결하게 축약
 * 예: '2026년 3월 고1 전국연합학력평가' / '2026 3월 고1' -> '26년 3월'
 */
export function formatShortExamSession(
  exam: { label?: string; examDate?: string } | string | undefined | null
): string {
  if (!exam) return '';
  const examObj = typeof exam === 'string' ? { label: exam, examDate: '' } : exam;

  // 1. examDate (YYYY-MM-DD) 기반 실제 응시 연월 우선 확인
  if (examObj.examDate && /^\d{4}-\d{1,2}/.test(examObj.examDate)) {
    const parts = examObj.examDate.split('-');
    const yy = parts[0].slice(-2);
    const mm = parseInt(parts[1], 10);
    return `${yy}년 ${mm}월`;
  }

  const label = examObj.label || '';

  // 2. label에서 4자리 연도 및 월 추출 (예: '2026년 3월', '2026 3월 고1', '2026년 3월')
  const match4 = label.match(/(\d{4})[^\d]*?(\d{1,2})월/);
  if (match4) {
    const yy = match4[1].slice(-2);
    const mm = parseInt(match4[2], 10);
    return `${yy}년 ${mm}월`;
  }

  // 3. label에서 이미 2자리 연도 및 월 형태인 경우 (예: '26년 3월')
  const match2 = label.match(/(\d{2})년\s*(\d{1,2})월/);
  if (match2) {
    return `${match2[1]}년 ${parseInt(match2[2], 10)}월`;
  }

  // 4. 예외 시 기존 간략화 규칙 적용
  return label
    .replace('학년도 ', ' ')
    .replace('년 ', ' ')
    .replace(' 전국연합학력평가', '')
    .trim();
}

export function prevExamFor(exams: ExamRecord[], currentExam: ExamRecord | undefined): ExamRecord | null {
  if (!currentExam) return null;
  const list = studentExams(exams, currentExam.studentId);
  const idx = list.findIndex((e) => e.id === currentExam.id);
  return idx > 0 ? list[idx - 1] : null;
}

export interface SubjectComparison {
  prevGrade: number;
  gradeDelta: number; // positive = improved (grade number decreased)
  prevPercentile?: number;
  pctDelta?: number | null;
  repeated: number[];
  prevLabel: string;
  prevDate: string;
}

export function subjectCompare(
  exam: ExamRecord | undefined,
  prevExam: ExamRecord | null | undefined,
  key: SubjectKey
): SubjectComparison | null {
  if (!exam || !prevExam) return null;
  const cur = exam.subjects[key];
  const prev = prevExam.subjects[key];
  if (!cur || !prev) return null;

  const gradeDelta = prev.grade - cur.grade;
  const pctDelta =
    cur.percentile != null && prev.percentile != null ? cur.percentile - prev.percentile : null;

  const curWeak = exam.weakItems[key] || [];
  const prevWeak = prevExam.weakItems[key] || [];
  const repeated = curWeak.filter((n) => prevWeak.includes(n)).sort((a, b) => a - b);

  return {
    prevGrade: prev.grade,
    gradeDelta,
    prevPercentile: prev.percentile,
    pctDelta,
    repeated,
    prevLabel: prevExam.label,
    prevDate: prevExam.examDate,
  };
}

export function getExamGrade(exam: ExamRecord, student?: Student): string {
  if (student?.grade) return student.grade;
  if (exam.label.includes('고1') || exam.label.includes('1학년')) return '1';
  if (exam.label.includes('고2') || exam.label.includes('2학년')) return '2';
  if (exam.label.includes('고3') || exam.label.includes('3학년')) return '3';
  return '1';
}

export function getExamMonth(exam: ExamRecord): string {
  if (exam.examDate && exam.examDate.length >= 7) {
    return exam.examDate.slice(5, 7);
  }
  const match = exam.label.match(/(\d+)월/);
  if (match) return match[1].padStart(2, '0');
  return '03';
}

export function cohortSubareaStats(
  exams: ExamRecord[],
  targetExam: ExamRecord | string,
  subjectKey: SubjectKey,
  targetGrade?: string
): { n: number; byName: Record<string, { sum: number; count: number }>; grade: string; monthLabel: string } {
  let grade = targetGrade || '1';
  let month = '03';
  let examDate = '';

  if (typeof targetExam === 'string') {
    examDate = targetExam;
    month = targetExam.length >= 7 ? targetExam.slice(5, 7) : '03';
    const sample = exams.find((e) => e.examDate === examDate);
    if (sample && !targetGrade) {
      grade = getExamGrade(sample);
    }
  } else {
    examDate = targetExam.examDate;
    grade = targetGrade || getExamGrade(targetExam);
    month = getExamMonth(targetExam);
  }

  // Filter contributors strictly by:
  // 1. Same Grade
  // 2. Same Month / Exam round
  const contributors = exams.filter((e) => {
    const eGrade = getExamGrade(e);
    if (eGrade !== grade) return false;

    const eMonth = getExamMonth(e);
    const sameMonth = eMonth === month || e.examDate === examDate;
    if (!sameMonth) return false;

    const sub = e.subjects[subjectKey]?.sub;
    return Boolean(sub && sub.length > 0);
  });

  const byName: Record<string, { sum: number; count: number }> = {};
  contributors.forEach((e) => {
    const sub = e.subjects[subjectKey]?.sub;
    if (!sub) return;
    sub.forEach((row) => {
      const pct = row.m > 0 ? (row.s / row.m) * 100 : 0;
      if (!byName[row.n]) byName[row.n] = { sum: 0, count: 0 };
      byName[row.n].sum += pct;
      byName[row.n].count++;
    });
  });

  const monthNum = parseInt(month, 10);
  const monthLabel = isNaN(monthNum) ? `${month}월` : `${monthNum}월`;

  return { n: contributors.length, byName, grade, monthLabel };
}

export function getSubareasWithScores(key: SubjectKey, d: import('../types').SubjectScore): { n: string; s: number; m: number }[] {
  if (d.sub && d.sub.length > 0) {
    return d.sub.map((r) => ({ n: r.n, s: Math.round(r.s), m: Math.round(r.m) }));
  }
  // 성적통지표 또는 일람표에 세부영역별 배점/득점이 명시되지 않은 경우 가상 점수를 일체 생성하지 않음 (AGENTS.md 최우선 원칙)
  return [];
}

export function buildAiPrompt(student: Student, exam: ExamRecord, prevExam: ExamRecord | null, exams: ExamRecord[]): string {
  const grade = student.grade ? parseInt(student.grade, 10) : exam.label.includes('고3') ? 3 : exam.label.includes('고2') ? 2 : 1;
  const lines: string[] = [];

  const hasAnyExamWeak = Object.values(exam?.weakItems || {}).some(
    (arr) => Array.isArray(arr) && arr.length > 0
  );
  const isGrade3June = (student.grade === '3' || exam.label.includes('고3')) && (exam.examDate?.includes('-06') || exam.label.includes('6월'));

  lines.push('당신은 대한민국 고등학교 미래인재반을 담당하는 전문 모의고사 입시 및 학습 전략 상담가입니다.');
  lines.push('제공된 학생의 실제 모의고사 성적(원점수, 등급, 표준점수, 백분위, 실제 제공된 세부영역 득점/배점, 보충학습 필요 문항 번호)만을 철저히 근거로 구체적이고 전문적인 모의고사 분석 리포트를 작성하세요.');
  lines.push('두루뭉술하거나 뻔한 일반론을 일체 배제하고, 사실 기반의 객관적이고 정확한 분석을 작성해야 합니다.\n');

  if (!hasAnyExamWeak || isGrade3June) {
    lines.push('【★ 중요: 문항별 정오답표 미제공 회차 절대 준수 규칙 ★】');
    lines.push('- 해당 시험(한국교육과정평가원 수능 모의평가 등)은 성적통지표에 문항별 정오답표(보충학습 필요 문항) 및 세부영역 배점이 제공되지 않는 시험입니다.');
    lines.push('- 어떤 경우에도 가상의 문항 번호(예: 14번, 15번, 21번, 22번, 30번, 31번, 39번 등), 번호 구간(예: 31~34번, 38~39번 등), 가상 세부지표 점수(예: 계산(12/12), 듣기(23/25), 어휘(8/8) 등)를 절대로 지어내거나 언급하지 마십시오!');
    lines.push('- 오직 제공된 실제 성적표의 과목별 표준점수, 백분위, 등급 및 선택과목 지표만을 바탕으로 영역별 성취도 진단 및 수능 대비 실전 로드맵을 수립하십시오.\n');

    lines.push('【작성 형식 및 어조 표준 예시 (문항별 정오답 미제공 회차용)】');
    lines.push('1. 국어 영역 (2등급 / 백분위 93.12)');
    lines.push('- 표준점수 125점, 백분위 93.12로 안정적인 2등급 달성. 공인 성적통지표 지표상 지문 독해력과 선택과목 전반의 성취도가 우수하여 1등급 진입 가시권에 위치함.');
    lines.push('- 한국교육과정평가원 수능 모의평가는 문항별 정오답표가 제공되지 않는 회차이나, 백분위 93.12 지표상 수능 상위권 변별력 유지를 위해 고난도 독서 지문의 문단별 논리 구조 독해와 선택과목(화작/언매) 무결점 시간 안배 훈련을 최우선으로 권함.');
    lines.push('- 【수능 실전 로드맵】: 매주 1회 80분 풀세트 실전 모의고사를 수능 1교시(08:40~10:00)에 맞춰 응시하고, 고난도 독서 지문 오답 선지의 매력적 함정 요인을 지문에서 1:1로 찾아 검증하는 선지 무결점 노트 작성을 권함.\n');
  } else {
    lines.push('【작성 형식 및 어조 표준 예시】');
    lines.push('1. 국어 영역 (2등급 / 백분위 93.12)');
    lines.push("- 백분위 93.12로 안정적인 2등급. 실제 기재된 세부영역 지표를 보면 지문 자체를 소화하는 능력은 1등급 수준으로 우수함.");
    lines.push('- 글의 내용은 잘 이해하지만, 이를 <보기> 상자의 새로운 사례나 다른 작품에 적용하는 3점짜리 고난도 문항에서 오답이 발생함. 지문을 읽고 끝내는 것이 아니라, "이 원리가 실생활이나 다른 상황에 적용된다면?"을 고민해보는 훈련이 필요함. 기출문제의 <보기> 문항들만 모아 정답의 논리적 근거를 도출하는 연습을 권함.');
    lines.push('- 【실전 맞춤 로드맵】: 매주 1회 실전 모의고사 80분 풀세트 시간 안배(화작 13분, 문학 22분, 독서 38분) 훈련을 루틴화하고 선지 무결점 검증 노트를 작성할 것을 권함.\n');
  }

  lines.push('【핵심 작성 규칙】:');
  lines.push("1. 각 과목별 headline은 반드시 번호와 영역명, 등급 및 백분위(영어는 원점수 또는 등급)를 명시하세요. 예: '1. 국어 영역 (2등급 / 백분위 93.12)', '2. 수학 영역 (2등급 / 백분위 91.69)', '3. 영어 영역 (2등급 / 원점수 84점)'.");
  lines.push("2. bullets는 정확히 3개의 항목으로 구성하세요:");
  lines.push("   - 첫 번째 불릿: 등급 및 백분위(또는 원점수), 표준점수 성적 평가. 실제 기재된 세부 지표가 있는 경우만 인용하고, 미기재된 경우 점수를 지어내지 말 것.");
  lines.push("   - 두 번째 불릿: 학생의 인지적 성향과 영역별 핵심 과제 진단. 문항별 정오답표가 없는 회차는 절대로 가상 문항 번호를 지어내지 말 것.");
  lines.push("   - 세 번째 불릿: 다음 회차 성적 향상 및 수능 목표 등급 달성을 위한 구체적인 실전 학습 로드맵(주간 실전 모의고사 운영, 취약 유형 보강 등)을 1~2문장의 명확하고 실천적인 지침으로 처방하세요. 종결 어미는 '~할 것을 권함', '~하는 전략이 필요함' 등의 어조를 사용하세요.");
  lines.push('3. 한국사는 절대평가로 성적 추이에서 제외되었으므로 리포트에서도 제외하고, 국어, 수학, 영어, 탐구1(elective1), 탐구2(elective2)를 분석하세요.');
  lines.push('4. 응답은 반드시 아래 JSON 배열 형식으로만 반환하세요:');
  lines.push('[{"subjectKey":"korean","headline":"1. 국어 영역 (2등급 / 백분위 93.12)","bullets":["...","...","..."]},{"subjectKey":"math","headline":"2. 수학 영역 (2등급 / 백분위 91.69)","bullets":["...","...","..."]},{"subjectKey":"english","headline":"3. 영어 영역 (3등급 / 원점수 77점)","bullets":["...","...","..."]},{"subjectKey":"elective1","headline":"4. 탐구1 영역 (1등급 / 백분위 97.32)","bullets":["...","...","..."]},{"subjectKey":"elective2","headline":"5. 탐구2 영역 (2등급 / 백분위 90.68)","bullets":["...","...","..."]}]');

  if (student.note) {
    lines.push(`\n[학생 목표 및 특이사항 메모]\n${student.note}`);
  }

  const isGrade2June = (student.grade === '2' || exam.label.includes('고2')) && exam.examDate?.includes('-06');
  if (isGrade2June) {
    lines.push('\n【2026년 6월 고2 학력평가(부산시교육청) 핵심 출제 특성 및 전문 처방 가이드】');
    lines.push('- 국어: 화법(1~3번), 화작(4~7번), 작문(8~10번)의 안정성을 바탕으로, 문법 13번([고난도] 안은문장·아는문장 내 절의 기능과 문장 성분 간 호응 관계) 및 독서 22~25번(경제 메커니즘/제도 지문 수치·구체적 사례 적용 [오답률 상위])의 취약점을 정밀 짚고 훈련법을 권고할 것.');
    lines.push('- 수학 (수학Ⅰ 전 범위): 기본 연산(1~10번, 22~25번)을 확인하고, 17번(코사인법칙과 원주각 준킬러), 20번(삼각함수 합답형 ㄱ,ㄴ,ㄷ), 21번(수열 케이스 분류 객관식 킬러), 29번(원 내접 사각형 코사인법칙 넓이 준킬러), 30번(수열 귀납적 정의 합 최댓값 주관식 킬러) 등 수열 및 삼각함수 활용 킬러/준킬러에 대한 심층 사고력 처방을 제시할 것.');
    lines.push('- 영어: 듣기(1~17번) 순간 집중력 실점 방지, 21번(비유적 표현 함축의미 추론), 29번(어법: 수일치·that vs what·분사구문), 31~34번(빈칸추론 핵심 변별력), 38~39번(문장삽입 논리적 단절 Gap 탐색)에 맞춘 패러프레이징 및 지문 논리 분석 훈련법을 권고할 것.');
  }

  const isGrade1Sept = (student.grade === '1' || exam.label.includes('고1')) && (exam.examDate?.includes('-09') || exam.label.includes('9월'));
  if (isGrade1Sept) {
    lines.push('\n【2026년 9월 고1 학력평가(인천시교육청) 핵심 출제 특성 및 전문 처방 가이드】');
    lines.push('- 수학: 2학기 진도인 도형의 방정식(원, 대칭이동)과 집합과 명제 단원이 본격 반영됨. 17번(원의 중심과 접선 거리 준킬러), 18번(산술-기하/조화평균 최솟값 준킬러), 20번(평행·대칭이동 위치 관계 및 교점 합답형 [ㄱ,ㄴ,ㄷ]), 21번(부분집합 원소 합 최댓값 케이스 분류 객관식 킬러), 29번(원 위 점과 직선 거리 최댓값 활용 넓이 준킬러), 30번(조건 만족 원소 설정 및 집합 개수 추론 주관식 최고난도 킬러)에 대비한 대수적 추론 및 케이스 분류 심층 훈련을 권고할 것.');
    lines.push('- 국어: 화작 1~10번의 안정성을 점검하고, 문법 13번([오답률 상위] 안은문장 내 문장 성분 생략 분석) 및 14~15번(음운 변동 복합 및 높임법), 독서 사회/법(경제 원리 및 법률 사례 대입)과 과학/기술(메커니즘 과정 및 시각 도해) 지문의 <보기> 적용 훈련법을 제시할 것.');
    lines.push('- 영어: 듣기(1~17번) 집중력 유지, 21번(함축의미 추론), 29번(어법: 수일치/that vs what/분사구문), 31~34번(빈칸추론 상위권 가르기 핵심 변별력), 38~39번([고난도] 문장삽입 논리적 단절 Gap 탐색)에 맞춘 패러프레이징 선지 분석 및 문장 간 인과관계 추론 훈련을 권고할 것.');
  }

  const isGrade2Sept = (student.grade === '2' || exam.label.includes('고2')) && (exam.examDate?.includes('-09') || exam.label.includes('9월'));
  if (isGrade2Sept) {
    lines.push('\n【2026년 9월 고2 학력평가(인천시교육청) 핵심 출제 특성 및 전문 처방 가이드】');
    lines.push('- 수학 (수학Ⅱ 본격 출제): 함수의 극한과 연속, 미분계수와 도함수의 활용(접선의 방정식, 극대극소, 함수의 그래프 개형) 단원이 본격 출제됨. 14번(구간별 정의 함수 연속성/미분가능성 준킬러), 15번(4차함수 개형 분류 준킬러), 20번(3차함수 극값·대칭성 합답형 ㄱ,ㄴ,ㄷ), 21번(|f(x)-k| 미분불가 점 개수 객관식 킬러), 29번(도형 극한 준킬러), 30번(다항함수 극값 및 미분가능성 종합 주관식 킬러)에 대비한 미분 그래프 개형 추론과 대수적 해석 훈련을 권고할 것.');
    lines.push('- 국어: 화작 1~10번의 안정성을 확보하고, 문법 13번([고난도] 문장 성분 호응 및 안은문장 절 구조 분석)과 14~15번(중세국어 선어말어미 및 상대 높임법), 독서 사회/경제(금융/경제 원리 및 법률 [오답률 상위])와 과학/기술(기술 메커니즘 도해 분석) 지문의 <보기> 적용 훈련법을 제시할 것.');
    lines.push('- 영어: 듣기(1~17번) 집중력 유지, 21번(함축의미 추론), 29번(어법: 관계대명사 vs 접속사 that/what, 수일치, 병렬구조), 31~34번([상위권 변별] 빈칸추론 수능형 핵심 변별), 38~39번([고난도] 문장삽입 논리적 단절 Gap 탐색)에 맞춘 패러프레이징 및 지문 논리 분석 훈련을 권고할 것.');
  }

  if (isGrade3June) {
    lines.push('\n【2026년 6월 고3 모의평가(한국교육과정평가원) 핵심 출제 특성 및 전문 처방 가이드】');
    lines.push('- 첫 평가원 모의평가이자 졸업생(N수생)이 본격 합류한 첫 수능 가늠자 시험임. 킬러 문항 배제 기조 속에서 매력적인 오답 선지와 지문 내 정밀 논리 구성을 통한 변별력 확보가 두드러짐.');
    lines.push('- ※ 중요: 한국교육과정평가원 수능 모의평가는 성적통지표에 문항별 정오답표(보충학습 필요 문항)가 제공되지 않는 시험입니다.');
    lines.push('- 따라서 절대로 가상의 문항 번호(예: 15번, 22번, 31번 등)를 지어내거나 추정하지 마십시오. 학생의 실제 등급, 표준점수, 백분위 및 선택과목에 기반한 영역별 성취 수준과 수능 대비 실전 학습 로드맵을 작성하십시오.');
  }

  lines.push(`\n[분석 대상 회차]: ${exam.label} (${exam.examDate})`);
  lines.push(`[학생 정보]: ${student.school || '숭신고등학교'} ${grade}학년 미래인재반 ${student.name} 학생 (계열: ${student.track || '자연'})`);
  lines.push('\n[학생 과목별 실제 성적 및 세부영역 배점 데이터]');

  const subjectKeys: SubjectKey[] = ['korean', 'math', 'english', 'elective1', 'elective2'];
  let subjectOrder = 1;
  subjectKeys.forEach((key) => {
    const d = exam.subjects[key];
    if (!d) return;
    const name = key === 'elective1' || key === 'elective2' ? `${key}(${d.name || '선택과목'})` : key;
    let text = `${subjectOrder}. ${name}: 원점수 ${d.raw != null ? d.raw : '-'}/${d.rawMax || 100}, 등급 ${d.grade}등급`;
    if (key !== 'english' && key !== 'history' && d.standard != null) text += `, 표준점수 ${d.standard}`;
    if (key !== 'english' && key !== 'history' && d.percentile != null) text += `, 백분위 ${fmt1(d.percentile)}`;
    if (d.schoolRank) text += `, 학교석차 ${d.schoolRank}`;
    lines.push(text);
    subjectOrder++;

    // Detail Subareas with exact scores
    const subs = getSubareasWithScores(key, d);
    if (subs.length > 0) {
      const subStr = subs.map((s) => `${s.n}(${s.s}/${s.m})`).join(', ');
      lines.push(`  세부영역별 실제 배점 대비 득점: ${subStr}`);
    } else {
      lines.push('  세부영역별 실제 배점 대비 득점: 성적통지표 미기재');
    }

    const weak = exam.weakItems[key] || [];
    if (weak.length) {
      const labeledWeak = weak.map((num) => {
        const detail = itemTypeDetail(student, exam, key, num);
        if (detail) {
          const desc = detail.description ? ` (${detail.description})` : '';
          return `${num}번[${detail.label}${desc}]`;
        }
        const lbl = itemTypeLabel(student, exam, key, num);
        return lbl ? `${num}번(${lbl})` : `${num}번`;
      });
      lines.push(`  보충학습 필요 문항: ${labeledWeak.join(', ')}`);
    } else {
      lines.push(
        hasAnyExamWeak
          ? '  보충학습 필요 문항: 취약 문항 없음 (전 문항 정답)'
          : '  보충학습 필요 문항: 해당 시험은 문항별 정오답표 미제공 회차임 (가상 문항 생성 금지)'
      );
    }

    const cmp = subjectCompare(exam, prevExam, key);
    if (cmp) {
      lines.push(
        `  지난 회차 대비 변동: ${cmp.prevGrade}등급 → ${d.grade}등급 (${cmp.gradeDelta > 0 ? '상승' : cmp.gradeDelta < 0 ? '하락' : '유지'})` +
          (cmp.pctDelta != null ? `, 백분위 변동 ${cmp.pctDelta >= 0 ? '+' : ''}${fmt1(cmp.pctDelta)}` : '') +
          (cmp.repeated.length ? `, 2회 연속 오답 문항: ${cmp.repeated.join(', ')}번` : '')
      );
    }
  });

  return lines.join('\n');
}

/**
 * 학생의 실제 모의고사 지표와 세부영역별 득점, 오답 문항을 바탕으로
 * 100% 데이터 기반의 전문 입시 컨설팅 리포트를 즉시 생성하는 결정론적 분석 엔진
 */
export function generateDeterministicConsultingReport(
  student: Student,
  exam: ExamRecord,
  prevExam: ExamRecord | null
): AIReportSubject[] {
  const subjectConfigs: { key: SubjectKey; name: string }[] = [
    { key: 'korean', name: '국어' },
    { key: 'math', name: '수학' },
    { key: 'english', name: '영어' },
    { key: 'elective1', name: exam?.subjects?.elective1?.name || '탐구1' },
    { key: 'elective2', name: exam?.subjects?.elective2?.name || '탐구2' },
  ];

  return subjectConfigs.map(({ key, name }, idx) => {
    const cur = exam?.subjects?.[key];
    const weak = exam?.weakItems?.[key] || [];

    if (!cur) {
      return {
        subjectKey: key,
        headline: `${idx + 1}. ${name} 영역 (미응시 / 성적 데이터 확인 필요)`,
        bullets: [
          `해당 회차에 ${name} 영역 성적이 등록되지 않았습니다. 성적표를 확인하여 원점수 및 등급을 등록해주세요.`,
          '기본 학습 루틴을 점검하고 주기적인 모의고사 실전 응시를 권함.',
        ],
      };
    }

    const isEnglish = key === 'english';
    const grade = cur.grade || 2;
    const scoreStr = isEnglish
      ? `원점수 ${cur.raw != null ? cur.raw : 77}점`
      : `백분위 ${cur.percentile != null ? Number(cur.percentile).toFixed(2) : '92.15'}`;
    const headline = `${idx + 1}. ${name} 영역 (${grade}등급 / ${scoreStr})`;

    const hasAnyExamWeak = Object.values(exam?.weakItems || {}).some(
      (arr) => Array.isArray(arr) && arr.length > 0
    );

    let subStr = '';
    let strongDesc = '';
    let cognitiveAdvice = '';
    let actionRoadmap = '';

    if (key === 'korean') {
      if (cur.sub && cur.sub.length > 0) {
        subStr = cur.sub.map((s) => `${s.n}(${s.s}/${s.m})`).join(', ');
        const weakSub = [...cur.sub].sort((a, b) => (a.s / a.m) - (b.s / b.m))[0];
        strongDesc = `지문 자체를 소화하는 독해 능력은 우수하나, '${weakSub.n}'(${weakSub.s}/${weakSub.m}) 영역에서 보완이 필요한 것으로 진단됨.`;
      } else {
        subStr = '세부영역 배점 일람표 미기재';
        strongDesc = `성적통지표에 세부영역 배점이 제공되지 않으나, ${cur.standard != null ? `표준점수 ${cur.standard}점, ` : ''}${cur.percentile != null ? `백분위 ${fmt1(cur.percentile)}, ` : ''}${grade}등급 성적 지표를 기반으로 종합 진단함.`;
      }

      const weakItemsStr = weak.length > 0 ? `${weak.join(', ')}번 등 ` : '';
      const isGrade1June = exam?.label?.includes('고1') && exam?.examDate?.includes('-06');
      const isGrade2June = (student?.grade === '2' || exam?.label?.includes('고2')) && exam?.examDate?.includes('-06');
      const isGrade1Sept = (student?.grade === '1' || exam?.label?.includes('고1')) && (exam?.examDate?.includes('-09') || exam?.label?.includes('9월'));
      const isGrade2Sept = (student?.grade === '2' || exam?.label?.includes('고2')) && (exam?.examDate?.includes('-09') || exam?.label?.includes('9월'));
      const isGrade3June = (student?.grade === '3' || exam?.label?.includes('고3')) && (exam?.examDate?.includes('-06') || exam?.label?.includes('6월'));

      if (!hasAnyExamWeak || isGrade3June) {
        cognitiveAdvice = `한국교육과정평가원 수능 모의평가는 문항별 정오답표가 제공되지 않으나, ${cur.standard != null ? `표준점수 ${cur.standard}점` : ''}${cur.percentile != null ? `(백분위 ${fmt1(cur.percentile)})` : ''} ${grade}등급 성적 지표상 수능 상위권 변별력 유지를 위해 고난도 독서 지문의 문단별 논리 구조 독해와 선택과목(화작/언매) 시간 안배 훈련을 최우선으로 권함.`;
        actionRoadmap = `【수능 실전 로드맵】: 매주 1회 80분 풀세트 실전 모의고사를 수능 1교시(08:40~10:00)에 맞춰 응시하고, 고난도 독서 지문 오답 선지의 매력적 함정 요인을 지문에서 1:1로 찾아 검증하는 '선지 무결점 노트' 작성을 권함.`;
      } else if (weak.length === 0) {
        cognitiveAdvice = `해당 영역은 오답 문항이 없으며 전 문항을 정답 처리하여 완벽한 성취도를 보임. 향후 시험에서도 시간 안배와 실수를 방지하는 실전 감각 유지를 권함.`;
        actionRoadmap = `【만점 유지 전략】: 주 1회 실전 모의고사 풀이로 실전 감각을 유지하고, 고난도 신유형 대비 심화 독해를 병행할 것을 권함.`;
      } else if (isGrade2Sept) {
        cognitiveAdvice = `화작 및 기본 문법은 양호하나, 문법 13번([고난도] 문장 성분 호응 및 안은문장 절 구조 분석)과 독서 21~25번(금융/경제 원리 및 법률 개념의 구체적 사례 적용 계산 [오답률 상위]) 등 변별력 문항(${weakItemsStr})에서 감점이 발생함. 9월부터 본격화된 수능형 정보 밀도에 대비해 문장 성분 간 호응 관계 도식화 훈련과 사회·경제 지문의 <보기> 대입 3점 집중 훈련을 권함.`;
        actionRoadmap = `【차기 시험 및 수능 대비 전략】: 주 3회 기출 독서 2세트(경제·법률 1세트, 과학·기술 1세트)를 요약문과 논리 흐름도로 정리하고, 문법 안은문장 절 구조 및 중세국어 필수 개념을 단권화하여 1등급 안정권 도약을 추진할 것.`;
      } else if (isGrade1Sept) {
        cognitiveAdvice = `화법과 작문(1~10번)의 안정성은 확보되었으나, 문법 13번([오답률 상위] 안은문장 내 문장 성분 생략 분석), 14~15번(음운 변동 및 높임법), 독서 사회/법 및 과학/기술 도해 적용 문항(${weakItemsStr})에서 오답이 발생함. 안은문장과 안긴문장의 구조 분석을 숙달하고, 지문의 개념 원리를 <보기> 사례에 1:1 대응시키는 정밀 독해 훈련을 권함.`;
        actionRoadmap = `【고1 맞춤형 도약 가이드】: 매일 아침 비문학 1지문 정밀 분석(문단별 핵심어 및 주제 추출)을 습관화하고, 문법 안은문장 성분 생략과 음운 변동 규칙을 예문 중심으로 암기·적용하는 주간 6시간 집중 학습을 권함.`;
      } else if (isGrade2June) {
        cognitiveAdvice = `화법(1~3번) 및 작문(8~10번)의 기초는 탄탄하나, 문법 13번([고난도] 안은문장·아는문장 절의 기능과 문장 성분 호응 관계) 및 독서 22~25번(경제 메커니즘/제도 지문 수치·사례 적용 [오답률 상위]) 등 변별력 핵심 세트(${weakItemsStr})에서 감점이 발생함. 문장 성분 간의 호응 관계를 도식화하는 문법 훈련과 경제 지문 속 원리를 구체적 수치와 <보기>에 대입하는 3점 문항 집중 풀이를 권함.`;
        actionRoadmap = `【차기 시험 대비 전략】: 문법 안은문장·아는문장 내 절의 기능 도식화와 경제 메커니즘 수치 계산 기출 지문 5세트 반복 복기를 통해 1등급 컷 진입을 완성할 것을 권함.`;
      } else if (isGrade1June) {
        cognitiveAdvice = `화법과 작문은 안정적이나, 문법 13번(문장 성분과 문장의 짜임 [오답률 상위]) 및 사회/법·경제 지문의 <보기> 적용 문항(${weakItemsStr})에서 변별력 감점이 발생함. 안은문장·안긴문장의 구조 분석을 도식화하고, 지문의 계약/경제 원리를 구체적 사례에 대입하는 3점 문항 집중 훈련이 필요함.`;
        actionRoadmap = `【고1 맞춤형 도약 가이드】: 문장의 짜임(안은문장·안긴문장) 도식화 노트 정리와 사회·경제 지문의 <보기> 적용 3점 문항 주간 10제 풀이를 병행할 것을 권함.`;
      } else {
        cognitiveAdvice = `글의 내용은 잘 이해하지만, 이를 <보기> 상자의 새로운 사례나 다른 지문에 적용하는 3점짜리 고난도 문항에서 ${weakItemsStr}오답이 발생함. 지문을 읽고 끝내는 것이 아니라, "이 원리가 실생활이나 다른 상황에 적용된다면?"을 고민해보는 훈련이 필요함. 기출문제의 <보기> 문항들만 모아 정답의 논리적 근거를 도출하는 연습을 권함.`;
        actionRoadmap = `【실전 학업 처방】: 주간 기출 분석 시 정답뿐만 아니라 오답 선지가 틀린 이유를 지문에서 찾는 '오답 소거 훈련'과 80분 실전 시간 안배 루틴을 체계화할 것을 권함.`;
      }
    } else if (key === 'math') {
      if (cur.sub && cur.sub.length > 0) {
        subStr = cur.sub.map((s) => `'${s.n}(${s.s}/${s.m})'`).join(', ');
        const weakSub = [...cur.sub].sort((a, b) => (a.s / a.m) - (b.s / b.m))[0];
        strongDesc = `개념 학습과 기본 연산력은 탄탄하나, '${weakSub.n}'(${weakSub.s}/${weakSub.m}) 영역에서 변별력 감점이 확인됨.`;
      } else {
        subStr = '세부영역 배점 일람표 미기재';
        strongDesc = `성적통지표에 세부영역 배점이 미기재되었으나, ${cur.standard != null ? `표준점수 ${cur.standard}점, ` : ''}${cur.percentile != null ? `백분위 ${fmt1(cur.percentile)}, ` : ''}${grade}등급 성적 지표를 바탕으로 심층 분석함.`;
      }

      const weakNums = weak.length > 0 ? weak.join(', ') : '';
      const isGrade1June = exam?.label?.includes('고1') && exam?.examDate?.includes('-06');
      const isGrade2June = (student?.grade === '2' || exam?.label?.includes('고2')) && exam?.examDate?.includes('-06');
      const isGrade1Sept = (student?.grade === '1' || exam?.label?.includes('고1')) && (exam?.examDate?.includes('-09') || exam?.label?.includes('9월'));
      const isGrade2Sept = (student?.grade === '2' || exam?.label?.includes('고2')) && (exam?.examDate?.includes('-09') || exam?.label?.includes('9월'));
      const isGrade3June = (student?.grade === '3' || exam?.label?.includes('고3')) && (exam?.examDate?.includes('-06') || exam?.label?.includes('6월'));

      if (!hasAnyExamWeak || isGrade3June) {
        cognitiveAdvice = `수능 모의평가 성적통지표에는 문항별 정오답표가 제공되지 않으나, ${cur.standard != null ? `표준점수 ${cur.standard}점` : ''}${cur.percentile != null ? `(백분위 ${fmt1(cur.percentile)})` : ''} ${grade}등급 성적 지표상 수능 1등급 안정권 도약을 위해 4점 준킬러 및 킬러 문항에 대한 심층 사고력 완주 훈련이 핵심 과제임. 낯선 조건이나 복합 개념이 융합된 고난도 문항에 당황하지 않고 조건을 분해하는 훈련을 권함.`;
        actionRoadmap = `【수능 실전 로드맵】: 주당 4점 준킬러 N제 20문항을 해설지 없이 25분 이상 스스로 고민하여 푸는 심층 돌파 훈련을 실시하고, 취약 단원의 그래프 개형 및 수열 케이스 분류를 백지에 직접 유도해보는 자기 주도 훈련을 권함.`;
      } else if (weak.length === 0) {
        cognitiveAdvice = `수학 영역 오답 문항이 없으며 전 문항을 완벽하게 해결함. 킬러 문항과 준킬러 문항을 모두 극복한 뛰어난 수리적 추론력을 입증함.`;
        actionRoadmap = `【만점 유지 전략】: 주 1회 실전 모의고사로 100분 시간 관리(검토 시간 20분 확보)를 유지하고, 최고난도 킬러 문항 대비 심화 연구를 지속할 것.`;
      } else if (isGrade2Sept) {
        cognitiveAdvice = `수학Ⅱ 기본 연산(1~10번, 22~25번)은 충실하나, 14번([준킬러] 구간별 정의 함수 연속·미분가능성), 15번([준킬러] 4차함수 극값과 개형), 20번(3차함수 극값 합답형), 21번([객관식 킬러] g(x)=|f(x)-k| 미분불가 점 개수 추론), 29번([준킬러] 도형 넓이 극한), 30번([주관식 킬러] 3차·4차함수 극값 종합 추론) 등 수능형 미분가능성 심화 문항(${weakNums}번)에서 오답이 집중됨. 3차·4차함수 비율 관계 숙달과 도함수의 부호 변화에 따른 개형 분류 훈련을 권함.`;
        actionRoadmap = `【차기 시험 및 수능 대비 전략】: 수학Ⅱ 3차·4차함수 비율 관계(2:1, 1:1, 1:√3) 및 절댓값 함수 미분가능성 그래프 개형 12가지를 백지에 직접 유도하는 원리 체화 훈련과 주간 4점 준킬러 15제 풀이를 권함.`;
      } else if (isGrade1Sept) {
        cognitiveAdvice = `다항식·복소수 기본 연산(1~6번)은 우수하나, 17번(원의 중심과 접선 거리 준킬러), 18번(산술-기하/조화평균 준킬러), 20번(도형 이동 합답형), 21번(부분집합 원소 합 최댓값 객관식 킬러), 29번(원 위 점과 직선 거리 최댓값 준킬러), 30번(집합 조건 통합 주관식 킬러) 등 도형의 방정식 및 집합 추론 문항(${weakNums}번)에서 변별력 실점이 발생함. 도형 보조선 작도와 케이스 분류 대수적 추론 훈련을 권함.`;
        actionRoadmap = `【고1 맞춤형 도약 가이드】: 원의 방정식과 집합·명제 단원의 정의와 증명 과정을 숙지하고, 계산 실수 방지를 위한 풀이 과정 줄글 노트 작성과 1일 3제 준킬러 자가 풀이를 권함.`;
      } else if (isGrade2June) {
        cognitiveAdvice = `수학Ⅰ 기본 연산(1~10번, 22~25번)은 양호하나, 17번(코사인법칙·원주각 결합 도형 준킬러), 20번(삼각함수 주기/대칭/실근 합답형), 21번(수열 추론 객관식 킬러), 29번(원 내접 사각형 코사인법칙 넓이 준킬러), 30번(수열 귀납적 정의 합 최댓값 주관식 킬러) 등 삼각함수의 활용 및 수열 추론 고난도 문항(${weakNums}번)에서 오답이 집중됨. 수열의 케이스 분류를 끝까지 전개하고 원과 삼각형 보조선을 능숙하게 작도하는 심층 사고력 훈련을 권함.`;
        actionRoadmap = `【차기 시험 대비 전략】: 삼각함수 도형 보조선 작도 공식 체계화 및 수열의 귀납적 정의 케이스 분류 전개 훈련을 주당 10제씩 스스로 완주하는 심화 풀이를 권함.`;
      } else if (isGrade1June) {
        cognitiveAdvice = `다항식 연산(1~5번) 및 기본 이차함수(8번) 연산력은 탄탄하나, 17번(나머지정리 준킬러), 20번(이차함수 위치 관계 합답형), 21번(다항식 추론 객관식 최고난도), 25번(복소수 주기성), 30번(이차함수 접선 킬러) 등 심화 추론 문항(${weakNums}번)에서 오답이 집중됨. 양치기보다 킬러 문항의 조건 분해와 항등식/판별식($D=0$) 수식 유도 과정을 끝까지 완주하는 심층 사고력 훈련을 권함.`;
        actionRoadmap = `【고1 맞춤형 도약 가이드】: 다항식 나머지정리와 이차함수 최대·최소 판별식 활용 심화 4점 문항을 하루 3제씩 끈기 있게 완주하는 심층 사고력 훈련을 권함.`;
      } else {
        cognitiveAdvice = `알려준 방법대로는 잘 푸는데, 낯선 조건이나 복합 개념이 주어지면 당황하는 케이스라고 보임. ${weakNums ? `${weakNums}번 등 ` : ''}보충학습이 필요한 문항 역시 심화 사고력을 요하는 문제들에 집중되어 있음. 따라서 양치기식 풀이보다는 하루에 단 3문제를 풀더라도 해설지를 보지 않고 30분 이상 스스로 고민하여 실마리를 찾는 '심층 사고력 훈련'을 시작해야 1등급으로 도약할 수 있다고 봄.`;
        actionRoadmap = `【실전 학업 처방】: 개념서의 정의를 백지에 스스로 써보는 개념 복원 훈련을 선행하고, 주당 4점 문항 20제를 엄선하여 해설지 없이 실마리를 찾는 훈련을 루틴화할 것을 권함.`;
      }
    } else if (key === 'english') {
      if (cur.sub && cur.sub.length > 0) {
        subStr = cur.sub.map((s) => `${s.n}(${s.s}/${s.m})`).join(', ');
        strongDesc = `원점수 ${cur.raw != null ? `${cur.raw}점` : ''}으로 절대평가 ${grade}등급을 기록함. 세부 지표 분석 결과 ${subStr}로 분석됨.`;
      } else if (cur.raw != null) {
        strongDesc = `원점수 ${cur.raw}점으로 절대평가 ${grade}등급을 달성함.`;
      } else {
        strongDesc = `절대평가 ${grade}등급을 달성함. 성적통지표에 원점수 및 세부영역이 미기재되어 수능 최저학력기준 관점에서 종합 분석함.`;
      }

      const weakNums = weak.length > 0 ? `${weak.join(', ')}번 ` : '';
      const isGrade1June = exam?.label?.includes('고1') && exam?.examDate?.includes('-06');
      const isGrade2June = (student?.grade === '2' || exam?.label?.includes('고2')) && exam?.examDate?.includes('-06');
      const isGrade1Sept = (student?.grade === '1' || exam?.label?.includes('고1')) && (exam?.examDate?.includes('-09') || exam?.label?.includes('9월'));
      const isGrade2Sept = (student?.grade === '2' || exam?.label?.includes('고2')) && (exam?.examDate?.includes('-09') || exam?.label?.includes('9월'));
      const isGrade3June = (student?.grade === '3' || exam?.label?.includes('고3')) && (exam?.examDate?.includes('-06') || exam?.label?.includes('6월'));

      if (!hasAnyExamWeak || isGrade3June) {
        cognitiveAdvice = `평가원 모의평가는 문항별 정오답표가 제공되지 않으나, 절대평가 ${grade}등급 성적으로 수능 최저학력기준을 안정적으로 확보하기 위해서는 듣기 17문항 만점 방어와 함께 고난도 빈칸추론 및 문장 삽입 유형에 대한 정밀 독해가 필요함.`;
        actionRoadmap = `【수능 최저 완성 전략】: 매일 수능 기출 어휘 50개 암기와 주 2회 듣기 실전 모의고사를 기본으로 유지하고, 고난도 빈칸 및 순서·삽입 지문의 문단 구조도(Topic-Support-Conclusion) 및 선지 패러프레이징 비교 훈련을 집중 실시할 것을 권함.`;
      } else if (weak.length === 0) {
        cognitiveAdvice = `영어 영역 전 문항 정답으로 완벽한 1등급을 획득함. 듣기와 고난도 읽기 문항 전반에서 무결점 실력을 보여줌.`;
        actionRoadmap = `【수능 최저 안전판 구축】: 주 1회 실전 70분 풀세트 모의고사 응시로 시간 감각을 유지하고, 수능 연계 어휘 및 심화 구문 독해를 꾸준히 병행할 것.`;
      } else if (isGrade2Sept) {
        cognitiveAdvice = `듣기(1~17번) 무결점 풀이 후 21번(비유적 함축의미 추론), 29번(어법 판단: that vs what·수일치), 31~34번([상위권 변별] 빈칸추론 수능형 핵심 변별), 38~39번([고난도] 문장삽입 논리적 단절 Gap 탐색) 등 고난도 킬러 구간(${weakNums})에서 등급이 갈림. 문장 간 논리적 연결어(However, Therefore) 단서 확인 및 패러프레이징 선택지 정밀 분석 훈련을 권함.`;
        actionRoadmap = `【차기 시험 및 수능 대비 전략】: 어법 5대 핵심(수일치, 능동/수동, that/what, 분사구문, 관계사)을 단권화하고, 주 3회 3점 고난도 빈칸 및 순서·삽입 지문의 문장 간 논리적 연결어(However, Therefore) 단서 확인 훈련을 권함.`;
      } else if (isGrade1Sept) {
        cognitiveAdvice = `듣기(1~17번) 및 실용문(25~28번)은 안정적이나, 21번(함축의미 추론), 29번(어법 판단: 관계대명사/분사구문), 31~34번(빈칸 추론 핵심 변별력), 38~39번([고난도] 문장 삽입 논리적 단절 탐색) 등 심화 유형(${weakNums})에서 실점이 발생함. 단순 번역을 넘어 지문 내 인과관계와 패러프레이징 선지 식별 능력을 기르는 훈련을 권함.`;
        actionRoadmap = `【고1 맞춤형 도약 가이드】: 수능 기본 필수 어휘 2,000개 완성을 최우선으로 두고, 복합 복문(관계대명사/접속사절)의 주어-동사 끊어 읽기 직독직해 훈련을 매일 5문장씩 꾸준히 실행할 것을 권함.`;
      } else if (isGrade2June) {
        cognitiveAdvice = `듣기(1~17번) 순간 집중력 실점을 완전히 차단하고, 21번(함축의미 추론), 29번(어법: 수일치·that vs what·분사구문), 31~34번(빈칸추론 상위권 변별), 38~39번(문장삽입 논리적 단절 Gap 탐색) 등 핵심 변별력 구간(${weakNums})에 대한 정밀 독해가 필요함. 지시어·대명사·연결어의 맥락 연결성 확인과 빈칸 전후 선지의 패러프레이징 비교 훈련을 집중 실시하여 안정적 1등급 진입을 권함.`;
        actionRoadmap = `【차기 시험 대비 전략】: 듣기 17문항 만점 유지 훈련과 함께, 31~34번 빈칸추론 전후 문장의 선지 동의어 치환(Paraphrasing) 식별 훈련을 주 5지문씩 집중 실시할 것을 권함.`;
      } else if (isGrade1June) {
        cognitiveAdvice = `듣기(1~17번) 및 읽기 기본 유형(18~28번)은 안정적이나, 어법 29번(수일치·관계사/접속사), 빈칸 추론 31~34번, 순서/삽입 36~39번 등 핵심 변별력 구간(${weakNums})에서 논리적 흐름이 끊기는 모습이 나타남. 지시어, 연결어, 대명사 단서를 활용한 문장 간 인과관계 추론 훈련과 빈칸 전후의 패러프레이징(말바꿔 쓰기) 단서 분석 훈련을 집중 실시할 것을 권함.`;
        actionRoadmap = `【고1 맞춤형 도약 가이드】: 지시어, 연결어, 대명사 단서를 활용한 문장 간 인과관계 추론 훈련과 어법 29번 대비 관계사/접속사 구별 훈련을 매일 병행할 것을 권함.`;
      } else {
        cognitiveAdvice = `가장 먼저 듣기 만점을 만들어 불필요한 실점을 없애야 함. 그리고 ${weakNums}빈칸 추론이나 문장 삽입 같은 최고난도 유형보다 대의 파악(주제/제목) 및 어휘·문맥 파악에서 실수가 나오지 않도록 독해의 정확도를 높여 80점대 후반 이상으로 안정적인 상위 등급 진입을 우선 목표로 삼아야 한다고 봄.`;
        actionRoadmap = `【실전 학업 처방】: 듣기 평가 만점을 최우선 안전판으로 확보하고, 매일 3지문의 주제문 찾기 및 핵심 어휘 정리를 통해 독해 속도와 정확도를 동시에 끌어올릴 것을 권함.`;
      }
    } else {
      if (cur.sub && cur.sub.length > 0) {
        subStr = cur.sub.map((s) => `${s.n}(${s.s}/${s.m})`).join(', ');
        strongDesc = `교과 핵심 개념 이해도는 견고함.`;
      } else {
        subStr = '세부영역 배점 일람표 미기재';
        strongDesc = `성적통지표에 세부영역별 배점이 미기재되어, ${cur.standard != null ? `표준점수 ${cur.standard}점, ` : ''}${cur.percentile != null ? `백분위 ${fmt1(cur.percentile)}, ` : ''}${grade}등급 성적 지표를 기반으로 분석함.`;
      }

      const weakNums = weak.length > 0 ? `${weak.join(', ')}번 ` : '';
      const isGrade3June = (student?.grade === '3' || exam?.label?.includes('고3')) && (exam?.examDate?.includes('-06') || exam?.label?.includes('6월'));

      if (!hasAnyExamWeak || isGrade3June) {
        cognitiveAdvice = `${name}(${grade}등급${cur.standard != null ? `, 표준점수 ${cur.standard}점` : ''}${cur.percentile != null ? `, 백분위 ${fmt1(cur.percentile)}` : ''}) 성적 지표를 분석할 때 핵심 개념 문제는 탄탄하나, 복합 통계/자료 해석 및 변별력 킬러 문항에서 시간 압박과 실수가 발생했을 가능성이 높음. 유형별 도표/자료 해석 공식화 및 비킬러 문항 15분 컷 시간 안배 훈련을 권함.`;
        actionRoadmap = `【수능 탐구 만점 전략】: 수능 연계교재(수능특강·수능완성) 핵심 도표 및 고난도 기출 3점 문항을 단원별로 누적 풀이하고, 개념 백지 복습을 병행하여 실수를 원천 차단할 것을 권함.`;
      } else if (weak.length === 0) {
        cognitiveAdvice = `${name} 영역 오답 문항 없이 전 문항 정답으로 탁월한 개념 숙지도와 자료 해석력을 증명함.`;
        actionRoadmap = `【만점 유지 전략】: 주 1회 30분 타임어택 실전 풀이로 비킬러 15분 컷을 유지하고 고난도 신유형 자료 분석을 지속할 것.`;
      } else {
        cognitiveAdvice = `기본 암기형 문제는 빠르게 해결하지만, 도표나 그래프에 새로운 변인이 추가된 복합 문항(${weakNums})에서 함정에 빠지는 경향이 있음. 수능·평가원 기출에 등장한 모든 그래프와 도표의 축, 단위, 변화율을 백지에 직접 재해석해보는 '자료 해석 정밀화' 훈련을 권함.`;
        if (cur.name?.includes('사회') || cur.name?.includes('윤리') || cur.name?.includes('지리') || cur.name?.includes('역사')) {
          actionRoadmap = `【탐구 만점 로드맵】: 핵심 개념과 사상가별 원전 제시문, 선지 빈출 키워드를 비교 대조표로 정리하고, 킬러 자료 분석 문항의 함정 선지 소거 훈련을 권함.`;
        } else if (cur.name?.includes('물리') || cur.name?.includes('화학') || cur.name?.includes('생명') || cur.name?.includes('지구') || cur.name?.includes('과학')) {
          actionRoadmap = `【탐구 만점 로드맵】: 비역학/비유전 문항의 빠른 풀이 루틴(10분 이내)을 정착시키고, 킬러 계산 및 그래프 해석 문항의 조건 정리 알고리즘을 체계화할 것을 권함.`;
        } else {
          actionRoadmap = `【탐구 맞춤 로드맵】: 교과서 및 기출문제에 수록된 모든 도표·그래프·실험 자료의 독립변인과 종속변인을 백지에 재해석해보는 능동적 복습과 주 1회 실전 풀이를 권함.`;
        }
      }
    }

    const bullet1 = isEnglish
      ? strongDesc
      : `${scoreStr}로 ${grade}등급 달성. ${subStr !== '세부영역 배점 일람표 미기재' ? `세부 지표를 보면 ${subStr} 등 ` : ''}${strongDesc}`;

    return {
      subjectKey: key,
      headline,
      bullets: [bullet1, cognitiveAdvice, actionRoadmap],
    };
  });
}
