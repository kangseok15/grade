import React from 'react';
import { GitCompare, Printer, PlusCircle, FileText, BarChart3, Target, BookOpen } from 'lucide-react';

export type SchoolRecordTab = 'report' | 'analysis' | 'simulator' | 'transcript';

interface SchoolRecordNavProps {
  activeTab: SchoolRecordTab;
  onSelectTab: (tab: SchoolRecordTab) => void;
  gradeSystemMode: '5grade' | '9grade' | 'both';
  onGradeSystemModeChange: (mode: '5grade' | '9grade' | 'both') => void;
  onOpenCompare: () => void;
  onOpenAddCourse: () => void;
  onOpenReport: () => void;
}

const TAB_META: { key: SchoolRecordTab; label: string; icon: React.ReactNode }[] = [
  { key: 'report', label: '진학 상담 리포트', icon: <FileText className="w-3.5 h-3.5" /> },
  { key: 'analysis', label: '성적 분석 & 등급 변환', icon: <BarChart3 className="w-3.5 h-3.5" /> },
  { key: 'simulator', label: '수시 예측 & 목표 시뮬레이터', icon: <Target className="w-3.5 h-3.5" /> },
  { key: 'transcript', label: '학생부 성적 일람표', icon: <BookOpen className="w-3.5 h-3.5" /> },
];

export const SchoolRecordNav: React.FC<SchoolRecordNavProps> = ({
  activeTab,
  onSelectTab,
  gradeSystemMode,
  onGradeSystemModeChange,
  onOpenCompare,
  onOpenAddCourse,
  onOpenReport,
}) => {
  return (
    <div className="no-print bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-[var(--shadow)] p-3 sm:p-4 space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <nav className="flex flex-wrap gap-1" aria-label="내신 분석 탭">
          {TAB_META.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => onSelectTab(t.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === t.key
                  ? 'bg-[var(--accent)] text-white shadow-xs'
                  : 'text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:bg-[var(--surface-alt)]'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            type="button"
            onClick={onOpenAddCourse}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--ink-secondary)] bg-[var(--surface-alt)] hover:bg-[var(--border)] border border-[var(--border)] rounded-lg transition-colors cursor-pointer"
            title="과목 성적 추가"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>과목 성적 추가</span>
          </button>
          <button
            type="button"
            onClick={onOpenCompare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--ink-secondary)] bg-[var(--surface-alt)] hover:bg-[var(--border)] border border-[var(--border)] rounded-lg transition-colors cursor-pointer"
            title="다른 학생과 성적 비교"
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>학생 비교</span>
          </button>
          <button
            type="button"
            onClick={onOpenReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[var(--accent)] hover:opacity-90 rounded-lg transition-all shadow-xs cursor-pointer"
            title="A4 진학 상담 리포트 인쇄 / PDF 저장"
          >
            <Printer className="w-4 h-4" />
            <span>상담 리포트 (A4)</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-end">
        <div className="flex items-center bg-[var(--surface-alt)] p-0.5 rounded-lg border border-[var(--border)] text-xs font-medium">
          <span className="px-2 text-[var(--muted)] text-[11px] hidden md:inline">표시 기준:</span>
          {(['5grade', '9grade', 'both'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onGradeSystemModeChange(mode)}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                gradeSystemMode === mode
                  ? 'bg-[var(--surface)] text-[var(--ink)] font-bold shadow-2xs'
                  : 'text-[var(--ink-secondary)] hover:text-[var(--ink)]'
              }`}
            >
              {mode === '5grade' ? '5등급제' : mode === '9grade' ? '9등급 환산' : '동시 비교'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
