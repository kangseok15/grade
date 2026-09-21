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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2 rounded-xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-lg">
          <button
            onClick={() => setSubTab('admission')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              subTab === 'admission'
                ? 'bg-white text-stone-900 shadow-xs ring-1 ring-stone-300'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>수시 지원 가능 대학 예측</span>
          </button>
          <button
            onClick={() => setSubTab('target')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              subTab === 'target'
                ? 'bg-white text-stone-900 shadow-xs ring-1 ring-stone-300'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-emerald-600" />
            <span>다음 학기 목표 등급 시뮬레이터</span>
          </button>
        </div>

        <div className="text-xs text-stone-500 font-medium px-2">
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
