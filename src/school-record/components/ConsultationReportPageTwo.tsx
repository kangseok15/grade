import React, { useState } from 'react';
import { StudentProfile, CourseRecord, ConversionMethod } from '../types';
import {
  calculateGpaSummary,
  calculateSemesterSummaries,
  analyzeTrajectory,
  convertGrade5ToGrade9,
} from '../utils/gradeConversion';
import { Award, TrendingUp, BarChart3, ListOrdered } from 'lucide-react';

interface ConsultationReportPageTwoProps {
  student: StudentProfile;
  allStudents?: StudentProfile[];
  conversionMethod: ConversionMethod;
}

const FIVE_SUBJECTS = ['국어', '수학', '영어', '사회', '과학'] as const;
type FiveSubjectKey = typeof FIVE_SUBJECTS[number];

// Distinct, high-contrast visual styling for the 5 major subjects
const SUBJECT_CONFIG: Record<
  FiveSubjectKey,
  {
    name: string;
    stroke: string;
    fill: string;
    bg: string;
    text: string;
    border: string;
    strokeWidth: number;
    strokeDasharray?: string;
    symbol: string;
    offsetY: number; // Micro-offset to avoid exact visual overlap when multiple subjects share the same grade
  }
> = {
  국어: {
    name: '국어',
    stroke: 'var(--korean)',
    fill: 'var(--korean)',
    bg: 'bg-[var(--korean)]/10',
    text: 'text-[var(--korean)]',
    border: 'border-[var(--korean)]/30',
    strokeWidth: 2.6,
    symbol: '●',
    offsetY: -3,
  },
  수학: {
    name: '수학',
    stroke: 'var(--math)',
    fill: 'var(--math)',
    bg: 'bg-[var(--math)]/10',
    text: 'text-[var(--math)]',
    border: 'border-[var(--math)]/30',
    strokeWidth: 3.0,
    symbol: '■',
    offsetY: -1.5,
  },
  영어: {
    name: '영어',
    stroke: 'var(--english)',
    fill: 'var(--english)',
    bg: 'bg-[var(--english)]/10',
    text: 'text-[var(--english)]',
    border: 'border-[var(--english)]/30',
    strokeWidth: 2.2,
    strokeDasharray: '4 2',
    symbol: '◆',
    offsetY: 0,
  },
  사회: {
    name: '사회',
    stroke: 'var(--elective1)',
    fill: 'var(--elective1)',
    bg: 'bg-[var(--elective1)]/10',
    text: 'text-[var(--elective1)]',
    border: 'border-[var(--elective1)]/30',
    strokeWidth: 2.2,
    strokeDasharray: '6 2 2 2',
    symbol: '▲',
    offsetY: 1.5,
  },
  과학: {
    name: '과학',
    stroke: 'var(--elective2)',
    fill: 'var(--elective2)',
    bg: 'bg-[var(--elective2)]/10',
    text: 'text-[var(--elective2)]',
    border: 'border-[var(--elective2)]/30',
    strokeWidth: 2.2,
    strokeDasharray: '2 2',
    symbol: '★',
    offsetY: 3,
  },
};

