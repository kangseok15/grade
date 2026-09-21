import React, { useState } from 'react';
import { StudentProfile, ConversionMethod, SubjectCategory } from '../types';
import { calculateCategorySummaries } from '../utils/gradeConversion';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  BookOpen,
  PieChart as PieChartIcon,
  BarChart3,
  Award,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

interface SubjectCategoryAnalysisProps {
  student: StudentProfile;
  allStudents?: StudentProfile[];
  gradeSystemMode: '5grade' | '9grade' | 'both';
  conversionMethod: ConversionMethod;
}

export const SubjectCategoryAnalysis: React.FC<SubjectCategoryAnalysisProps> = ({
  student,
  allStudents = [],
  gradeSystemMode,
  conversionMethod,
}) => {
  const [selectedCat, setSelectedCat] = useState<SubjectCategory | 'all'>('all');

  const categories = calculateCategorySummaries(student.records, conversionMethod);

  // 미래인재반 같은 학년 친구들 교과군 평균 계산
  const cohortSameGrade = allStudents.filter((s) => s.grade === student.grade);
  const cohortCount = cohortSameGrade.length > 0 ? cohortSameGrade.length : 1;

  // Radar chart data:
  // For radar chart, we convert grade to an "역량 지수" (Competency Index: 1등급=100점, 2등급=85점, 3등급=70점, 4등급=50점, 5등급=30점)
  // so that higher radius visually represents stronger mastery.
  const radarData = categories.map((cat) => {
    // 5등급제 등급을 100점 척도 역량으로 변환
    const competencyScore = Math.max(
      20,
      Math.round(100 - (cat.weightedGpa5 - 1.0) * 20)
    );

    return {
      subject: cat.category,
      역량지수: competencyScore,
      평균원점수: cat.avgRawScore,
      과목평균: cat.avgMeanScore,
      등급: cat.weightedGpa5,
    };
  });

  // Bar chart data for Raw score vs Peer Cohort mean (미래인재반 같은 학년 친구들 평균)
  const barData = categories.map((cat) => {
    // 같은 학년 미래인재반 친구들의 해당 교과목 평균 원점수 계산
    let sumCohortRaw = 0;
    let cohortStudentWithCat = 0;

    cohortSameGrade.forEach((s) => {
      const sCats = calculateCategorySummaries(s.records, conversionMethod);
      const match = sCats.find((c) => c.category === cat.category);
      if (match && match.avgRawScore > 0) {
        sumCohortRaw += match.avgRawScore;
        cohortStudentWithCat++;
      }
    });

    const cohortAvgRaw =
      cohortStudentWithCat > 0
        ? +(sumCohortRaw / cohortStudentWithCat).toFixed(1)
        : cat.avgRawScore;

    return {
      name: cat.category,
      '학생 원점수': cat.avgRawScore,
      '미래인재반 평균': cohortAvgRaw,
      '학교 전체평균': cat.avgMeanScore,
      '미래인재반 대비 격차': +(cat.avgRawScore - cohortAvgRaw).toFixed(1),
    };
  });

  // Custom tick for Category Bar Chart to prevent crooked/slanted labels and provide clean distance from graph
  const renderCategoryAxisTick = (props: any) => {
    const { x = 0, y = 0, payload } = props;
    const rawText: string = payload?.value || '';

    if (rawText.includes('/')) {
      const parts = rawText.split('/');
      const line1 = parts[0].trim();
      const line2 = `/ ${parts.slice(1).join('/')}`.trim();
      return (
        <g transform={`translate(${x},${y})`}>
          <text
            x={0}
            y={0}
            textAnchor="middle"
            fill="#44403c"
            fontSize={11}
            fontWeight={600}
          >
            <tspan x={0} dy={20}>{line1}</tspan>
            <tspan x={0} dy={15}>{line2}</tspan>
          </text>
        </g>
      );
    }

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={24}
          textAnchor="middle"
          fill="#44403c"
          fontSize={11}
          fontWeight={600}
        >
          {rawText}
        </text>
      </g>
    );
  };

  // Custom legend to strictly guarantee: 학생 원점수 -> 미래인재반 평균 -> 학교 전체평균
  const renderCategoryBarLegend = () => {
    return (
      <div className="flex items-center justify-center gap-5 pt-3.5 text-xs font-semibold select-none">
        <span className="flex items-center gap-1.5 text-blue-600">
          <span className="w-3 h-3 rounded-xs bg-blue-600 inline-block shrink-0" />
          학생 원점수
        </span>
        <span className="flex items-center gap-1.5 text-amber-600">
          <span className="w-3 h-3 rounded-xs bg-amber-500 inline-block shrink-0" />
          미래인재반 평균
        </span>
        <span className="flex items-center gap-1.5 text-stone-500">
          <span className="w-3 h-3 rounded-xs bg-stone-400 inline-block shrink-0" />
          학교 전체평균
        </span>
      </div>
    );
  };

  // Filtered course records for detailed breakdown
  const displayedRecords =
    selectedCat === 'all'
      ? student.records
      : student.records.filter((r) => r.category === selectedCat);

  return (
    <div className="space-y-6" id="subject-category-section">
      {/* Top Banner & Strategy Summary */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-stone-100 gap-3">
          <div>
            <h3 className="text-base font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-500" />
              교과목별 학업 역량 및 성취도 분석
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              국어, 수학, 영어, 사회, 과학, 정보 등 교과군별 편차와 원점수·과목평균 간 우위를 다각도로 분석합니다.
            </p>
          </div>

          {/* Quick Category Filter */}
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => setSelectedCat('all')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                selectedCat === 'all'
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              전체 교과 ({student.records.length})
            </button>
            {categories.map((c) => (
              <button
                key={c.category}
                type="button"
                onClick={() => setSelectedCat(c.category)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  selectedCat === c.category
                    ? 'bg-amber-500 text-stone-900 font-bold'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {c.category} ({c.courseCount})
              </button>
            ))}
          </div>
        </div>

        {/* Dual Chart Grid: Radar Chart + Deviation Bar Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-5">
          {/* Radar Chart: Academic Balance */}
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <PieChartIcon className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                  교과목 밸런스 방사형 차트 (역량 지수)
                </h4>
              </div>
              <span className="text-[11px] text-stone-500">100점 만점 기준 환산</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={(tickProps: any) => {
                      const { payload, x, y, textAnchor, ...rest } = tickProps;
                      const text = payload?.value || '';
                      if (text.includes('/')) {
                        const parts = text.split('/');
                        return (
                          <text
                            {...rest}
                            x={x}
                            y={y}
                            textAnchor={textAnchor}
                            fill="#44403c"
                            fontSize={10}
                            fontWeight={600}
                          >
                            <tspan x={x} dy="-0.2em">{parts[0].trim()}</tspan>
                            <tspan x={x} dy="1.2em">/{parts.slice(1).join('/').trim()}</tspan>
                          </text>
                        );
                      }
                      return (
                        <text
                          {...rest}
                          x={x}
                          y={y}
                          textAnchor={textAnchor}
                          fill="#44403c"
                          fontSize={11}
                          fontWeight={600}
                        >
                          {text}
                        </text>
                      );
                    }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: '#78716c' }}
                  />
                  <Radar
                    name="학생 역량지수"
                    dataKey="역량지수"
                    stroke="#2563eb"
                    fill="#3b82f6"
                    fillOpacity={0.4}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-stone-900 text-white p-2.5 rounded-md text-xs border border-stone-700">
                          <div className="font-bold text-amber-400 mb-1">{d.subject}</div>
                          <div>평균 등급: <span className="font-bold">{d.등급}등급</span></div>
                          <div>평균 원점수: <span className="font-bold">{d.평균원점수}점</span></div>
                          <div>역량 환산: <span className="font-bold">{d.역량지수}점 / 100</span></div>
                        </div>
                      );
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-stone-500 text-center mt-1">
              영역이 외곽으로 넓고 고르게 퍼질수록 교과 간 편차 없이 균형 잡힌 우수성을 나타냅니다.
            </p>
          </div>

          {/* Bar Chart: Raw score vs Peer Cohort (Future Talent Class) Mean */}
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                  원점수 vs 미래인재반({student.grade}학년 {cohortCount}명) 평균 비교
                </h4>
              </div>
              <span className="text-[11px] text-stone-500">단위: 점수(점)</span>
            </div>
            <div className="h-76 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -10, bottom: 46 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    interval={0}
                    tick={renderCategoryAxisTick}
                    tickLine={false}
                    axisLine={{ stroke: '#d6d3d1' }}
                  />
                  <YAxis domain={[50, 100]} tick={{ fill: '#78716c', fontSize: 10 }} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload || !payload.length) return null;
                      const orderMap: Record<string, number> = {
                        '학생 원점수': 1,
                        '미래인재반 평균': 2,
                        '학교 전체평균': 3,
                      };
                      const sorted = [...payload].sort(
                        (a, b) => (orderMap[a.name as string] || 99) - (orderMap[b.name as string] || 99)
                      );
                      return (
                        <div className="bg-stone-900 text-white p-2.5 rounded-md text-xs border border-stone-700 shadow-md">
                          <div className="font-bold text-amber-400 mb-1.5 border-b border-stone-700 pb-1">{label}</div>
                          <div className="space-y-1">
                            {sorted.map((p, i) => (
                              <div key={i} className="flex justify-between gap-4 text-stone-300">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-xs inline-block" style={{ backgroundColor: p.color }} />
                                  {p.name}:
                                </span>
                                <span className="font-bold text-white">{p.value}점</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="학생 원점수" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="미래인재반 평균" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="학교 전체평균" fill="#a8a29e" radius={[4, 4, 0, 0]} />
                  <Legend content={renderCategoryBarLegend} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-stone-500 text-center mt-1">
              파란색 막대(학생 원점수)가 주황색 막대(미래인재반 같은 학년 평균)보다 높을수록 심화반 내에서도 뛰어난 성취를 보여줍니다.
            </p>
          </div>
        </div>
      </div>

      {/* Category Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((c) => {
          const isTopTier = c.weightedGpa5 <= 1.3;
          return (
            <div
              key={c.category}
              onClick={() => setSelectedCat(selectedCat === c.category ? 'all' : c.category)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                selectedCat === c.category
                  ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-300 shadow-xs'
                  : 'bg-white border-stone-200 hover:border-stone-300 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-stone-900">{c.category}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-medium">
                  {c.totalUnits}단위 / {c.courseCount}과목
                </span>
              </div>

              <div className="flex items-baseline justify-between mt-1">
                <div>
                  <div className="text-[10px] text-stone-400 uppercase font-semibold">5등급제 평균</div>
                  <div className="text-xl font-extrabold text-stone-900">
                    {c.weightedGpa5 > 0 ? `${c.weightedGpa5}등급` : 'P/성취'}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-stone-400 uppercase font-semibold">9등급 환산</div>
                  <div className="text-sm font-bold text-amber-900">
                    {c.weightedGpa9 > 0 ? `${c.weightedGpa9}등급` : '-'}
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-stone-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-stone-400 text-[11px] block">성취도 A 비율</span>
                  <span className="font-bold text-stone-800">{c.ratioA}%</span>
                </div>
                <div>
                  <span className="text-stone-400 text-[11px] block">원점수 평균</span>
                  <span className="font-bold text-stone-800">{c.avgRawScore}점</span>
                </div>
              </div>

              {isTopTier && (
                <div className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  <Award className="w-3 h-3" />
                  최우수 강점 교과
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Category Course Detail Breakdown Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <span>{selectedCat === 'all' ? '전체 과목' : `[${selectedCat}]`} 세부 성적 명세</span>
            <span className="text-xs font-normal text-stone-500">
              (총 {displayedRecords.length}개 과목)
            </span>
          </h4>
        </div>

        <div className="overflow-x-auto border border-stone-200 rounded-lg">
          <table className="w-full text-left text-xs whitespace-nowrap min-w-[900px]">
            <thead className="bg-stone-100 text-stone-700 font-semibold border-b border-stone-200 whitespace-nowrap">
              <tr>
                <th className="py-2.5 px-3 whitespace-nowrap">학기</th>
                <th className="py-2.5 px-3 whitespace-nowrap">교과</th>
                <th className="py-2.5 px-3 whitespace-nowrap">과목명</th>
                <th className="py-2.5 px-2 whitespace-nowrap">구분</th>
                <th className="py-2.5 px-2 text-center whitespace-nowrap">단위수</th>
                <th className="py-2.5 px-2 text-center whitespace-nowrap">원점수</th>
                <th className="py-2.5 px-2 text-center whitespace-nowrap">과목평균</th>
                <th className="py-2.5 px-2 text-center whitespace-nowrap">성취도</th>
                <th className="py-2.5 px-2 text-center bg-blue-50/70 text-blue-900 font-bold whitespace-nowrap">
                  5등급 석차
                </th>
                {(gradeSystemMode === '9grade' || gradeSystemMode === 'both') && (
                  <th className="py-2.5 px-2 text-center bg-amber-50/70 text-amber-900 font-bold whitespace-nowrap">
                    9등급 환산
                  </th>
                )}
                <th className="py-2.5 px-3 text-center whitespace-nowrap">수강자수</th>
                <th className="py-2.5 px-3 whitespace-nowrap">성취도별 학생비율 (A/B/C/D/E)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 font-medium text-stone-800 whitespace-nowrap">
              {displayedRecords.map((r) => {
                const isGrade1 = r.rankGrade5 === 1;
                return (
                  <tr
                    key={r.id}
                    className={`hover:bg-stone-50 transition-colors whitespace-nowrap ${
                      isGrade1 ? 'bg-amber-50/20' : ''
                    }`}
                  >
                    <td className="py-2 px-3 text-stone-600 font-semibold whitespace-nowrap">{r.semester}</td>
                    <td className="py-2 px-3 text-stone-700 whitespace-nowrap">{r.category}</td>
                    <td className="py-2 px-3 font-bold text-stone-900 flex items-center gap-1.5 whitespace-nowrap">
                      {r.subjectName}
                      {isGrade1 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-stone-500 text-[11px] whitespace-nowrap">{r.courseType}</td>
                    <td className="py-2 px-2 text-center font-semibold whitespace-nowrap">{r.units}</td>
                    <td className="py-2 px-2 text-center font-bold text-stone-900 whitespace-nowrap">
                      {r.rawScore ?? '-'}
                    </td>
                    <td className="py-2 px-2 text-center text-stone-500 whitespace-nowrap">
                      {r.subjectMean ?? '-'}
                    </td>
                    <td className="py-2 px-2 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded-md text-[11px] font-bold whitespace-nowrap ${
                          r.achievement === 'A'
                            ? 'bg-blue-100 text-blue-800'
                            : r.achievement === 'B'
                            ? 'bg-stone-100 text-stone-800'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {r.achievement}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center bg-blue-50/40 font-extrabold text-blue-900 whitespace-nowrap">
                      {r.rankGrade5 ? `${r.rankGrade5}등급` : '-'}
                    </td>
                    {(gradeSystemMode === '9grade' || gradeSystemMode === 'both') && (
                      <td className="py-2 px-2 text-center bg-amber-50/40 font-bold text-amber-900 whitespace-nowrap">
                        {r.rankGrade5
                          ? `${r.rankGrade5 === 1 ? '1.4' : r.rankGrade5 === 2 ? '3.2' : '5.0'}등급`
                          : '-'}
                      </td>
                    )}
                    <td className="py-2 px-3 text-center text-stone-500 whitespace-nowrap">
                      {r.studentCount ? `${r.studentCount}명` : '-'}
                    </td>
                    <td className="py-2 px-3 text-[11px] text-stone-500 font-mono whitespace-nowrap">
                      {r.achievementRatios
                        ? `${r.achievementRatios.A}% / ${r.achievementRatios.B}% / ${r.achievementRatios.C}% / ${r.achievementRatios.D}% / ${r.achievementRatios.E}%`
                        : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
