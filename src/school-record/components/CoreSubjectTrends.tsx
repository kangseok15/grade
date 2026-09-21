import React, { useState } from 'react';
import { StudentProfile, ConversionMethod } from '../types';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  BookOpen,
  Languages,
  Calculator,
  Globe,
  Atom,
  TrendingUp,
  LayoutGrid,
  Layers,
} from 'lucide-react';

interface CoreSubjectTrendsProps {
  student: StudentProfile;
  conversionMethod: ConversionMethod;
}

interface SubjectConfig {
  key: '국어' | '영어' | '수학' | '사회' | '과학';
  label: string;
  shortLabel: string;
  color: string;
  lightBg: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  icon: React.ReactNode;
}

const CORE_SUBJECT_CONFIGS: SubjectConfig[] = [
  {
    key: '국어',
    label: '국어',
    shortLabel: '국어',
    color: '#e11d48', // rose-600
    lightBg: 'bg-rose-50/60',
    borderColor: 'border-rose-200',
    badgeBg: 'bg-rose-100 text-rose-800',
    badgeText: 'text-rose-700',
    icon: <BookOpen className="w-3.5 h-3.5 text-rose-600" />,
  },
  {
    key: '영어',
    label: '영어',
    shortLabel: '영어',
    color: '#d97706', // amber-600
    lightBg: 'bg-amber-50/60',
    borderColor: 'border-amber-200',
    badgeBg: 'bg-amber-100 text-amber-800',
    badgeText: 'text-amber-700',
    icon: <Languages className="w-3.5 h-3.5 text-amber-600" />,
  },
  {
    key: '수학',
    label: '수학',
    shortLabel: '수학',
    color: '#2563eb', // blue-600
    lightBg: 'bg-blue-50/60',
    borderColor: 'border-blue-200',
    badgeBg: 'bg-blue-100 text-blue-800',
    badgeText: 'text-blue-700',
    icon: <Calculator className="w-3.5 h-3.5 text-blue-600" />,
  },
  {
    key: '사회',
    label: '사회',
    shortLabel: '사회',
    color: '#059669', // emerald-600
    lightBg: 'bg-emerald-50/60',
    borderColor: 'border-emerald-200',
    badgeBg: 'bg-emerald-100 text-emerald-800',
    badgeText: 'text-emerald-700',
    icon: <Globe className="w-3.5 h-3.5 text-emerald-600" />,
  },
  {
    key: '과학',
    label: '과학',
    shortLabel: '과학',
    color: '#7c3aed', // violet-600
    lightBg: 'bg-violet-50/60',
    borderColor: 'border-violet-200',
    badgeBg: 'bg-violet-100 text-violet-800',
    badgeText: 'text-violet-700',
    icon: <Atom className="w-3.5 h-3.5 text-violet-600" />,
  },
];

