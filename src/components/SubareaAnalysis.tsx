import React, { useState } from 'react';
import { ExamRecord, CompareBasis } from '../types';
import { SUBJECTS } from '../data/mockData';
import { cohortSubareaStats, fmt1, gradeColor } from '../utils/analysis';
import { Users, Globe } from 'lucide-react';

interface SubareaAnalysisProps {
  currentExam: ExamRecord | undefined;
  exams: ExamRecord[];
}

interface HoveredInfo {
  subjectName: string;
  subjectColor: string;
  areaName: string;
  studentScore: number;
  maxScore: number;
  studentPct: number;
  comparePct: number | null;
  basisLabel: string;
  x: number;
  y: number;
}

export const SubareaAnalysis: React.FC<SubareaAnalysisProps> = ({ currentExam, exams }) => {
  const [compareBasis, setCompareBasis] = useState<CompareBasis>('cohort');
  const [hoveredInfo, setHoveredInfo] = useState<HoveredInfo | null>(null);

  const subSubjects = SUBJECTS.filter((s) => s.hasSub);

  if (!currentExam) return null;

  const basisLabel = compareBasis === 'cohort' ? '미래인재반 평균' : '전국 평균';

  // Calculate cohort sizes strictly for same grade and same exam month
  const cohortStats = subSubjects.map(
    (s) => cohortSubareaStats(exams, currentExam, s.key)
  );
  const maxCohortSize = Math.max(...cohortStats.map((c) => c.n), 0);
  const targetGrade = cohortStats[0]?.grade || '1';
  const targetMonth = cohortStats[0]?.monthLabel || '3월';

  // SVG dimensions for each of the 3 columns
  const W = 330;
  const rowH = 44;
  const padT = 16;
  const padB = 26;
  const padL = 78;
  const padR = 24;
  const plotW = W - padL - padR;

  return (
    <section className="mb-10" id="subareas">
      {/* Section Title & Compare Basis Controls */}
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-serif-kr font-bold text-[var(--ink)]">영역별 강약점 분석</h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            세부영역 득점률 3단 비교 (국어 · 수학 · 영어) · {currentExam.label}
          </p>
        </div>

        {/* Compare Basis Toggle */}
        <div className="flex items-center gap-1 p-1 bg-[var(--surface-alt)] rounded-lg border border-[var(--border-strong)] shrink-0 whitespace-nowrap">
          <button
            type="button"
            onClick={() => setCompareBasis('cohort')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              compareBasis === 'cohort'
                ? 'bg-[var(--accent)] text-white shadow-xs'
                : 'text-[var(--ink-secondary)] hover:text-[var(--ink)]'
            }`}
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">미래인재반 평균</span>
          </button>
          <button
            type="button"
            onClick={() => setCompareBasis('national')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              compareBasis === 'national'
                ? 'bg-[var(--accent)] text-white shadow-xs'
                : 'text-[var(--ink-secondary)] hover:text-[var(--ink)]'
            }`}
          >
            <Globe className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">전국 평균</span>
          </button>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 md:p-6 shadow-[var(--shadow)] relative">
        {/* Cohort note */}
        <div className="text-xs text-[var(--muted)] mb-5 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" />
          <span>
            {compareBasis === 'cohort'
              ? `비교 대상: 동일 학년(${targetGrade}학년) · 동일 월(${targetMonth}) 미래인재반 응시 학생 ${
                  maxCohortSize > 0 ? `${maxCohortSize}명` : '전체'
                }의 평균 득점률`
              : '비교 대상: 성적표상 기재된 전국 수험생 평균 득점률 (배점 대비 득점 비율)'}
          </span>
        </div>

        {/* 3-Column Grid: Korean, Math, English Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {subSubjects.map((s) => {
            const subjData = currentExam.subjects[s.key];
            const rows = subjData?.sub || [];
            const cohort = cohortSubareaStats(exams, currentExam, s.key);
            const H = padT + padB + Math.max(1, rows.length) * rowH;

            return (
              <div
                key={`col-${s.key}`}
                className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-4 flex flex-col justify-between shadow-2xs hover:border-[var(--border-strong)] transition-all"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <h3 className="text-sm font-bold text-[var(--ink)]">{s.name}</h3>
                  </div>

                  {subjData && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--ink)] num">
                        {subjData.raw !== undefined ? `${subjData.raw}점` : '-'}
                      </span>
                      {subjData.grade && (
                        <span
                          className="px-2 py-0.5 rounded text-[11px] font-bold"
                          style={{
                            backgroundColor: `${gradeColor(subjData.grade)}18`,
                            color: gradeColor(subjData.grade),
                          }}
                        >
                          {subjData.grade}등급
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Subarea Chart for this subject */}
                {rows.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[var(--muted)] flex flex-col items-center justify-center gap-1.5 px-4">
                    <span className="font-medium text-[var(--ink-secondary)]">세부영역 분석 데이터 미제공</span>
                    <span className="text-[11px] text-[var(--muted)]">학급별 성적일람표 등록 회차는 세부영역별 정오답 데이터가 집계되지 않습니다.</span>
                  </div>
                ) : (
                  <div className="relative w-full">
                    <svg
                      viewBox={`0 0 ${W} ${H}`}
                      className="w-full h-auto overflow-visible select-none"
                      onMouseLeave={() => setHoveredInfo(null)}
                    >
                      {/* Grid Lines (0%, 25%, 50%, 75%, 100%) */}
                      {[0, 25, 50, 75, 100].map((pct) => {
                        const gx = padL + plotW * (pct / 100);
                        return (
                          <g key={`grid-${s.key}-${pct}`}>
                            <line
                              x1={gx}
                              x2={gx}
                              y1={padT}
                              y2={H - padB}
                              stroke="var(--border)"
                              strokeWidth={1}
                              strokeDasharray={pct === 0 ? 'none' : '2,2'}
                            />
                            <text
                              x={gx}
                              y={H - padB + 15}
                              textAnchor="middle"
                              fontSize="9.5"
                              fill="var(--muted)"
                              className="num font-medium"
                            >
                              {pct}%
                            </text>
                          </g>
                        );
                      })}

                      {/* Y-Axis Line */}
                      <line
                        x1={padL}
                        x2={padL}
                        y1={padT}
                        y2={H - padB}
                        stroke="var(--border-strong)"
                        strokeWidth={1.5}
                      />

                      {/* Subarea Rows */}
                      {rows.map((r, i) => {
                        const cy = padT + i * rowH;
                        const studentPct = r.m > 0 ? (r.s / r.m) * 100 : 0;

                        let comparePct: number | null = null;
                        if (compareBasis === 'cohort') {
                          const c = cohort.byName[r.n];
                          comparePct = c && c.count > 0 ? c.sum / c.count : null;
                        } else {
                          comparePct = r.m > 0 ? (r.natAvg / r.m) * 100 : 0;
                        }

                        const barH = 10;
                        const barGap = 3;
                        const studentBarW = Math.max(2, plotW * (studentPct / 100));
                        const compareBarW =
                          comparePct != null ? Math.max(2, plotW * (comparePct / 100)) : 0;

                        return (
                          <g key={`row-${s.key}-${r.n}-${i}`}>
                            {/* Area Label */}
                            <text
                              x={padL - 7}
                              y={cy + rowH / 2 + 1}
                              textAnchor="end"
                              fontSize="11"
                              fontWeight="600"
                              fill="var(--ink)"
                            >
                              {r.n}
                            </text>

                            {/* Student Bar */}
                            <rect
                              x={padL}
                              y={cy + rowH / 2 - barH - barGap / 2}
                              width={studentBarW}
                              height={barH}
                              rx={2.5}
                              fill={s.color}
                              className="cursor-pointer transition-all hover:brightness-115"
                              onMouseEnter={(e) => {
                                const containerRect = e.currentTarget
                                  .closest('#subareas')
                                  ?.getBoundingClientRect();
                                const rect = e.currentTarget.getBoundingClientRect();
                                if (containerRect) {
                                  setHoveredInfo({
                                    subjectName: s.name,
                                    subjectColor: s.color,
                                    areaName: r.n,
                                    studentScore: r.s,
                                    maxScore: r.m,
                                    studentPct,
                                    comparePct,
                                    basisLabel,
                                    x: rect.left - containerRect.left + rect.width / 2,
                                    y: rect.top - containerRect.top - 8,
                                  });
                                }
                              }}
                            />

                            {/* Compare Bar */}
                            {comparePct != null && (
                              <rect
                                x={padL}
                                y={cy + rowH / 2 + barGap / 2}
                                width={compareBarW}
                                height={barH}
                                rx={2.5}
                                fill="var(--muted)"
                                opacity={0.55}
                                className="cursor-pointer transition-all hover:opacity-80"
                                onMouseEnter={(e) => {
                                  const containerRect = e.currentTarget
                                    .closest('#subareas')
                                    ?.getBoundingClientRect();
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  if (containerRect) {
                                    setHoveredInfo({
                                      subjectName: s.name,
                                      subjectColor: s.color,
                                      areaName: r.n,
                                      studentScore: r.s,
                                      maxScore: r.m,
                                      studentPct,
                                      comparePct,
                                      basisLabel,
                                      x: rect.left - containerRect.left + rect.width / 2,
                                      y: rect.top - containerRect.top - 8,
                                    });
                                  }
                                }}
                              />
                            )}
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Shared Hover Tooltip */}
        {hoveredInfo && (
          <div
            className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full bg-[var(--ink)] text-[var(--paper)] text-xs rounded-lg px-3 py-2 shadow-xl border border-[var(--border-strong)] whitespace-nowrap animate-in fade-in duration-150"
            style={{ left: hoveredInfo.x, top: hoveredInfo.y }}
          >
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: hoveredInfo.subjectColor }}
              />
              <span>
                {hoveredInfo.subjectName} · {hoveredInfo.areaName}
              </span>
            </div>
            <div className="space-y-0.5 text-[11px]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-300">학생 득점률:</span>
                <span className="font-bold text-white num">
                  {fmt1(hoveredInfo.studentPct)}% ({hoveredInfo.studentScore}/
                  {hoveredInfo.maxScore}점)
                </span>
              </div>
              {hoveredInfo.comparePct != null && (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-300">{hoveredInfo.basisLabel}:</span>
                  <span className="font-semibold text-gray-200 num">
                    {fmt1(hoveredInfo.comparePct)}%
                  </span>
                </div>
              )}
              {hoveredInfo.comparePct != null && (
                <div className="flex items-center justify-between gap-3 pt-1 mt-1 border-t border-white/15">
                  <span className="text-gray-300">평균 대비:</span>
                  <span
                    className={`font-bold num ${
                      hoveredInfo.studentPct >= hoveredInfo.comparePct
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {hoveredInfo.studentPct >= hoveredInfo.comparePct ? '+' : ''}
                    {fmt1(hoveredInfo.studentPct - hoveredInfo.comparePct)}%p
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Global Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-6 pt-4 border-t border-[var(--border)] text-xs text-[var(--ink-secondary)] whitespace-nowrap">
          <div className="flex items-center gap-2.5 sm:gap-3 whitespace-nowrap shrink-0">
            <span className="text-[11px] font-semibold text-[var(--muted)] whitespace-nowrap shrink-0">학생 득점률:</span>
            {subSubjects.map((s) => (
              <div key={`legend-${s.key}`} className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
                <span
                  className="w-3 h-2.5 rounded-xs shrink-0"
                  style={{ backgroundColor: s.color }}
                />
                <span className="font-medium text-[var(--ink)] whitespace-nowrap">{s.name}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 pl-3 border-l border-[var(--border)] whitespace-nowrap shrink-0">
            <span className="w-3 h-2.5 rounded-xs bg-[var(--muted)] opacity-55 shrink-0" />
            <span className="font-medium text-[var(--ink)] whitespace-nowrap">{basisLabel}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
