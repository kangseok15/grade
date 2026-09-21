import React, { useState, useMemo } from 'react';
import { StudentProfile, CourseRecord, ConversionMethod, SubjectCategory } from '../types';
import { calculateGpaSummary } from '../utils/gradeConversion';
import { convertByEducationOffice } from '../data/educationOfficeConversions';
import {
  Sparkles,
  Calculator,
  PlusCircle,
  Trash2,
  TrendingUp,
  Award,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Target,
  BookOpen,
} from 'lucide-react';

interface TargetGradeSimulatorProps {
  student: StudentProfile;
  conversionMethod: ConversionMethod;
}

interface SimulatedCourse {
  id: string;
  subjectName: string;
  category: SubjectCategory;
  units: number;
  grade5: number;
}

export const TargetGradeSimulator: React.FC<TargetGradeSimulatorProps> = ({
  student,
  conversionMethod,
}) => {
  // Current real stats
  const currentSummary = calculateGpaSummary(student.records, conversionMethod);
  const officeKey =
    conversionMethod === 'busan' ||
    conversionMethod === 'gyeonggi' ||
    conversionMethod === 'gwangju' ||
    conversionMethod === 'average'
      ? conversionMethod
      : 'average';

  const currentCumRatio = convertByEducationOffice(
    currentSummary.weightedGpa5,
    officeKey
  ).cumulativeRatio;

  // Next target semester (e.g. if student has 1-1, 1-2, 2-1 -> next is 2-2)
  const existingSemesters = Array.from(new Set(student.records.map((r) => r.semester))).sort();
  const nextSemester = existingSemesters.includes('2-1')
    ? '2-2'
    : existingSemesters.includes('1-2')
    ? '2-1'
    : '1-2';

  // Default simulated courses for next semester based on track
  const isScience = student.track.includes('자연') || student.track.includes('이과');

  const defaultSimulatedCourses: SimulatedCourse[] = isScience
    ? [
        { id: 'sim-1', subjectName: '미적분', category: '수학', units: 4, grade5: 1 },
        { id: 'sim-2', subjectName: '기하', category: '수학', units: 3, grade5: 1 },
        { id: 'sim-3', subjectName: '영어독해와작문', category: '영어', units: 4, grade5: 1 },
        { id: 'sim-4', subjectName: '물리학Ⅱ', category: '과학', units: 3, grade5: 1 },
        { id: 'sim-5', subjectName: '화학Ⅱ', category: '과학', units: 3, grade5: 2 },
        { id: 'sim-6', subjectName: '독서와문법', category: '국어', units: 4, grade5: 1 },
      ]
    : [
        { id: 'sim-1', subjectName: '문학', category: '국어', units: 4, grade5: 1 },
        { id: 'sim-2', subjectName: '확률과통계', category: '수학', units: 4, grade5: 1 },
        { id: 'sim-3', subjectName: '심화영어', category: '영어', units: 4, grade5: 1 },
        { id: 'sim-4', subjectName: '사회문화', category: '사회', units: 3, grade5: 1 },
        { id: 'sim-5', subjectName: '생활과윤리', category: '사회', units: 3, grade5: 1 },
        { id: 'sim-6', subjectName: '세계지리', category: '사회', units: 3, grade5: 2 },
      ];

  const [simulatedCourses, setSimulatedCourses] =
    useState<SimulatedCourse[]>(defaultSimulatedCourses);

  // Add course handler
  const handleAddCourse = () => {
    const newCourse: SimulatedCourse = {
      id: `sim-${Date.now()}`,
      subjectName: '새 목표 과목',
      category: '수학',
      units: 3,
      grade5: 1,
    };
    setSimulatedCourses((prev) => [...prev, newCourse]);
  };

  // Remove course handler
  const handleRemoveCourse = (id: string) => {
    setSimulatedCourses((prev) => prev.filter((c) => c.id !== id));
  };

  // Update course field
  const handleUpdateCourse = (
    id: string,
    field: keyof SimulatedCourse,
    val: any
  ) => {
    setSimulatedCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: val } : c))
    );
  };

  // Reset to default
  const handleReset = () => {
    setSimulatedCourses(defaultSimulatedCourses);
  };

  // Set all to 1st grade
  const handleSetAllGrade = (targetGrade: number) => {
    setSimulatedCourses((prev) =>
      prev.map((c) => ({ ...c, grade5: targetGrade }))
    );
  };

  // Combined projected records
  const projectedRecords: CourseRecord[] = useMemo(() => {
    const convertedSimulated: CourseRecord[] = simulatedCourses.map(
      (sim, idx) => ({
        id: `sim-rec-${idx}`,
        semester: nextSemester,
        subjectName: sim.subjectName,
        category: sim.category,
        units: sim.units,
        achievement: (sim.grade5 === 1 ? 'A' : sim.grade5 === 2 ? 'B' : sim.grade5 === 3 ? 'C' : 'D'),
        rankGrade5: sim.grade5,
        courseType: '일반',
      })
    );
    return [...student.records, ...convertedSimulated];
  }, [student.records, simulatedCourses, nextSemester]);

  // Projected Summary
  const projectedSummary = useMemo(() => {
    return calculateGpaSummary(projectedRecords, conversionMethod);
  }, [projectedRecords, conversionMethod]);

  const projectedCumRatio = convertByEducationOffice(
    projectedSummary.weightedGpa5,
    officeKey
  ).cumulativeRatio;

  // Differences
  // Note: in GPA, lower is better. If projected is 1.15 and current is 1.21:
  // grade5 change = 1.21 - 1.15 = 0.06 improvement!
  const gpa5Improvement = +(
    currentSummary.weightedGpa5 - projectedSummary.weightedGpa5
  ).toFixed(2);
  const gpa9Improvement = +(
    currentSummary.weightedGpa9 - projectedSummary.weightedGpa9
  ).toFixed(2);
  const cumRatioImprovement = +(
    currentCumRatio - projectedCumRatio
  ).toFixed(2);

  // Term GPA for just the simulated term
  const simulatedTermUnits = simulatedCourses.reduce((acc, c) => acc + c.units, 0);
  const simulatedTermWeightedSum = simulatedCourses.reduce(
    (acc, c) => acc + c.units * c.grade5,
    0
  );
  const simulatedTermGpa =
    simulatedTermUnits > 0
      ? +(simulatedTermWeightedSum / simulatedTermUnits).toFixed(2)
      : 0;

  return (
    <div className="space-y-6" id="target-grade-simulator-section">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-stone-100 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-stone-900 tracking-tight">
                  다음 학기({nextSemester}) 목표 성적 시뮬레이터 (What-If 분석)
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                  성적 역전 및 누적 GPA 도약 분석
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                다음 학기 이수할 과목들의 예상 등급을 설정하여, 졸업 시점 누적 내신(5등급제 & 9등급 환산치)의 변화량과 입시 유리도를 사전에 측정합니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto">
            <button
              onClick={() => handleSetAllGrade(1)}
              className="px-3 py-1.5 bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              전과목 1등급 가정
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>초기화</span>
            </button>
          </div>
        </div>

        {/* Before vs After Visual Scoreboard */}
        <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: 5-Grade Cumulative GPA Shift */}
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200">
            <span className="text-xs font-bold text-blue-800 block">
              5등급제 전학년 누적 GPA 변화
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-stone-400 line-through font-mono">
                {currentSummary.weightedGpa5}등급
              </span>
              <ArrowRight className="w-4 h-4 text-blue-600" />
              <span className="text-2xl font-black text-blue-950 font-mono">
                {projectedSummary.weightedGpa5}등급
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span
                className={`px-2 py-0.5 rounded font-bold ${
                  gpa5Improvement > 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : gpa5Improvement < 0
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-stone-100 text-stone-600'
                }`}
              >
                {gpa5Improvement > 0
                  ? `▲ ${gpa5Improvement}등급 상승`
                  : gpa5Improvement < 0
                  ? `▼ ${Math.abs(gpa5Improvement)}등급 하락`
                  : '변동 없음'}
              </span>
              <span className="text-[11px] text-stone-500">
                총 {projectedSummary.totalUnits}단위 기준
              </span>
            </div>
          </div>

          {/* Card 2: 9-Grade Equivalent Shift */}
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
            <span className="text-xs font-bold text-amber-800 block">
              3개 교육청 통합 9등급 환산치 변화
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-stone-400 line-through font-mono">
                {currentSummary.weightedGpa9}등급
              </span>
              <ArrowRight className="w-4 h-4 text-amber-600" />
              <span className="text-2xl font-black text-amber-950 font-mono">
                약 {projectedSummary.weightedGpa9}등급
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span
                className={`px-2 py-0.5 rounded font-bold ${
                  gpa9Improvement > 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : gpa9Improvement < 0
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-stone-100 text-stone-600'
                }`}
              >
                {gpa9Improvement > 0
                  ? `▲ 9등급 ${gpa9Improvement}등급 도약`
                  : gpa9Improvement < 0
                  ? `▼ 9등급 ${Math.abs(gpa9Improvement)}등급 하락`
                  : '변동 없음'}
              </span>
            </div>
          </div>

          {/* Card 3: Next Term Goal Focus */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-stone-700 block">
                {nextSemester}학기 목표 학기 평균
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-stone-900 font-mono">
                  {simulatedTermGpa}등급
                </span>
                <span className="text-xs text-stone-500">
                  (총 {simulatedTermUnits}단위 목표)
                </span>
              </div>
            </div>
            <p className="text-[11px] text-stone-600 mt-2">
              누적 백분위: 상위 {currentCumRatio}% ➔{' '}
              <strong className="text-blue-700 font-bold">
                상위 {projectedCumRatio}%
              </strong>{' '}
              ({cumRatioImprovement > 0 ? `+${cumRatioImprovement}%p 개선` : ''})
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Simulation Course Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-stone-200 bg-stone-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span className="font-bold text-stone-900">
              {nextSemester}학기 목표 이수 과목 및 등급 설정
            </span>
            <span className="text-stone-400">({simulatedCourses.length}과목)</span>
          </div>

          <button
            onClick={handleAddCourse}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-bold transition-colors cursor-pointer self-start sm:self-auto"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>목표 과목 추가</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse whitespace-nowrap min-w-[620px]">
            <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
              <tr>
                <th className="py-2.5 px-4 text-left">과목명</th>
                <th className="py-2.5 px-3">교과군</th>
                <th className="py-2.5 px-3">이수 단위</th>
                <th className="py-2.5 px-4 bg-amber-50 text-amber-950">
                  목표 석차등급 (5등급제)
                </th>
                <th className="py-2.5 px-3">9등급 환산 대응치</th>
                <th className="py-2.5 px-3">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-stone-800">
              {simulatedCourses.map((course) => {
                const equiv9 = convertByEducationOffice(course.grade5, officeKey).grade9Equivalent;

                return (
                  <tr key={course.id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-2.5 px-4 text-left">
                      <input
                        type="text"
                        value={course.subjectName}
                        onChange={(e) =>
                          handleUpdateCourse(course.id, 'subjectName', e.target.value)
                        }
                        className="px-2 py-1 bg-stone-50 border border-stone-300 rounded font-semibold text-stone-900 w-44 outline-hidden focus:bg-white focus:border-amber-500"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <select
                        value={course.category}
                        onChange={(e) =>
                          handleUpdateCourse(
                            course.id,
                            'category',
                            e.target.value as SubjectCategory
                          )
                        }
                        className="px-2 py-1 bg-stone-50 border border-stone-300 rounded font-medium text-stone-700 outline-hidden cursor-pointer"
                      >
                        <option value="국어">국어</option>
                        <option value="수학">수학</option>
                        <option value="영어">영어</option>
                        <option value="사회">사회</option>
                        <option value="과학">과학</option>
                        <option value="기술가정">기술가정</option>
                        <option value="정보">정보</option>
                        <option value="제2외국어">제2외국어</option>
                      </select>
                    </td>
                    <td className="py-2.5 px-3">
                      <select
                        value={course.units}
                        onChange={(e) =>
                          handleUpdateCourse(course.id, 'units', Number(e.target.value))
                        }
                        className="px-2 py-1 bg-stone-50 border border-stone-300 rounded font-mono font-bold text-stone-800 outline-hidden cursor-pointer"
                      >
                        {[1, 2, 3, 4, 5].map((u) => (
                          <option key={u} value={u}>
                            {u}단위
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2.5 px-4 bg-amber-50/40">
                      <div className="flex items-center justify-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => handleUpdateCourse(course.id, 'grade5', g)}
                            className={`w-7 h-7 rounded-md font-bold text-xs cursor-pointer transition-all ${
                              course.grade5 === g
                                ? 'bg-amber-500 text-stone-950 shadow-xs ring-2 ring-amber-400 font-black'
                                : 'bg-white border border-stone-300 text-stone-600 hover:bg-stone-100'
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                        <span className="font-bold text-amber-950 ml-1">등급</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-stone-600">
                      약 {equiv9.toFixed(2)}등급
                    </td>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => handleRemoveCourse(course.id)}
                        className="p-1 text-stone-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                        title="과목 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Academic Coaching Advice */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 text-xs space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="font-bold text-stone-900">
              {student.name} 학생 맞춤형 다음 학기 내신 방어 전략 조언
            </span>
          </div>
          <p className="text-stone-600 leading-relaxed text-[11px]">
            {simulatedTermGpa <= 1.2
              ? `다음 학기 전과목 평균 ${simulatedTermGpa}등급을 달성할 경우, 전학년 누적 9등급 환산치가 약 ${projectedSummary.weightedGpa9}등급(상위 ${projectedCumRatio}%)으로 대폭 개선되어, 서울 상위 5개 대학(연세·고려·성균관·한양·서강) 학생부교과/종합 안정 합격권에 진입할 수 있습니다.`
              : `목표 설정 기준 전학년 누적치가 약 ${projectedSummary.weightedGpa9}등급으로 유지됩니다. 의약학 및 최상위권 진학을 목표로 한다면 단위수가 높은 수학(미적분)과 국어 교과를 최우선으로 1등급 확보하도록 집중 관리가 필요합니다.`}
          </p>
        </div>
      </div>
    </div>
  );
};
