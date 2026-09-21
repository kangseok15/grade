import React, { useState } from 'react';
import { ExamRecord, SubjectKey, Student } from '../types';
import { SUBJECTS } from '../data/mockData';
import { fmt1, studentExams, formatShortExamSession } from '../utils/analysis';
import { Table, LineChart as ChartIcon } from 'lucide-react';

interface TrendChartsProps {
  exams: ExamRecord[];
  currentStudentId: string;
  student?: Student;
}

interface TooltipData {
  x: number;
  y: number;
  label: string;
  color: string;
  date: string;
  valueText: string;
}

export const TrendCharts: React.FC<TrendChartsProps> = ({ exams, currentStudentId, student }) => {
  const myExams = studentExams(exams, currentStudentId);
  const [viewMode, setViewMode] = useState<'matrix' | 'overview'>('matrix');

  // Interactive tooltips for overview charts
  const [gradeTooltip, setGradeTooltip] = useState<TooltipData | null>(null);
  const [pctTooltip, setPctTooltip] = useState<TooltipData | null>(null);

  if (myExams.length === 0) {
    return null;
  }

  // 1, 2학년은 전 과목이 공통과목(선택과목 구분이 없음)이므로 '선택과목' 행 삭제 반영
  const isGrade1or2 =
    student?.grade === '1' ||
    student?.grade === '2' ||
    myExams.every((e) => e.label.includes('고1') || e.label.includes('고2'));

  // Exam round column header format: e.g. "26년 3월", "26년 6월", "26년 9월"
  const roundHeaders = myExams.map((e) => formatShortExamSession(e));

  // Target subjects to render in the Matrix view
  const matrixSubjects: {
    key: SubjectKey;
    displayName: string;
    subNameFallback: string;
    isPercentileAvailable: boolean;
    color: string;
    hasElective: boolean;
  }[] = [
    {
      key: 'korean',
      displayName: '국어',
      subNameFallback: '화법과작문',
      isPercentileAvailable: true,
      color: '#2563eb', // 국어: 선명한 블루
      hasElective: !isGrade1or2, // 1, 2학년은 공통과목이므로 선택과목 행 제거
    },
    {
      key: 'math',
      displayName: '수학',
      subNameFallback: '확률과통계',
      isPercentileAvailable: true,
      color: '#ea580c', // 수학: 코랄 오렌지
      hasElective: !isGrade1or2, // 1, 2학년은 공통과목이므로 선택과목 행 제거
    },
    {
      key: 'english',
      displayName: '영어',
      subNameFallback: '영어',
      isPercentileAvailable: false, // 절대평가 (백분위/표준점수 없음)
      color: '#059669', // 영어: 에메랄드 그린
      hasElective: false, // 영어는 전 학년 공통
    },
    {
      key: 'elective1',
      displayName: myExams[myExams.length - 1]?.subjects.elective1?.name || (isGrade1or2 ? '통합사회' : '탐구1'),
      subNameFallback: '통합사회',
      isPercentileAvailable: true,
      color: '#7c3aed', // 탐구1: 세련된 퍼플
      hasElective: !isGrade1or2, // 1, 2학년은 공통(통합사회)으로 이미 표기되므로 선택과목 행 제거
    },
    {
      key: 'elective2',
      displayName: myExams[myExams.length - 1]?.subjects.elective2?.name || (isGrade1or2 ? '통합과학' : '탐구2'),
      subNameFallback: '통합과학',
      isPercentileAvailable: true,
      color: '#0891b2', // 탐구2: 딥 틸/사이언
      hasElective: !isGrade1or2, // 1, 2학년은 공통(통합과학)으로 이미 표기되므로 선택과목 행 제거
    },
  ];

  // ==========================================
  // SPARKLINE COMPONENT FOR EACH SUBJECT ROW (COMPACT, NO SCROLLBAR)
  // ==========================================
  const renderSubjectSparkline = (
    key: SubjectKey,
    isPctAvailable: boolean,
    color: string
  ) => {
    const W = 230;
    const H = 64;
    const padL = 26;
    const padR = 26;
    const padT = 18;
    const padB = 14;

    // Collect data points across rounds
    const pointsData = myExams.map((exam, idx) => {
      const subj = exam.subjects[key];
      const monthLabel = `${parseInt(exam.examDate.slice(5, 7), 10)}월`;

      // Value prioritization: percentile if available, otherwise raw score
      let val: number | null = null;
      if (isPctAvailable && subj?.percentile != null) {
        val = subj.percentile;
      } else if (subj?.raw != null) {
        val = subj.raw;
      }

      return {
        idx,
        monthLabel,
        val,
      };
    });

    const validPoints = pointsData.filter((p) => p.val !== null);

    if (validPoints.length === 0) {
      return (
        <div className="h-full flex items-center justify-center text-xs text-[var(--muted)]">
          데이터 없음
        </div>
      );
    }

    // Determine scale min/max
    const vals = validPoints.map((p) => p.val!);
    const minVal = Math.min(...vals);
    const maxVal = Math.max(...vals);

    let yMin = minVal;
    let yMax = maxVal;
    if (minVal === maxVal) {
      yMin = Math.max(0, minVal - 5);
      yMax = Math.min(isPctAvailable ? 100 : (key === 'history' ? 50 : 100), maxVal + 5);
    } else {
      const buffer = (maxVal - minVal) * 0.35;
      yMin = Math.max(0, minVal - buffer);
      yMax = Math.min(isPctAvailable ? 100 : (key === 'history' ? 50 : 100), maxVal + buffer);
    }

    const plotW = W - padL - padR;
    const plotH = H - padT - padB;

    const coordinates = pointsData.map((p, i) => {
      const x =
        pointsData.length <= 1
          ? W / 2
          : padL + (i / (pointsData.length - 1)) * plotW;

      let y = padT + plotH / 2;
      if (p.val !== null) {
        const t = (p.val - yMin) / (yMax - yMin || 1);
        y = padT + (1 - t) * plotH;
      }

      return {
        ...p,
        x,
        y,
      };
    });

    const validCoords = coordinates.filter((c) => c.val !== null);
    const pathD = validCoords
      .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
      .join(' ');

    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[52px] sm:h-[58px] overflow-visible select-none">
        <defs>
          <filter id={`line-shadow-${key}`} x="-10%" y="-10%" width="120%" height="150%">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor={color} floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Soft horizontal guide line */}
        <line
          x1={padL - 10}
          x2={W - padR + 10}
          y1={padT + plotH / 2}
          y2={padT + plotH / 2}
          stroke="var(--border)"
          strokeDasharray="2,2"
          strokeWidth="1"
        />

        {/* Line Path with distinct subject color */}
        {validCoords.length > 1 && (
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#line-shadow-${key})`}
          />
        )}

        {/* Points & Value Badges */}
        {coordinates.map((c, i) => {
          if (c.val === null) return null;
          const badgeText = isPctAvailable ? fmt1(c.val) : `${c.val}점`;
          const badgeW = Math.max(36, badgeText.length * 7 + 8);
          return (
            <g key={`pt-${key}-${i}`}>
              {/* Circle Marker */}
              <circle
                cx={c.x}
                cy={c.y}
                r="3.5"
                fill={color}
                stroke="#ffffff"
                strokeWidth="2"
              />

              {/* Value Badge Pill (Compact & Crisp) */}
              <rect
                x={c.x - badgeW / 2}
                y={c.y - 17}
                width={badgeW}
                height="15"
                rx="3.5"
                ry="3.5"
                fill={color}
                className="shadow-xs"
              />
              <text
                x={c.x}
                y={c.y - 6}
                textAnchor="middle"
                fill="#ffffff"
                fontSize="10.5"
                fontWeight="800"
                fontFamily="system-ui, -apple-system, sans-serif"
                className="num"
              >
                {badgeText}
              </text>

              {/* X Month Label (Clear, high-contrast) */}
              <text
                x={c.x}
                y={H - 2}
                textAnchor="middle"
                fill="var(--ink)"
                fontSize="10.5"
                fontWeight="700"
              >
                {c.monthLabel}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  // ==========================================
  // DATA FOR OVERVIEW COMPARISON CHARTS
  // ==========================================
  const examDates = myExams.map((e) => ({
    label: e.examDate.slice(2).replace(/-/g, '.'),
    full: e.label,
  }));

  const W_OVERVIEW = 520;
  const H_OVERVIEW = 240;
  const padL_O = 40;
  const padR_O = 20;
  const padT_O = 20;
  const padB_O = 34;
  const plotW_O = W_OVERVIEW - padL_O - padR_O;
  const plotH_O = H_OVERVIEW - padT_O - padB_O;

  function xFor(i: number) {
    return padL_O + (examDates.length <= 1 ? plotW_O / 2 : (i / (examDates.length - 1)) * plotW_O);
  }

  const gradeSeries = SUBJECTS.filter((s) => s.key !== 'history').map((s) => ({
    key: s.key,
    label: s.name,
    color: s.color,
    values: myExams.map((e) => e.subjects[s.key as SubjectKey]?.grade ?? null),
  }));

  const allGrades = gradeSeries.flatMap((s) => s.values.filter((v): v is number => v !== null));
  const maxG = allGrades.length > 0 ? Math.max(...allGrades) : 4;
  const yMaxGrade = Math.min(9, Math.max(4, maxG));
  const yMinGrade = 1;

  function yForGrade(g: number) {
    const t = (g - yMinGrade) / (yMaxGrade - yMinGrade);
    return padT_O + t * plotH_O;
  }

  const pctSubjects = SUBJECTS.filter((s) => s.hasPct && s.key !== 'history');
  const pctSeries = pctSubjects.map((s) => ({
    key: s.key,
    label: s.name,
    color: s.color,
    values: myExams.map((e) => e.subjects[s.key as SubjectKey]?.percentile ?? null),
  }));

  const allPcts = pctSeries.flatMap((s) => s.values.filter((v): v is number => v !== null));
  const minP = allPcts.length > 0 ? Math.min(...allPcts) : 50;
  const yMinPct = Math.min(90, Math.max(0, Math.floor((minP - 5) / 10) * 10));
  const yMaxPct = 100;

  function yForPct(p: number) {
    const t = (p - yMinPct) / (yMaxPct - yMinPct);
    return padT_O + (1 - t) * plotH_O;
  }

  return (
    <section className="mb-8" id="trends">
      {/* Section Header */}
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-serif-kr font-bold text-[var(--ink)] whitespace-nowrap">
            모의고사 회차별 성적 추이
          </h2>
          <p className="text-xs text-[var(--muted)] mt-0.5 whitespace-nowrap truncate" title="과목별 성적 변화 그래프와 회차별 원점수·백분위·표준점수·등급 상세 매트릭스 (영어는 절대평가)">
            과목별 성적 변화 그래프 및 회차별 원점수·백분위·표준점수·등급 상세 매트릭스 (영어는 절대평가)
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-[var(--surface-alt)] p-1 rounded-lg border border-[var(--border)]">
          <button
            type="button"
            onClick={() => setViewMode('matrix')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all whitespace-nowrap ${
              viewMode === 'matrix'
                ? 'bg-[var(--surface)] text-[var(--ink)] shadow-xs border border-[var(--border-strong)]'
                : 'text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>과목별 성적표 양식</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('overview')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all whitespace-nowrap ${
              viewMode === 'overview'
                ? 'bg-[var(--surface)] text-[var(--ink)] shadow-xs border border-[var(--border-strong)]'
                : 'text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
          >
            <ChartIcon className="w-3.5 h-3.5" />
            <span>전과목 종합 그래프</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. PRIMARY VIEW: SUBJECT-BY-SUBJECT MATRIX TABLE (COMPACT & SCROLLBAR-FREE)*/}
      {/* ========================================================================= */}
      {viewMode === 'matrix' ? (
        <div className="bg-[var(--surface)] border border-[#b8cde2] dark:border-[#334155] rounded-xl shadow-[var(--shadow)] overflow-hidden w-full">
          <div className="w-full overflow-hidden">
            <table className="w-full table-fixed border-collapse text-xs">
              {/* Proportional Column Definition: strictly sums to 100% */}
              <colgroup>
                <col style={{ width: '15%' }} />
                <col style={{ width: '35%' }} />
                <col style={{ width: '14%' }} />
                {roundHeaders.map((_, idx) => (
                  <col
                    key={`col-hdr-${idx}`}
                    style={{ width: `${36 / Math.max(1, roundHeaders.length)}%` }}
                  />
                ))}
              </colgroup>

              {/* Table Master Header */}
              <thead>
                <tr className="bg-[#7492b3] dark:bg-[#435d79] text-white border-b border-[#63809f]">
                  <th className="py-2 px-1.5 text-center font-bold tracking-tight border-r border-[#8faac6] dark:border-[#526e8c] whitespace-nowrap text-xs sm:text-[13px]">
                    과목
                  </th>
                  <th className="py-2 px-1.5 text-center font-bold tracking-tight border-r border-[#8faac6] dark:border-[#526e8c] whitespace-nowrap text-xs sm:text-[13px]">
                    성적변화 추이
                  </th>
                  <th className="py-2 px-1.5 text-center font-bold tracking-tight border-r border-[#8faac6] dark:border-[#526e8c] whitespace-nowrap text-xs sm:text-[13px]">
                    성적구분
                  </th>
                  {roundHeaders.map((hdr, idx) => (
                    <th
                      key={idx}
                      className="py-2 px-1.5 text-center font-bold tracking-tight border-r last:border-r-0 border-[#8faac6] dark:border-[#526e8c] whitespace-nowrap text-xs sm:text-[13px]"
                    >
                      {hdr}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Table Subject Rows */}
              <tbody>
                {matrixSubjects.map((item, rowIdx) => {
                  const isLastRow = rowIdx === matrixSubjects.length - 1;
                  const borderBottomClass = isLastRow
                    ? ''
                    : 'border-b border-[#b8cde2] dark:border-[#334155]';

                  return (
                    <tr key={item.key} className={`${borderBottomClass} hover:bg-[var(--surface-alt)]/20 transition-colors`}>
                      {/* 1. Subject Label Cell */}
                      <td className="text-center font-bold border-r border-[#c8d9ea] dark:border-[#334155] px-1.5 py-2 bg-[var(--surface)] align-middle">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <span
                            className="inline-flex items-center justify-center px-2.5 py-1 rounded-md font-bold border shadow-xs whitespace-nowrap shrink-0 text-xs sm:text-[13px]"
                            style={{
                              backgroundColor: `${item.color}15`,
                              color: item.color,
                              borderColor: `${item.color}40`,
                            }}
                          >
                            {item.displayName}
                          </span>
                          {!item.isPercentileAvailable && (
                            <span className="text-[10px] text-[var(--muted)] font-medium whitespace-nowrap tracking-tight">
                              9등급 절대평가
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 2. Score Trend Sparkline Cell */}
                      <td className="border-r border-[#c8d9ea] dark:border-[#334155] p-1 bg-[var(--surface)] align-middle">
                        <div className="flex items-center h-full min-h-[72px] sm:min-h-[78px]">
                          {/* Vertical Indicator Label (백분위 / 원점수) */}
                          <div
                            className="w-6 shrink-0 flex flex-col items-center justify-center text-[10px] sm:text-[11px] font-bold py-1 border-r border-[#e1ecf6] dark:border-[#1e293b]"
                            style={{ color: item.color }}
                          >
                            {item.isPercentileAvailable ? (
                              <>
                                <span>백</span>
                                <span className="my-0.5">분</span>
                                <span>위</span>
                              </>
                            ) : (
                              <>
                                <span>원</span>
                                <span className="my-0.5">점</span>
                                <span>수</span>
                              </>
                            )}
                          </div>

                          {/* Compact Sparkline Visual */}
                          <div className="flex-1 px-1 h-full flex items-center justify-center">
                            {renderSubjectSparkline(item.key, item.isPercentileAvailable, item.color)}
                          </div>
                        </div>
                      </td>

                      {/* 3 & 4. Score Matrix Details Table (Pixel-perfect column matching) */}
                      <td colSpan={1 + roundHeaders.length} className="p-0 bg-[var(--surface)] align-middle">
                        <div className="w-full flex flex-col justify-center min-h-[72px] sm:min-h-[78px]">
                          {/* Sub-row 1: 선택과목 (3학년 선택과목만 노출) */}
                          {item.hasElective && (
                            <div className="flex items-center text-xs border-b border-[#e1ecf6] dark:border-[#1e293b] py-1 sm:py-1.5">
                              <div className="w-[28%] shrink-0 text-center font-bold text-[var(--ink-secondary)] border-r border-[#e1ecf6] dark:border-[#1e293b] px-1 whitespace-nowrap truncate">
                                선택과목
                              </div>
                              {myExams.map((e) => {
                                const s = e.subjects[item.key];
                                const electiveName =
                                  s?.name || item.subNameFallback || '-';
                                return (
                                  <div
                                    key={`sub-${e.id}`}
                                    className="flex-1 text-center font-medium text-[var(--ink)] truncate px-1 border-r last:border-r-0 border-[#e1ecf6] dark:border-[#1e293b] whitespace-nowrap"
                                  >
                                    {electiveName}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Sub-row 2: 원점수 */}
                          <div className={`flex items-center text-xs border-b border-[#e1ecf6] dark:border-[#1e293b] ${!item.isPercentileAvailable && !item.hasElective ? 'py-2.5 sm:py-3.5' : 'py-1 sm:py-1.5'}`}>
                            <div className="w-[28%] shrink-0 text-center font-bold text-[var(--ink-secondary)] border-r border-[#e1ecf6] dark:border-[#1e293b] px-1 whitespace-nowrap truncate">
                              원점수
                            </div>
                            {myExams.map((e) => {
                              const s = e.subjects[item.key];
                              return (
                                <div
                                  key={`raw-${e.id}`}
                                  className="flex-1 text-center num font-semibold text-[var(--ink)] border-r last:border-r-0 border-[#e1ecf6] dark:border-[#1e293b] px-1 whitespace-nowrap"
                                >
                                  {s?.raw != null ? `${s.raw}점` : '-'}
                                </div>
                              );
                            })}
                          </div>

                          {/* Sub-row 3: 백분위 (영어·한국사는 절대평가로 백분위가 없으므로 제외) */}
                          {item.isPercentileAvailable && (
                            <div className="flex items-center text-xs border-b border-[#e1ecf6] dark:border-[#1e293b] py-1 sm:py-1.5">
                              <div className="w-[28%] shrink-0 text-center font-bold text-[var(--ink-secondary)] border-r border-[#e1ecf6] dark:border-[#1e293b] px-1 whitespace-nowrap truncate">
                                백분위
                              </div>
                              {myExams.map((e) => {
                                const s = e.subjects[item.key];
                                return (
                                  <div
                                    key={`pct-${e.id}`}
                                    className="flex-1 text-center num font-bold text-[var(--ink)] border-r last:border-r-0 border-[#e1ecf6] dark:border-[#1e293b] px-1 whitespace-nowrap"
                                  >
                                    {s?.percentile != null ? fmt1(s.percentile) : '-'}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Sub-row 4: 표준점수 (영어·한국사는 절대평가로 표준점수가 없으므로 제외) */}
                          {item.isPercentileAvailable && (
                            <div className="flex items-center text-xs border-b border-[#e1ecf6] dark:border-[#1e293b] py-1 sm:py-1.5">
                              <div className="w-[28%] shrink-0 text-center font-bold text-[var(--ink-secondary)] border-r border-[#e1ecf6] dark:border-[#1e293b] px-1 whitespace-nowrap truncate">
                                표준점수
                              </div>
                              {myExams.map((e) => {
                                const s = e.subjects[item.key];
                                return (
                                  <div
                                    key={`std-${e.id}`}
                                    className="flex-1 text-center num font-semibold text-[var(--ink)] border-r last:border-r-0 border-[#e1ecf6] dark:border-[#1e293b] px-1 whitespace-nowrap"
                                  >
                                    {s?.standard != null ? s.standard : '-'}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Sub-row 5: 등급 */}
                          <div className={`flex items-center text-xs bg-[var(--surface-alt)]/30 ${!item.isPercentileAvailable && !item.hasElective ? 'py-2.5 sm:py-3.5' : 'py-1 sm:py-1.5'}`}>
                            <div className="w-[28%] shrink-0 text-center font-bold text-[var(--ink-secondary)] border-r border-[#e1ecf6] dark:border-[#1e293b] px-1 whitespace-nowrap truncate">
                              등급
                            </div>
                            {myExams.map((e) => {
                              const s = e.subjects[item.key];
                              return (
                                <div
                                  key={`grd-${e.id}`}
                                  className="flex-1 text-center num font-bold border-r last:border-r-0 border-[#e1ecf6] dark:border-[#1e293b] px-1 whitespace-nowrap"
                                >
                                  {s?.grade != null ? (
                                    <span
                                      className="inline-block px-2.5 py-0.5 rounded-full text-xs font-extrabold whitespace-nowrap shadow-xs"
                                      style={{
                                        backgroundColor: `${item.color}18`,
                                        color: item.color,
                                      }}
                                    >
                                      {s.grade}등급
                                    </span>
                                  ) : (
                                    '-'
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 2. SECONDARY VIEW: ALL-SUBJECT OVERVIEW CHARTS                            */
        /* ========================================================================= */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Grade Trend Chart */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-[var(--shadow)] relative">
            <div className="flex items-baseline justify-between mb-1">
              <h3 className="text-sm font-bold text-[var(--ink)]">등급 추이</h3>
              <span className="text-[11px] text-[var(--muted)]">전 과목 · 낮을수록(위쪽) 상위 등급</span>
            </div>

            <div className="relative">
              <svg
                viewBox={`0 0 ${W_OVERVIEW} ${H_OVERVIEW}`}
                className="w-full h-auto overflow-visible select-none"
                onMouseLeave={() => setGradeTooltip(null)}
              >
                {/* Grid Lines for Grades */}
                {Array.from({ length: yMaxGrade - yMinGrade + 1 }).map((_, idx) => {
                  const g = yMinGrade + idx;
                  const y = yForGrade(g);
                  return (
                    <g key={`g-grid-${g}`}>
                      <line
                        x1={padL_O}
                        x2={W_OVERVIEW - padR_O}
                        y1={y}
                        y2={y}
                        stroke="var(--border)"
                        strokeWidth={1}
                        strokeDasharray={g === 1 ? 'none' : '2,2'}
                      />
                      <text
                        x={padL_O - 8}
                        y={y + 3.5}
                        textAnchor="end"
                        fontSize="10"
                        fill="var(--muted)"
                        className="num font-medium"
                      >
                        {g}등급
                      </text>
                    </g>
                  );
                })}

                {/* X Axis dates */}
                {examDates.map((d, i) => (
                  <text
                    key={`g-date-${i}`}
                    x={xFor(i)}
                    y={H_OVERVIEW - 10}
                    textAnchor="middle"
                    fontSize="11"
                    fill="var(--ink-secondary)"
                    className="num font-medium"
                  >
                    {d.label}
                  </text>
                ))}

                {/* Series Lines & Circles */}
                {gradeSeries.map((s) => {
                  const validPoints = s.values
                    .map((v, i) =>
                      v !== null
                        ? { x: xFor(i), y: yForGrade(v), val: v, date: examDates[i].label }
                        : null
                    )
                    .filter((p): p is { x: number; y: number; val: number; date: string } => p !== null);

                  if (validPoints.length === 0) return null;

                  const pathData = validPoints.reduce(
                    (acc, p, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`,
                    ''
                  );

                  return (
                    <g key={`g-series-${s.key}`}>
                      <path
                        d={pathData}
                        fill="none"
                        stroke={s.color}
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {validPoints.map((p, idx) => (
                        <circle
                          key={`g-pt-${s.key}-${idx}`}
                          cx={p.x}
                          cy={p.y}
                          r={4}
                          fill={s.color}
                          stroke="var(--surface)"
                          strokeWidth={2}
                          className="cursor-pointer transition-transform hover:scale-125"
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                            if (rect) {
                              setGradeTooltip({
                                x: (p.x / W_OVERVIEW) * rect.width,
                                y: (p.y / H_OVERVIEW) * rect.height - 12,
                                label: s.label,
                                color: s.color,
                                date: p.date,
                                valueText: `${p.val}등급`,
                              });
                            }
                          }}
                        />
                      ))}
                    </g>
                  );
                })}
              </svg>

              {/* Custom Interactive Tooltip */}
              {gradeTooltip && (
                <div
                  className="absolute z-10 pointer-events-none transform -translate-x-1/2 -translate-y-full bg-[var(--ink)] text-[var(--paper)] text-xs rounded-lg px-2.5 py-1.5 shadow-lg border border-[var(--border-strong)]"
                  style={{ left: gradeTooltip.x, top: gradeTooltip.y }}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: gradeTooltip.color }}
                    />
                    <span>
                      {gradeTooltip.label} · {gradeTooltip.date}
                    </span>
                  </div>
                  <div className="font-bold font-serif-kr text-sm text-right mt-0.5 num">
                    {gradeTooltip.valueText}
                  </div>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-3.5 mt-3 pt-2 border-t border-[var(--border)]">
              {gradeSeries.map((s) => (
                <div key={s.key} className="flex items-center gap-1.5 text-xs text-[var(--ink-secondary)]">
                  <span className="w-3.5 h-1 rounded-full" style={{ backgroundColor: s.color }} />
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Percentile Trend Chart */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-[var(--shadow)] relative">
            <div className="flex items-baseline justify-between mb-1">
              <h3 className="text-sm font-bold text-[var(--ink)]">백분위 추이</h3>
              <span className="text-[11px] text-[var(--muted)]">
                표준점수 과목 (국어·수학·탐구1·탐구2)
              </span>
            </div>

            <div className="relative">
              <svg
                viewBox={`0 0 ${W_OVERVIEW} ${H_OVERVIEW}`}
                className="w-full h-auto overflow-visible select-none"
                onMouseLeave={() => setPctTooltip(null)}
              >
                {/* Grid Lines for Percentiles */}
                {Array.from({ length: 5 }).map((_, idx) => {
                  const p = yMinPct + idx * ((yMaxPct - yMinPct) / 4);
                  const y = yForPct(p);
                  return (
                    <g key={`p-grid-${idx}`}>
                      <line
                        x1={padL_O}
                        x2={W_OVERVIEW - padR_O}
                        y1={y}
                        y2={y}
                        stroke="var(--border)"
                        strokeWidth={1}
                        strokeDasharray={idx === 4 ? 'none' : '2,2'}
                      />
                      <text
                        x={padL_O - 8}
                        y={y + 3.5}
                        textAnchor="end"
                        fontSize="10"
                        fill="var(--muted)"
                        className="num font-medium"
                      >
                        {Math.round(p)}%
                      </text>
                    </g>
                  );
                })}

                {/* X Axis dates */}
                {examDates.map((d, i) => (
                  <text
                    key={`p-date-${i}`}
                    x={xFor(i)}
                    y={H_OVERVIEW - 10}
                    textAnchor="middle"
                    fontSize="11"
                    fill="var(--ink-secondary)"
                    className="num font-medium"
                  >
                    {d.label}
                  </text>
                ))}

                {/* Series Lines & Circles */}
                {pctSeries.map((s) => {
                  const validPoints = s.values
                    .map((v, i) =>
                      v !== null
                        ? { x: xFor(i), y: yForPct(v), val: v, date: examDates[i].label }
                        : null
                    )
                    .filter((p): p is { x: number; y: number; val: number; date: string } => p !== null);

                  if (validPoints.length === 0) return null;

                  const pathData = validPoints.reduce(
                    (acc, p, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`,
                    ''
                  );

                  return (
                    <g key={`p-series-${s.key}`}>
                      <path
                        d={pathData}
                        fill="none"
                        stroke={s.color}
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {validPoints.map((p, idx) => (
                        <circle
                          key={`p-pt-${s.key}-${idx}`}
                          cx={p.x}
                          cy={p.y}
                          r={4}
                          fill={s.color}
                          stroke="var(--surface)"
                          strokeWidth={2}
                          className="cursor-pointer transition-transform hover:scale-125"
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                            if (rect) {
                              setPctTooltip({
                                x: (p.x / W_OVERVIEW) * rect.width,
                                y: (p.y / H_OVERVIEW) * rect.height - 12,
                                label: s.label,
                                color: s.color,
                                date: p.date,
                                valueText: `${fmt1(p.val)}%`,
                              });
                            }
                          }}
                        />
                      ))}
                    </g>
                  );
                })}
              </svg>

              {/* Tooltip */}
              {pctTooltip && (
                <div
                  className="absolute z-10 pointer-events-none transform -translate-x-1/2 -translate-y-full bg-[var(--ink)] text-[var(--paper)] text-xs rounded-lg px-2.5 py-1.5 shadow-lg border border-[var(--border-strong)]"
                  style={{ left: pctTooltip.x, top: pctTooltip.y }}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: pctTooltip.color }}
                    />
                    <span>
                      {pctTooltip.label} · {pctTooltip.date}
                    </span>
                  </div>
                  <div className="font-bold font-serif-kr text-sm text-right mt-0.5 num">
                    {pctTooltip.valueText}
                  </div>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-3.5 mt-3 pt-2 border-t border-[var(--border)]">
              {pctSeries.map((s) => (
                <div key={s.key} className="flex items-center gap-1.5 text-xs text-[var(--ink-secondary)]">
                  <span className="w-3.5 h-1 rounded-full" style={{ backgroundColor: s.color }} />
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
