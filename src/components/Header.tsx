import React, { useMemo } from 'react';
import { Student, ExamRecord } from '../types';
import { ROSTER, studentIdFor } from '../data/mockData';
import { fmt1, studentExams, formatShortExamSession, compareStudentHakbeon } from '../utils/analysis';
import { Sun, Moon, GraduationCap, Award, BookOpen, BarChart3, Users, FileSpreadsheet } from 'lucide-react';
import { AdmissionPredictionCard } from './AdmissionPredictionCard';

export interface HeaderProps {
  currentGrade: string;
  onGradeChange: (grade: string) => void;
  currentStudent: Student;
  onStudentChange: (studentId: string) => void;
  currentView?: 'intro' | 'report' | 'stats' | 'school';
  onSelectView?: (view: 'intro' | 'report' | 'stats' | 'school') => void;
  exams: ExamRecord[];
  selectedExamId: string | null;
  onSelectExam: (examId: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export interface HeaderTopBarProps {
  currentGrade: string;
  onGradeChange: (grade: string) => void;
  currentStudent: Student;
  onStudentChange: (studentId: string) => void;
  currentView: 'intro' | 'report' | 'stats' | 'school';
  onSelectView: (view: 'intro' | 'report' | 'stats' | 'school') => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  exams?: ExamRecord[];
}

export const HeaderTopBar: React.FC<HeaderTopBarProps> = ({
  currentGrade,
  onGradeChange,
  currentStudent,
  onStudentChange,
  currentView,
  onSelectView,
  theme,
  onToggleTheme,
  exams,
}) => {
  // Roster entries for the current grade, sorted by:
  // 1. 성적표 등록 학생 우선
  // 2. 학번 순 (반 -> 번호)
  const gradeRoster = useMemo(() => {
    return ROSTER.filter((r) => r.grade === currentGrade).sort((a, b) => {
      const hasA = exams ? exams.some((e) => e.studentName === a.name) : true;
      const hasB = exams ? exams.some((e) => e.studentName === b.name) : true;
      if (hasA !== hasB) return hasA ? -1 : 1;

      return compareStudentHakbeon(a, b);
    });
  }, [currentGrade, exams]);

  return (
    <div className="no-print no-export flex items-center justify-between gap-3 pt-5 pb-3 border-b border-[var(--border)] overflow-x-auto no-scrollbar">
      {/* Left: School Logo & System Title (Clickable to return to Introduction) */}
      <button
        type="button"
        onClick={() => onSelectView('intro')}
        className="flex items-center gap-2.5 text-left group cursor-pointer shrink-0"
        title="시스템 소개 및 사용 방법 화면으로 이동"
      >
        <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
          <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="flex items-baseline gap-1.5 sm:gap-2">
          <h2 className="text-xs sm:text-sm font-bold text-[var(--ink)] whitespace-nowrap">
            모의고사 성적 분석 시스템
          </h2>
          <span className="text-[11px] sm:text-xs text-[var(--muted)] font-medium whitespace-nowrap">
            | 제작 : 숭신고 진로진학상담부
          </span>
        </div>
      </button>

      {/* Right: View Switch Tabs + Student Picker + Dark Mode (같은 칸에 한 줄로 정렬) */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Navigation Tabs */}
        <div className="flex items-center bg-[var(--surface-alt)] p-1 rounded-xl border border-[var(--border-strong)] gap-1">
          <button
            type="button"
            onClick={() => onSelectView('intro')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentView === 'intro'
                ? 'bg-[var(--accent)] text-white shadow-xs'
                : 'text-[var(--ink-secondary)] hover:text-[var(--ink)]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>소개 & 사용법</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectView('report')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentView === 'report'
                ? 'bg-[var(--accent)] text-white shadow-xs'
                : 'text-[var(--ink-secondary)] hover:text-[var(--ink)]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>학생 성적표</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectView('stats')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentView === 'stats'
                ? 'bg-[var(--accent)] text-white shadow-xs'
                : 'text-[var(--ink-secondary)] hover:text-[var(--ink)]'
            }`}
            title="미래인재반 통계 분석표"
          >
            <Users className="w-3.5 h-3.5" />
            <span>통계 분석표</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold">
              교사용
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelectView('school')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentView === 'school'
                ? 'bg-[var(--accent)] text-white shadow-xs'
                : 'text-[var(--ink-secondary)] hover:text-[var(--ink)]'
            }`}
            title="학생부(내신) 성적 분석"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>내신 성적 분석</span>
          </button>
        </div>

        {/* Student Quick Select Dropdown */}
        <div className="flex items-center gap-1.5 bg-[var(--surface-alt)] p-1 rounded-full border border-[var(--border-strong)]">
          <select
            id="gradeSelect"
            aria-label="학년 선택"
            value={currentGrade}
            onChange={(e) => onGradeChange(e.target.value)}
            className="bg-transparent text-[var(--ink)] text-xs font-semibold px-2.5 py-1 rounded-full cursor-pointer focus:outline-none"
          >
            <option value="1">1학년</option>
            <option value="2">2학년</option>
            <option value="3">3학년</option>
          </select>

          <div className="w-px h-3.5 bg-[var(--border-strong)]" />

          <select
            id="studentPickSelect"
            aria-label="학생 선택"
            value={currentStudent.name}
            onChange={(e) => {
              onStudentChange(e.target.value);
              // Stay on the current tab (report/stats/school) when just switching students;
              // only jump out of the intro screen since it has no student context of its own.
              if (currentView === 'intro') {
                onSelectView('report');
              }
            }}
            className="bg-transparent text-[var(--ink)] text-xs font-semibold px-2.5 py-1 rounded-full cursor-pointer focus:outline-none"
          >
            {gradeRoster.map((r) => {
              const hasExam = exams ? exams.some((e) => e.studentName === r.name) : true;
              return (
                <option key={r.name} value={r.name}>
                  {r.class ? `${r.class}반 ${r.number ? `${r.number}번 ` : ''}${r.name}` : r.name}
                  {!hasExam ? ' (성적 미등록)' : ''}
                </option>
              );
            })}
          </select>
        </div>

        <button
          type="button"
          onClick={onToggleTheme}
          title={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
          className="p-2 rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:border-[var(--border-strong)] transition-colors cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

export interface StudentReportHeaderProps {
  currentStudent: Student;
  currentExam: ExamRecord | undefined;
  myExams: ExamRecord[];
  onSelectExam: (examId: string) => void;
}

export const StudentReportHeader: React.FC<StudentReportHeaderProps> = ({
  currentStudent,
  currentExam,
  myExams,
  onSelectExam,
}) => {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-[var(--shadow)] overflow-hidden">
      <div className="p-6 md:p-8 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        {/* Left: Student Identity & Exam Selection */}
        <div className="space-y-4 flex-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold tracking-widest text-[var(--accent)] uppercase whitespace-nowrap">
                MOCK EXAM PERFORMANCE REPORT · 숭신고 미래인재반
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/20 whitespace-nowrap shrink-0">
                제1면
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif-kr font-bold text-[var(--ink)] tracking-tight">
              {currentStudent.name} 학생 성적 분석표
            </h1>
          </div>

          {/* Student Meta Details: 1 Clean Line without wrapping (1학년 2반 10번  성명 우채원  계열 : 인문계열) */}
          <div className="flex items-center flex-nowrap gap-x-4 sm:gap-x-5 text-sm md:text-base text-[var(--ink-secondary)] whitespace-nowrap overflow-x-auto no-scrollbar">
            {(currentStudent.grade || currentStudent.class || currentStudent.number) && (
              <span className="text-[var(--ink)] font-bold whitespace-nowrap">
                {[
                  currentStudent.grade ? `${currentStudent.grade}학년` : '',
                  currentStudent.class ? `${currentStudent.class}반` : '',
                  currentStudent.number ? `${currentStudent.number}번` : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              </span>
            )}
            <div className="whitespace-nowrap">
              성명 <b className="text-[var(--ink)] font-bold ml-1">{currentStudent.name}</b>
            </div>
            <div className="whitespace-nowrap">
              계열 :{' '}
              <b className="text-[var(--accent)] font-bold ml-1">
                {currentStudent.track ? `${currentStudent.track}계열` : '자연계열'}
              </b>
            </div>
          </div>

          {/* Exam Round Selection Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs sm:text-[13px] font-semibold text-[var(--muted)] mr-1 whitespace-nowrap">응시 회차:</span>
            {myExams.length === 0 ? (
              <span className="text-xs sm:text-[13px] text-[var(--muted)] whitespace-nowrap">등록된 성적표가 없습니다.</span>
            ) : (
              myExams.map((e) => {
                const isSelected = e.id === (currentExam && currentExam.id);
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => onSelectExam(e.id)}
                    title={e.label}
                    className={`px-4 py-1.5 rounded-full text-xs sm:text-[13px] font-semibold tracking-tight transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'bg-[var(--ink)] text-[var(--paper)] shadow-xs font-bold'
                        : 'bg-[var(--surface-alt)] text-[var(--ink-secondary)] hover:border-[var(--border-strong)] border border-[var(--border)]'
                    }`}
                  >
                    {formatShortExamSession(e)}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: 수시 납치 대비 정시 지원선 카드 */}
        <div className="xl:max-w-lg w-full shrink-0">
          <AdmissionPredictionCard
            currentStudent={currentStudent}
            latestExam={currentExam}
          />
        </div>
      </div>
    </div>
  );
};

export const Header: React.FC<HeaderProps> = ({
  currentGrade,
  onGradeChange,
  currentStudent,
  onStudentChange,
  currentView = 'report',
  onSelectView = () => {},
  exams,
  selectedExamId,
  onSelectExam,
  theme,
  onToggleTheme,
}) => {
  const myExams = studentExams(exams, currentStudent.id);
  const currentExam = myExams.find((e) => e.id === selectedExamId) || myExams[myExams.length - 1];

  return (
    <header className="mb-8" id="report-header">
      <HeaderTopBar
        currentGrade={currentGrade}
        onGradeChange={onGradeChange}
        currentStudent={currentStudent}
        onStudentChange={onStudentChange}
        currentView={currentView}
        onSelectView={onSelectView}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />
      <div className="mt-4">
        <StudentReportHeader
          currentStudent={currentStudent}
          currentExam={currentExam}
          myExams={myExams}
          onSelectExam={onSelectExam}
        />
      </div>
    </header>
  );
};
