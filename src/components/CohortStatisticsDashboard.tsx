import React, { useState, useMemo } from 'react';
import { Student, ExamRecord, SubjectKey } from '../types';
import { ROSTER, SUBJECTS, SUBJ_BY_KEY, ITEM_TYPE_MAPS, itemTypeDetail } from '../data/mockData';
import { fmt1, formatShortExamSession, compareStudentHakbeon } from '../utils/analysis';
import { STANDARD_CRITERIA } from './MinimumStandardSimulator';
import {
  BarChart3,
  Users,
  Award,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BookOpen,
  Filter,
  Printer,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight,
  Download,
  ExternalLink,
  X,
  Loader2,
  FileText,
  FileQuestion,
} from 'lucide-react';
import { exportCohortDashboardToPdf } from '../utils/exportReport';

interface CohortStatisticsDashboardProps {
  exams: ExamRecord[];
  students: Student[];
  onSelectStudent: (studentName: string, grade: string) => void;
  currentGrade: string;
  onGradeChange: (grade: string) => void;
}

export const CohortStatisticsDashboard: React.FC<CohortStatisticsDashboardProps> = ({
  exams,
  students,
  onSelectStudent,
  currentGrade,
  onGradeChange,
}) => {
  // Selected Exam Session filter
  const [selectedExamLabel, setSelectedExamLabel] = useState<string>('all');
  const [activeSubjectTab, setActiveSubjectTab] = useState<SubjectKey>('math');

  // Filter students by selected grade (or 'all')
  // 정렬 기준: 1. 성적표 있는 학생들 우선, 2. 학번 순 (학년 -> 반 -> 번호)
  const gradeStudents = useMemo(() => {
    const list = currentGrade === 'all' ? students : students.filter((s) => s.grade === currentGrade);
    return [...list].sort((a, b) => {
      const hasA = exams.some((e) => e.studentName === a.name);
      const hasB = exams.some((e) => e.studentName === b.name);
      if (hasA !== hasB) return hasA ? -1 : 1;
      return compareStudentHakbeon(a, b);
    });
  }, [students, currentGrade, exams]);

  const gradeLabel = currentGrade === 'all' ? '전체 학년 (1~3학년)' : `${currentGrade}학년`;

  const gradeStudentIds = useMemo(() => {
    return new Set(gradeStudents.map((s) => s.name));
  }, [gradeStudents]);

  // Available exam sessions in the dataset for these students
  // 1, 2, 3학년 모두 최신 시험(9월 -> 6월 -> 5월 -> 3월) 순서가 위로 올라오도록 내림차순 정렬
  const availableExamLabels = useMemo(() => {
    const labelDateMap = new Map<string, string>();
    exams.forEach((e) => {
      if (gradeStudentIds.has(e.studentName)) {
        const curDate = e.examDate || '';
        const prevDate = labelDateMap.get(e.label);
        if (!prevDate || curDate > prevDate) {
          labelDateMap.set(e.label, curDate);
        }
      }
    });

    return Array.from(labelDateMap.keys()).sort((labelA, labelB) => {
      const dateA = labelDateMap.get(labelA) || '';
      const dateB = labelDateMap.get(labelB) || '';
      if (dateA !== dateB) {
        return dateB.localeCompare(dateA); // 최근 일자가 위로 (내림차순)
      }
      // 날짜가 같거나 누락된 경우 라벨 내 연도/월 파싱하여 내림차순 정렬
      const matchA = labelA.match(/(\d{4})년\s*(\d{1,2})월/);
      const matchB = labelB.match(/(\d{4})년\s*(\d{1,2})월/);
      if (matchA && matchB) {
        const numA = parseInt(matchA[1], 10) * 100 + parseInt(matchA[2], 10);
        const numB = parseInt(matchB[1], 10) * 100 + parseInt(matchB[2], 10);
        return numB - numA;
      }
      return labelB.localeCompare(labelA, 'ko');
    });
  }, [exams, gradeStudentIds]);

  // Default to the first available exam if 'all' or not matched
  const effectiveExamLabel = useMemo(() => {
    if (selectedExamLabel !== 'all' && availableExamLabels.includes(selectedExamLabel)) {
      return selectedExamLabel;
    }
    return availableExamLabels[0] || '';
  }, [selectedExamLabel, availableExamLabels]);

  // Exam records for this cohort and selected exam
  const filteredExams = useMemo(() => {
    return exams.filter(
      (e) => gradeStudentIds.has(e.studentName) && (effectiveExamLabel ? e.label === effectiveExamLabel : true)
    );
  }, [exams, gradeStudentIds, effectiveExamLabel]);

  // Key stats per subject: average grade, 1-2 grade ratio, etc.
  const subjectStats = useMemo(() => {
    const stats: Record<
      SubjectKey,
      {
        total: number;
        avgGrade: number;
        avgRaw: number | null;
        avgPct: number | null;
        gradeCounts: Record<number, number>;
        tier1And2Ratio: number;
      }
    > = {} as any;

    SUBJECTS.forEach((subj) => {
      let count = 0;
      let sumGrade = 0;
      let sumRaw = 0;
      let rawCount = 0;
      let sumPct = 0;
      let pctCount = 0;
      const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };

      filteredExams.forEach((e) => {
        const s = e.subjects[subj.key];
        if (s && s.grade) {
          count++;
          sumGrade += s.grade;
          counts[s.grade] = (counts[s.grade] || 0) + 1;
          if (typeof s.raw === 'number') {
            sumRaw += s.raw;
            rawCount++;
          }
          if (typeof s.percentile === 'number') {
            sumPct += s.percentile;
            pctCount++;
          }
        }
      });

      const avgGrade = count > 0 ? sumGrade / count : 0;
      const avgRaw = rawCount > 0 ? sumRaw / rawCount : null;
      const avgPct = pctCount > 0 ? sumPct / pctCount : null;
      const tier1And2 = (counts[1] || 0) + (counts[2] || 0);
      const tier1And2Ratio = count > 0 ? (tier1And2 / count) * 100 : 0;

      stats[subj.key] = {
        total: count,
        avgGrade,
        avgRaw,
        avgPct,
        gradeCounts: counts,
        tier1And2Ratio,
      };
    });

    return stats;
  }, [filteredExams]);

  // 수능 최저학력기준 충족 현황 통계 (Cohort Passing Rate)
  const minimumCriteriaStats = useMemo(() => {
    return STANDARD_CRITERIA.map((crit) => {
      let passedCount = 0;
      let totalEligible = 0;
      const passedStudents: {
        studentName: string;
        student?: Student;
        sum: number;
        detailText: string;
      }[] = [];
      const failedStudents: {
        studentName: string;
        student?: Student;
        sum: number | null;
        detailText: string;
      }[] = [];

      filteredExams.forEach((exam) => {
        const s = exam.subjects;
        const itemsWithLabels: { label: string; grade: number }[] = [];

        if (s.korean?.grade) itemsWithLabels.push({ label: '국어', grade: s.korean.grade });
        if (s.math?.grade) itemsWithLabels.push({ label: '수학', grade: s.math.grade });
        if (s.english?.grade) itemsWithLabels.push({ label: '영어', grade: s.english.grade });

        const e1 = s.elective1?.grade;
        const e2 = s.elective2?.grade;

        if (crit.inquiryType === 'avg2') {
          if (e1 && e2) {
            itemsWithLabels.push({ label: '탐구(2평균)', grade: (e1 + e2) / 2 });
          } else if (e1 || e2) {
            itemsWithLabels.push({ label: '탐구', grade: e1 || e2 || 9 });
          }
        } else {
          if (e1 && e2) {
            itemsWithLabels.push({ label: '탐구(상위1)', grade: Math.min(e1, e2) });
          } else if (e1 || e2) {
            itemsWithLabels.push({ label: '탐구', grade: e1 || e2 || 9 });
          }
        }

        const stObj = gradeStudents.find((st) => st.name === exam.studentName);

        if (itemsWithLabels.length >= crit.targetCount) {
          totalEligible++;
          itemsWithLabels.sort((a, b) => a.grade - b.grade);
          const topPicked = itemsWithLabels.slice(0, crit.targetCount);
          const sum = topPicked.reduce((acc, v) => acc + v.grade, 0);
          const detailText = topPicked.map((p) => `${p.label} ${p.grade}`).join(', ');

          if (sum <= crit.limitSum) {
            passedCount++;
            passedStudents.push({
              studentName: exam.studentName,
              student: stObj,
              sum,
              detailText: `합 ${sum}등급 (${detailText})`,
            });
          } else {
            failedStudents.push({
              studentName: exam.studentName,
              student: stObj,
              sum,
              detailText: `합 ${sum}등급 (${detailText})`,
            });
          }
        }
      });

      const passRate = totalEligible > 0 ? (passedCount / totalEligible) * 100 : 0;

      // 합계 오름차순 정렬 (우수한 성적순)
      passedStudents.sort((a, b) => a.sum - b.sum);

      return {
        ...crit,
        totalEligible,
        passedCount,
        passRate,
        passedStudents,
        failedStudents,
      };
    });
  }, [filteredExams, gradeStudents]);

  // 문항별 정오답표(보충학습 필요 문항) 제공 여부 확인
  const hasAnyWeakItemData = useMemo(() => {
    return filteredExams.some((e) => {
      if (!e.weakItems) return false;
      return (['korean', 'math', 'english', 'history', 'elective1', 'elective2'] as SubjectKey[]).some(
        (sk) => Array.isArray(e.weakItems[sk]) && e.weakItems[sk]!.length > 0
      );
    });
  }, [filteredExams]);

  // TOP 공통 오답 및 킬러 문항 집계 (Weak Items Aggregation)
  const topWeakItems = useMemo(() => {
    const countsBySubject: Record<
      SubjectKey,
      { itemNum: number; count: number; studentNames: string[] }[]
    > = {
      korean: [],
      math: [],
      english: [],
      history: [],
      elective1: [],
      elective2: [],
    };

    // Helper to find concept/label for an item
    const getConcept = (subjKey: SubjectKey, itemNum: number) => {
      const sampleExam = filteredExams[0];
      const grade =
        currentGrade !== 'all'
          ? currentGrade
          : sampleExam?.label?.includes('고3')
          ? '3'
          : sampleExam?.label?.includes('고2')
          ? '2'
          : '1';

      const sampleStudent = sampleExam
        ? ({ grade, school: '숭신고등학교' } as Student)
        : undefined;

      const detail = itemTypeDetail(sampleStudent, sampleExam, subjKey, itemNum);
      if (detail) {
        return {
          label: detail.label,
          category: detail.category,
          concept: detail.concept || detail.label,
          desc: detail.description,
        };
      }

      // Check key permutations in ITEM_TYPE_MAPS
      const year = sampleExam?.examDate?.slice(0, 4) || '2026';
      const month = sampleExam?.examDate?.slice(5, 7) || '06';
      const candidates = [
        `${grade}-${year}-${month}`,
        `${grade}-2026-${month}`,
        `${grade}-2026-06`,
        `${grade}-2026-09`,
        `${grade}-2026-03`,
        '3-2026-06',
        '2-2026-09',
        '2-2026-06',
        '1-2026-09',
        '1-2026-03',
      ];

      for (const k of candidates) {
        const bp = ITEM_TYPE_MAPS[k]?.[subjKey];
        if (bp) {
          for (const b of bp) {
            if (b.items && b.items.includes(itemNum)) {
              return {
                label: b.label,
                category: b.category,
                concept: b.concept || b.label,
                desc: b.description,
              };
            }
            if (
              typeof b.from === 'number' &&
              typeof b.to === 'number' &&
              itemNum >= b.from &&
              itemNum <= b.to
            ) {
              return {
                label: b.label,
                category: b.category,
                concept: b.concept || b.label,
                desc: b.description,
              };
            }
          }
        }
      }

      return null;
    };

    SUBJECTS.forEach((subj) => {
      const freq: Record<number, { count: number; students: string[] }> = {};

      filteredExams.forEach((e) => {
        const items = e.weakItems[subj.key];
        if (Array.isArray(items)) {
          items.forEach((num) => {
            if (!freq[num]) {
              freq[num] = { count: 0, students: [] };
            }
            freq[num].count++;
            freq[num].students.push(e.studentName);
          });
        }
      });

      const sorted = Object.entries(freq)
        .map(([numStr, data]) => ({
          itemNum: parseInt(numStr, 10),
          count: data.count,
          studentNames: data.students,
        }))
        .sort((a, b) => b.count - a.count);

      countsBySubject[subj.key] = sorted;
    });

    return {
      countsBySubject,
      getConcept,
    };
  }, [filteredExams, effectiveExamLabel]);

  // Roster Student Summary Table Data
  // 1. 성적표 있는 학생들 우선
  // 2. 학번 순으로 정리 (학년 -> 반 -> 번호 -> 성명)
  const studentRows = useMemo(() => {
    const list = gradeStudents.map((st) => {
      const exam = filteredExams.find((e) => e.studentName === st.name);
      const subs = exam?.subjects;

      // Check 3합 7 (탐1) and 2합 5 (탐1)
      let pass37 = false;
      let pass25 = false;
      let sum3 = null;
      let sum2 = null;

      if (subs) {
        const pool: number[] = [];
        if (subs.korean?.grade) pool.push(subs.korean.grade);
        if (subs.math?.grade) pool.push(subs.math.grade);
        if (subs.english?.grade) pool.push(subs.english.grade);

        const e1 = subs.elective1?.grade;
        const e2 = subs.elective2?.grade;
        const bestInq = e1 && e2 ? Math.min(e1, e2) : e1 || e2 || null;
        if (bestInq) pool.push(bestInq);

        if (pool.length >= 3) {
          pool.sort((a, b) => a - b);
          sum3 = pool[0] + pool[1] + pool[2];
          pass37 = sum3 <= 7;
        }
        if (pool.length >= 2) {
          sum2 = pool[0] + pool[1];
          pass25 = sum2 <= 5;
        }
      }

      // 성적표 보유 여부 (현재 선택된 시험 회차)
      const hasExamInCurrentSession = Boolean(
        exam &&
        exam.subjects &&
        Object.values(exam.subjects).some(
          (s: any) => s && (s.grade !== undefined || s.raw !== undefined || s.standard !== undefined)
        )
      );

      // 전체 등록된 모의고사 중 성적표 보유 여부
      const hasAnyExam = exams.some(
        (e) =>
          e.studentName === st.name &&
          e.subjects &&
          Object.values(e.subjects).some(
            (s: any) => s && (s.grade !== undefined || s.raw !== undefined || s.standard !== undefined)
          )
      );

      return {
        student: st,
        exam,
        hasExamInCurrentSession,
        hasAnyExam,
        pass37,
        pass25,
        sum3,
        sum2,
      };
    });

    // 정렬: 1. 성적표 있는 학생들, 2. 학번 순
    return list.sort((a, b) => {
      // 1순위: 현재 시험 성적표 보유 학생 우선
      if (a.hasExamInCurrentSession !== b.hasExamInCurrentSession) {
        return a.hasExamInCurrentSession ? -1 : 1;
      }
      // 1-2순위: 전체 등록된 성적표 보유 여부
      if (a.hasAnyExam !== b.hasAnyExam) {
        return a.hasAnyExam ? -1 : 1;
      }
      // 2순위: 학번 순 (학년 -> 반 -> 번호 -> 성명)
      return compareStudentHakbeon(a.student, b.student);
    });
  }, [gradeStudents, filteredExams, exams]);

  const [showPrintModal, setShowPrintModal] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<string>('');

  // 팝업 모달 상태: 과목별 1·2등급 학생 명단
  const [gradeModal, setGradeModal] = useState<{
    subjectName: string;
    targetGrade: number;
    students: {
      name: string;
      student?: Student;
      percentile: number | null;
      standard: number | null;
      raw: number | null;
      electiveName?: string;
    }[];
  } | null>(null);

  // 팝업 모달 상태: 수능 최저 충족 학생 명단
  const [criteriaModal, setCriteriaModal] = useState<{
    name: string;
    universities: string;
    limitSum: number;
    targetCount: number;
    passedStudents: {
      studentName: string;
      student?: Student;
      sum: number;
      detailText: string;
    }[];
    failedStudents: {
      studentName: string;
      student?: Student;
      sum: number | null;
      detailText: string;
    }[];
  } | null>(null);

  const handleOpenGradeModal = (subjKey: SubjectKey, subjName: string, gradeNum: number) => {
    const matchedList: {
      name: string;
      student?: Student;
      percentile: number | null;
      standard: number | null;
      raw: number | null;
      electiveName?: string;
    }[] = [];

    filteredExams.forEach((e) => {
      const score = e.subjects[subjKey];
      if (score && score.grade === gradeNum) {
        const stObj = gradeStudents.find((s) => s.name === e.studentName);
        matchedList.push({
          name: e.studentName,
          student: stObj,
          percentile: score.percentile ?? null,
          standard: score.standard ?? null,
          raw: score.raw ?? null,
          electiveName: score.name,
        });
      }
    });

    // 백분위 내림차순 정렬 (높은 순서)
    matchedList.sort((a, b) => (b.percentile ?? 0) - (a.percentile ?? 0));

    setGradeModal({
      subjectName: subjName,
      targetGrade: gradeNum,
      students: matchedList,
    });
  };

  const handleDownloadPdf = async (mode: 'single' | 'two-page' = 'single') => {
    setIsExportingPdf(true);
    setPdfProgress(mode === 'single' ? '진단 통계 분석표 1페이지 PDF 생성 준비 중...' : '진단 통계 분석표 2페이지 PDF 생성 준비 중...');
    try {
      if (mode === 'single') {
        const singleEl = document.getElementById('cohort-printable-page');
        if (!singleEl) {
          alert('출력 영역을 찾을 수 없습니다.');
          return;
        }
        await exportCohortDashboardToPdf(
          singleEl,
          null,
          currentGrade,
          effectiveExamLabel,
          (p) => setPdfProgress(p.message)
        );
      } else {
        const page1El = document.getElementById('cohort-page-1');
        const page2El = document.getElementById('cohort-page-2');
        if (!page1El || !page2El) {
          alert('출력 영역을 찾을 수 없습니다.');
          return;
        }
        await exportCohortDashboardToPdf(
          page1El,
          page2El,
          currentGrade,
          effectiveExamLabel,
          (p) => setPdfProgress(p.message)
        );
      }
    } catch (err) {
      console.error('PDF export error:', err);
      alert('PDF 생성 중 문제가 발생했습니다. 브라우저 인쇄 기능을 이용해 주세요.');
    } finally {
      setIsExportingPdf(false);
      setPdfProgress('');
    }
  };

  const handlePrint = () => {
    try {
      const isIframe = window.self !== window.top;
      if (isIframe) {
        window.print();
        setShowPrintModal(true);
      } else {
        window.print();
      }
    } catch (e) {
      console.warn('iframe print exception:', e);
      setShowPrintModal(true);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" id="cohort-dashboard">
      {/* Top Banner & Filters (화면용 대시보드 조작부 - 인쇄 및 PDF 캡처 시 제외) */}
      <section className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 shadow-[var(--shadow)] no-print">
        <div className="flex items-center justify-between gap-3 mb-5 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center font-bold text-base sm:text-lg shadow-sm shrink-0">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-[var(--accent)] uppercase whitespace-nowrap">
                  TEACHER ANALYTICS CONSOLE
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/20 whitespace-nowrap">
                  교사용 대시보드
                </span>
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-serif-kr font-bold text-[var(--ink)] whitespace-nowrap">
                미래인재반 {currentGrade === 'all' ? '전학년' : `${currentGrade}학년`} 진단 통계 분석표
              </h1>
            </div>
          </div>

          {/* Action Buttons: PDF Download & Print (분석표와 같은 칸 옆에 나란히 배치) */}
          <div className="no-print flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleDownloadPdf('single')}
              disabled={isExportingPdf}
              title="통계표를 1페이지 완결형 PDF 파일로 다운로드합니다."
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--accent)] hover:opacity-90 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50 whitespace-nowrap"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span className="text-xs">{pdfProgress || 'PDF 생성 중...'}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>통계표 PDF 저장</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              title="통계표를 1페이지 규격으로 인쇄합니다."
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--surface-alt)] hover:border-[var(--border-strong)] border border-[var(--border)] text-xs sm:text-sm font-bold text-[var(--ink)] transition-all cursor-pointer shadow-xs whitespace-nowrap"
            >
              <Printer className="w-4 h-4 text-[var(--accent)]" />
              <span>통계표 인쇄</span>
            </button>

            <button
              type="button"
              onClick={() => handleDownloadPdf('two-page')}
              disabled={isExportingPdf}
              title="통계표를 2페이지 상세 분할 PDF 파일로 다운로드합니다."
              className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-[var(--surface-alt)] hover:border-[var(--border-strong)] border border-[var(--border)] text-xs font-semibold text-[var(--ink-secondary)] hover:text-[var(--ink)] transition-all cursor-pointer shadow-xs disabled:opacity-50 whitespace-nowrap"
            >
              <FileText className="w-3.5 h-3.5 text-[var(--muted)]" />
              <span>2페이지 분할</span>
            </button>
          </div>
        </div>

        {/* Filters Bar: Grade & Exam Session */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[var(--border)]">
          {/* Grade Selector */}
          <div>
            <label className="block text-xs font-bold text-[var(--ink-secondary)] mb-2">
              대상 학년 선택:
            </label>
            <div className="flex items-center gap-2">
              {[
                { id: '1', label: '1학년 (15명)' },
                { id: '2', label: '2학년 (15명)' },
                { id: '3', label: '3학년 (15명)' },
                { id: 'all', label: '전체 (45명)' },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => onGradeChange(g.id)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentGrade === g.id
                      ? 'bg-[var(--ink)] text-[var(--paper)] shadow-xs'
                      : 'bg-[var(--surface-alt)] text-[var(--ink-secondary)] border border-[var(--border)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Exam Session Selector */}
          <div>
            <label className="block text-xs font-bold text-[var(--ink-secondary)] mb-2">
              분석 대상 모의고사 회차:
            </label>
            <select
              value={effectiveExamLabel}
              onChange={(e) => setSelectedExamLabel(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)] text-xs sm:text-sm font-semibold text-[var(--ink)] focus:outline-hidden focus:border-[var(--accent)] cursor-pointer"
            >
              {availableExamLabels.map((lbl) => (
                <option key={lbl} value={lbl}>
                  {lbl}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 📄 통합 진단 통계 분석표 (A4 1페이지 완결 출력 및 다운로드 최적화) */}
      {/* ========================================================================= */}
      <div id="cohort-printable-page" className="space-y-5 bg-transparent">
        {/* 📄 제1영역: 미래인재반 모의고사 종합 지표 & 3대 영역(국·수·영) 킬러문항 분석 */}
        <div id="cohort-page-1" className="space-y-5">
          {/* 공식 상단 타이틀 헤더 (화면, PDF 캡처 및 인쇄 시 최상단에 항상 표시) */}
          <div className="export-header pb-2.5 mb-2 border-b-2 border-[var(--ink)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center font-bold text-xs shrink-0">
                숭신
              </div>
              <div>
                <span className="text-[9px] font-bold tracking-widest text-[var(--muted)] uppercase">
                  SOUNGSIN HIGH SCHOOL · CAREER & ACADEMIC COUNSELING
                </span>
                <h2 className="text-base sm:text-lg font-serif-kr font-bold text-[var(--ink)]">
                  미래인재반 {currentGrade === 'all' ? '전학년' : `${currentGrade}학년`} 통계 분석표
                </h2>
              </div>
            </div>
            <div className="text-right text-[10px] text-[var(--ink-secondary)] leading-tight shrink-0">
              <div><strong>대상 학년:</strong> {gradeLabel} (총 {studentRows.length}명)</div>
              <div><strong>기준 시험:</strong> {effectiveExamLabel}</div>
              <div className="text-[9px] text-[var(--muted)]">발급처: 숭신고등학교 진로진학상담부</div>
            </div>
          </div>

        {/* 1. KPI Cards: Subject Averages and 1-2 Tier Student Counts (Clickable for student names & percentiles) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-serif-kr font-bold text-[var(--ink)] flex items-center gap-2">
              <span>과목별 성적 지표 및 최상위권(1·2등급) 인원</span>
              <span className="text-xs font-normal text-[var(--muted)]">
                (응시 인원: {filteredExams.length}명 · 1·2등급 클릭 시 이름/백분위 확인)
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {SUBJECTS.map((subj) => {
              const st = subjectStats[subj.key];
              if (!st || st.total === 0) return null;

              return (
                <div
                  key={subj.key}
                  className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3.5 shadow-[var(--shadow)] flex flex-col justify-between"
                  style={{ borderTop: `3px solid ${subj.color}` }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5 whitespace-nowrap">
                      <span className="font-bold text-xs sm:text-sm text-[var(--ink)]">
                        {subj.name}
                      </span>
                      <span className="text-[11px] font-semibold text-[var(--muted)]">
                        {st.total}명 응시
                      </span>
                    </div>

                    <div className="space-y-1 my-2">
                      <div className="flex items-baseline justify-between text-xs whitespace-nowrap">
                        <span className="text-[var(--muted)]">평균 등급:</span>
                        <strong className="text-sm sm:text-base font-bold text-[var(--ink)]">
                          {fmt1(st.avgGrade)}등급
                        </strong>
                      </div>
                      {st.avgPct !== null && (
                        <div className="flex items-baseline justify-between text-xs whitespace-nowrap">
                          <span className="text-[var(--muted)]">평균 백분위:</span>
                          <span className="font-semibold text-[var(--ink-secondary)]">
                            {fmt1(st.avgPct)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[var(--border)] space-y-1">
                    {/* 1등급 버튼 클릭 시 학생 명단 & 백분위 팝업 */}
                    <button
                      type="button"
                      onClick={() => handleOpenGradeModal(subj.key, subj.name, 1)}
                      className="flex items-center justify-between text-xs w-full px-1.5 py-1 rounded-md hover:bg-emerald-500/10 text-left transition-colors cursor-pointer group whitespace-nowrap"
                      title={`${subj.name} 1등급 학생 명단(이름 및 백분위) 확인`}
                    >
                      <span className="text-[var(--muted)] font-medium group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                        1등급
                      </span>
                      <strong className="font-bold text-emerald-600 dark:text-emerald-400 group-hover:underline flex items-center gap-0.5">
                        <span>{st.gradeCounts[1] || 0}명</span>
                        <span className="text-[10px] opacity-70">🔍</span>
                      </strong>
                    </button>

                    {/* 2등급 버튼 클릭 시 학생 명단 & 백분위 팝업 */}
                    <button
                      type="button"
                      onClick={() => handleOpenGradeModal(subj.key, subj.name, 2)}
                      className="flex items-center justify-between text-xs w-full px-1.5 py-1 rounded-md hover:bg-blue-500/10 text-left transition-colors cursor-pointer group whitespace-nowrap"
                      title={`${subj.name} 2등급 학생 명단(이름 및 백분위) 확인`}
                    >
                      <span className="text-[var(--muted)] font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300">
                        2등급
                      </span>
                      <strong className="font-bold text-blue-600 dark:text-blue-400 group-hover:underline flex items-center gap-0.5">
                        <span>{st.gradeCounts[2] || 0}명</span>
                        <span className="text-[10px] opacity-70">🔍</span>
                      </strong>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 2. Su-si Minimum Criteria Pass Rate Grid (Clickable for student names) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-serif-kr font-bold text-[var(--ink)] flex items-center gap-2">
              <Award className="w-5 h-5 text-[var(--accent)]" />
              <span>수능 최저학력기준 충족 현황</span>
              <span className="text-xs font-normal text-[var(--muted)]">
                (충족 인원 클릭 시 달성 학생 명단 확인)
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {minimumCriteriaStats.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5 whitespace-nowrap">
                    <span className="font-bold text-sm text-[var(--ink)]">{item.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      충족률 {item.passRate.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--muted)] mb-3 line-clamp-1">{item.universities}</p>
                </div>

                {/* 충족 인원 클릭 시 충족 학생 명단 팝업 */}
                <button
                  type="button"
                  onClick={() => setCriteriaModal(item)}
                  className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs w-full text-left px-1.5 py-1 rounded-md hover:bg-emerald-500/10 transition-colors cursor-pointer group whitespace-nowrap"
                  title="클릭하여 충족 학생 명단 및 과목별 등급합 확인"
                >
                  <span className="text-[var(--ink-secondary)] group-hover:text-[var(--ink)]">
                    충족 인원: <strong className="text-[var(--ink)] group-hover:underline">{item.passedCount}명</strong> / {item.totalEligible}명
                  </span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:scale-105 transition-transform">
                    <span>{item.passedCount} PASS</span>
                    <span className="text-[10px]">🔍</span>
                  </span>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Common Weak Items & Killer Questions TOP 5 (국어, 수학, 영어 3칸 모두 표시 및 오답학생 예시 삭제) */}
        <section className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 shadow-[var(--shadow)]">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-serif-kr font-bold text-[var(--ink)]">
                  미래인재반 공통 오답 및 킬러문항 분석 (TOP 5)
                </h2>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  국어, 수학, 영어 3대 주요 영역의 오답 문항을 종합 집계하여 방과후 심화 수업 및 클리닉 지표로 활용합니다.
                </p>
              </div>
            </div>
          </div>

          {!hasAnyWeakItemData ? (
            <div className="py-8 px-5 sm:px-6 text-center rounded-xl bg-[var(--surface-alt)] border border-[var(--border)] flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2.5">
                <FileQuestion className="w-5 h-5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[var(--ink)] mb-1">
                정오답표가 제공되지 않아 분석할 수 없습니다
              </h3>
              <p className="text-xs text-[var(--muted)] max-w-lg leading-relaxed">
                해당 시험({effectiveExamLabel})은 문항별 정오답표(보충학습 필요 문항)가 제공되지 않는 회차(수능 모의평가 등)이므로 공통 오답 및 킬러문항을 분석할 수 없습니다.
              </p>
              <div className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] text-[var(--muted)] bg-[var(--surface)] px-3 py-1 rounded-full border border-[var(--border)]">
                <span>※ 한국교육과정평가원 수능 모의평가 및 학급별 성적일람표 등록 회차는 문항별 정오답 데이터가 기재되지 않습니다.</span>
              </div>
            </div>
          ) : (
            /* 국어, 수학, 영어 3칸 동시 배치 */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {(['korean', 'math', 'english'] as SubjectKey[]).map((sk) => {
                const subj = SUBJ_BY_KEY[sk];
                const items = (topWeakItems.countsBySubject[sk] || []).slice(0, 5);
                const cohortTotal = filteredExams.length;

                return (
                  <div
                    key={sk}
                    className="bg-[var(--surface-alt)] border border-[var(--border)] rounded-xl p-3.5 flex flex-col justify-between"
                    style={{ borderTop: `3px solid ${subj.color}` }}
                  >
                    <div>
                      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[var(--border)] whitespace-nowrap">
                        <span className="font-bold text-xs sm:text-sm text-[var(--ink)] flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: subj.color }}
                          />
                          {subj.name} 오답 TOP 5
                        </span>
                        <span className="text-[11px] text-[var(--muted)] font-medium">
                          오답 인원(비율)
                        </span>
                      </div>

                      {items.length === 0 ? (
                        <div className="py-8 text-center text-xs text-[var(--muted)]">
                          오답 문항 없음 (전원 정답)
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {items.map((item, idx) => {
                            const conceptInfo = topWeakItems.getConcept(sk, item.itemNum);
                            const errorRate = cohortTotal > 0 ? (item.count / cohortTotal) * 100 : 0;
                            const itemDesc = conceptInfo
                              ? conceptInfo.category && !conceptInfo.label.includes(conceptInfo.category)
                                ? `${conceptInfo.category} · ${conceptInfo.label}`
                                : conceptInfo.label
                              : '';

                            return (
                              <div
                                key={item.itemNum}
                                className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-between gap-2 whitespace-nowrap overflow-hidden"
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                                  <span className="w-5 h-5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs shrink-0">
                                    #{idx + 1}
                                  </span>
                                  <span className="font-extrabold text-xs text-[var(--ink)] whitespace-nowrap shrink-0">
                                    {item.itemNum}번
                                  </span>
                                  {itemDesc && (
                                    <span
                                      className="text-[11px] font-medium text-[var(--ink-secondary)] bg-[var(--surface-alt)] px-2 py-0.5 rounded border border-[var(--border)] truncate whitespace-nowrap"
                                      title={conceptInfo?.desc ? `${itemDesc} (${conceptInfo.desc})` : itemDesc}
                                    >
                                      {itemDesc}
                                    </span>
                                  )}
                                </div>

                                <div className="text-right whitespace-nowrap shrink-0 ml-1">
                                  <span className="font-bold text-rose-600 dark:text-rose-400 text-xs">
                                    {item.count}명
                                  </span>
                                  <span className="text-[10px] text-[var(--muted)] ml-1">
                                    ({errorRate.toFixed(0)}%)
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* ========================================================================= */}
      {/* 📄 제2영역: 미래인재반 학생별 성적 및 수능 최저 일람표 */}
      {/* ========================================================================= */}
      <div id="cohort-page-2" className="space-y-4">
        {/* 인쇄 및 2페이지 PDF 저장 시 제2면 상단 공식 타이틀 헤더 */}
        <div className="hidden print:block export-header pb-2 mb-2 border-b-2 border-[var(--ink)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center font-bold text-xs">
                숭신
              </div>
              <h2 className="text-sm font-serif-kr font-bold text-[var(--ink)]">
                미래인재반 {currentGrade === 'all' ? '전학년' : `${currentGrade}학년`} 통계 분석표 (제2면: 학생별 일람표)
              </h2>
            </div>
            <div className="text-right text-[10px] text-[var(--ink-secondary)]">
              기준: {effectiveExamLabel} | 대상: {studentRows.length}명
            </div>
          </div>
        </div>

        <section className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 shadow-[var(--shadow)]">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[var(--accent)]" />
              <h2 className="text-base sm:text-lg font-serif-kr font-bold text-[var(--ink)]">
                미래인재반 {currentGrade === 'all' ? '전학년' : `${currentGrade}학년`} 학생별 성적 및 수능 최저 일람표
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--muted)]">
                총 {studentRows.length}명 (응시 {studentRows.filter((r) => r.hasExamInCurrentSession).length}명)
              </span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                1. 성적표 등록순 · 2. 학번순
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[var(--surface-alt)] border-b border-[var(--border)] text-[var(--muted)] uppercase font-semibold">
                  <th className="py-2.5 px-3 whitespace-nowrap">학번/학생</th>
                  <th className="py-2.5 px-2 whitespace-nowrap">계열</th>
                  <th className="py-2.5 px-2 text-center whitespace-nowrap">국어</th>
                  <th className="py-2.5 px-2 text-center whitespace-nowrap">수학</th>
                  <th className="py-2.5 px-2 text-center whitespace-nowrap">영어</th>
                  <th className="py-2.5 px-2 text-center whitespace-nowrap">탐구1</th>
                  <th className="py-2.5 px-2 text-center whitespace-nowrap">탐구2</th>
                  <th className="py-2.5 px-2 text-center whitespace-nowrap">3합 7 (탐1)</th>
                  <th className="py-2.5 px-2 text-center whitespace-nowrap">2합 5 (탐1)</th>
                  <th className="py-2.5 px-3 text-right whitespace-nowrap no-print">상세 성적표</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] font-medium">
                {studentRows.map(({ student, exam, pass37, pass25, sum3, sum2 }) => {
                  const s = exam?.subjects;

                  return (
                    <tr key={student.id} className="hover:bg-[var(--surface-alt)] transition-colors">
                      {/* 학생 성명 및 학번: 두 줄 대신 한 줄로 변경 (우채원 (1학년 2반 10번)) */}
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span className="font-bold text-[var(--ink)] mr-1.5">{student.name}</span>
                        <span className="text-[11px] text-[var(--muted)] font-normal">
                          ({student.grade}학년 {student.class ? `${student.class}반 ` : ''}{student.number ? `${student.number}번` : ''})
                        </span>
                      </td>

                      <td className="py-2 px-2 text-[var(--ink-secondary)] whitespace-nowrap">
                        {student.track || '자연'}
                      </td>

                      <td className="py-2 px-2 text-center whitespace-nowrap">
                        {s?.korean?.grade ? (
                          <span className="font-bold text-[var(--ink)]">{s.korean.grade}등급</span>
                        ) : (
                          <span className="text-[var(--muted)]">-</span>
                        )}
                      </td>

                      <td className="py-2 px-2 text-center whitespace-nowrap">
                        {s?.math?.grade ? (
                          <span className="font-bold text-[var(--ink)]">{s.math.grade}등급</span>
                        ) : (
                          <span className="text-[var(--muted)]">-</span>
                        )}
                      </td>

                      <td className="py-2 px-2 text-center whitespace-nowrap">
                        {s?.english?.grade ? (
                          <span className="font-bold text-[var(--ink)]">{s.english.grade}등급</span>
                        ) : (
                          <span className="text-[var(--muted)]">-</span>
                        )}
                      </td>

                      <td className="py-2 px-2 text-center whitespace-nowrap">
                        {s?.elective1?.grade ? (
                          <span className="font-bold text-[var(--ink)]">{s.elective1.grade}등급</span>
                        ) : (
                          <span className="text-[var(--muted)]">-</span>
                        )}
                      </td>

                      <td className="py-2 px-2 text-center whitespace-nowrap">
                        {s?.elective2?.grade ? (
                          <span className="font-bold text-[var(--ink)]">{s.elective2.grade}등급</span>
                        ) : (
                          <span className="text-[var(--muted)]">-</span>
                        )}
                      </td>

                      {/* 3합 7 */}
                      <td className="py-2 px-2 text-center whitespace-nowrap">
                        {sum3 !== null ? (
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              pass37
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {pass37 ? `PASS (${sum3})` : `FAIL (${sum3})`}
                          </span>
                        ) : (
                          <span className="text-[var(--muted)]">-</span>
                        )}
                      </td>

                      {/* 2합 5 */}
                      <td className="py-2 px-2 text-center whitespace-nowrap">
                        {sum2 !== null ? (
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              pass25
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {pass25 ? `PASS (${sum2})` : `FAIL (${sum2})`}
                          </span>
                        ) : (
                          <span className="text-[var(--muted)]">-</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-2 px-3 text-right whitespace-nowrap no-print">
                        <button
                          type="button"
                          onClick={() => onSelectStudent(student.name, student.grade || '1')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--surface-alt)] hover:bg-[var(--accent)] hover:text-white text-xs font-semibold text-[var(--accent)] border border-[var(--border)] transition-all cursor-pointer"
                        >
                          <span>성적표</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>

      {/* ========================================================================= */}
      {/* 🎓 과목별 1·2등급 학생 명단 팝업 모달 (이름과 백분위 표시) */}
      {/* ========================================================================= */}
      {gradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs no-print">
          <div className="bg-[var(--surface)] border border-[var(--border-strong)] rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                    gradeModal.targetGrade === 1
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                  }`}
                >
                  {gradeModal.targetGrade}등급
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--ink)] font-serif-kr">
                    [{gradeModal.subjectName}] {gradeModal.targetGrade}등급 학생 명단
                  </h3>
                  <span className="text-xs text-[var(--muted)]">
                    총 {gradeModal.students.length}명 ({formatShortExamSession(effectiveExamLabel)} 응시 기준)
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGradeModal(null)}
                className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {gradeModal.students.length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--muted)]">
                해당 등급을 취득한 학생이 없습니다.
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-[var(--muted)] border-b border-[var(--border)] bg-[var(--surface-alt)]">
                      <th className="py-2 px-2 font-semibold">순번</th>
                      <th className="py-2 px-2 font-semibold">학생 성명</th>
                      <th className="py-2 px-2 font-semibold">학급/번호</th>
                      <th className="py-2 px-2 font-semibold text-right">백분위</th>
                      <th className="py-2 px-2 font-semibold text-right">표준점수</th>
                      <th className="py-2 px-2 text-right">성적표</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)] font-medium">
                    {gradeModal.students.map((st, i) => (
                      <tr key={st.name} className="hover:bg-[var(--surface-alt)] transition-colors">
                        <td className="py-2.5 px-2 text-[var(--muted)]">#{i + 1}</td>
                        <td className="py-2.5 px-2 font-bold text-[var(--ink)] whitespace-nowrap">
                          {st.name}
                          {st.electiveName && (
                            <span className="ml-1 text-[10px] text-[var(--muted)] font-normal">
                              ({st.electiveName})
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-[var(--ink-secondary)] whitespace-nowrap">
                          {st.student?.grade ? `${st.student.grade}학년 ` : ''}
                          {st.student?.class ? `${st.student.class}반 ` : ''}
                          {st.student?.number ? `${st.student.number}번` : ''}
                        </td>
                        <td className="py-2.5 px-2 text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          {st.percentile !== null ? `${st.percentile.toFixed(1)}%` : '-'}
                        </td>
                        <td className="py-2.5 px-2 text-right font-semibold text-[var(--ink)] whitespace-nowrap">
                          {st.standard !== null ? `${st.standard}점` : '-'}
                        </td>
                        <td className="py-2.5 px-2 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => {
                              setGradeModal(null);
                              onSelectStudent(st.name, st.student?.grade || '1');
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--surface-alt)] hover:bg-[var(--accent)] hover:text-white text-[11px] font-semibold text-[var(--accent)] border border-[var(--border)] transition-colors cursor-pointer"
                          >
                            <span>보기</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setGradeModal(null)}
                className="px-4 py-2 rounded-lg bg-[var(--surface-alt)] text-xs font-semibold text-[var(--ink)] hover:bg-[var(--border)] cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🏆 수능 최저학력기준 충족 학생 명단 팝업 모달 */}
      {/* ========================================================================= */}
      {criteriaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs no-print">
          <div className="bg-[var(--surface)] border border-[var(--border-strong)] rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--ink)] font-serif-kr">
                    [{criteriaModal.name}] 충족 현황
                  </h3>
                  <span className="text-xs text-[var(--muted)]">
                    {criteriaModal.universities} · 충족 인원 {criteriaModal.passedStudents.length}명
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCriteriaModal(null)}
                className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="font-bold text-[var(--ink)]">
                  충족 학생 명단 ({criteriaModal.passedStudents.length}명)
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  전체 {criteriaModal.passedStudents.length + criteriaModal.failedStudents.length}명 중 {criteriaModal.passedStudents.length}명 달성
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-[var(--muted)] border-b border-[var(--border)] bg-[var(--surface-alt)]">
                      <th className="py-2 px-2 font-semibold">순번</th>
                      <th className="py-2 px-2 font-semibold">학생 성명</th>
                      <th className="py-2 px-2 font-semibold">학급/번호</th>
                      <th className="py-2 px-2 font-semibold">상위 반영 과목 및 등급합</th>
                      <th className="py-2 px-2 text-center font-semibold">결과</th>
                      <th className="py-2 px-2 text-right">성적표</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)] font-medium">
                    {criteriaModal.passedStudents.map((st, i) => (
                      <tr key={st.studentName} className="hover:bg-[var(--surface-alt)] transition-colors">
                        <td className="py-2.5 px-2 text-[var(--muted)]">#{i + 1}</td>
                        <td className="py-2.5 px-2 font-bold text-[var(--ink)] whitespace-nowrap">
                          {st.studentName}
                        </td>
                        <td className="py-2.5 px-2 text-[var(--ink-secondary)] whitespace-nowrap">
                          {st.student?.grade ? `${st.student.grade}학년 ` : ''}
                          {st.student?.class ? `${st.student.class}반 ` : ''}
                          {st.student?.number ? `${st.student.number}번` : ''}
                        </td>
                        <td className="py-2.5 px-2 text-[var(--ink)]">
                          <span className="font-semibold">{st.detailText}</span>
                        </td>
                        <td className="py-2.5 px-2 text-center whitespace-nowrap">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            PASS ({st.sum})
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => {
                              setCriteriaModal(null);
                              onSelectStudent(st.studentName, st.student?.grade || '1');
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--surface-alt)] hover:bg-[var(--accent)] hover:text-white text-[11px] font-semibold text-[var(--accent)] border border-[var(--border)] transition-colors cursor-pointer"
                          >
                            <span>보기</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setCriteriaModal(null)}
                className="px-4 py-2 rounded-lg bg-[var(--surface-alt)] text-xs font-semibold text-[var(--ink)] hover:bg-[var(--border)] cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🖨️ 통계표 인쇄 안내 모달 (iframe sandbox 보안 제한 대응) */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs no-print">
          <div className="bg-[var(--surface)] border border-[var(--border-strong)] rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden p-6 space-y-5 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center font-bold">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--ink)] font-serif-kr">
                    진단 통계 분석표 인쇄 안내
                  </h3>
                  <span className="text-xs text-[var(--muted)]">
                    숭신고 미래인재반 학생별 진단 통계 분석표 (A4 1면 완결)
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[var(--ink-secondary)] leading-relaxed">
              <div className="p-3.5 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)] space-y-2">
                <p className="font-semibold text-[var(--ink)]">
                  💡 미리보기(iframe) 환경에서 인쇄창이 열리지 않으셨나요?
                </p>
                <p>
                  브라우저의 보안 정책상 작은 미리보기 창(iframe) 내부에서는 인쇄 대화상자가 차단될 수 있습니다. 
                  아래 <strong>[새 창에서 열어 인쇄하기]</strong> 또는 <strong>[PDF로 바로 저장 (1페이지)]</strong>를 이용하시면 깔끔하게 1페이지로 출력 및 저장하실 수 있습니다.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[11px] space-y-1.5">
                <div className="font-bold text-[var(--ink)]">인쇄 최적화 권장 설정:</div>
                <div>• 대상: <strong>PDF로 저장</strong> 또는 실제 프린터기</div>
                <div>• 페이지: <strong>1장 (단면 인쇄)</strong> - 과목 지표, 최저 충족률, 킬러문항, 학생별 일람표 완결</div>
                <div>• 용지 방향: <strong>세로 (Portrait)</strong></div>
                <div>• 여백: <strong>최소</strong> 또는 <strong>기본</strong></div>
                <div>• 옵션: <strong>배경 그래픽 인쇄(Background graphics) 체크</strong></div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="px-3.5 py-2 rounded-lg border border-[var(--border)] text-xs font-semibold text-[var(--ink-secondary)] hover:bg-[var(--surface-alt)] cursor-pointer"
              >
                닫기
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowPrintModal(false);
                  handleDownloadPdf();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[var(--border-strong)] bg-[var(--surface-alt)] text-xs font-semibold text-[var(--ink)] hover:bg-[var(--border)] cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>PDF로 바로 다운로드</span>
              </button>

              <a
                href={window.location.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-xs font-bold shadow-xs hover:opacity-90 transition-all cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>새 창에서 열어 인쇄하기</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
