import React, { useState, useMemo } from 'react';
import { ExamRecord, Student } from '../types';
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  SlidersHorizontal,
  RotateCcw,
  GraduationCap,
  ChevronRight,
  Info
} from 'lucide-react';

export interface MinimumCriteriaConfig {
  id: string;
  name: string;
  targetCount: number; // 2 or 3
  limitSum: number; // 7, 8, 5 etc.
  inquiryType: 'avg2' | 'top1'; // 탐구 2과목 평균 vs 상위 1과목
  universities: string;
  description: string;
}

export const STANDARD_CRITERIA: MinimumCriteriaConfig[] = [
  {
    id: '3_7_avg2',
    name: '3합 7 (탐구 2과목)',
    targetCount: 3,
    limitSum: 7,
    inquiryType: 'avg2',
    universities: '고려대(학업우수), 홍익대, 주요 의약학',
    description: '국·수·영·탐(2과목 평균) 중 3개 영역 등급 합 7 이내',
  },
  {
    id: '3_7_top1',
    name: '3합 7 (탐구 1과목)',
    targetCount: 3,
    limitSum: 7,
    inquiryType: 'top1',
    universities: '성균관대, 중앙대, 경희대, 한국외대',
    description: '국·수·영·탐(상위 1과목) 중 3개 영역 등급 합 7 이내',
  },
  {
    id: '3_8_top1',
    name: '3합 8 (탐구 1과목)',
    targetCount: 3,
    limitSum: 8,
    inquiryType: 'top1',
    universities: '건국대, 동국대, 숙명여대, 숭실대',
    description: '국·수·영·탐(상위 1과목) 중 3개 영역 등급 합 8 이내',
  },
  {
    id: '2_5_top1',
    name: '2합 5 (탐구 1과목)',
    targetCount: 2,
    limitSum: 5,
    inquiryType: 'top1',
    universities: '중앙대(교과), 경희대, 세종대, 국민대',
    description: '국·수·영·탐(상위 1과목) 중 2개 영역 등급 합 5 이내',
  },
];

interface SubjectGradeInfo {
  name: string;
  key: string;
  grade: number;
}

interface MinimumStandardSimulatorProps {
  currentExam: ExamRecord | undefined;
  currentStudent: Student;
}