export const CoreSubjectTrends: React.FC<CoreSubjectTrendsProps> = ({ student }) => {
  const [viewMode, setViewMode] = useState<'cards' | 'combined' | 'both'>('cards');

  // All distinct semesters in chronological order (e.g. ['1-1', '1-2', '2-1'])
  const distinctSemesters = Array.from(new Set(student.records.map((r) => r.semester))).sort();

  // Compute per-subject semester data and overall metrics
  const subjectAnalytics = CORE_SUBJECT_CONFIGS.map((config) => {
    // Filter records for this subject (for 사회, also match 한국사 if any)
    const subjectRecords = student.records.filter((r) => {
      if (r.courseType === '예체') return false;
      if (config.key === '사회') {
        return r.category === '사회' || r.subjectName.includes('한국사');
      }
      return r.category === config.key;
    });

    // Total units and overall 5-grade weighted average
    const totalUnits = subjectRecords.reduce((sum, r) => sum + (r.units || 1), 0);
    const overallGpa5 =
      totalUnits > 0
        ? +(
            subjectRecords.reduce(
              (sum, r) => sum + (r.units || 1) * (r.rankGrade5 || 1),
              0
            ) / totalUnits
          ).toFixed(2)
        : 1.0;
    const overallAvgRaw =
      totalUnits > 0
        ? +(
            subjectRecords.reduce(
              (sum, r) => sum + (r.units || 1) * (r.rawScore || 0),
              0
            ) / totalUnits
          ).toFixed(1)
        : 0;

    // Semester-by-semester breakdown for this subject
    const semesterData = distinctSemesters.map((sem) => {
      const semRecs = subjectRecords.filter((r) => r.semester === sem);
      const semUnits = semRecs.reduce((sum, r) => sum + (r.units || 1), 0);
      const semGpa5 =
        semUnits > 0
          ? +(
              semRecs.reduce(
                (sum, r) => sum + (r.units || 1) * (r.rankGrade5 || 1),
                0
              ) / semUnits
            ).toFixed(2)
          : null;
      const semAvgRaw =
        semUnits > 0
          ? +(
              semRecs.reduce(
                (sum, r) => sum + (r.units || 1) * (r.rawScore || 0),
                0
              ) / semUnits
            ).toFixed(1)
          : null;

      return {
        term: sem,
        semesterLabel: `${sem}학기`,
        grade5: semGpa5,
        avgRaw: semAvgRaw,
        units: semUnits,
        courses: semRecs.map((r) => ({
          name: r.subjectName,
          grade5: r.rankGrade5,
          rawScore: r.rawScore,
          units: r.units,
        })),
      };
    });

    // Determine trajectory trend (remember: lower number is better)
    const validTerms = semesterData.filter((d) => d.grade5 !== null);
    let trendLabel = '1.00등급 유지';
    let trendType: 'up' | 'stable' | 'down' = 'stable';
    let gradeDiff = 0;

    if (validTerms.length >= 2) {
      const firstGrade = validTerms[0].grade5!;
      const lastGrade = validTerms[validTerms.length - 1].grade5!;
      gradeDiff = +(firstGrade - lastGrade).toFixed(2); // positive = grade improved (value dropped)

      if (gradeDiff > 0.05) {
        trendLabel = `▲ 상승 (+${gradeDiff}등급)`;
        trendType = 'up';
      } else if (gradeDiff < -0.05) {
        trendLabel = `▼ 하강 (${gradeDiff}등급)`;
        trendType = 'down';
      } else {
        trendLabel = `● ${lastGrade.toFixed(2)}등급 유지`;
        trendType = 'stable';
      }
    } else if (validTerms.length === 1) {
      trendLabel = `1학기 ${validTerms[0].grade5!.toFixed(2)}등급`;
      trendType = 'stable';
    }

    return {
      config,
      totalUnits,
      overallGpa5,
      overallAvgRaw,
      recordsCount: subjectRecords.length,
      semesterData,
      validTerms,
      trendLabel,
      trendType,
      gradeDiff,
    };
  });

  // Calculate dynamic Y-domain for mini charts (bottom = 1.0, top = max grade in subjects)
  const allSubjectGrades = subjectAnalytics
    .flatMap((s) => s.semesterData)
    .map((d) => d.grade5)
    .filter((g): g is number => g !== null);
  const maxSubjectGrade = allSubjectGrades.length > 0 ? Math.max(...allSubjectGrades) : 2.0;
  const miniYMax = Math.max(1.8, Math.min(3.5, Math.ceil((maxSubjectGrade + 0.2) * 10) / 10));
  const miniYTicks = [1.0, 1.5, 2.0, 2.5, 3.0].filter((t) => t <= miniYMax + 0.05);

  // Combined Multi-Line Chart Data: one row per semester, containing values for all 5 subjects
  const combinedChartData = distinctSemesters.map((sem) => {
    const row: Record<string, string | number | null> = {
      term: `${sem}학기`,
      semesterRaw: sem,
    };

    subjectAnalytics.forEach((subj) => {
      const semMatch = subj.semesterData.find((d) => d.term === sem);
      row[subj.config.shortLabel] = semMatch?.grade5 ?? null;
    });

    return row;
  });

  return (
    <div className="pt-6 border-t border-stone-200" id="core-subjects-trend-section">
      {/* Section Header with View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-stone-900 tracking-tight flex items-center gap-1.5 whitespace-nowrap">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              주요 5대 교과별 학기별 성적 추이 그래프
            </h4>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200 font-semibold whitespace-nowrap">
              국어 · 영어 · 수학 · 사회 · 과학
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            5대 핵심 교과의 학기별 5등급제 성적 변화, 이수 과목 및 등급 추이를 개별/통합 그래프로 비교 분석합니다.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg border border-stone-200 text-xs font-semibold whitespace-nowrap self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              viewMode === 'cards'
                ? 'bg-white text-stone-900 shadow-2xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            개별 교과 카드 (5종)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('combined')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              viewMode === 'combined'
                ? 'bg-white text-stone-900 shadow-2xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            5대 교과 한눈에 비교
          </button>
          <button
            type="button"
            onClick={() => setViewMode('both')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              viewMode === 'both'
                ? 'bg-white text-stone-900 shadow-2xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            전체 보기
          </button>
        </div>
      </div>

      {/* VIEW 1: Combined Multi-Line Chart (Shown when 'combined' or 'both') */}
      {(viewMode === 'combined' || viewMode === 'both') && (
        <div className="mb-5 p-4 rounded-xl bg-stone-50/80 border border-stone-200">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200/80 mb-3">
            <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5 whitespace-nowrap">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              5대 교과 동시 비교 추이 그래프 (하단 1.0등급 기준)
            </span>
            <span className="text-[11px] text-stone-500 whitespace-nowrap">
              학기별 5등급제 평균 등급 (국·영·수·사·과)
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={combinedChartData} margin={{ top: 15, right: 25, left: -5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                <XAxis
                  dataKey="term"
                  tick={{ fill: '#57534e', fontSize: 12, fontWeight: 600 }}
                  tickLine={{ stroke: '#d6d3d1' }}
                />
                <YAxis
                  reversed={false}
                  domain={[1.0, miniYMax]}
                  ticks={miniYTicks}
                  tick={{ fill: '#78716c', fontSize: 11 }}
                  tickFormatter={(v) => `${Number(v).toFixed(1)}등급`}
                  tickLine={{ stroke: '#d6d3d1' }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    return (
                      <div className="bg-stone-900 text-white p-3 rounded-lg shadow-lg text-xs border border-stone-700 min-w-44 whitespace-nowrap">
                        <div className="font-bold text-amber-400 border-b border-stone-700 pb-1 mb-2">
                          {label} 5대 교과 등급
                        </div>
                        <div className="space-y-1.5">
                          {payload.map((entry, idx) => (
                            <div key={idx} className="flex justify-between items-center gap-3">
                              <span className="flex items-center gap-1.5 text-stone-300">
                                <span
                                  className="w-2.5 h-2.5 rounded-full inline-block"
                                  style={{ backgroundColor: entry.color }}
                                />
                                {entry.name}:
                              </span>
                              <span className="font-bold text-white">
                                {entry.value !== null && entry.value !== undefined
                                  ? `${Number(entry.value).toFixed(2)}등급`
                                  : '미이수'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: 8, fontSize: 11 }}
                  iconType="circle"
                />
                <ReferenceLine
                  y={1.0}
                  stroke="#ca8a04"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  label={{
                    value: '1.0등급 기준',
                    fill: '#ca8a04',
                    fontSize: 10,
                    position: 'insideBottomRight',
                  }}
                />

                {CORE_SUBJECT_CONFIGS.map((config) => (
                  <Line
                    key={config.key}
                    type="monotone"
                    dataKey={config.shortLabel}
                    stroke={config.color}
                    strokeWidth={2.5}
                    dot={{ fill: config.color, r: 4.5, strokeWidth: 1.5, stroke: '#fff' }}
                    activeDot={{ r: 6.5 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* VIEW 2: 5 Individual Subject Graph Cards (Shown when 'cards' or 'both') */}
      {(viewMode === 'cards' || viewMode === 'both') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
          {subjectAnalytics.map((subj) => {
            const hasMultiSem = subj.validTerms.length >= 2;
            const singleSem = subj.validTerms.length === 1 ? subj.validTerms[0] : null;

            return (
              <div
                key={subj.config.key}
                className="bg-white rounded-xl border border-stone-200 hover:border-stone-300 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between p-3.5"
              >
                {/* Card Top: Subject Header */}
                <div>
                  <div className="flex items-center justify-between gap-1.5 pb-2 border-b border-stone-100">
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 rounded-md bg-stone-100">
                        {subj.config.icon}
                      </div>
                      <span className="font-bold text-stone-900 text-sm whitespace-nowrap">
                        {subj.config.label}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                        subj.trendType === 'up'
                          ? 'bg-emerald-100 text-emerald-800'
                          : subj.trendType === 'down'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      {subj.trendLabel}
                    </span>
                  </div>

                  {/* Summary Metric Row */}
                  <div className="mt-2 flex items-baseline justify-between gap-2">
                    <div>
                      <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider whitespace-nowrap">
                        5등급제 누적 평균
                      </div>
                      <div className="text-xl font-black text-stone-900 tracking-tight whitespace-nowrap">
                        {subj.overallGpa5.toFixed(2)}등급
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-stone-600 block whitespace-nowrap">
                        {subj.totalUnits}단위 ({subj.recordsCount}과목)
                      </span>
                      <span className="text-[11px] text-stone-400 block whitespace-nowrap">
                        원점수 평균 {subj.overallAvgRaw}점
                      </span>
                    </div>
                  </div>

                  {/* Mini Line Chart for This Subject */}
                  <div className="h-32 w-full mt-3 pt-1 border-t border-stone-100">
                    {hasMultiSem ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={subj.semesterData}
                          margin={{ top: 12, right: 12, left: -22, bottom: 2 }}
                        >
                          <CartesianGrid strokeDasharray="2 2" stroke="#f5f5f4" vertical={false} />
                          <XAxis
                            dataKey="term"
                            tick={{ fill: '#78716c', fontSize: 10, fontWeight: 600 }}
                            tickLine={false}
                          />
                          <YAxis
                            reversed={false}
                            domain={[1.0, miniYMax]}
                            ticks={miniYTicks}
                            tick={{ fill: '#a8a29e', fontSize: 9 }}
                            tickLine={false}
                            tickFormatter={(v) => `${v}`}
                          />
                          <Tooltip
                            content={({ active, payload, label }) => {
                              if (!active || !payload || !payload.length) return null;
                              const d = subj.semesterData.find((x) => x.term === label);
                              return (
                                <div className="bg-stone-900 text-white p-2.5 rounded-lg shadow-md text-xs border border-stone-700 whitespace-nowrap z-20">
                                  <div className="font-bold text-amber-300 border-b border-stone-700 pb-1 mb-1.5 flex items-center justify-between gap-2">
                                    <span>{label} {subj.config.label}</span>
                                    <span>{d?.grade5 ? `${d.grade5}등급` : '미이수'}</span>
                                  </div>
                                  {d && d.courses.length > 0 ? (
                                    <div className="space-y-1 text-[11px]">
                                      {d.courses.map((c, ci) => (
                                        <div key={ci} className="text-stone-300 flex justify-between gap-2">
                                          <span>{c.name}</span>
                                          <span className="text-white font-semibold">
                                            {c.grade5}등급 ({c.rawScore}점)
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-stone-400 text-[11px]">개설/이수 과목 없음</span>
                                  )}
                                </div>
                              );
                            }}
                          />
                          <ReferenceLine
                            y={1.0}
                            stroke="#eab308"
                            strokeWidth={1}
                            strokeDasharray="2 2"
                          />
                          <Line
                            type="monotone"
                            dataKey="grade5"
                            stroke={subj.config.color}
                            strokeWidth={2.5}
                            dot={{
                              fill: subj.config.color,
                              r: 4,
                              strokeWidth: 1.5,
                              stroke: '#fff',
                            }}
                            activeDot={{ r: 6 }}
                            connectNulls
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      /* Single semester student display (e.g. 1st grade) */
                      <div className="h-full flex flex-col items-center justify-center p-2 rounded-lg bg-stone-50/80 border border-dashed border-stone-200 text-center">
                        <div className="text-xs font-bold text-stone-800 whitespace-nowrap">
                          {singleSem?.term || '1-1'}학기 단일 기록
                        </div>
                        <div
                          className="mt-1 text-base font-extrabold whitespace-nowrap"
                          style={{ color: subj.config.color }}
                        >
                          {singleSem?.grade5 !== null && singleSem?.grade5 !== undefined
                            ? `${singleSem.grade5.toFixed(2)}등급`
                            : '1.00등급'}
                        </div>
                        <div className="text-[10px] text-stone-400 mt-0.5 whitespace-nowrap">
                          향후 학기 누적 시 추이선 자동 연계
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Bottom: Semester Course Details */}
                <div className="mt-3 pt-2 border-t border-stone-100 space-y-1.5">
                  <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider whitespace-nowrap">
                    학기별 이수 세부 과목
                  </div>
                  <div className="space-y-1">
                    {subj.semesterData.map((sem, sIdx) => {
                      if (!sem.courses || sem.courses.length === 0) {
                        return (
                          <div
                            key={sIdx}
                            className="text-[11px] text-stone-400 flex items-center justify-between py-0.5 whitespace-nowrap"
                          >
                            <span>{sem.term}학기</span>
                            <span className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.2 rounded">
                              해당 학기 미이수
                            </span>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={sIdx}
                          className="text-[11px] text-stone-700 flex items-center justify-between py-0.5 whitespace-nowrap"
                        >
                          <span className="font-medium truncate max-w-[120px]" title={sem.courses.map((c) => c.name).join(', ')}>
                            <span className="font-bold text-stone-900 mr-1">{sem.term}:</span>
                            {sem.courses.map((c) => c.name).join(', ')}
                          </span>
                          <span className="font-bold text-stone-900 ml-1.5 bg-stone-100 px-1.5 py-0.5 rounded text-[11px] whitespace-nowrap shrink-0">
                            {sem.grade5?.toFixed(2)}등급
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
