import React, { useState } from 'react';
import { StudentProfile, ConversionMethod } from '../types';
import {
  calculateGpaSummary,
  calculateSemesterSummaries,
  analyzeTrajectory,
  calculateSubjectGroupCombinations,
} from '../utils/gradeConversion';
import {
  TrendingUp,
  Award,
  BookOpen,
  Sliders,
  Sparkles,
  FileCheck,
  Users,
  Target,
  GraduationCap,
} from 'lucide-react';

interface StudentSummaryCardProps {
  student: StudentProfile;
  allStudents?: StudentProfile[];
  gradeSystemMode: '5grade' | '9grade' | 'both';
  conversionMethod: ConversionMethod;
}

export const StudentSummaryCard: React.FC<StudentSummaryCardProps> = ({
  student,
  allStudents = [],
  gradeSystemMode,
  conversionMethod,
}) => {
  // 학년 가중 비율 설정 (기본: 1학년 50%, 2학년 50%)
  const [ratioYear1, setRatioYear1] = useState<number>(50);
  const ratioYear2 = 100 - ratioYear1;

  // 1학년 레코드 vs 2학년 레코드
  const y1Records = student.records.filter((r) => r.semester.startsWith('1-'));
  const y2Records = student.records.filter((r) => r.semester.startsWith('2-'));

  const y1Summary = calculateGpaSummary(y1Records, conversionMethod);
  const y2Summary = calculateGpaSummary(y2Records, conversionMethod);
  const allSummary = calculateGpaSummary(student.records, conversionMethod);

  // 학년 가중 비율 반영 전학년 평균
  const weightedOverall5 =
    y1Summary.totalUnits > 0 && y2Summary.totalUnits > 0
      ? +(
          (y1Summary.weightedGpa5 * ratioYear1 + y2Summary.weightedGpa5 * ratioYear2) /
          100
        ).toFixed(2)
      : allSummary.weightedGpa5;

  const weightedOverall9 =
    y1Summary.totalUnits > 0 && y2Summary.totalUnits > 0
      ? +(
          (y1Summary.weightedGpa9 * ratioYear1 + y2Summary.weightedGpa9 * ratioYear2) /
          100
        ).toFixed(2)
      : allSummary.weightedGpa9;

  const semesterSummaries = calculateSemesterSummaries(student.records, conversionMethod);
  const trajectory = analyzeTrajectory(semesterSummaries);

  // 성취도 A 비율
  const aCount = student.records.filter((r) => r.achievement === 'A').length;
  const aPercent =
    student.records.length > 0 ? Math.round((aCount / student.records.length) * 100) : 0;

  // -------------------------------------------------------------
  // 미래인재반(동일 학년 우수 학생군) 집단 평균 산출
  // -------------------------------------------------------------
  const cohortSameGrade = allStudents.filter((s) => s.grade === student.grade);
  const cohortCount = cohortSameGrade.length > 0 ? cohortSameGrade.length : 1;

  // 동일 학년 미래인재반 친구들의 교과군별 조합 성적 평균
  const cohortCombinations = cohortSameGrade.map((s) =>
    calculateSubjectGroupCombinations(s.records, conversionMethod)
  );

  // 현재 학생의 교과군 조합별 성적
  // 1) 전과목, 2) 국영수사과한국사, 3) 국영수사(한국사), 4) 국영수과
  const studentCombinations = calculateSubjectGroupCombinations(
    student.records,
    conversionMethod
  );

  // 미래인재반 전체 평균
  const cohortAvgByGroup = studentCombinations.map((sc) => {
    let sumGpa5 = 0;
    let sumGpa9 = 0;
    let sumRaw = 0;
    let count = 0;

    cohortCombinations.forEach((combList) => {
      const match = combList.find((item) => item.key === sc.key);
      if (match && match.totalUnits > 0) {
        sumGpa5 += match.weightedGpa5;
        sumGpa9 += match.weightedGpa9;
        sumRaw += match.avgRawScore;
        count++;
      }
    });

    return {
      key: sc.key,
      avgGpa5: count > 0 ? +(sumGpa5 / count).toFixed(2) : sc.weightedGpa5,
      avgGpa9: count > 0 ? +(sumGpa9 / count).toFixed(2) : sc.weightedGpa9,
      avgRaw: count > 0 ? +(sumRaw / count).toFixed(1) : sc.avgRawScore,
      count,
    };
  });

  return (
    <div
      className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden"
      id="student-summary-card"
    >
      {/* Student Profile Ribbon */}
      <div className="bg-stone-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-amber-400 text-stone-900 font-extrabold text-xl flex items-center justify-center border-2 border-white shadow-xs">
            {student.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white">{student.name}</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 font-medium">
                {student.school}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-semibold border border-amber-400/30">
                {student.track}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-400/30 flex items-center gap-1">
                <Users className="w-3 h-3" />
                미래인재반 ({student.grade}학년 {cohortCount}명)
              </span>
            </div>
            <div className="text-xs text-stone-400 mt-0.5 flex items-center gap-2">
              <span>
                {student.grade}학년 {student.classNum}반 {student.studentNum}번
              </span>
              <span>•</span>
              <span>
                총 {allSummary.totalUnits}단위 이수 ({allSummary.gradedCourseCount}과목 평가)
              </span>
            </div>
          </div>
        </div>

        {/* Trajectory Badge */}
        <div className="flex items-center gap-2 bg-stone-800/80 px-3 py-1.5 rounded-lg border border-stone-700">
          <TrendingUp
            className={`w-4 h-4 ${
              trajectory.trend === '상승형'
                ? 'text-emerald-400'
                : trajectory.trend === '하강형'
                ? 'text-rose-400'
                : 'text-blue-400'
            }`}
          />
          <div className="text-left">
            <div className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">
              {student.grade === 1 ? '1학년 성취 수준' : '학업 추세'}
            </div>
            <div className="text-xs font-bold text-white flex items-center gap-1">
              <span>
                {student.grade === 1
                  ? allSummary.weightedGpa5 <= 1.3
                    ? '최상위권'
                    : '상위권'
                  : trajectory.trend}
              </span>
              {y2Summary.totalUnits > 0 ? (
                <span
                  className={`text-[11px] font-normal ${
                    trajectory.trend === '상승형'
                      ? 'text-emerald-400'
                      : trajectory.trend === '하강형'
                      ? 'text-rose-400'
                      : 'text-stone-300'
                  }`}
                >
                  ({y1Summary.weightedGpa5 - y2Summary.weightedGpa5 >= 0 ? '+' : ''}
                  {+(y1Summary.weightedGpa5 - y2Summary.weightedGpa5).toFixed(2)}등급 개선)
                </span>
              ) : (
                <span className="text-[11px] font-normal text-amber-300">
                  (1-1 평균 {allSummary.weightedGpa5}등급)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-5 space-y-5">
        {/* ========================================================= */}
        {/* NEW: 대입 교과군 조합별 성적 일람표 (미래인재반 비교) */}
        {/* ========================================================= */}
        <div>
          <div className="flex flex-wrap items-center justify-between mb-2.5">
            <div>
              <h3 className="text-xs font-bold text-stone-900 flex items-center gap-1.5 uppercase tracking-wide">
                <Target className="w-4 h-4 text-blue-600" />
                대입 주요 교과군 조합별 성적 & 미래인재반 ({student.grade}학년) 비교
              </h3>
              <p className="text-[11px] text-stone-500 mt-0.5">
                수시 전형별(전과목 / 국영수사과한국사 / 국영수사(한국사) / 국영수과) 반영 등급 및 미래인재반 동일 학년 친구들 평균과의 격차를 분석합니다.
              </p>
            </div>

            <span className="text-xs px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 font-semibold border border-stone-200">
              미래인재반 표본: {cohortCount}명 기준
            </span>
          </div>

          <div className="border border-stone-200 rounded-lg shadow-2xs overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <table className="w-full text-center text-xs whitespace-nowrap">
              <thead className="bg-stone-100 text-stone-700 font-semibold border-b border-stone-200 whitespace-nowrap">
                <tr>
                  <th className="py-2.5 px-2.5 text-left whitespace-nowrap">교과군 조합</th>
                  <th className="py-2.5 px-2 whitespace-nowrap">이수단위 / 과목</th>
                  <th className="py-2.5 px-2 bg-blue-50/70 text-blue-900 font-bold whitespace-nowrap">
                    5등급제 평균
                  </th>
                  <th className="py-2.5 px-2 bg-amber-50/70 text-amber-900 font-bold whitespace-nowrap">
                    9등급 환산
                  </th>
                  <th className="py-2.5 px-2 text-stone-600 whitespace-nowrap">
                    미래인재반({student.grade}학년) 평균
                  </th>
                  <th className="py-2.5 px-2 text-stone-800 whitespace-nowrap">
                    미래인재반 대비 우위
                  </th>
                  <th className="py-2.5 px-2.5 text-left whitespace-nowrap">대입 전형 활용도</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 font-medium text-stone-800 whitespace-nowrap">
                {studentCombinations.map((comb) => {
                  const cohortMatch = cohortAvgByGroup.find((c) => c.key === comb.key);
                  const cohortAvg5 = cohortMatch?.avgGpa5 ?? comb.weightedGpa5;

                  // 등급은 낮을수록 좋으므로, (미래인재반 평균 - 내 등급)이 양수이면 우위(+)
                  const diff5 = +(cohortAvg5 - comb.weightedGpa5).toFixed(2);
                  const isAdvantage = diff5 >= 0;

                  return (
                    <tr
                      key={comb.key}
                      className="hover:bg-stone-50/80 transition-colors whitespace-nowrap"
                    >
                      {/* 교과군 명칭 */}
                      <td className="py-2.5 px-2.5 text-left font-bold text-stone-900 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              comb.key === 'all'
                                ? 'bg-stone-700'
                                : comb.key === 'korean_math_eng_soc_sci_hist'
                                ? 'bg-blue-600'
                                : comb.key === 'korean_math_eng_soc_hist'
                                ? 'bg-amber-600'
                                : 'bg-emerald-600'
                            }`}
                          ></span>
                          <span className="text-stone-900 whitespace-nowrap">{comb.label}</span>
                        </div>
                      </td>

                      {/* 이수단위/과목수 */}
                      <td className="py-2.5 px-2 text-stone-600 font-mono whitespace-nowrap">
                        {comb.totalUnits}단위 ({comb.courseCount}과목)
                      </td>

                      {/* 학생 5등급제 평균 */}
                      <td className="py-2.5 px-2 bg-blue-50/50 font-black text-blue-950 text-sm whitespace-nowrap">
                        {comb.weightedGpa5}등급
                      </td>

                      {/* 학생 9등급제 환산 */}
                      <td className="py-2.5 px-2 bg-amber-50/50 font-black text-amber-950 text-sm whitespace-nowrap">
                        {comb.weightedGpa9}등급
                      </td>

                      {/* 미래인재반 5등급제 평균 */}
                      <td className="py-2.5 px-2 font-semibold text-stone-700 font-mono whitespace-nowrap">
                        {cohortAvg5.toFixed(2)}등급
                      </td>

                      {/* 미래인재반 대비 우위 격차 */}
                      <td className="py-2.5 px-2 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            diff5 > 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : diff5 < 0
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {diff5 > 0 ? `+${diff5}등급 우위` : diff5 < 0 ? `${diff5}등급` : '동일'}
                        </span>
                      </td>

                      {/* 전형 활용도 설명 */}
                      <td className="py-2.5 px-2.5 text-left text-[11px] text-stone-500 whitespace-nowrap">
                        {comb.description}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 학년별 가중평균 및 단순합산 일람표 */}
        {/* ========================================================= */}
        <div>
          <div className="flex flex-wrap items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-stone-800 flex items-center gap-1.5 uppercase tracking-wide">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              학년별 이수 구분 및 가중 비율 계산
            </h3>

            {/* Year weight ratio slider */}
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <Sliders className="w-3.5 h-3.5" />
              <span>학년 가중비:</span>
              <div className="inline-flex rounded-md border border-stone-200 overflow-hidden text-[11px]">
                <button
                  type="button"
                  onClick={() => setRatioYear1(50)}
                  className={`px-2 py-0.5 ${
                    ratioYear1 === 50
                      ? 'bg-stone-800 text-white font-bold'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-700'
                  }`}
                >
                  50:50 (기본)
                </button>
                <button
                  type="button"
                  onClick={() => setRatioYear1(40)}
                  className={`px-2 py-0.5 ${
                    ratioYear1 === 40
                      ? 'bg-stone-800 text-white font-bold'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-700'
                  }`}
                >
                  40:60
                </button>
                <button
                  type="button"
                  onClick={() => setRatioYear1(30)}
                  className={`px-2 py-0.5 ${
                    ratioYear1 === 30
                      ? 'bg-stone-800 text-white font-bold'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-700'
                  }`}
                >
                  30:70
                </button>
              </div>
            </div>
          </div>

          <div className="border border-stone-200 rounded-lg overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <table className="w-full text-center text-xs whitespace-nowrap">
              <thead className="bg-stone-100 text-stone-700 font-semibold border-b border-stone-200 whitespace-nowrap">
                <tr>
                  <th className="py-2 px-3 text-left whitespace-nowrap">구분</th>
                  <th className="py-2 px-3 whitespace-nowrap">1학년 ({ratioYear1}%)</th>
                  <th className="py-2 px-3 whitespace-nowrap">2학년 ({ratioYear2}%)</th>
                  <th className="py-2 px-3 whitespace-nowrap">전학년 (단순합산)</th>
                  <th className="py-2 px-3 bg-amber-50 text-amber-900 font-bold whitespace-nowrap">
                    설정비 가중 ({ratioYear1}:{ratioYear2})
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 font-medium text-stone-800 whitespace-nowrap">
                {/* 5-Grade System Row */}
                {(gradeSystemMode === '5grade' || gradeSystemMode === 'both') && (
                  <>
                    <tr className="hover:bg-stone-50/80 whitespace-nowrap">
                      <td className="py-2 px-3 text-left font-semibold text-stone-900 whitespace-nowrap">
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-600 mr-1.5 shrink-0"></span>
                        5등급제 단위반영(O)
                      </td>
                      <td className="py-2 px-3 font-bold text-stone-900 whitespace-nowrap">
                        {y1Summary.weightedGpa5 > 0 ? y1Summary.weightedGpa5 : '-'}
                      </td>
                      <td className="py-2 px-3 font-bold text-stone-900 whitespace-nowrap">
                        {y2Summary.weightedGpa5 > 0 ? y2Summary.weightedGpa5 : '-'}
                      </td>
                      <td className="py-2 px-3 text-stone-700 whitespace-nowrap">{allSummary.weightedGpa5}</td>
                      <td className="py-2 px-3 bg-amber-50 font-extrabold text-stone-900 text-sm whitespace-nowrap">
                        {weightedOverall5}
                      </td>
                    </tr>
                    <tr className="hover:bg-stone-50/80 text-stone-600 whitespace-nowrap">
                      <td className="py-1.5 px-3 text-left pl-6 text-stone-500 whitespace-nowrap">
                        └ 단위미반영(X)
                      </td>
                      <td className="py-1.5 px-3 whitespace-nowrap">{y1Summary.unweightedGpa5 || '-'}</td>
                      <td className="py-1.5 px-3 whitespace-nowrap">{y2Summary.unweightedGpa5 || '-'}</td>
                      <td className="py-1.5 px-3 whitespace-nowrap">{allSummary.unweightedGpa5}</td>
                      <td className="py-1.5 px-3 bg-amber-50/50 text-stone-700 whitespace-nowrap">
                        {y1Summary.unweightedGpa5 && y2Summary.unweightedGpa5
                          ? +(
                              (y1Summary.unweightedGpa5 * ratioYear1 +
                                y2Summary.unweightedGpa5 * ratioYear2) /
                              100
                            ).toFixed(2)
                          : allSummary.unweightedGpa5}
                      </td>
                    </tr>
                  </>
                )}

                {/* 9-Grade Equivalent Row */}
                {(gradeSystemMode === '9grade' || gradeSystemMode === 'both') && (
                  <>
                    <tr className="bg-stone-50/40 hover:bg-stone-50 whitespace-nowrap">
                      <td className="py-2 px-3 text-left font-semibold text-stone-900 whitespace-nowrap">
                        <span className="inline-block w-2 h-2 rounded-full bg-amber-600 mr-1.5 shrink-0"></span>
                        9등급 환산 단위반영(O)
                      </td>
                      <td className="py-2 px-3 font-bold text-amber-900 whitespace-nowrap">
                        {y1Summary.weightedGpa9 > 0 ? y1Summary.weightedGpa9 : '-'}
                      </td>
                      <td className="py-2 px-3 font-bold text-amber-900 whitespace-nowrap">
                        {y2Summary.weightedGpa9 > 0 ? y2Summary.weightedGpa9 : '-'}
                      </td>
                      <td className="py-2 px-3 text-stone-700 whitespace-nowrap">{allSummary.weightedGpa9}</td>
                      <td className="py-2 px-3 bg-amber-100/70 font-extrabold text-amber-950 text-sm whitespace-nowrap">
                        {weightedOverall9}
                      </td>
                    </tr>
                    <tr className="hover:bg-stone-50/80 text-stone-500 whitespace-nowrap">
                      <td className="py-1.5 px-3 text-left pl-6 whitespace-nowrap">
                        └ 9등급 단위미반영(X)
                      </td>
                      <td className="py-1.5 px-3 whitespace-nowrap">{y1Summary.unweightedGpa9 || '-'}</td>
                      <td className="py-1.5 px-3 whitespace-nowrap">{y2Summary.unweightedGpa9 || '-'}</td>
                      <td className="py-1.5 px-3 whitespace-nowrap">{allSummary.unweightedGpa9}</td>
                      <td className="py-1.5 px-3 bg-amber-50/50 whitespace-nowrap">
                        {y1Summary.unweightedGpa9 && y2Summary.unweightedGpa9
                          ? +(
                              (y1Summary.unweightedGpa9 * ratioYear1 +
                                y2Summary.unweightedGpa9 * ratioYear2) /
                              100
                            ).toFixed(2)
                          : allSummary.unweightedGpa9}
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Highlight Insights Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-lg bg-stone-50 border border-stone-200">
            <div className="text-[11px] font-semibold text-stone-500 uppercase flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              성취도 A 비율
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-bold text-stone-900">{aPercent}%</span>
              <span className="text-xs text-stone-500">
                ({aCount}/{student.records.length} 과목)
              </span>
            </div>
            <div className="w-full bg-stone-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all"
                style={{ width: `${aPercent}%` }}
              ></div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-stone-50 border border-stone-200">
            <div className="text-[11px] font-semibold text-stone-500 uppercase flex items-center gap-1">
              <FileCheck className="w-3.5 h-3.5 text-amber-600" />
              평균 원점수 vs 미래인재반({student.grade}학년)
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-bold text-stone-900">{allSummary.avgRawScore}점</span>
              <span className="text-xs font-semibold text-stone-500">
                (미래인재반 평균 {cohortAvgByGroup[0]?.avgRaw ?? 88.5}점)
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              {allSummary.avgRawScore >= (cohortAvgByGroup[0]?.avgRaw ?? 88.5) ? (
                <span className="text-emerald-700 font-bold">
                  미래인재반 평균 대비 +
                  {(allSummary.avgRawScore - (cohortAvgByGroup[0]?.avgRaw ?? 88.5)).toFixed(1)}점
                  우위
                </span>
              ) : (
                <span className="text-stone-600">
                  미래인재반 평균 대비{' '}
                  {(allSummary.avgRawScore - (cohortAvgByGroup[0]?.avgRaw ?? 88.5)).toFixed(1)}점
                </span>
              )}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-stone-50 border border-stone-200">
            <div className="text-[11px] font-semibold text-stone-500 uppercase flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              미래인재반 종합 평가
            </div>
            <p className="text-xs font-medium text-stone-800 mt-1 line-clamp-2">
              {student.memo || trajectory.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
