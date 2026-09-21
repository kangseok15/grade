import React, { useState, useMemo } from 'react';
import {
  Award,
  Info,
  ChevronRight,
  AlertTriangle,
  TrendingDown,
  X,
  BookOpen,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import { Student, ExamRecord } from '../types';
import {
  HUMANITIES_TIERS,
  NATURAL_TIERS,
  getAdmissionTier,
  AdmissionTier,
} from '../data/admissionData';

interface Props {
  currentStudent: Student;
  latestExam?: ExamRecord | null;
}

export const AdmissionPredictionCard: React.FC<Props> = ({
  currentStudent,
  latestExam,
}) => {
  // Strictly determine track from student assigned track (인문 or 자연)
  const track: 'humanities' | 'natural' =
    currentStudent.track === '인문' ? 'humanities' : 'natural';

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculate score breakdown
  const scoreData = useMemo(() => {
    if (!latestExam) return null;

    const korPct = latestExam.subjects.korean?.percentile ?? null;
    const mathPct = latestExam.subjects.math?.percentile ?? null;
    const e1Pct = latestExam.subjects.elective1?.percentile ?? null;
    const e2Pct = latestExam.subjects.elective2?.percentile ?? null;

    if (korPct === null || mathPct === null) return null;

    // Inquiry percentile calculation: average of 2 electives if available, or 1 if only 1 exists
    let inqAvgPct: number | null = null;
    if (e1Pct !== null && e2Pct !== null) {
      inqAvgPct = (e1Pct + e2Pct) / 2;
    } else if (e1Pct !== null) {
      inqAvgPct = e1Pct;
    } else if (e2Pct !== null) {
      inqAvgPct = e2Pct;
    }

    if (inqAvgPct === null) return null;

    // 국·수·탐 백분위 합 (300점 만점)
    const sum300 = korPct + mathPct + inqAvgPct;
    const avg3 = sum300 / 3;

    // 1·2학년의 경우 고3 수능 시 상위권 N수생 유입에 따른 감점(3~5%p, 평균 4%p 선반영) 적용
    const isGrade1or2 = currentStudent.grade === '1' || currentStudent.grade === '2';
    const nDiscountPct = isGrade1or2 ? 4.0 : 0; // 3~5% 중 4%p 선반영 (합산 약 12점)
    const adjustedSum300 = Math.max(0, sum300 - nDiscountPct * 3);
    const adjustedAvg3 = Math.max(0, avg3 - nDiscountPct);

    const currentTier = getAdmissionTier(sum300, track);
    // 마지노선 대학 라인: 1·2학년은 N수생 감점 보정 후 백분위 기준, 3학년은 실전 백분위 기준
    const predictedTier = isGrade1or2 ? getAdmissionTier(adjustedSum300, track) : currentTier;

    // Conservative 1-tier lower estimate for N-takers
    const conservativeSum = Math.max(0, sum300 - 15); // approx 5% drop per subject (~15 pts in sum)
    const conservativeTier = getAdmissionTier(conservativeSum, track);

    return {
      korPct,
      mathPct,
      e1Pct,
      e2Pct,
      e1Name: latestExam.subjects.elective1?.name || '탐구1',
      e2Name: latestExam.subjects.elective2?.name || '탐구2',
      inqAvgPct,
      sum300,
      avg3,
      isGrade1or2,
      nDiscountPct,
      adjustedSum300,
      adjustedAvg3,
      currentTier,
      predictedTier,
      conservativeTier,
    };
  }, [latestExam, track, currentStudent.grade]);

  if (!latestExam || !scoreData) {
    return (
      <div className="bg-[var(--surface-alt)]/60 px-5 py-3 rounded-xl border border-[var(--border)] text-right">
        <div className="text-xs text-[var(--muted)] font-medium">최근 모의고사</div>
        <div className="text-sm font-semibold text-[var(--ink-secondary)] mt-1">
          성적 등록 대기중
        </div>
      </div>
    );
  }

  const activeTiers = track === 'humanities' ? HUMANITIES_TIERS : NATURAL_TIERS;

  return (
    <>
      {/* Header Card Container */}
      <div className="bg-[var(--surface-alt)]/70 hover:bg-[var(--surface-alt)]/90 transition-all rounded-2xl border border-[var(--border)] p-4 sm:p-4.5 max-w-xl w-full shadow-xs">
        {/* Top Control Bar: Assigned Track Badge & Detail Button */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 bg-[var(--surface)] px-2.5 py-1 rounded-lg border border-[var(--border)] whitespace-nowrap shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            <span className="text-xs font-bold text-[var(--accent)]">
              {track === 'humanities' ? '인문계열' : '자연계열'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1 text-[11px] font-medium text-[var(--ink-secondary)] hover:text-[var(--accent)] transition-colors px-2 py-1 rounded-md hover:bg-[var(--surface)] border border-transparent hover:border-[var(--border)] whitespace-nowrap shrink-0 cursor-pointer"
            title="수시 납치 방지 및 기준표 상세 안내"
          >
            <Info className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
            <span>수시 납치 하한선 안내</span>
          </button>
        </div>

        {/* Score and Target Universities Layout */}
        <div className="space-y-2">
          {/* Main KPI numbers */}
          <div className="flex items-center justify-between gap-2 border-b border-[var(--border)]/60 pb-2">
            <div className="flex items-center gap-1.5 text-xs text-[var(--ink-secondary)] font-medium whitespace-nowrap shrink-0">
              <Award className="w-4 h-4 text-[var(--accent)] shrink-0" />
              <span>국·수·탐 백분위 합</span>
              <span className="text-[10px] text-[var(--muted)]">(300점 만점)</span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
              <span className="font-serif-kr text-xl sm:text-2xl font-bold text-[var(--ink)] num">
                {scoreData.sum300.toFixed(1)}
                <span className="text-xs font-sans-kr font-normal text-[var(--muted)] ml-0.5">점</span>
              </span>
              <span className="text-[11px] font-semibold text-[var(--ink-secondary)] bg-[var(--surface)] px-2 py-0.5 rounded-full border border-[var(--border)] whitespace-nowrap shrink-0">
                평균 {scoreData.avg3.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Target Line Callout */}
          <div className="pt-0.5">
            <div className="flex items-center justify-between text-[11px] text-[var(--muted)] font-medium mb-1 whitespace-nowrap">
              <div className="flex items-center gap-1.5 text-[var(--accent)] font-semibold whitespace-nowrap">
                <span>🎯 수시 납치 주의 하한선</span>
              </div>
              <span className="text-[10px] text-[var(--muted)] font-medium whitespace-nowrap">
                정시 합격권 기준
              </span>
            </div>
            <div
              onClick={() => setIsModalOpen(true)}
              className="cursor-pointer group bg-[var(--surface)]/90 hover:bg-[var(--surface)] px-3 py-2 rounded-xl border border-[var(--border)] transition-all flex items-center justify-between gap-2 min-w-0"
              title={scoreData.predictedTier.line}
            >
              <div className="text-[11px] sm:text-xs font-semibold text-[var(--ink)] whitespace-nowrap truncate min-w-0 flex-1 leading-normal">
                {scoreData.predictedTier.line}
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--muted)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
            </div>

            {/* Explanatory subtitle for 1st & 2nd graders: inline without breaking */}
            {scoreData.isGrade1or2 ? (
              <div className="text-[10.5px] text-amber-700 dark:text-amber-400 font-medium mt-1.5 px-0.5 whitespace-nowrap truncate leading-normal" title={`※ 고3 수능 상위권 N수생 유입에 따른 예상 감점(3~5%p)을 감안한 안전 방어선 (보정 평균 ${scoreData.adjustedAvg3.toFixed(1)}%)`}>
                ※ 고3 수능 상위권 N수생 유입에 따른 예상 감점(3~5%p)을 감안한 안전 방어선 (보정 평균 {scoreData.adjustedAvg3.toFixed(1)}%)
              </div>
            ) : (
              <div className="text-[10.5px] text-[var(--muted)] font-medium mt-1.5 px-0.5 whitespace-nowrap truncate leading-normal" title={`※ 3학년 실측 백분위 기준 정시 지원 합격선 (평균 ${scoreData.avg3.toFixed(1)}%)`}>
                ※ 3학년 실측 백분위 기준 정시 지원 합격선 (평균 {scoreData.avg3.toFixed(1)}%)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-[var(--surface)] text-[var(--ink)] w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-alt)]/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--ink)]">
                    수시 납치 방지 및 수시 납치 주의 하한선 안내
                  </h3>
                  <p className="text-xs text-[var(--muted)]">
                    {currentStudent.name} 학생 현 성적 기반 정시 환산선 ({track === 'humanities' ? '인문계열' : '자연계열'} 기준)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-[var(--surface-alt)] text-[var(--muted)] hover:text-[var(--ink)] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              {/* Current Student Snapshot Card */}
              <div className="bg-[var(--surface-alt)]/60 rounded-xl p-4 border border-[var(--border)] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)]/70 pb-2.5">
                  <div className="text-xs font-semibold text-[var(--ink-secondary)] whitespace-nowrap">
                    최근 회차 성적 세부 지표 ({latestExam.label})
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[var(--surface)] border border-[var(--border)] text-xs font-bold text-[var(--accent)] whitespace-nowrap">
                    {track === 'humanities' ? '인문계열 기준' : '자연계열 기준'}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-[var(--surface)] p-2 rounded-lg border border-[var(--border)]">
                    <div className="text-[var(--muted)] mb-0.5">국어 백분위</div>
                    <div className="font-bold text-sm text-[var(--ink)] num">
                      {scoreData.korPct.toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-[var(--surface)] p-2 rounded-lg border border-[var(--border)]">
                    <div className="text-[var(--muted)] mb-0.5">수학 백분위</div>
                    <div className="font-bold text-sm text-[var(--ink)] num">
                      {scoreData.mathPct.toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-[var(--surface)] p-2 rounded-lg border border-[var(--border)]">
                    <div className="text-[var(--muted)] mb-0.5">탐구 평균 백분위</div>
                    <div className="font-bold text-sm text-[var(--ink)] num">
                      {scoreData.inqAvgPct.toFixed(1)}%
                    </div>
                    <div className="text-[10px] text-[var(--muted)] truncate mt-0.5">
                      {scoreData.e1Name} {scoreData.e1Pct?.toFixed(0)}% / {scoreData.e2Name} {scoreData.e2Pct?.toFixed(0)}%
                    </div>
                  </div>
                  <div className="bg-[var(--accent)]/10 p-2 rounded-lg border border-[var(--accent)]/30">
                    <div className="text-[var(--accent)] font-semibold mb-0.5">국·수·탐 백분위 합</div>
                    <div className="font-bold text-base text-[var(--accent)] num">
                      {scoreData.sum300.toFixed(1)}점
                    </div>
                    <div className="text-[10px] text-[var(--accent)] font-medium">
                      (평균 {scoreData.avg3.toFixed(1)}%)
                    </div>
                  </div>
                </div>

                {/* N수생 유입 감점 보정 안내 카드 (1·2학년) */}
                {scoreData.isGrade1or2 && (
                  <div className="bg-amber-500/10 border border-amber-500/25 rounded-lg p-3 text-xs space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 font-semibold text-amber-900 dark:text-amber-200">
                      <span className="flex items-center gap-1.5">
                        <TrendingDown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>고3 수능 N수생 유입 대비 감점 보정 (-4%p 선반영)</span>
                      </span>
                      <span className="num font-bold text-amber-700 dark:text-amber-300">
                        보정 합 {scoreData.adjustedSum300.toFixed(1)}점 (평균 {scoreData.adjustedAvg3.toFixed(1)}%)
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800/90 dark:text-amber-200/90 leading-relaxed">
                      현재 1·2학년 모의고사는 고교 재학생끼리만 경쟁하므로 수능 본시험 대비 백분위가 높게 측정됩니다. 고3 시점 상위권 N수생(재수·반수생) 대거 유입으로 인한 <strong>예상 백분위 하락(3~5%p)을 차감</strong>하여 수시 납치를 방지하는 안전 방어선을 산출했습니다.
                    </p>
                  </div>
                )}

                <div className="bg-[var(--surface)] p-3.5 rounded-lg border border-[var(--border)] flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-1 w-full">
                    <div className="text-xs font-bold text-[var(--ink)] flex flex-wrap items-center justify-between gap-2">
                      <span>최종 권장 수시 납치 주의 하한선 대학:</span>
                      <span className="text-[11px] font-semibold text-[var(--accent)] bg-[var(--accent-soft)]/60 px-2 py-0.5 rounded border border-[var(--accent)]/20">
                        {scoreData.predictedTier.tierName}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-[var(--accent)]">
                      {scoreData.predictedTier.line}
                    </div>
                    {scoreData.isGrade1or2 && (
                      <div className="text-[11px] text-[var(--muted)] flex flex-wrap items-center gap-2 pt-0.5">
                        <span>단순 합산선: {scoreData.currentTier.line.split(',')[0]} 등</span>
                        <span>→</span>
                        <span className="text-amber-700 dark:text-amber-300 font-medium">
                          N수생 유입 예상 보정(-4%p) 안전 하한선 적용 완료
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Crucial Advisory 1: 수시 납치 방지 전략 */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>수시 원서 접수 시 '수시 납치' 주의 사항</span>
                </div>
                <ul className="text-xs text-amber-900/90 dark:text-amber-200/90 space-y-1.5 pl-5 list-disc leading-relaxed">
                  <li>
                    <strong>수시 납치란?</strong> 수시 모집(학생부교과·종합·논술 등)에서 합격(최초 및 충원 추가합격 포함)하면, 수능 점수가 아무리 높아도 <strong>정시 지원이 법적으로 전면 금지</strong>됩니다.
                  </li>
                  <li>
                    따라서 수시 6장의 카드를 작성할 때는, 정시로 충분히 진학할 수 있는 <strong>본 대학 라인보다 낮은 대학은 원서를 쓰지 않거나 최후의 보루 1장 정도로만 엄격히 제한</strong>해야 합니다.
                  </li>
                </ul>
              </div>

              {/* Crucial Advisory 2: N수생 유입 경고 및 보정 배경 */}
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-sm">
                  <TrendingDown className="w-4 h-4 shrink-0" />
                  <span>⚠️ 고3 수능 시 N수생 유입에 따른 정시 마지노선 하향 조정 배경</span>
                </div>
                <div className="text-xs text-rose-900/90 dark:text-rose-200/90 space-y-1.5 leading-relaxed">
                  <p>
                    현재 고1·고2 모의고사 성적표의 백분위는 <strong>고등학교 재학생끼리만 경쟁한 결과</strong>입니다.
                  </p>
                  <p>
                    하지만 실제 고3 대학수학능력시험 본시험에는 <strong>최상위권 재수생·반수생·N수생(약 15~17만 명)이 대거 유입</strong>됩니다. 이에 따라 재학생들은 실제 수능에서 <strong>백분위가 평균 3~5%p(합산 9~15점) 이상 자연 하락</strong>하는 현상이 보편적으로 발생합니다.
                  </p>
                  <p className="font-semibold text-rose-700 dark:text-rose-300">
                    💡 수시 원서 지도 전략: 현재 백분위 그대로 수시 하한선을 잡으면 '수시 납치'의 위험이나 정시 실패 위험이 커집니다. 따라서 본 시스템에서는 <strong>상위권 N수생 유입에 따른 예상 감점분(3~5%p)을 감안하여 차감한 보수적 정시 마지노선 대학({scoreData.predictedTier.tierName}: {scoreData.predictedTier.line})</strong>을 기준으로 수시 원서를 지도할 것을 권장합니다.
                  </p>
                </div>
              </div>

              {/* Advisory 3: 대학별 환산 차이 */}
              <div className="text-xs text-[var(--muted)] space-y-1 bg-[var(--surface-alt)]/40 p-3 rounded-lg border border-[var(--border)]">
                <div className="font-semibold text-[var(--ink-secondary)] flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--muted)]" />
                  <span>대학별 수능 전형 및 환산 방식 차이 안내</span>
                </div>
                <p>
                  본 기준은 단순 백분위 합(300점 만점) 기준의 대표적인 마지노선 분류표입니다. 대학별로 국어·수학·탐구 반영 비율(자연계열 수학·과탐 가중치 등), 영어 등급별 감점/가산점 격차, 탐구 영역 변환표준점수 반영 방식에 따라 실제 합격 가능 여부는 상이할 수 있습니다.
                </p>
                {track === 'natural' && (
                  <p className="text-sky-600 dark:text-sky-400 font-medium">
                    * 자연계열 의약학계열(의대·치대·한의대·약대·수의대)은 통상 백분위 합 290~298점 이상 선에서 합격선이 형성됩니다.
                  </p>
                )}
              </div>

              {/* Full Benchmark Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-[var(--ink)] flex items-center gap-1.5 whitespace-nowrap">
                    <span>{track === 'humanities' ? '인문계열' : '자연계열'} 마지노선 전체 기준표</span>
                    <span className="text-[11px] font-normal text-[var(--muted)]">(국·수·탐 300점 만점 기준)</span>
                  </h4>
                </div>

                <div className="border border-[var(--border)] rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-[var(--surface-alt)] border-b border-[var(--border)] text-[var(--ink-secondary)]">
                        <th className="py-2.5 px-3 font-semibold text-center w-24 whitespace-nowrap">백분위 합</th>
                        <th className="py-2.5 px-3 font-semibold text-center w-20 whitespace-nowrap">3개 영역 평균</th>
                        <th className="py-2.5 px-3 font-semibold whitespace-nowrap">대학 그룹 / 수시 납치 주의 하한선 라인</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {activeTiers.map((tier) => {
                        const isCurrent = tier.id === scoreData.currentTier.id;
                        const isPredicted = tier.id === scoreData.predictedTier.id;
                        const isHighlighted = isCurrent || isPredicted;
                        return (
                          <tr
                            key={tier.id}
                            className={`transition-colors ${
                              isPredicted
                                ? 'bg-amber-500/15 font-medium'
                                : isCurrent
                                ? 'bg-[var(--accent)]/10 font-medium'
                                : 'hover:bg-[var(--surface-alt)]/40'
                            }`}
                          >
                            <td className="py-2.5 px-3 text-center num whitespace-nowrap">
                              {isPredicted && (
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-600 mr-1.5 animate-pulse" />
                              )}
                              {!isPredicted && isCurrent && (
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--accent)] mr-1.5" />
                              )}
                              <span className={isPredicted ? 'font-bold text-amber-800 dark:text-amber-200' : isCurrent ? 'font-bold text-[var(--accent)]' : 'text-[var(--ink)]'}>
                                {tier.rangeText}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center num text-[var(--muted)] whitespace-nowrap">
                              {tier.avgText}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span
                                  className={`text-xs ${
                                    isHighlighted
                                      ? 'font-bold text-[var(--ink)]'
                                      : 'text-[var(--ink-secondary)]'
                                  }`}
                                >
                                  {tier.line}
                                </span>
                                {isPredicted && scoreData.isGrade1or2 && (
                                  <span className="shrink-0 text-[10px] font-bold bg-amber-600 text-white px-2 py-0.5 rounded-full whitespace-nowrap">
                                    🎯 N수생 보정 하한선
                                  </span>
                                )}
                                {isCurrent && (!isPredicted || !scoreData.isGrade1or2) && (
                                  <span className="shrink-0 text-[10px] font-semibold bg-[var(--surface)] text-[var(--ink-secondary)] border border-[var(--border)] px-2 py-0.5 rounded-full whitespace-nowrap">
                                    현재 단순합 구간
                                  </span>
                                )}
                              </div>
                              {tier.notes && (
                                <div className="text-[10px] text-[var(--accent)] mt-0.5">
                                  * {tier.notes}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-[var(--border)] bg-[var(--surface-alt)]/40 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-[var(--surface)] hover:bg-[var(--surface-alt)] border border-[var(--border)] rounded-lg text-xs font-semibold text-[var(--ink)] transition-colors cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