export const ConsultationReportPageTwo: React.FC<ConsultationReportPageTwoProps> = ({
  student,
  allStudents = [],
  conversionMethod,
}) => {
  const [highlightedSubject, setHighlightedSubject] = useState<FiveSubjectKey | null>(null);

  const allSummary = calculateGpaSummary(student.records, conversionMethod);
  const semesterSummaries = calculateSemesterSummaries(student.records, conversionMethod);
  const trajectory = analyzeTrajectory(semesterSummaries);

  // Distinct semesters in order (e.g. ['1-1', '1-2', '2-1'])
  const distinctSemesters = Array.from(new Set(student.records.map((r) => r.semester))).sort();

  // Cohort peer profiles
  const cohortSameGrade = allStudents.filter((s) => s.grade === student.grade);

  // Cohort semester averages
  const cohortSemesterStats = distinctSemesters.map((sem) => {
    let gpaSum = 0;
    let count = 0;
    cohortSameGrade.forEach((peer) => {
      const pSem = calculateSemesterSummaries(peer.records, conversionMethod).find(
        (s) => s.term === sem
      );
      if (pSem && pSem.totalUnits > 0) {
        gpaSum += pSem.weightedGpa5;
        count++;
      }
    });
    return {
      semester: sem,
      cohortGpa5: count > 0 ? +(gpaSum / count).toFixed(2) : 2.0,
    };
  });

  // Calculate GPA for 5 major subject groups across semesters with robust categorization
  const isSubjectMatch = (r: CourseRecord, category: FiveSubjectKey) => {
    if (category === '국어') {
      return (
        r.category === '국어' ||
        r.subjectName.includes('국어') ||
        r.subjectName.includes('문학') ||
        r.subjectName.includes('독서') ||
        r.subjectName.includes('화법')
      );
    }
    if (category === '수학') {
      return (
        r.category === '수학' ||
        r.subjectName.includes('수학') ||
        r.subjectName.includes('미적') ||
        r.subjectName.includes('기하') ||
        r.subjectName.includes('확률')
      );
    }
    if (category === '영어') {
      return (
        r.category === '영어' ||
        r.subjectName.includes('영어') ||
        r.subjectName.includes('영미')
      );
    }
    if (category === '사회') {
      return (
        r.category === '사회' ||
        r.subjectName.includes('사회') ||
        r.subjectName.includes('한국사') ||
        r.subjectName.includes('역사') ||
        r.subjectName.includes('지리') ||
        r.subjectName.includes('윤리')
      );
    }
    if (category === '과학') {
      return (
        r.category === '과학' ||
        r.subjectName.includes('과학') ||
        r.subjectName.includes('물리') ||
        r.subjectName.includes('화학') ||
        r.subjectName.includes('생명') ||
        r.subjectName.includes('지구')
      );
    }
    return false;
  };

  const getSubjectSemesterData = (category: FiveSubjectKey, semester: string) => {
    const list = student.records.filter(
      (r) => r.semester === semester && isSubjectMatch(r, category)
    );
    const valid = list.filter((r) => typeof r.rankGrade5 === 'number');
    const u = valid.reduce((a, c) => a + c.units, 0);
    const g = valid.reduce((a, c) => a + c.units * (c.rankGrade5 || 0), 0);
    return u > 0 ? +(g / u).toFixed(2) : null;
  };

  // 5 major subjects cumulative GPA for summary legend chips
  const subjectOverallGpa = FIVE_SUBJECTS.map((sub) => {
    const list = student.records.filter((r) => isSubjectMatch(r, sub));
    const valid = list.filter((r) => typeof r.rankGrade5 === 'number');
    const u = valid.reduce((a, c) => a + c.units, 0);
    const g = valid.reduce((a, c) => a + c.units * (c.rankGrade5 || 0), 0);
    return {
      subject: sub,
      gpa5: u > 0 ? +(g / u).toFixed(2) : null,
      units: u,
    };
  });

  // SVG Chart Dimensions
  const chartWidth = 320;
  const chartHeight = 135;
  const padLeft = 32;
  const padRight = 24;
  const padTop = 20;
  const padBottom = 22;
  const plotW = chartWidth - padLeft - padRight;
  const plotH = chartHeight - padTop - padBottom;

  // USER REQUIREMENT: 1등급이 아래(bottom), 3등급이 위(top)
  // minGradeY = 1.0 (bottom, y = padTop + plotH)
  // maxGradeY = 3.0 (top, y = padTop)
  const minGradeY = 1.0;
  const maxGradeY = 3.0;

  const gradeToY = (g: number) => {
    const clamped = Math.max(minGradeY, Math.min(maxGradeY, g));
    // When clamped is 3.0 -> padTop (Top)
    // When clamped is 1.0 -> padTop + plotH (Bottom)
    return padTop + ((maxGradeY - clamped) / (maxGradeY - minGradeY)) * plotH;
  };

  const semToX = (index: number, total: number) => {
    if (total <= 1) return padLeft + plotW / 2;
    return padLeft + (index / (total - 1)) * plotW;
  };

  // Student points for Chart 1
  const studentOverallPoints = distinctSemesters.map((sem, idx) => {
    const sSummary = semesterSummaries.find((s) => s.term === sem);
    const gpa = sSummary ? sSummary.weightedGpa5 : 1.5;
    return {
      semester: sem,
      gpa,
      x: semToX(idx, distinctSemesters.length),
      y: gradeToY(gpa),
    };
  });

  // Cohort points for Chart 1
  const cohortOverallPoints = distinctSemesters.map((sem, idx) => {
    const cStat = cohortSemesterStats.find((c) => c.semester === sem);
    const gpa = cStat ? cStat.cohortGpa5 : 1.8;
    return {
      semester: sem,
      gpa,
      x: semToX(idx, distinctSemesters.length),
      y: gradeToY(gpa),
    };
  });

  // Split records by semester for 2-column layout requested by user:
  // 1학년 1학기: 왼쪽 (Top Left)
  // 1학년 2학기: 오른쪽 (Top Right)
  // 2학년 1학기: 왼쪽 (Bottom Left)
  // 2학년 2학기: 오른쪽 자리는 비워놓기 (Bottom Right - Empty Slot)
  const sem11Records = student.records.filter((r) => r.semester === '1-1');
  const sem12Records = student.records.filter((r) => r.semester === '1-2');
  const sem21Records = student.records.filter((r) => r.semester === '2-1');

  const getSemStats = (recs: CourseRecord[]) => {
    const units = recs.reduce((a, c) => a + c.units, 0);
    const valid = recs.filter((r) => typeof r.rankGrade5 === 'number');
    const uValid = valid.reduce((a, c) => a + c.units, 0);
    const gSum = valid.reduce((a, c) => a + c.units * (c.rankGrade5 || 0), 0);
    const gpa5 = uValid > 0 ? (gSum / uValid).toFixed(2) : '-';
    return { count: recs.length, units, gpa5 };
  };

  // Render Marker Icon SVG Element
  const renderMarker = (
    symbolType: FiveSubjectKey,
    cx: number,
    cy: number,
    color: string
  ) => {
    switch (symbolType) {
      case '국어': // Circle
        return (
          <circle
            cx={cx}
            cy={cy}
            r="3.5"
            fill={color}
            stroke="var(--surface)"
            strokeWidth="1.6"
          />
        );
      case '수학': // Square
        return (
          <rect
            x={cx - 3.5}
            y={cy - 3.5}
            width="7"
            height="7"
            fill={color}
            stroke="var(--surface)"
            strokeWidth="1.6"
          />
        );
      case '영어': // Diamond
        return (
          <polygon
            points={`${cx},${cy - 4} ${cx + 4},${cy} ${cx},${cy + 4} ${cx - 4},${cy}`}
            fill={color}
            stroke="var(--surface)"
            strokeWidth="1.6"
          />
        );
      case '사회': // Triangle
        return (
          <polygon
            points={`${cx},${cy - 4} ${cx + 4},${cy + 3.5} ${cx - 4},${cy + 3.5}`}
            fill={color}
            stroke="var(--surface)"
            strokeWidth="1.6"
          />
        );
      case '과학': // Hexagon
        return (
          <polygon
            points={`${cx},${cy - 4} ${cx + 3.5},${cy - 2} ${cx + 3.5},${cy + 2} ${cx},${cy + 4} ${cx - 3.5},${cy + 2} ${cx - 3.5},${cy - 2}`}
            fill={color}
            stroke="var(--surface)"
            strokeWidth="1.6"
          />
        );
    }
  };

  // Render a clean, non-wrapping semester transcript card with increased height and studentCount
  const renderSemesterCard = (
    title: string,
    records: CourseRecord[],
    badgeColor = 'bg-[var(--ink)] text-white'
  ) => {
    const stats = getSemStats(records);

    return (
      <div className="flex flex-col border border-[var(--border-strong)] rounded-md overflow-hidden bg-[var(--surface)] shadow-2xs h-full">
        {/* Semester Header */}
        <div className="bg-[var(--surface-alt)]/90 px-2.5 py-1.5 border-b border-[var(--border-strong)] flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className={`px-1.5 py-0.5 rounded font-black text-[9px] font-mono ${badgeColor}`}>
              {title}
            </span>
            <span className="font-bold text-[var(--ink)]">
              {stats.count}과목 · {stats.units}단위
            </span>
          </div>
          <div className="flex items-center gap-1 text-[9.5px] font-mono">
            <span className="text-[var(--muted)] font-sans">학기평균:</span>
            <span className="font-black text-[var(--korean)]">{stats.gpa5}등급</span>
          </div>
        </div>

        {/* Semester Courses Table with increased row height and student count */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-center text-xs border-collapse table-fixed">
            <colgroup>
              <col style={{ width: '13%' }} />
              <col style={{ width: '27%' }} />
              <col style={{ width: '7%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '7%' }} />
              <col style={{ width: '21%' }} />
            </colgroup>
            <thead>
              <tr className="bg-[var(--surface-alt)] border-b border-[var(--border-strong)] text-[9px] font-black text-[var(--ink-secondary)] whitespace-nowrap">
                <th className="py-1.5 px-1 border-r border-[var(--border)]">교과</th>
                <th className="py-1.5 px-1.5 text-left border-r border-[var(--border)]">과목명</th>
                <th className="py-1.5 px-0.5 border-r border-[var(--border)]">단위</th>
                <th className="py-1.5 px-0.5 border-r border-[var(--border)]">원점수/평균</th>
                <th className="py-1.5 px-0.5 border-r border-[var(--border)]">수강자</th>
                <th className="py-1.5 px-0.5 border-r border-[var(--border)]">성취</th>
                <th className="py-1.5 px-1 bg-[var(--korean)]/70 text-[var(--korean)]">5등급(9환산)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-[9px]">
              {records.length > 0 ? (
                records.map((r, idx) => {
                  const conv =
                    typeof r.rankGrade5 === 'number'
                      ? convertGrade5ToGrade9(r.rankGrade5, conversionMethod)
                      : null;
                  const isGradeOne = r.rankGrade5 === 1;

                  return (
                    <tr
                      key={r.id || `${title}-${idx}`}
                      className={`hover:bg-[var(--surface-alt)]/60 transition-colors ${
                        idx % 2 === 1 ? 'bg-[var(--surface-alt)]/40' : 'bg-[var(--surface)]'
                      }`}
                    >
                      <td className="py-1.5 px-1 font-medium text-[var(--ink-secondary)] border-r border-[var(--border)] truncate whitespace-nowrap">
                        {r.category}
                      </td>
                      <td
                        className="py-1.5 px-1.5 text-left font-bold text-[var(--ink)] border-r border-[var(--border)] truncate whitespace-nowrap"
                        title={r.subjectName}
                      >
                        {r.subjectName}
                      </td>
                      <td className="py-1.5 px-0.5 font-mono text-[var(--ink-secondary)] border-r border-[var(--border)] whitespace-nowrap">
                        {r.units}
                      </td>
                      <td className="py-1.5 px-0.5 font-mono border-r border-[var(--border)] text-[var(--ink)] whitespace-nowrap">
                        <span className="font-bold text-[var(--korean)]">{r.rawScore ?? '-'}</span>
                        {typeof r.subjectMean === 'number' && (
                          <span className="text-[7.5px] text-[var(--muted)]">/{r.subjectMean}</span>
                        )}
                      </td>
                      <td className="py-1.5 px-0.5 font-mono border-r border-[var(--border)] text-[var(--ink-secondary)] whitespace-nowrap">
                        {typeof r.studentCount === 'number' ? (
                          <span>
                            {r.studentCount}
                            <span className="text-[7.5px] text-[var(--muted)] ml-0.2">명</span>
                          </span>
                        ) : (
                          <span className="text-[var(--muted)]">-</span>
                        )}
                      </td>
                      <td className="py-1.5 px-0.5 font-bold border-r border-[var(--border)] whitespace-nowrap">
                        <span
                          className={`inline-block px-1 rounded-xs text-[8px] whitespace-nowrap ${
                            r.achievement === 'A'
                              ? 'bg-[var(--good)]/10 text-[var(--good)] font-black'
                              : r.achievement === 'B'
                              ? 'bg-[var(--korean)]/10 text-[var(--korean)]'
                              : 'bg-[var(--surface-alt)] text-[var(--ink-secondary)]'
                          }`}
                        >
                          {r.achievement || '-'}
                        </span>
                      </td>
                      {/* USER REQUIREMENT: 1등급을 한 줄에 (줄 바꿈 X) */}
                      <td className="py-1.5 px-1 font-mono font-bold bg-[var(--korean)]/20 text-center whitespace-nowrap">
                        {typeof r.rankGrade5 === 'number' ? (
                          <div className="inline-flex items-center justify-center gap-0.5 whitespace-nowrap">
                            <span
                              className={`whitespace-nowrap inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[8.5px] font-black shrink-0 ${
                                isGradeOne
                                  ? 'bg-[var(--korean)] text-white'
                                  : 'bg-[var(--border)] text-[var(--ink)]'
                              }`}
                            >
                              {r.rankGrade5}등급
                            </span>
                            {conv && (
                              <span className="text-[7.5px] text-[var(--accent)] font-medium whitespace-nowrap shrink-0">
                                ({conv.grade9Equivalent})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[var(--muted)] whitespace-nowrap">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-[var(--muted)] text-[9.5px]">
                    이수 내역 없음
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render the empty placeholder for 2학년 2학기 with matched height
  const renderEmptySemesterCard = (title: string) => (
    <div className="flex flex-col border border-dashed border-[var(--border-strong)] rounded-md bg-[var(--surface-alt)]/50 p-2.5 justify-between items-center text-center h-full min-h-[220px]">
      <div className="w-full flex items-center justify-between pb-1.5 border-b border-dashed border-[var(--border-strong)] text-[var(--ink-secondary)] font-bold text-[10px]">
        <span className="px-1.5 py-0.5 rounded bg-[var(--border)] text-[var(--ink-secondary)] font-mono font-bold">
          {title}
        </span>
        <span className="text-[9px] text-[var(--muted)] font-mono font-bold">이수 예정 (공란)</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center py-8 text-[var(--muted)]">
        <div className="w-10 h-10 rounded-full border border-[var(--border-strong)] flex items-center justify-center mb-2 text-[var(--muted)] font-serif text-sm">
          숭신
        </div>
        <span className="font-bold text-[11px] text-[var(--ink-secondary)]">
          2학년 2학기 교육과정 미편제
        </span>
        <span className="text-[9px] text-[var(--muted)] mt-1 max-w-[200px] leading-relaxed">
          차기 학기 개설 및 이수 후 내신 성적 반영 예정 (현재 공란)
        </span>
      </div>
      <div className="w-full pt-1.5 border-t border-dashed border-[var(--border)] text-[8px] text-[var(--muted)] font-mono text-center">
        SUGSHIN HIGH SCHOOL ACADEMIC RECORDS
      </div>
    </div>
  );

  return (
    <div
      id="consultation-report-sheet-p2"
      className="consultation-report-page text-[var(--ink)] bg-[var(--surface)] font-sans text-xs leading-normal w-full max-w-[210mm] min-h-[297mm] p-3 sm:p-5 md:p-[7mm] lg:p-[9mm] mx-auto box-border flex flex-col justify-between gap-2.5 select-text print:m-0 print:p-0 print:border-none print:shadow-none"
    >
      {/* Page 2 Header */}
      <div className="border-b-2 border-[var(--border-strong)] pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[var(--ink)] text-white flex items-center justify-center font-serif font-black text-xs shrink-0">
              숭
            </div>
            <div>
              <span className="text-[10.5px] tracking-wider text-[var(--korean)] font-bold block">
                숭신고등학교 진로진학상담부 (미래인재반)
              </span>
              <h1 className="text-lg font-black tracking-tight text-[var(--ink)] font-serif leading-tight">
                2028 대입 개편 5등급제 심층 분석 리포트
              </h1>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-2 py-0.5 rounded bg-[var(--ink)] text-white text-[10px] font-black font-mono">
              [ 2 / 2 페이지 ]
            </span>
          </div>
        </div>

        {/* Student Quick Info Strip */}
        <div className="mt-2 grid grid-cols-5 gap-1.5 bg-[var(--surface-alt)] p-1.5 rounded border border-[var(--border-strong)] text-center font-mono text-[10px]">
          <div>
            <span className="text-[var(--muted)] font-sans block text-[8.5px]">학생 성명</span>
            <span className="font-bold text-[var(--ink)] font-sans">{student.name}</span>
          </div>
          <div>
            <span className="text-[var(--muted)] font-sans block text-[8.5px]">학번</span>
            <span className="font-bold text-[var(--ink)] font-sans whitespace-nowrap">
              {student.grade}학년 {student.classNum}반 {student.studentNum}번
            </span>
          </div>
          <div>
            <span className="text-[var(--muted)] font-sans block text-[8.5px]">과정</span>
            <span className="font-bold text-[var(--ink)] font-sans truncate block" title={student.track}>
              {student.track}
            </span>
          </div>
          <div>
            <span className="text-[var(--muted)] font-sans block text-[8.5px]">전과목 5등급제</span>
            <span className="font-black text-[var(--korean)]">{allSummary.weightedGpa5}등급</span>
          </div>
          <div>
            <span className="text-[var(--muted)] font-sans block text-[8.5px]">9등급 환산</span>
            <span className="font-black text-[var(--accent)]">약 {allSummary.weightedGpa9}등급</span>
          </div>
        </div>
      </div>

      {/* 2 Side-by-Side Trend Graphs */}
      <div className="grid grid-cols-2 gap-3 items-stretch">
        {/* Graph 1: 학기별 전과목 성적 변화 추이 (5등급제) */}
        <div className="flex flex-col space-y-1 p-2 rounded border border-[var(--border-strong)] bg-[var(--surface-alt)]/70">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-[var(--ink)] flex items-center gap-1.5 text-[11px] border-l-3 border-[var(--korean)]/40 pl-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[var(--korean)]" />
              <span>5. 학기별 전과목 5등급제 성적 변화 추이</span>
            </h2>
            <span className="text-[8.5px] font-bold text-[var(--korean)] bg-[var(--korean)]/10 px-1.5 py-0.2 rounded border border-[var(--korean)]/25">
              {trajectory.trend}
            </span>
          </div>

          {/* SVG Line Chart 1 */}
          <div className="bg-[var(--surface)] rounded border border-[var(--border)] p-2 flex flex-col items-center justify-center">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto select-none overflow-visible">
              {/* USER REQUIREMENT: 1등급이 아래고 3등급이 위: 3.0 at top, 1.0 at bottom */}
              {[3.0, 2.5, 2.0, 1.5, 1.0].map((g) => {
                const y = gradeToY(g);
                return (
                  <g key={g}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={chartWidth - padRight}
                      y2={y}
                      stroke={g === 1.0 ? 'var(--border-strong)' : 'var(--border)'}
                      strokeWidth={g === 1.0 ? '1' : '0.6'}
                      strokeDasharray={g === 1.0 ? 'none' : '2 2'}
                    />
                    <text
                      x={padLeft - 4}
                      y={y + 3}
                      textAnchor="end"
                      className="font-mono text-[7.5px] font-bold"
                      fill="var(--muted)"
                    >
                      {g.toFixed(1)}
                    </text>
                  </g>
                );
              })}

              {/* Area gradient for student line */}
              <defs>
                <linearGradient id="studentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--korean)" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="var(--korean)" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* Area fill extending to 1.0 baseline (padTop + plotH) */}
              {studentOverallPoints.length > 1 && (
                <polygon
                  points={`
                    ${studentOverallPoints[0].x},${padTop + plotH}
                    ${studentOverallPoints.map((p) => `${p.x},${p.y}`).join(' ')}
                    ${studentOverallPoints[studentOverallPoints.length - 1].x},${padTop + plotH}
                  `}
                  fill="url(#studentGradient)"
                />
              )}

              {/* Cohort Dashed Line */}
              {cohortOverallPoints.length > 1 && (
                <polyline
                  points={cohortOverallPoints.map((p) => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="1.8"
                  strokeDasharray="4 3"
                />
              )}

              {/* Student Solid Line */}
              {studentOverallPoints.length > 1 && (
                <polyline
                  points={studentOverallPoints.map((p) => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke="var(--korean)"
                  strokeWidth="2.4"
                />
              )}

              {/* Cohort Points */}
              {cohortOverallPoints.map((p) => (
                <circle
                  key={`cohort-${p.semester}`}
                  cx={p.x}
                  cy={p.y}
                  r="2.5"
                  fill="var(--surface)"
                  stroke="var(--accent)"
                  strokeWidth="1.5"
                />
              ))}

              {/* Student Points with Grade Labels */}
              {studentOverallPoints.map((p) => (
                <g key={`student-${p.semester}`}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="3.5"
                    fill="var(--korean)"
                    stroke="var(--surface)"
                    strokeWidth="1.8"
                  />
                  <rect
                    x={p.x - 14}
                    y={p.y - 14}
                    width="28"
                    height="10"
                    rx="3"
                    fill="var(--korean)"
                  />
                  <text
                    x={p.x}
                    y={p.y - 7}
                    textAnchor="middle"
                    className="font-mono text-[7px] font-black"
                    fill="white"
                  >
                    {p.gpa.toFixed(2)}
                  </text>
                </g>
              ))}

              {/* Semester X-labels */}
              {distinctSemesters.map((sem, idx) => {
                const x = semToX(idx, distinctSemesters.length);
                return (
                  <text
                    key={sem}
                    x={x}
                    y={chartHeight - 4}
                    textAnchor="middle"
                    className="font-mono text-[8.5px] font-bold"
                    fill="var(--ink)"
                  >
                    {sem}
                  </text>
                );
              })}
            </svg>

            {/* Chart 1 Legend */}
            <div className="flex items-center justify-between w-full mt-1.5 pt-1.5 border-t border-[var(--border)] text-[8.5px]">
              <div className="flex items-center gap-2 font-bold">
                <span className="flex items-center gap-1 text-[var(--korean)]">
                  <span className="w-2.5 h-1 bg-[var(--korean)] rounded-xs" />
                  {student.name}
                </span>
                <span className="flex items-center gap-1 text-[var(--accent)]">
                  <span className="w-2.5 h-0.5 border-t-2 border-dashed border-[var(--accent)]/40" />
                  미인반평균
                </span>
              </div>
              <span className="text-[var(--muted)] font-medium text-[8px]">
                * 1.0등급(하단) ~ 3.0등급(상단) 기준
              </span>
            </div>
          </div>
        </div>

        {/* Graph 2: 주요 5대 교과별 학기별 성적 추이 그래프 */}
        <div className="flex flex-col space-y-1 p-2 rounded border border-[var(--border-strong)] bg-[var(--surface-alt)]/70">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-[var(--ink)] flex items-center gap-1.5 text-[11px] border-l-3 border-[var(--korean)]/40 pl-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-[var(--korean)]" />
              <span>6. 주요 5대 교과별 학기별 성적 추이 (5등급제)</span>
            </h2>
            <div className="flex items-center gap-1.5">
              {highlightedSubject && (
                <button
                  onClick={() => setHighlightedSubject(null)}
                  className="text-[8px] text-[var(--korean)] underline font-bold"
                >
                  전체보기
                </button>
              )}
              <span className="text-[8.5px] font-bold text-[var(--ink-secondary)]">
                국 · 수 · 영 · 사 · 과
              </span>
            </div>
          </div>

          {/* SVG Multi-line Chart 2 */}
          <div className="bg-[var(--surface)] rounded border border-[var(--border)] p-2 flex flex-col items-center justify-center">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto select-none overflow-visible">
              {/* USER REQUIREMENT: 1등급이 아래고 3등급이 위: 3.0 at top, 1.0 at bottom */}
              {[3.0, 2.5, 2.0, 1.5, 1.0].map((g) => {
                const y = gradeToY(g);
                return (
                  <g key={g}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={chartWidth - padRight}
                      y2={y}
                      stroke={g === 1.0 ? 'var(--border-strong)' : 'var(--border)'}
                      strokeWidth={g === 1.0 ? '1' : '0.6'}
                      strokeDasharray={g === 1.0 ? 'none' : '2 2'}
                    />
                    <text
                      x={padLeft - 4}
                      y={y + 3}
                      textAnchor="end"
                      className="font-mono text-[7.5px] font-bold"
                      fill="var(--muted)"
                    >
                      {g.toFixed(1)}
                    </text>
                  </g>
                );
              })}

              {/* Semester X-labels */}
              {distinctSemesters.map((sem, idx) => {
                const x = semToX(idx, distinctSemesters.length);
                return (
                  <text
                    key={sem}
                    x={x}
                    y={chartHeight - 4}
                    textAnchor="middle"
                    className="font-mono text-[8.5px] font-bold"
                    fill="var(--ink)"
                  >
                    {sem}
                  </text>
                );
              })}

              {/* 5 Subject Lines & Markers with Collision Avoidance Offset */}
              {FIVE_SUBJECTS.map((sub) => {
                const conf = SUBJECT_CONFIG[sub];
                const isFocused = highlightedSubject === null || highlightedSubject === sub;
                const opacity = isFocused ? 1 : 0.15;

                const points = distinctSemesters.map((sem, idx) => {
                  const gpa = getSubjectSemesterData(sub, sem) ?? 2.0;
                  const baseY = gradeToY(gpa);
                  // Apply micro-offset so overlapping lines/markers (e.g. at 1.0) are simultaneously visible
                  const y = baseY + conf.offsetY;

                  return {
                    semester: sem,
                    gpa,
                    x: semToX(idx, distinctSemesters.length),
                    y,
                  };
                });

                if (points.length < 1) return null;

                return (
                  <g key={sub} opacity={opacity} className="transition-opacity duration-150">
                    {/* Multi-line Stroke */}
                    {points.length > 1 && (
                      <polyline
                        points={points.map((p) => `${p.x},${p.y}`).join(' ')}
                        fill="none"
                        stroke={conf.stroke}
                        strokeWidth={highlightedSubject === sub ? conf.strokeWidth + 1.2 : conf.strokeWidth}
                        strokeDasharray={conf.strokeDasharray}
                      />
                    )}

                    {/* Distinct Markers for each subject */}
                    {points.map((p) => (
                      <g key={`${sub}-${p.semester}`}>
                        {renderMarker(sub, p.x, p.y, conf.stroke)}
                      </g>
                    ))}
                  </g>
                );
              })}
            </svg>

            {/* 5 Subject Chips Legend with Marker Symbols & Click-to-Focus */}
            <div className="grid grid-cols-5 gap-1 w-full mt-1.5 pt-1.5 border-t border-[var(--border)]">
              {subjectOverallGpa.map((s) => {
                const conf = SUBJECT_CONFIG[s.subject];
                const isSelected = highlightedSubject === s.subject;

                return (
                  <button
                    key={s.subject}
                    type="button"
                    onClick={() =>
                      setHighlightedSubject(isSelected ? null : s.subject)
                    }
                    className={`flex items-center justify-between px-1.5 py-0.5 rounded border text-[8px] font-mono cursor-pointer transition-all ${
                      isSelected
                        ? 'ring-2 ring-[var(--ink)] shadow-xs'
                        : highlightedSubject && !isSelected
                        ? 'opacity-40 border-[var(--border)]'
                        : `${conf.bg} ${conf.border}`
                    }`}
                    title={`${conf.name} 과목 선 강조 표시 (클릭 시 토글)`}
                  >
                    <span className="flex items-center gap-0.5">
                      <span style={{ color: conf.stroke }} className="text-[9px] font-bold">
                        {conf.symbol}
                      </span>
                      <span className={`font-sans font-black ${conf.text}`}>
                        {conf.name}
                      </span>
                    </span>
                    <span className="font-black text-[var(--ink)] ml-0.5">
                      {s.gpa5 !== null ? s.gpa5.toFixed(2) : '-'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Half: 7. 전체 과목 세부 성적 명세 - 2단 그리드 (1-1 좌, 1-2 우, 2-1 좌, 2-2 우 비워놓기) */}
      <div className="flex flex-col space-y-1.5 flex-1">
        <div className="flex items-center justify-between">
          <h2 className="font-black text-[var(--ink)] flex items-center gap-1.5 text-[11px] border-l-3 border-[var(--korean)]/40 pl-1.5 shrink-0">
            <ListOrdered className="w-3.5 h-3.5 text-[var(--korean)]" />
            <span>7. 전체 과목 세부 성적 명세 (학생부 이수 전과목 내역)</span>
          </h2>
          <span className="text-[9px] text-[var(--muted)] font-bold font-mono">
            총 {student.records.length}개 과목 이수 ({allSummary.totalUnits}단위 누적)
          </span>
        </div>

        {/* 2-Column Grid of Semesters:
            Top Row: 1학년 1학기 (Left) | 1학년 2학기 (Right)
            Bottom Row: 2학년 1학기 (Left) | 2학년 2학기 (Right, Blank Placeholder)
        */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Row 1 Left: 1학년 1학기 */}
          {renderSemesterCard('1학년 1학기', sem11Records, 'bg-[var(--ink)] text-white')}

          {/* Row 1 Right: 1학년 2학기 */}
          {renderSemesterCard('1학년 2학기', sem12Records, 'bg-[var(--accent)] text-white')}

          {/* Row 2 Left: 2학년 1학기 */}
          {renderSemesterCard('2학년 1학기', sem21Records, 'bg-[var(--korean)] text-white')}

          {/* Row 2 Right: 2학년 2학기 자리는 비워놓기 (USER REQUIREMENT) */}
          {renderEmptySemesterCard('2학년 2학기')}
        </div>
      </div>

      {/* Page 2 Official Sign-off Footer */}
      <div className="border-t-2 border-[var(--border-strong)] pt-2 flex flex-row items-center justify-between gap-2 text-[10px] text-[var(--ink-secondary)] font-sans shrink-0">
        <div className="flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-[var(--korean)] shrink-0" />
          <span className="font-bold text-[var(--ink)]">
            본 리포트는 숭신고 진로진학상담부에서 제작한 프로그램입니다.
          </span>
        </div>
        <div className="flex items-center gap-2 text-right font-bold text-[var(--ink)] shrink-0 whitespace-nowrap">
          <span>진로진학상담부 담당교사: ____________________ (인)</span>
          <span className="font-mono text-[var(--ink-secondary)]">[ 2 / 2 ]</span>
        </div>
      </div>
    </div>
  );
};
