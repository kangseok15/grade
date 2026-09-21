import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  Users, 
  BookOpen, 
  BarChart3, 
  TrendingUp, 
  Scale, 
  Layers, 
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';

import { 
  students, 
  schoolTargets, 
  gradeCutoffs, 
  sampleAnalysis, 
  weakAreas, 
  studyRecommendations, 
  subareaAnalysisData 
} from './data/mockData';

import { OverviewCards } from './components/OverviewCards';
import { TrendCharts } from './components/TrendCharts';
import { WeakItemsGrid } from './components/WeakItemsGrid';
import { SubareaAnalysis } from './components/SubareaAnalysis';
import { MinimumStandardSimulator } from './components/MinimumStandardSimulator';
import { AIReportSection } from './components/AIReportSection';
import { ExportControls } from './components/ExportControls';
import { AddExamSection } from './components/AddExamSection';
import { SystemIntroGuide } from './components/SystemIntroGuide';
import { CohortStatisticsDashboard } from './components/CohortStatisticsDashboard';
import { SchoolRecordView } from './school-record/SchoolRecordView';

import { Student, ExamRecord } from './types';

export function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<'guide' | 'report' | 'cohort' | 'school-record'>('report');
  const [activeTab, setActiveTab] = useState<'overview' | 'weakness' | 'minimum' | 'ai-report'>('overview');

  // Student & Grade Selection State
  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [allStudents, setAllStudents] = useState<Student[]>(students);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    const firstInGrade = students.find(s => s.grade === 1);
    return firstInGrade ? firstInGrade.id : students[0].id;
  });

  // Current Grade Students
  const gradeStudents = useMemo(() => {
    return allStudents.filter(s => s.grade === selectedGrade);
  }, [allStudents, selectedGrade]);

  // Current Selected Student
  const currentStudent = useMemo(() => {
    const found = allStudents.find(s => s.id === selectedStudentId);
    if (found) return found;
    return gradeStudents[0] || allStudents[0];
  }, [allStudents, selectedStudentId, gradeStudents]);

  // Handle Grade Change
  const handleGradeChange = (newGrade: number) => {
    setSelectedGrade(newGrade);
    const firstStudentInNewGrade = allStudents.find(s => s.grade === newGrade);
    if (firstStudentInNewGrade) {
      setSelectedStudentId(firstStudentInNewGrade.id);
    }
  };

  // Handle Student Change
  const handleStudentChange = (studentId: string) => {
    setSelectedStudentId(studentId);
  };

  // Add Exam Record Callback
  const handleAddExam = (newRecord: ExamRecord) => {
    setAllStudents(prevStudents => 
      prevStudents.map(student => {
        if (student.id === currentStudent.id) {
          return {
            ...student,
            exams: [...student.exams, newRecord]
          };
        }
        return student;
      })
    );
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans">
      {/* 
        ========================================================
        최상단 헤더 영역
        1. '모의고사' 제거 -> '성적 분석 시스템'
        2. 학년/반/번호 셀렉터에 shrink-0, whitespace-nowrap 적용
        ========================================================
      */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30 px-4 py-2.5 shadow-sm">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3">
          
          {/* 1. 좌측 로고 & 타이틀 ('모의고사' 문구 제거) */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg text-stone-900 tracking-tight whitespace-nowrap">
                성적 분석 시스템
              </span>
              <span className="text-xs text-stone-400 hidden xl:inline whitespace-nowrap">
                | 제작 : 숭신고 진로진학상담부
              </span>
            </div>
          </div>

          {/* 2. 중앙 메인 내비게이션 탭 */}
          <nav className="flex items-center gap-1.5 flex-nowrap whitespace-nowrap overflow-x-auto py-1">
            <button
              onClick={() => setCurrentView('guide')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                currentView === 'guide'
                  ? 'bg-red-700 text-white shadow-sm'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>소개 &amp; 사용법</span>
            </button>

            <button
              onClick={() => setCurrentView('report')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                currentView === 'report'
                  ? 'bg-red-700 text-white shadow-sm'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>학생 성적표</span>
            </button>

            <button
              onClick={() => setCurrentView('cohort')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                currentView === 'cohort'
                  ? 'bg-red-700 text-white shadow-sm'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>통계 분석표</span>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-1 py-0.2 rounded">
                교사용
              </span>
            </button>

            <button
              onClick={() => setCurrentView('school-record')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                currentView === 'school-record'
                  ? 'bg-red-700 text-white shadow-sm'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>내신 성적 분석</span>
            </button>
          </nav>

          {/* 3. 우측 학년 / 반 / 번호 셀렉터 (shrink-0, min-w-max 적용으로 잘림 완벽 방지) */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center bg-stone-100/90 hover:bg-stone-100 rounded-full px-3 py-1.5 border border-stone-200 text-xs sm:text-sm font-medium text-stone-800 shrink-0 whitespace-nowrap shadow-inner">
              {/* 학년 선택 드롭다운 */}
              <select
                value={selectedGrade}
                onChange={(e) => handleGradeChange(Number(e.target.value))}
                className="bg-transparent font-semibold cursor-pointer focus:outline-none pr-1"
              >
                <option value={1}>1학년</option>
                <option value={2}>2학년</option>
                <option value={3}>3학년</option>
              </select>

              <span className="text-stone-300 mx-1">|</span>

              {/* 반 / 번호 / 이름 드롭다운 */}
              <select
                value={selectedStudentId}
                onChange={(e) => handleStudentChange(e.target.value)}
                className="bg-transparent font-semibold cursor-pointer focus:outline-none max-w-[150px] truncate"
              >
                {gradeStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.classNum ? `${s.classNum}반 ${s.studentNum}번 ${s.name}` : s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

        </div>
      </header>

      {/* 메인 뷰 렌더링 영역 */}
      <main className="flex-1 pb-12">
        {currentView === 'guide' && <SystemIntroGuide />}

        {currentView === 'cohort' && (
          <CohortStatisticsDashboard 
            students={gradeStudents} 
            selectedGrade={selectedGrade} 
          />
        )}

        {currentView === 'school-record' && (
          <SchoolRecordView />
        )}

        {currentView === 'report' && (
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
            {/* 학생 요약 카드 및 엑스포트 컨트롤 */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-stone-900">
                    {currentStudent.name} 학생 성적 리포트
                  </h2>
                  <span className="text-xs bg-stone-100 text-stone-600 px-2.5 py-0.5 rounded-full border border-stone-200">
                    {currentStudent.grade}학년 {currentStudent.classNum ? `${currentStudent.classNum}반 ${currentStudent.studentNum}번` : ''}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  목표 학과: {currentStudent.targetMajor || '미설정'} | 최근 모의고사 기반 누적 진단
                </p>
              </div>

              {/* 내보내기 버튼 컴포넌트 */}
              <ExportControls currentStudent={currentStudent} />
            </div>

            {/* 개별 성적표 서브 탭 내비게이션 */}
            <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'overview'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                성적 추이 &amp; 종합 개요
              </button>

              <button
                onClick={() => setActiveTab('weakness')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'weakness'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                문항 &amp; 세부 영역 분석
              </button>

              <button
                onClick={() => setActiveTab('minimum')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'minimum'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                수능 최저학력기준 진단
              </button>

              <button
                onClick={() => setActiveTab('ai-report')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'ai-report'
                    ? 'bg-red-700 text-white shadow-sm'
                    : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI 종합 진학 코멘트
              </button>
            </div>

            {/* 서브 탭 콘텐츠 */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <OverviewCards student={currentStudent} />
                <TrendCharts student={currentStudent} />
                <AddExamSection student={currentStudent} onAddExam={handleAddExam} />
              </div>
            )}

            {activeTab === 'weakness' && (
              <div className="space-y-6">
                <WeakItemsGrid student={currentStudent} weakAreas={weakAreas} />
                <SubareaAnalysis data={subareaAnalysisData} />
              </div>
            )}

            {activeTab === 'minimum' && (
              <MinimumStandardSimulator student={currentStudent} schoolTargets={schoolTargets} />
            )}

            {activeTab === 'ai-report' && (
              <AIReportSection student={currentStudent} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