export const MinimumStandardSimulator: React.FC<MinimumStandardSimulatorProps> = ({
  currentExam,
  currentStudent,
}) => {
  // Simulator adjusted grades (offsets from actual grades)
  const [gradeAdjustments, setGradeAdjustments] = useState<Record<string, number>>({});
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedStandardId, setSelectedStandardId] = useState<string>('3_7_top1');

  // Actual base grades from current exam
  const baseGrades = useMemo(() => {
    if (!currentExam) return null;
    const s = currentExam.subjects;
    return {
      korean: s.korean?.grade ?? null,
      math: s.math?.grade ?? null,
      english: s.english?.grade ?? null,
      elective1: s.elective1?.grade ?? null,
      elective2: s.elective2?.grade ?? null,
      elective1Name: s.elective1?.name || '탐구1',
      elective2Name: s.elective2?.name || '탐구2',
    };
  }, [currentExam]);

  // Effective grades with simulation adjustments applied
  const effectiveGrades = useMemo(() => {
    if (!baseGrades) return null;
    const clamp = (val: number | null, adj: number = 0) => {
      if (val === null) return null;
      const res = val + adj;
      return Math.min(9, Math.max(1, res));
    };

    return {
      korean: clamp(baseGrades.korean, gradeAdjustments.korean || 0),
      math: clamp(baseGrades.math, gradeAdjustments.math || 0),
      english: clamp(baseGrades.english, gradeAdjustments.english || 0),
      elective1: clamp(baseGrades.elective1, gradeAdjustments.elective1 || 0),
      elective2: clamp(baseGrades.elective2, gradeAdjustments.elective2 || 0),
      elective1Name: baseGrades.elective1Name,
      elective2Name: baseGrades.elective2Name,
    };
  }, [baseGrades, gradeAdjustments]);

  // Evaluate single criterion
  const evaluateCriterion = (config: MinimumCriteriaConfig) => {
    if (!effectiveGrades) return null;

    const availableSubjects: SubjectGradeInfo[] = [];

    if (effectiveGrades.korean !== null) {
      availableSubjects.push({ name: '국어', key: 'korean', grade: effectiveGrades.korean });
    }
    if (effectiveGrades.math !== null) {
      availableSubjects.push({ name: '수학', key: 'math', grade: effectiveGrades.math });
    }
    if (effectiveGrades.english !== null) {
      availableSubjects.push({ name: '영어', key: 'english', grade: effectiveGrades.english });
    }

    // Inquiry evaluation
    const e1 = effectiveGrades.elective1;
    const e2 = effectiveGrades.elective2;

    if (config.inquiryType === 'avg2') {
      if (e1 !== null && e2 !== null) {
        const avg = (e1 + e2) / 2;
        availableSubjects.push({
          name: `탐구(2과목 평균 ${avg.toFixed(1)})`,
          key: 'inquiry_avg',
          grade: avg,
        });
      } else if (e1 !== null) {
        availableSubjects.push({
          name: `탐구(${effectiveGrades.elective1Name})`,
          key: 'elective1',
          grade: e1,
        });
      } else if (e2 !== null) {
        availableSubjects.push({
          name: `탐구(${effectiveGrades.elective2Name})`,
          key: 'elective2',
          grade: e2,
        });
      }
    } else {
      // top1
      const bestInq =
        e1 !== null && e2 !== null
          ? e1 <= e2
            ? { grade: e1, name: effectiveGrades.elective1Name }
            : { grade: e2, name: effectiveGrades.elective2Name }
          : e1 !== null
          ? { grade: e1, name: effectiveGrades.elective1Name }
          : e2 !== null
          ? { grade: e2, name: effectiveGrades.elective2Name }
          : null;

      if (bestInq) {
        availableSubjects.push({
          name: `탐구 상위1(${bestInq.name})`,
          key: 'inquiry_top1',
          grade: bestInq.grade,
        });
      }
    }

    // Sort by grade ascending (lowest number = best grade)
    availableSubjects.sort((a, b) => a.grade - b.grade);

    if (availableSubjects.length < config.targetCount) {
      return {
        passed: false,
        sum: 0,
        diff: 0,
        selected: [],
        statusText: '응시 과목 부족',
      };
    }

    const selected = availableSubjects.slice(0, config.targetCount);
    const sum = selected.reduce((acc, s) => acc + s.grade, 0);
    const passed = sum <= config.limitSum;
    const diff = sum - config.limitSum; // <= 0 means passed with margin

    return {
      passed,
      sum,
      diff,
      selected,
      statusText: passed
        ? diff === 0
          ? '턱걸이 충족'
          : `${Math.abs(diff)}등급 여유 충족`
        : `${diff}등급 부족`,
    };
  };

  // Evaluate all 4 standards
  const allResults = useMemo(() => {
    return STANDARD_CRITERIA.map((crit) => ({
      config: crit,
      result: evaluateCriterion(crit),
    }));
  }, [effectiveGrades]);

  const hasAdjustments = Object.values(gradeAdjustments).some((v) => v !== 0);

  const resetAdjustments = () => {
    setGradeAdjustments({});
  };

  const handleAdjust = (key: string, delta: number) => {
    setGradeAdjustments((prev) => {
      const current = prev[key] || 0;
      return {
        ...prev,
        [key]: current + delta,
      };
    });
  };

  if (!currentExam || !baseGrades) {
    return null;
  }

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 shadow-[var(--shadow)]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-serif-kr font-bold text-[var(--ink)]">
                주요 대학 수시 '수능 최저학력기준' 자동 판정
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                실시간 판정
              </span>
            </div>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              학생의 실제 성적을 기준으로 대학별 4대 핵심 수능 최저 기준 충족 여부를 산출합니다.
            </p>
          </div>
        </div>

        {/* Simulation toggle button */}
        <button
          type="button"
          onClick={() => setIsSimulating((prev) => !prev)}
          className={`no-print inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            isSimulating
              ? 'bg-[var(--accent)] text-white shadow-xs'
              : 'bg-[var(--surface-alt)] text-[var(--ink-secondary)] hover:border-[var(--border-strong)] border border-[var(--border)]'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>등급 향상 시뮬레이터 {isSimulating ? '닫기' : '열기'}</span>
        </button>
      </div>

      {/* Interactive Simulation Panel (Collapsible) */}
      {isSimulating && (
        <div className="no-print mb-6 p-4 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)] animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--ink)]">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>수능 최저 도약 시뮬레이션 (등급 가상 조정)</span>
            </div>
            {hasAdjustments && (
              <button
                type="button"
                onClick={resetAdjustments}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--accent)] hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>원래 성적으로 초기화</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            {[
              { key: 'korean', name: '국어', base: baseGrades.korean },
              { key: 'math', name: '수학', base: baseGrades.math },
              { key: 'english', name: '영어', base: baseGrades.english },
              { key: 'elective1', name: baseGrades.elective1Name, base: baseGrades.elective1 },
              { key: 'elective2', name: baseGrades.elective2Name, base: baseGrades.elective2 },
            ].map((subj) => {
              if (subj.base === null) return null;
              const adj = gradeAdjustments[subj.key] || 0;
              const eff = Math.min(9, Math.max(1, subj.base + adj));
              return (
                <div
                  key={subj.key}
                  className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex flex-col items-center justify-between gap-1.5"
                >
                  <span className="font-semibold text-[var(--ink-secondary)] truncate w-full text-center">
                    {subj.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[var(--ink)]">
                      {eff}등급
                    </span>
                    {adj !== 0 && (
                      <span
                        className={`text-[10px] font-bold ${
                          adj < 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {adj < 0 ? `▲${Math.abs(adj)}` : `▼${adj}`}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 w-full justify-center pt-0.5">
                    <button
                      type="button"
                      onClick={() => handleAdjust(subj.key, -1)}
                      disabled={eff <= 1}
                      className="px-2 py-0.5 rounded bg-[var(--surface-alt)] hover:bg-emerald-500/10 hover:text-emerald-600 text-xs font-bold border border-[var(--border)] disabled:opacity-30 cursor-pointer"
                      title="1등급 올리기"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjust(subj.key, 1)}
                      disabled={eff >= 9}
                      className="px-2 py-0.5 rounded bg-[var(--surface-alt)] hover:bg-rose-500/10 hover:text-rose-600 text-xs font-bold border border-[var(--border)] disabled:opacity-30 cursor-pointer"
                      title="1등급 내리기"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-[var(--muted)] mt-2">
            * ▲ 버튼을 누르면 해당 과목의 등급이 1단계 향상(예: 3등급 → 2등급)되어 최저 충족 여부가 즉시 재계산됩니다.
          </p>
        </div>
      )}

      {/* 4-Criteria Standard Grid: 4 Columns in 1 Row (4칸 1줄) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {allResults.map(({ config, result }) => {
          if (!result) return null;
          const isPassed = result.passed;

          return (
            <div
              key={config.id}
              className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                isPassed
                  ? 'bg-emerald-500/5 border-emerald-500/30 dark:bg-emerald-950/10'
                  : 'bg-rose-500/5 border-rose-500/30 dark:bg-rose-950/10'
              }`}
            >
              <div>
                {/* Top Badge & Title */}
                <div className="flex items-start justify-between gap-1.5 mb-2">
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-sm text-[var(--ink)] block whitespace-nowrap truncate">
                      {config.name}
                    </span>
                    <p className="text-[11px] text-[var(--muted)] mt-0.5 whitespace-nowrap truncate" title={config.universities}>
                      {config.universities}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 whitespace-nowrap ${
                      isPassed
                        ? 'bg-emerald-500 text-white'
                        : 'bg-rose-500 text-white'
                    }`}
                  >
                    {isPassed ? (
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                    ) : (
                      <XCircle className="w-3 h-3 shrink-0" />
                    )}
                    <span>{isPassed ? '충족' : '미충족'}</span>
                  </div>
                </div>

                {/* Score Formula Display: Clean single line without repeating subject names */}
                <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] mb-2.5">
                  <div className="flex items-center justify-between gap-1 text-[11px] mb-1.5 whitespace-nowrap">
                    <span className="text-[var(--muted)]">반영 등급 합</span>
                    <span className="font-bold text-[var(--ink)]">
                      <span className={isPassed ? 'text-emerald-600 dark:text-emerald-400 font-extrabold text-sm' : 'text-rose-600 dark:text-rose-400 font-extrabold text-sm'}>
                        {result.sum}
                      </span>
                      <span className="text-[var(--muted)] font-normal text-[11px]"> / 기준 {config.limitSum} 이내</span>
                    </span>
                  </div>

                  {/* Grade Formula: Displays selected grades clearly in 1 single line without clipping */}
                  <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-[var(--ink-secondary)] whitespace-nowrap overflow-visible py-0.5">
                    {result.selected.map((s, idx) => (
                      <React.Fragment key={idx}>
                        <span className="px-1.5 py-0.5 rounded bg-[var(--surface-alt)] border border-[var(--border)] font-bold text-[var(--ink)] text-[10.5px] whitespace-nowrap shrink-0">
                          {s.grade}등급
                        </span>
                        {idx < result.selected.length - 1 && <span className="text-[var(--muted)] text-[10px] shrink-0">+</span>}
                      </React.Fragment>
                    ))}
                    <span className="text-[var(--muted)] text-[10px] shrink-0">=</span>
                    <span className={`font-extrabold text-xs whitespace-nowrap shrink-0 ${isPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {result.sum}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Outcome & Advice */}
              <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-[11px] whitespace-nowrap">
                <span className="text-[var(--muted)] truncate" title={config.inquiryType === 'avg2' ? '탐구 2과목 평균 반영' : '탐구 상위 1과목 반영'}>
                  {config.inquiryType === 'avg2' ? '탐구 2과목 평균' : '탐구 상위 1과목'}
                </span>
                <span
                  className={`font-bold ml-1 shrink-0 whitespace-nowrap ${
                    isPassed
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {result.statusText}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info: Strictly 1 line */}
      <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center gap-2 text-[11px] text-[var(--muted)] whitespace-nowrap">
        <span className="inline-flex items-center gap-1 whitespace-nowrap min-w-0">
          <Info className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
          <span className="whitespace-nowrap">성적일람표 공인 등급 기준 상위 우수 영역 조합으로 자동 산출합니다.</span>
        </span>
      </div>
    </div>
  );
};
