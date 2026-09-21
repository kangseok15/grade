import React, { useState } from 'react';
import { StudentProfile, ConversionMethod } from '../types';
import {
  calculateSemesterSummaries,
  calculateGpaSummary,
  analyzeTrajectory,
} from '../utils/gradeConversion';
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
import { TrendingUp, CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';
import { CoreSubjectTrends } from './CoreSubjectTrends';

interface GradeTrendChartProps {
  student: StudentProfile;
  gradeSystemMode: '5grade' | '9grade' | 'both';
  conversionMethod: ConversionMethod;
}

export const GradeTrendChart: React.FC<GradeTrendChartProps> = ({
  student,
  gradeSystemMode,
  conversionMethod,
}) => {
  const [metricMode, setMetricMode] = useState<'weighted' | 'unweighted' | 'major'>('weighted');

  // Compute semester data
  const semesterSummaries = calculateSemesterSummaries(student.records, conversionMethod);
  const trajectory = analyzeTrajectory(semesterSummaries);

  // Calculate major subjects (국, 수, 영) for each semester
  const chartData = semesterSummaries.map((sem) => {
    const semRecords = student.records.filter((r) => r.semester === sem.term);
    const majorRecords = semRecords.filter((r) =>
      ['국어', '수학', '영어'].includes(r.category)
    );
    const stemRecords = semRecords.filter((r) =>
      ['수학', '과학', '기술가정/정보'].includes(r.category)
    );
    const humanitiesRecords = semRecords.filter((r) =>
      ['국어', '영어', '사회'].includes(r.category)
    );

    const majorSummary = calculateGpaSummary(majorRecords, conversionMethod);
    const stemSummary = calculateGpaSummary(stemRecords, conversionMethod);
    const humSummary = calculateGpaSummary(humanitiesRecords, conversionMethod);

    return {
      semester: `${sem.term} 학기`,
      termRaw: sem.term,
      // 5-Grade Metrics
      '5등급 전체(단위O)': sem.weightedGpa5,
      '5등급 전체(단위X)': sem.unweightedGpa5,
      '5등급 주요교과(국수영)': majorSummary.weightedGpa5 || null,
      '5등급 자연/공학(수과정)': stemSummary.weightedGpa5 || null,
      '5등급 인문/사회(국영사)': humSummary.weightedGpa5 || null,

      // Raw Score Mean
      '원점수 평균': sem.avgRawScore,
    };
  });

  // Calculate dynamic domain & ticks for optimal visibility and amplified variation
  const allValues = chartData.flatMap((d) => {
    const vals: number[] = [];
    if (typeof d['5등급 전체(단위O)'] === 'number') vals.push(d['5등급 전체(단위O)']);
    if (typeof d['5등급 전체(단위X)'] === 'number') vals.push(d['5등급 전체(단위X)']);
    if (typeof d['5등급 주요교과(국수영)'] === 'number') vals.push(d['5등급 주요교과(국수영)']);
    if (typeof d['5등급 자연/공학(수과정)'] === 'number') vals.push(d['5등급 자연/공학(수과정)']);
    if (typeof d['5등급 인문/사회(국영사)'] === 'number') vals.push(d['5등급 인문/사회(국영사)']);
    return vals;
  });

  const maxVal = allValues.length > 0 ? Math.max(...allValues) : 2.0;

  // Y-axis configuration:
  // User request: "아래가 1등급이고 위에가 높은 등급" -> Standard numeric axis (bottom = 1.0, top = higher number e.g. 2.0 or 2.5)
  // "급간이 0.5이다 보니 눈에 띄는 변화가 안 보여서 급간을 좀 더 넓히면 잘 보일 것 같다" -> 0.1 or 0.2 step zoom
  const yDomainMax = Math.max(1.6, Math.min(3.5, Math.ceil((maxVal + 0.15) * 10) / 10));
  const yDomainMin = 1.0;

  // Generate dense, readable ticks every 0.1 or 0.2 depending on range
  const step = yDomainMax - yDomainMin <= 1.0 ? 0.1 : 0.2;
  const yTicks: number[] = [];
  for (let t = yDomainMin; t <= yDomainMax + 0.01; t += step) {
    yTicks.push(+t.toFixed(1));
  }

  return (
    <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-xs p-5" id="grade-trend-section">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--border)] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[var(--ink)] tracking-tight">
              학기별 성적 변화 추이 그래프 (5등급제)
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-md bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/25 font-medium">
              하단 1.0등급 기준 · 0.1~0.2 상세 급간 확대
            </span>
          </div>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            5등급제 기준 학기별 미세한 성적 변동(0.1 단위)을 선명하게 확대하여 시각화합니다. (하단 1등급 → 상단 등급 수치)
          </p>
        </div>

        {/* Metric Selector */}
        <div className="flex items-center gap-1 bg-[var(--surface-alt)] p-1 rounded-lg border border-[var(--border)] text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMetricMode('weighted')}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              metricMode === 'weighted'
                ? 'bg-[var(--surface)] text-[var(--ink)] shadow-2xs'
                : 'text-[var(--ink-secondary)] hover:text-[var(--ink)]'
            }`}
          >
            단위수 가중평균
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('major')}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              metricMode === 'major'
                ? 'bg-[var(--surface)] text-[var(--ink)] shadow-2xs'
                : 'text-[var(--ink-secondary)] hover:text-[var(--ink)]'
            }`}
          >
            계열/교과별 분리
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('unweighted')}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              metricMode === 'unweighted'
                ? 'bg-[var(--surface)] text-[var(--ink)] shadow-2xs'
                : 'text-[var(--ink-secondary)] hover:text-[var(--ink)]'
            }`}
          >
            단위수 미반영
          </button>
        </div>
      </div>

      {/* 2단 분할 레이아웃: 좌측 성적 변화 추이 그래프, 우측 성적 변화 종합 진단 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-3">
        {/* Left: Chart Canvas Area (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 25, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="semester"
                  tick={{ fill: 'var(--ink-secondary)', fontSize: 12, fontWeight: 600 }}
                  tickLine={{ stroke: 'var(--border-strong)' }}
                />
                {/* Standard non-reversed axis: 1.0 is at the bottom, higher numbers at top */}
                <YAxis
                  reversed={false}
                  domain={[yDomainMin, yDomainMax]}
                  ticks={yTicks}
                  tick={{ fill: 'var(--muted)', fontSize: 11 }}
                  tickFormatter={(v) => `${Number(v).toFixed(1)}등급`}
                  tickLine={{ stroke: 'var(--border-strong)' }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    return (
                      <div className="bg-[var(--ink)] text-white p-3 rounded-lg shadow-lg text-xs border border-[var(--border-strong)] min-w-44">
                        <div className="font-bold text-[var(--accent)] border-b border-[var(--border-strong)] pb-1 mb-2 flex items-center justify-between">
                          <span>{label} 5등급제</span>
                        </div>
                        <div className="space-y-1.5">
                          {payload.map((entry, idx) => (
                            <div key={idx} className="flex justify-between items-center gap-3">
                              <span className="flex items-center gap-1.5 text-[var(--muted)]">
                                <span
                                  className="w-2 h-2 rounded-full inline-block"
                                  style={{ backgroundColor: entry.color }}
                                />
                                {entry.name}:
                              </span>
                              <span className="font-bold text-white">
                                {Number(entry.value).toFixed(2)}등급
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: 10, fontSize: 11 }}
                  iconType="circle"
                />

                {/* Reference Line for Base Grade 1.0 */}
                <ReferenceLine
                  y={1.0}
                  stroke="var(--accent)"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  label={{
                    value: '1.0등급 기준',
                    fill: 'var(--accent)',
                    fontSize: 10,
                    position: 'insideBottomRight',
                  }}
                />

                {/* Lines according to mode - 5 Grade only */}
                {metricMode === 'weighted' && (
                  <>
                    <Line
                      type="monotone"
                      dataKey="5등급 전체(단위O)"
                      stroke="var(--korean)"
                      strokeWidth={3}
                      dot={{ fill: 'var(--korean)', r: 5, strokeWidth: 2, stroke: 'var(--surface)' }}
                      activeDot={{ r: 7 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="5등급 주요교과(국수영)"
                      stroke="var(--good)"
                      strokeWidth={2.5}
                      dot={{ fill: 'var(--good)', r: 4.5, strokeWidth: 1.5, stroke: 'var(--surface)' }}
                      activeDot={{ r: 6.5 }}
                    />
                  </>
                )}

                {metricMode === 'major' && (
                  <>
                    <Line
                      type="monotone"
                      dataKey="5등급 주요교과(국수영)"
                      stroke="var(--korean)"
                      strokeWidth={2.5}
                      dot={{ fill: 'var(--korean)', r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="5등급 자연/공학(수과정)"
                      stroke="var(--good)"
                      strokeWidth={2.5}
                      dot={{ fill: 'var(--good)', r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="5등급 인문/사회(국영사)"
                      stroke="var(--accent)"
                      strokeWidth={2.5}
                      dot={{ fill: 'var(--accent)', r: 5 }}
                    />
                  </>
                )}

                {metricMode === 'unweighted' && (
                  <>
                    <Line
                      type="monotone"
                      dataKey="5등급 전체(단위O)"
                      stroke="var(--korean)"
                      strokeWidth={2.5}
                      dot={{ fill: 'var(--korean)', r: 4.5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="5등급 전체(단위X)"
                      stroke="var(--ink-secondary)"
                      strokeWidth={2.5}
                      strokeDasharray="4 4"
                      dot={{ fill: 'var(--ink-secondary)', r: 4.5 }}
                    />
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Deep Dive Qualitative Academic Analysis (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col justify-between p-4 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)]">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2 pb-2 border-b border-[var(--border)]/80">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg shrink-0 ${
                  trajectory.trend === '상승형' ? 'bg-[var(--good)]/15 text-[var(--good)]' : 'bg-[var(--korean)]/15 text-[var(--korean)]'
                }`}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--ink)]">
                    성적 변화 종합 진단
                  </h4>
                  <div className="text-sm font-extrabold text-[var(--korean)]">
                    {trajectory.trend} 모델
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[var(--border)] text-[var(--ink-secondary)] shrink-0">
                학종 발전역량
              </span>
            </div>

            <p className="text-xs text-[var(--ink-secondary)] leading-relaxed">
              {trajectory.description}
            </p>

            {/* Strengths & Recommendations */}
            <div className="space-y-2.5 pt-1">
              <div className="bg-[var(--surface)] p-3 rounded-lg border border-[var(--border)]">
                <div className="text-[11px] font-bold text-[var(--good)] uppercase flex items-center gap-1 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  강점 및 성취 포인트
                </div>
                <ul className="text-xs text-[var(--ink-secondary)] space-y-1 pl-1">
                  {trajectory.strengthPoints.map((sp, i) => (
                    <li key={i} className="flex items-start gap-1.5 leading-tight">
                      <span className="text-[var(--good)] font-bold">•</span>
                      <span>{sp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[var(--surface)] p-3 rounded-lg border border-[var(--border)]">
                <div className="text-[11px] font-bold text-[var(--accent)] uppercase flex items-center gap-1 mb-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  향후 전략 및 보완 권고사항
                </div>
                <ul className="text-xs text-[var(--ink-secondary)] space-y-1 pl-1">
                  {trajectory.recommendations.map((rc, i) => (
                    <li key={i} className="flex items-start gap-1.5 leading-tight">
                      <span className="text-[var(--accent)] font-bold">•</span>
                      <span>{rc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 주요 5대 교과별 학기별 성적 추이 그래프 (국어, 영어, 수학, 사회, 과학) */}
      <CoreSubjectTrends
        student={student}
        conversionMethod={conversionMethod}
      />
    </div>
  );
};
