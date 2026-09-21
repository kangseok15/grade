import React, { useState } from 'react';
import { StudentProfile, ConversionMethod } from '../types';
import { GradeTrendChart } from './GradeTrendChart';
import { SubjectCategoryAnalysis } from './SubjectCategoryAnalysis';
import { ConversionWorkbench } from './ConversionWorkbench';
import { BarChart3, ArrowRightLeft, TrendingUp } from 'lucide-react';

interface AnalysisHubProps {
  student: StudentProfile;
  allStudents?: StudentProfile[];
  gradeSystemMode: '5grade' | '9grade' | 'both';
  conversionMethod: ConversionMethod;
  setConversionMethod: (method: ConversionMethod) => void;
}

export const AnalysisHub: React.FC<AnalysisHubProps> = ({
  student,
  allStudents = [],
  gradeSystemMode,
  conversionMethod,
  setConversionMethod,
}) => {
  const [subTab, setSubTab] = useState<'trends' | 'conversion'>('trends');

  return (
    <div className="space-y-6">
      {/* Sub Navigation Segment Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--surface)] p-2 rounded-xl border border-[var(--border)] shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-[var(--surface-alt)] rounded-lg">
          <button
            onClick={() => setSubTab('trends')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              subTab === 'trends'
                ? 'bg-[var(--surface)] text-[var(--ink)] shadow-xs ring-1 ring-[var(--border-strong)]'
                : 'text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:bg-[var(--border)]/50'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-[var(--korean)]" />
            <span>학기별 성적 추이 & 교과군 분석</span>
          </button>
          <button
            onClick={() => setSubTab('conversion')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              subTab === 'conversion'
                ? 'bg-[var(--surface)] text-[var(--ink)] shadow-xs ring-1 ring-[var(--border-strong)]'
                : 'text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:bg-[var(--border)]/50'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>5등급 ↔ 9등급 변환 워크벤치</span>
          </button>
        </div>

        <div className="text-xs text-[var(--muted)] font-medium px-2">
          {subTab === 'trends'
            ? '학기별 내신 성취 변화와 6대 교과군별 학업 역량을 분석합니다.'
            : '시도교육청별 5등급제 ↔ 9등급제 환산 공식 및 누적비율을 비교합니다.'}
        </div>
      </div>

      {/* Sub Tab Contents */}
      {subTab === 'trends' ? (
        <div className="space-y-6">
          <GradeTrendChart
            student={student}
            gradeSystemMode={gradeSystemMode}
            conversionMethod={conversionMethod}
          />

          <SubjectCategoryAnalysis
            student={student}
            allStudents={allStudents}
            gradeSystemMode={gradeSystemMode}
            conversionMethod={conversionMethod}
          />
        </div>
      ) : (
        <ConversionWorkbench
          student={student}
          conversionMethod={conversionMethod}
          setConversionMethod={setConversionMethod}
        />
      )}
    </div>
  );
};
