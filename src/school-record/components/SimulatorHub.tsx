import React, { useState } from 'react';
import { StudentProfile, ConversionMethod } from '../types';
import { UniversityAdmissionSimulator } from './UniversityAdmissionSimulator';
import { TargetGradeSimulator } from './TargetGradeSimulator';
import { Building2, Target } from 'lucide-react';

interface SimulatorHubProps {
  student: StudentProfile;
  conversionMethod: ConversionMethod;
}

export const SimulatorHub: React.FC<SimulatorHubProps> = ({
  student,
  conversionMethod,
}) => {
  const [subTab, setSubTab] = useState<'admission' | 'target'>('admission');

  return (
    <div className="space-y-6">
      {/* Sub Navigation Segment Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--surface)] p-2 rounded-xl border border-[var(--border)] shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-[var(--surface-alt)] rounded-lg">
          <button
            onClick={() => setSubTab('admission')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              subTab === 'admission'
                ? 'bg-[var(--surface)] text-[var(--ink)] shadow-xs ring-1 ring-[var(--border-strong)]'
                : 'text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:bg-[var(--border)]/50'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-[var(--korean)]" />
            <span>수시 지원 가능 대학 예측</span>
          </button>
          <button
            onClick={() => setSubTab('target')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              subTab === 'target'
                ? 'bg-[var(--surface)] text-[var(--ink)] shadow-xs ring-1 ring-[var(--border-strong)]'
                : 'text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:bg-[var(--border)]/50'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-[var(--good)]" />
            <span>다음 학기 목표 등급 시뮬레이터</span>
          </button>
        </div>

        <div className="text-xs text-[var(--muted)] font-medium px-2">
          {subTab === 'admission'
            ? '학생의 5등급제 및 9등급 환산 내신을 기반으로 전국 주요 대학 수시 지원선을 예측합니다.'
            : '남은 학기 목표 등급을 설정하여 최종 내신 등급 변화를 시뮬레이션합니다.'}
        </div>
      </div>

      {/* Sub Tab Contents */}
      {subTab === 'admission' ? (
        <UniversityAdmissionSimulator
          student={student}
          conversionMethod={conversionMethod}
        />
      ) : (
        <TargetGradeSimulator
          student={student}
          conversionMethod={conversionMethod}
        />
      )}
    </div>
  );
};
