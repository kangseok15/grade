import React, { useState } from 'react';
import { CourseRecord, StudentProfile, ConversionMethod, SubjectCategory } from '../types';
import { convertGrade5ToGrade9 } from '../utils/gradeConversion';
import {
  Search,
  Filter,
  Trash2,
  Edit2,
  FileSpreadsheet,
  Download,
} from 'lucide-react';

interface TranscriptTableProps {
  student: StudentProfile;
  gradeSystemMode: '5grade' | '9grade' | 'both';
  conversionMethod: ConversionMethod;
  onEditCourse: (course: CourseRecord) => void;
  onDeleteCourse: (courseId: string) => void;
}

export const TranscriptTable: React.FC<TranscriptTableProps> = ({
  student,
  gradeSystemMode,
  conversionMethod,
  onEditCourse,
  onDeleteCourse,
}) => {
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const semesters = Array.from(new Set(student.records.map((r) => r.semester))).sort();
  const categories = Array.from(new Set(student.records.map((r) => r.category)));

  // Filter records
  const filtered = student.records.filter((r) => {
    if (selectedSemester !== 'all' && r.semester !== selectedSemester) return false;
    if (selectedCategory !== 'all' && r.category !== selectedCategory) return false;
    if (searchQuery.trim() && !r.subjectName.toLowerCase().includes(searchQuery.toLowerCase().trim())) {
      return false;
    }
    return true;
  });

  // Calculate stats for current filter view
  const totalUnits = filtered.reduce((acc, r) => acc + (r.units || 1), 0);
  const gradedCourses = filtered.filter((r) => r.rankGrade5 != null && r.rankGrade5 > 0);
  const avgGrade5 =
    gradedCourses.length > 0
      ? +(
          gradedCourses.reduce((acc, r) => acc + r.rankGrade5! * (r.units || 1), 0) /
          gradedCourses.reduce((acc, r) => acc + (r.units || 1), 0)
        ).toFixed(2)
      : 0;

  return (
    <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-xs p-5" id="transcript-table-section">
      {/* Table Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[var(--border)] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[var(--ink)] tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[var(--accent)]" />
              개인별 점수자료 일람표 [학생부]
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--surface-alt)] text-[var(--ink-secondary)] font-semibold">
              {student.school} {student.grade}학년 {student.classNum}반 {student.name}
            </span>
          </div>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            내신닷컴 UNIV 대입정보시스템 표준 학생부 점수자료 양식
          </p>
        </div>

        {/* View Statistics */}
        <div className="flex items-center gap-3 text-xs bg-[var(--surface-alt)] px-3 py-1.5 rounded-lg border border-[var(--border)] font-medium">
          <span>조회 과목수: <strong className="text-[var(--ink)]">{filtered.length}개</strong></span>
          <span>•</span>
          <span>이수 단위합: <strong className="text-[var(--ink)]">{totalUnits}단위</strong></span>
          <span>•</span>
          <span>
            선택 가중평균: <strong className="text-[var(--korean)]">{avgGrade5 > 0 ? `${avgGrade5}등급` : '-'}</strong>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Semester Selector */}
          <div className="flex items-center bg-[var(--surface-alt)] rounded-lg p-0.5 border border-[var(--border)]">
            <button
              type="button"
              onClick={() => setSelectedSemester('all')}
              className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                selectedSemester === 'all'
                  ? 'bg-[var(--surface)] text-[var(--ink)] shadow-2xs'
                  : 'text-[var(--ink-secondary)] hover:text-[var(--ink)]'
              }`}
            >
              전체 학기
            </button>
            {semesters.map((sem) => (
              <button
                key={sem}
                type="button"
                onClick={() => setSelectedSemester(sem)}
                className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                  selectedSemester === sem
                    ? 'bg-[var(--surface)] text-[var(--ink)] shadow-2xs'
                    : 'text-[var(--ink-secondary)] hover:text-[var(--ink)]'
                }`}
              >
                {sem}학기
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            id="transcript-category-filter"
            aria-label="교과목 필터"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[var(--surface-alt)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--ink)] font-medium outline-hidden"
          >
            <option value="all">전체 교과군</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 text-[var(--muted)] absolute left-3 top-2.5" />
          <input
            id="transcript-search-input"
            type="text"
            placeholder="과목명 검색 (예: 화학, 대수...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[var(--surface-alt)] border border-[var(--border)] rounded-lg text-xs text-[var(--ink)] placeholder-[var(--muted)] outline-hidden focus:border-[var(--border-strong)] focus:bg-[var(--surface)] transition-all"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto border border-[var(--border)] rounded-lg">
        <table className="w-full text-left text-xs whitespace-nowrap min-w-[950px]">
          <thead className="bg-[var(--surface-alt)] text-[var(--ink-secondary)] font-semibold border-b border-[var(--border)] whitespace-nowrap">
            <tr>
              <th className="py-2.5 px-3 whitespace-nowrap">학기</th>
              <th className="py-2.5 px-3 whitespace-nowrap">교과</th>
              <th className="py-2.5 px-3 whitespace-nowrap">과목명</th>
              <th className="py-2.5 px-2 whitespace-nowrap">구분</th>
              <th className="py-2.5 px-2 text-center whitespace-nowrap">단위수</th>
              <th className="py-2.5 px-2 text-center whitespace-nowrap">원점수</th>
              <th className="py-2.5 px-2 text-center whitespace-nowrap">과목평균</th>
              <th className="py-2.5 px-2 text-center whitespace-nowrap">성취도</th>
              <th className="py-2.5 px-2 text-center bg-[var(--korean)]/10 text-[var(--korean)] font-bold whitespace-nowrap">
                5등급 석차
              </th>
              {(gradeSystemMode === '9grade' || gradeSystemMode === 'both') && (
                <th className="py-2.5 px-2 text-center bg-[var(--accent-soft)] text-[var(--accent)] font-bold whitespace-nowrap">
                  9등급 환산
                </th>
              )}
              <th className="py-2.5 px-3 text-center whitespace-nowrap">수강자</th>
              <th className="py-2.5 px-3 whitespace-nowrap">성취비율 (A/B/C/D/E)</th>
              <th className="py-2.5 px-2 text-center whitespace-nowrap">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] font-medium text-[var(--ink)] whitespace-nowrap">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={13} className="py-8 text-center text-[var(--muted)] text-xs whitespace-nowrap">
                  조건에 맞는 과목 성적 데이터가 없습니다.
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const isGrade1 = r.rankGrade5 === 1;
                const converted9 = r.rankGrade5
                  ? convertGrade5ToGrade9(r.rankGrade5, conversionMethod).grade9Equivalent
                  : null;

                return (
                  <tr
                    key={r.id}
                    className={`hover:bg-[var(--surface-alt)]/90 transition-colors whitespace-nowrap ${
                      isGrade1 ? 'bg-[var(--accent-soft)]/15' : ''
                    }`}
                  >
                    <td className="py-2 px-3 text-[var(--ink-secondary)] font-semibold whitespace-nowrap">{r.semester}</td>
                    <td className="py-2 px-3 text-[var(--ink-secondary)] whitespace-nowrap">{r.category}</td>
                    <td className="py-2 px-3 font-bold text-[var(--ink)] flex items-center gap-1.5 whitespace-nowrap">
                      {r.subjectName}
                      {isGrade1 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" title="1등급 과목"></span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-[var(--muted)] text-[11px] whitespace-nowrap">{r.courseType}</td>
                    <td className="py-2 px-2 text-center font-semibold whitespace-nowrap">{r.units}</td>
                    <td className="py-2 px-2 text-center font-bold text-[var(--ink)] whitespace-nowrap">
                      {r.rawScore ?? '-'}
                    </td>
                    <td className="py-2 px-2 text-center text-[var(--muted)] whitespace-nowrap">
                      {r.subjectMean ?? '-'}
                    </td>
                    <td className="py-2 px-2 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded-md text-[11px] font-bold whitespace-nowrap ${
                          r.achievement === 'A'
                            ? 'bg-[var(--korean)]/15 text-[var(--korean)]'
                            : r.achievement === 'B'
                            ? 'bg-[var(--surface-alt)] text-[var(--ink)]'
                            : 'bg-[var(--surface-alt)] text-[var(--ink-secondary)]'
                        }`}
                      >
                        {r.achievement}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center bg-[var(--korean)]/30 font-extrabold text-[var(--korean)] whitespace-nowrap">
                      {r.rankGrade5 ? `${r.rankGrade5}등급` : '-'}
                    </td>
                    {(gradeSystemMode === '9grade' || gradeSystemMode === 'both') && (
                      <td className="py-2 px-2 text-center bg-[var(--accent-soft)]/30 font-bold text-[var(--accent)] whitespace-nowrap">
                        {converted9 ? `${converted9}등급` : '-'}
                      </td>
                    )}
                    <td className="py-2 px-3 text-center text-[var(--muted)] whitespace-nowrap">
                      {r.studentCount ? `${r.studentCount}명` : '-'}
                    </td>
                    <td className="py-2 px-3 text-[11px] text-[var(--muted)] font-mono whitespace-nowrap">
                      {r.achievementRatios
                        ? `${r.achievementRatios.A}% / ${r.achievementRatios.B}% / ${r.achievementRatios.C}% / ${r.achievementRatios.D}% / ${r.achievementRatios.E}%`
                        : '-'}
                    </td>
                    <td className="py-2 px-2 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEditCourse(r)}
                          className="p-1 hover:text-[var(--ink)] text-[var(--muted)] rounded-md transition-colors cursor-pointer"
                          title="과목 수정"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteCourse(r.id)}
                          className="p-1 hover:text-[var(--critical)] text-[var(--muted)] rounded-md transition-colors cursor-pointer"
                          title="과목 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
