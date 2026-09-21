import React, { useState } from 'react';
import { StudentProfile, ConversionMethod } from '../types';
import {
  calculateGpaSummary,
  calculateCategorySummaries,
} from '../utils/gradeConversion';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
} from 'recharts';
import { X, GitCompare, Award, Users } from 'lucide-react';

interface StudentComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentProfile[];
  currentStudent: StudentProfile;
  conversionMethod: ConversionMethod;
}

export const StudentComparisonModal: React.FC<StudentComparisonModalProps> = ({
  isOpen,
  onClose,
  students,
  currentStudent,
  conversionMethod,
}) => {
  const otherStudents = students.filter((s) => s.id !== currentStudent.id);
  const [compareStudentId, setCompareStudentId] = useState<string>(
    otherStudents[0]?.id || ''
  );

  if (!isOpen) return null;

  const studentB = students.find((s) => s.id === compareStudentId) || otherStudents[0];

  const summaryA = calculateGpaSummary(currentStudent.records, conversionMethod);
  const summaryB = studentB ? calculateGpaSummary(studentB.records, conversionMethod) : summaryA;

  const catA = calculateCategorySummaries(currentStudent.records, conversionMethod);
  const catB = studentB ? calculateCategorySummaries(studentB.records, conversionMethod) : [];

  // Union of categories for radar chart
  const allCategories = Array.from(
    new Set([...catA.map((c) => c.category), ...catB.map((c) => c.category)])
  );

  const radarData = allCategories.map((cat) => {
    const itemA = catA.find((c) => c.category === cat);
    const itemB = catB.find((c) => c.category === cat);

    const scoreA = itemA ? Math.max(20, Math.round(100 - (itemA.weightedGpa5 - 1.0) * 20)) : 50;
    const scoreB = itemB ? Math.max(20, Math.round(100 - (itemB.weightedGpa5 - 1.0) * 20)) : 50;

    return {
      subject: cat,
      [currentStudent.name]: scoreA,
      [studentB?.name || '비교학생']: scoreB,
      rawA: itemA?.weightedGpa5 || null,
      rawB: itemB?.weightedGpa5 || null,
    };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between sticky top-0 bg-[var(--surface)] z-10">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-[var(--accent)]" />
            <h3 className="text-base font-bold text-[var(--ink)]">학생 간 성적 및 교과 역량 비교</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--ink-secondary)] hover:bg-[var(--surface-alt)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Comparison Selector */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[var(--korean)] text-white font-bold flex items-center justify-center text-sm">
                {currentStudent.name.charAt(0)}
              </div>
              <div>
                <span className="text-xs text-[var(--muted)] block">기준 학생</span>
                <span className="text-sm font-bold text-[var(--ink)]">
                  {currentStudent.name} ({currentStudent.track.split(' ')[0]})
                </span>
              </div>
            </div>

            <span className="text-xs font-bold text-[var(--muted)]">VS</span>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[var(--accent)] text-white font-bold flex items-center justify-center text-sm">
                {studentB?.name.charAt(0)}
              </div>
              <div>
                <span className="text-xs text-[var(--muted)] block mb-1">비교 대상 학생 선택</span>
                <div className="flex items-center gap-2">
                  {/* Grade Dropdown */}
                  <select
                    aria-label="비교 대상 학년 선택"
                    value={studentB?.grade || 1}
                    onChange={(e) => {
                      const targetGrade = Number(e.target.value);
                      const sortedInGrade = otherStudents
                        .filter((st) => st.grade === targetGrade)
                        .slice()
                        .sort(
                          (a, b) =>
                            a.classNum - b.classNum ||
                            a.studentNum - b.studentNum ||
                            a.name.localeCompare(b.name, 'ko')
                        );
                      if (sortedInGrade.length > 0) setCompareStudentId(sortedInGrade[0].id);
                    }}
                    className="bg-[var(--surface)] border border-[var(--border-strong)] rounded-lg px-2 py-1 text-xs font-bold text-[var(--ink)] outline-hidden cursor-pointer"
                  >
                    {Array.from(new Set(otherStudents.map((st) => st.grade)))
                      .sort((a, b) => a - b)
                      .map((g) => (
                        <option key={g} value={g}>
                          {g}학년
                        </option>
                      ))}
                  </select>

                  {/* Student Name Dropdown */}
                  <select
                    aria-label="비교 대상 학생 선택"
                    value={compareStudentId}
                    onChange={(e) => setCompareStudentId(e.target.value)}
                    className="bg-[var(--surface)] border border-[var(--border-strong)] rounded-lg px-2.5 py-1 text-xs font-bold text-[var(--ink)] outline-hidden cursor-pointer max-w-48 truncate"
                  >
                    {otherStudents
                      .filter((st) => st.grade === (studentB?.grade || 1))
                      .slice()
                      .sort(
                        (a, b) =>
                          a.classNum - b.classNum ||
                          a.studentNum - b.studentNum ||
                          a.name.localeCompare(b.name, 'ko')
                      )
                      .map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.classNum}반 {st.studentNum ? `${st.studentNum}번 ` : ''}{st.name} ({st.track.split(' ')[0]})
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Comparison Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="p-3 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)]">
              <span className="text-[var(--muted)] block text-[11px]">5등급제 전학년 GPA</span>
              <div className="mt-1 flex items-baseline justify-center gap-2">
                <span className="font-extrabold text-[var(--korean)] text-base">{summaryA.weightedGpa5}</span>
                <span className="text-[var(--muted)]">vs</span>
                <span className="font-extrabold text-[var(--accent)] text-base">{summaryB.weightedGpa5}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)]">
              <span className="text-[var(--muted)] block text-[11px]">9등급 환산 GPA</span>
              <div className="mt-1 flex items-baseline justify-center gap-2">
                <span className="font-extrabold text-[var(--korean)] text-base">{summaryA.weightedGpa9}</span>
                <span className="text-[var(--muted)]">vs</span>
                <span className="font-extrabold text-[var(--accent)] text-base">{summaryB.weightedGpa9}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)]">
              <span className="text-[var(--muted)] block text-[11px]">평균 원점수</span>
              <div className="mt-1 flex items-baseline justify-center gap-2">
                <span className="font-extrabold text-[var(--korean)] text-base">{summaryA.avgRawScore}점</span>
                <span className="text-[var(--muted)]">vs</span>
                <span className="font-extrabold text-[var(--accent)] text-base">{summaryB.avgRawScore}점</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)]">
              <span className="text-[var(--muted)] block text-[11px]">이수 과목수</span>
              <div className="mt-1 flex items-baseline justify-center gap-2">
                <span className="font-extrabold text-[var(--korean)] text-base">{summaryA.gradedCourseCount}과목</span>
                <span className="text-[var(--muted)]">vs</span>
                <span className="font-extrabold text-[var(--accent)] text-base">{summaryB.gradedCourseCount}과목</span>
              </div>
            </div>
          </div>

          {/* Overlaid Radar Chart */}
          <div className="bg-[var(--surface-alt)] rounded-xl p-4 border border-[var(--border)]">
            <h4 className="text-xs font-bold text-[var(--ink)] mb-2 uppercase tracking-wide text-center">
              교과목별 밸런스 비교 방사형 오버레이 차트
            </h4>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border)" />
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
                            fill="var(--ink-secondary)"
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
                          fill="var(--ink-secondary)"
                          fontSize={11}
                          fontWeight={600}
                        >
                          {text}
                        </text>
                      );
                    }}
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Radar
                    name={`${currentStudent.name} (기준)`}
                    dataKey={currentStudent.name}
                    stroke="var(--korean)"
                    fill="var(--korean)"
                    fillOpacity={0.3}
                  />
                  {studentB && (
                    <Radar
                      name={`${studentB.name} (비교)`}
                      dataKey={studentB.name}
                      stroke="var(--accent)"
                      fill="var(--accent)"
                      fillOpacity={0.3}
                    />
                  )}
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 5 }} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[var(--border)] bg-[var(--surface-alt)] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[var(--ink)] text-white text-xs font-semibold rounded-lg hover:bg-[var(--ink)] transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
