import { useState, useEffect } from 'react';
import { Student, ExamRecord, AIReportEntry } from './types';
import { INITIAL_STUDENTS, INITIAL_EXAMS, ROSTER, studentIdFor } from './data/mockData';
import { studentExams, compareStudentHakbeon } from './utils/analysis';
import { HeaderTopBar, StudentReportHeader } from './components/Header';
import { ExportControls } from './components/ExportControls';
import { SchoolRecordView } from './school-record/SchoolRecordView';
import { SchoolRecordPrintRoute } from './school-record/SchoolRecordPrintRoute';
import { OverviewCards } from './components/OverviewCards';
import { MinimumStandardSimulator } from './components/MinimumStandardSimulator';
import { TrendCharts } from './components/TrendCharts';
import { SubareaAnalysis } from './components/SubareaAnalysis';
import { WeakItemsGrid } from './components/WeakItemsGrid';
import { AIReportSection } from './components/AIReportSection';
import { SystemIntroGuide } from './components/SystemIntroGuide';
import { CohortStatisticsDashboard } from './components/CohortStatisticsDashboard';
import { AlertCircle } from 'lucide-react';

export default function App() {
  // Standalone full-page print/PDF route for the 내신(학생부) 상담 리포트, independent of
  // the mock-exam ?student=/?print= route below (opened via "새 창에서 인쇄" from that modal).
  {
    const params = new URLSearchParams(window.location.search);
    const schoolPrintStudentId = params.get('studentId');
    if (params.get('print') === 'true' && schoolPrintStudentId) {
      return <SchoolRecordPrintRoute studentId={schoolPrintStudentId} />;
    }
  }

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('future_talent_theme') as 'light' | 'dark') || 'light';
  });

  // Active view: 'intro' (소개 및 사용법) | 'report' (학생 성적표) | 'stats' (교사용 종합 통계 대시보드)
  const [currentView, setCurrentView] = useState<'intro' | 'report' | 'stats' | 'school'>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('student') || params.get('print') === 'true') {
        return 'report';
      }
      if (params.get('view') === 'stats') {
        return 'stats';
      }
      if (params.get('view') === 'school') {
        return 'school';
      }
    } catch {
      // ignore
    }
    return 'intro';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('future_talent_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Helper to enrich student with ROSTER grade/class/number
  const enrichStudent = (s: Student): Student => {
    const rosterItem = ROSTER.find((r) => r.name === s.name);
    return {
      ...s,
      grade: rosterItem ? rosterItem.grade : s.grade,
      class: rosterItem ? rosterItem.class : s.class,
      number: rosterItem ? rosterItem.number : s.number,
      track: (rosterItem ? rosterItem.track : s.track) || '자연',
    };
  };

  // Helper to sort students: 1. 성적표 있는 학생들 우선, 2. 학번 순 (학년 -> 반 -> 번호)
  const sortStudentList = (list: Student[], currentExams: ExamRecord[]): Student[] => {
    return [...list].sort((a, b) => {
      const hasA = currentExams.some((e) => e.studentName === a.name);
      const hasB = currentExams.some((e) => e.studentName === b.name);
      if (hasA !== hasB) return hasA ? -1 : 1;
      return compareStudentHakbeon(a, b);
    });
  };

  // Students state with LocalStorage persistence
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      localStorage.removeItem('future_talent_students_v24');
      localStorage.removeItem('future_talent_exams_v24');
      localStorage.removeItem('future_talent_students_v25');
      localStorage.removeItem('future_talent_exams_v25');
      localStorage.removeItem('future_talent_students_v26');
      localStorage.removeItem('future_talent_exams_v26');
      localStorage.removeItem('future_talent_students_v27');
      localStorage.removeItem('future_talent_exams_v27');
      localStorage.removeItem('future_talent_students_v28');
      localStorage.removeItem('future_talent_exams_v28');
      localStorage.removeItem('future_talent_students_v29');
      localStorage.removeItem('future_talent_exams_v29');
      localStorage.removeItem('future_talent_students_v30');
      localStorage.removeItem('future_talent_exams_v30');
      localStorage.removeItem('future_talent_students_v31');
      localStorage.removeItem('future_talent_exams_v31');
      localStorage.removeItem('future_talent_students_v32');
      localStorage.removeItem('future_talent_exams_v32');
      localStorage.removeItem('future_talent_students_v33');
      localStorage.removeItem('future_talent_exams_v33');
      const saved = localStorage.getItem('future_talent_students_v34');
      if (saved) {
        const parsed: Student[] = JSON.parse(saved);
        const names = new Set(parsed.map((s) => s.name));
        const missing = INITIAL_STUDENTS.filter((s) => !names.has(s.name));
        const combined = [...parsed, ...missing].map(enrichStudent);
        return sortStudentList(combined, INITIAL_EXAMS);
      }
      return sortStudentList(INITIAL_STUDENTS.map(enrichStudent), INITIAL_EXAMS);
    } catch {
      return sortStudentList(INITIAL_STUDENTS.map(enrichStudent), INITIAL_EXAMS);
    }
  });

  // Exams state with LocalStorage persistence & sync with INITIAL_EXAMS for verified official exams
  const [exams, setExams] = useState<ExamRecord[]>(() => {
    try {
      const initialMap = new Map(INITIAL_EXAMS.map((e) => [e.id, e]));
      const saved = localStorage.getItem('future_talent_exams_v34');
      if (saved) {
        const parsed: ExamRecord[] = JSON.parse(saved);
        // Core official exams remain updated with latest verified data; exclude deleted incorrect records
        const filtered = parsed.filter((e) => e.id !== '최보윤__2026-06-04');
        const merged = filtered.map((e) => {
          const init = initialMap.get(e.id);
          if (init) return init;
          return {
            ...e,
            label: (e.label || '').replace(/202[67]학년도/g, '2026년'),
          };
        });
        const mergedIds = new Set(merged.map((e) => e.id));
        const missing = INITIAL_EXAMS.filter((e) => !mergedIds.has(e.id));
        return [...merged, ...missing];
      }
      return INITIAL_EXAMS;
    } catch {
      return INITIAL_EXAMS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('future_talent_students_v34', JSON.stringify(students));
    } catch (e) {
      console.warn('Failed to save students to localStorage', e);
    }
  }, [students]);

  // Auto trigger print when opened with ?print=true parameter in a full new tab
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const studentParam = params.get('student');
    if (studentParam) {
      handleStudentChange(studentParam);
      setCurrentView('report');
    }
    if (params.get('print') === 'true') {
      setCurrentView('report');
      const timer = setTimeout(() => {
        try {
          window.print();
        } catch (e) {
          console.error('Auto print failed:', e);
        }
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('future_talent_exams_v34', JSON.stringify(exams));
    } catch (e) {
      console.warn('Failed to save exams to localStorage', e);
    }
  }, [exams]);

  // Current grade and selected student (by name)
  const [currentGrade, setCurrentGrade] = useState<string>('1');
  const [selectedStudentName, setSelectedStudentName] = useState<string>('우채원');

  const currentStudent =
    students.find((s) => s.name === selectedStudentName || s.id === selectedStudentName) ||
    students.find((s) => s.grade === currentGrade) ||
    students[0];

  // Selected exam ID
  const myExams = studentExams(exams, currentStudent.name);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(() => {
    return myExams.length > 0 ? myExams[myExams.length - 1].id : null;
  });

  // When student changes, update selected exam ID to latest available
  useEffect(() => {
    const list = studentExams(exams, currentStudent.name);
    if (list.length > 0) {
      setSelectedExamId(list[list.length - 1].id);
    } else {
      setSelectedExamId(null);
    }
  }, [currentStudent.name, exams]);

  const currentExam = myExams.find((e) => e.id === selectedExamId) || myExams[myExams.length - 1];

  // AI Consulting reports cached by studentName + examId with LocalStorage persistence
  const [aiReports, setAiReports] = useState<Record<string, AIReportEntry>>(() => {
    try {
      const saved = localStorage.getItem('future_talent_ai_reports_v26');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load AI reports from localStorage', e);
    }
    return {};
  });

  useEffect(() => {
    try {
      localStorage.setItem('future_talent_ai_reports_v26', JSON.stringify(aiReports));
    } catch (e) {
      console.warn('Failed to save AI reports to localStorage', e);
    }
  }, [aiReports]);

  const reportKey = `${currentStudent.name}__${currentExam?.id || 'none'}`;
  const currentAiReport = aiReports[reportKey];

  const handleUpdateReport = (report: AIReportEntry, targetKey?: string) => {
    const key = targetKey || reportKey;
    setAiReports((prev) => ({
      ...prev,
      [key]: report,
    }));
  };

  // Grade selection change
  // 1. 성적표 있는 학생 우선
  // 2. 학번 순 (반 -> 번호)
  const handleGradeChange = (newGrade: string) => {
    setCurrentGrade(newGrade);
    const rosterForGrade = ROSTER.filter((r) => r.grade === newGrade).sort((a, b) => {
      const hasA = exams.some((e) => e.studentName === a.name);
      const hasB = exams.some((e) => e.studentName === b.name);
      if (hasA !== hasB) return hasA ? -1 : 1;
      return compareStudentHakbeon(a, b);
    });
    if (rosterForGrade.length > 0) {
      handleStudentChange(rosterForGrade[0].name);
    }
  };

  // Student selection change
  const handleStudentChange = (studentName: string) => {
    const existing = students.find((s) => s.name === studentName || s.id === studentName);
    if (!existing) {
      const rosterEntry = ROSTER.find((r) => r.name === studentName);
      const newStudent: Student = {
        id: studentName,
        name: studentName,
        school: '숭신고등학교',
        grade: rosterEntry?.grade,
        class: rosterEntry?.class,
        number: rosterEntry?.number,
      };
      setStudents((prev) => [...prev, newStudent]);
    }
    setSelectedStudentName(studentName);
    const matched = ROSTER.find((r) => r.name === studentName);
    if (matched && matched.grade && matched.grade !== currentGrade) {
      setCurrentGrade(matched.grade);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] antialiased transition-colors duration-200">
      <div className="max-w-[1080px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Top Program Navigation Bar & Quick Action Controls (Excluded from export) */}
        <header className="mb-6 space-y-4 no-print" id="app-top-header">
          <HeaderTopBar
            currentGrade={currentGrade}
            onGradeChange={handleGradeChange}
            currentStudent={currentStudent}
            onStudentChange={(name) => {
              handleStudentChange(name);
              setCurrentView((prev) => (prev === 'intro' ? 'report' : prev));
            }}
            currentView={currentView}
            onSelectView={(v) => {
              setCurrentView(v);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            theme={theme}
            onToggleTheme={toggleTheme}
            exams={exams}
          />

          {/* Export & Save Toolbar (PDF & Image) - Visible only when viewing student report and has exams */}
          {currentView === 'report' && myExams.length > 0 && (
            <ExportControls
              page1Id="report-page-1"
              page2Id="report-page-2"
              page3Id="report-page-3"
              studentName={currentStudent.name}
              examLabel={currentExam?.label || ''}
              currentGrade={currentGrade}
              students={students}
              onSwitchStudent={handleStudentChange}
            />
          )}
        </header>

        <main className="space-y-12">
          {currentView === 'intro' ? (
            <SystemIntroGuide
              onSelectStudent={(studentName, grade) => {
                handleStudentChange(studentName);
                if (grade) setCurrentGrade(grade);
                setCurrentView('report');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              currentGrade={currentGrade}
              onGradeChange={handleGradeChange}
              exams={exams}
            />
          ) : currentView === 'stats' ? (
            <CohortStatisticsDashboard
              exams={exams}
              students={students}
              currentGrade={currentGrade}
              onGradeChange={handleGradeChange}
              onSelectStudent={(studentName, grade) => {
                handleStudentChange(studentName);
                if (grade) setCurrentGrade(grade);
                setCurrentView('report');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          ) : currentView === 'school' ? (
            <SchoolRecordView mockStudent={currentStudent} />
          ) : (
            <div className="space-y-12 animate-fade-in">
              {/* ========================================================================= */}
              {/* 📄 1페이지: 모의고사 회차별 성적 추이까지 (Report Page 1)                    */}
              {/* ========================================================================= */}
              <section
                id="report-page-1"
                className="space-y-4 sm:space-y-5 rounded-2xl transition-all overflow-hidden no-scrollbar w-full"
              >
                {/* 1P Header: Student Profile, Exam Selector, and Admission Target */}
                <StudentReportHeader
                  currentStudent={currentStudent}
                  currentExam={currentExam}
                  myExams={myExams}
                  onSelectExam={(id) => setSelectedExamId(id)}
                />

                {myExams.length === 0 ? (
                  <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 sm:p-12 text-center shadow-[var(--shadow)] space-y-3 my-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-serif-kr font-bold text-[var(--ink)]">
                      등록된 모의고사 성적이 없습니다
                    </h3>
                    <p className="text-sm text-[var(--muted)] max-w-md mx-auto">
                      {currentStudent.name} 학생의 모의고사 성적표 또는 학급별 성적일람표 데이터가 아직 등록되지 않았습니다.
                    </p>
                    <p className="text-xs text-[var(--muted)] pt-3 border-t border-[var(--border)] max-w-sm mx-auto">
                      ※ 공인 성적표가 등록되면 자동으로 회차별 성적 추이 및 세부 영역 분석표가 생성됩니다.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* 1. Overview Cards: Current Subject Scores & Delta */}
                    <OverviewCards currentExam={currentExam} exams={exams} />

                    {/* 2. University Admission Minimum Requirement Simulator (3합 7, 3합 8, 2합 5 등) */}
                    <MinimumStandardSimulator currentExam={currentExam} currentStudent={currentStudent} />

                    {/* 3. Trend Charts: Grade and Percentile over Exam Sessions (Ends Page 1) */}
                    <TrendCharts exams={exams} currentStudentId={currentStudent.id} student={currentStudent} />
                  </>
                )}

                {/* Page 1 Bottom Official Badge */}
                <div className="pt-4 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--muted)]">
                  <span className="font-medium text-[var(--ink-secondary)]">
                    숭신고등학교 미래인재반 모의고사 성적 심층 분석표
                  </span>
                  <span className="font-semibold text-[var(--ink-secondary)] bg-[var(--surface-alt)] px-2.5 py-1 rounded border border-[var(--border)]">
                    제1면 / 총 3면 (성적 개요 및 회차별 성적 추이)
                  </span>
                </div>
              </section>

              {myExams.length > 0 && (
                <>
                  {/* ========================================================================= */}
                  {/* 📄 2페이지: 오답(보충학습 필요) 문항 분석까지 (Report Page 2)                  */}
                  {/* ========================================================================= */}
                  <section
                    id="report-page-2"
                    className="space-y-6 sm:space-y-8 rounded-2xl transition-all pt-2 overflow-hidden no-scrollbar w-full"
                  >
                    {/* 2P Top Header Banner */}
                    <div className="p-5 sm:p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-[var(--shadow)] flex flex-nowrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center font-bold text-base shrink-0">
                          2P
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 whitespace-nowrap">
                            <span className="text-[11px] font-bold tracking-widest text-[var(--accent)] uppercase whitespace-nowrap">
                              MOCK EXAM PERFORMANCE REPORT · 숭신고 미래인재반
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/20 whitespace-nowrap shrink-0">
                              제2면
                            </span>
                          </div>
                          <h2 className="text-xl sm:text-2xl font-serif-kr font-bold text-[var(--ink)] whitespace-nowrap report-heading">
                            세부 영역별 득점률 및 오답 문항 분석
                          </h2>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[var(--ink-secondary)] bg-[var(--surface-alt)] px-4 py-2 rounded-xl border border-[var(--border)] font-medium whitespace-nowrap shrink-0">
                        <span>학생: <strong className="text-[var(--ink)]">{currentStudent.name}</strong></span>
                        <span>·</span>
                        <span>{currentStudent.grade}학년 {currentStudent.class ? `${currentStudent.class}반 ` : ''}{currentStudent.number ? `${currentStudent.number}번` : ''}</span>
                        <span>·</span>
                        <span className="text-[var(--accent)] font-semibold">{currentExam?.label || '모의고사'}</span>
                      </div>
                    </div>

                    {/* 3. Subarea Analysis: Student vs Cohort / National Average */}
                    <SubareaAnalysis currentExam={currentExam} exams={exams} />

                    {/* 4. Weak Items: Re-study Problem Numbers & Concept Mapping (Ends Page 2) */}
                    <WeakItemsGrid currentStudent={currentStudent} currentExam={currentExam} />

                    {/* Page 2 Bottom Official Badge */}
                    <div className="pt-4 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--muted)]">
                      <span className="font-medium text-[var(--ink-secondary)] whitespace-nowrap">
                        숭신고등학교 미래인재반 모의고사 성적 심층 분석표
                      </span>
                      <span className="font-semibold text-[var(--ink-secondary)] bg-[var(--surface-alt)] px-2.5 py-1 rounded border border-[var(--border)] whitespace-nowrap shrink-0">
                        제2면 / 총 3면 (세부 영역별 득점률 및 오답 문항 정밀 진단)
                      </span>
                    </div>
                  </section>

                  {/* ========================================================================= */}
                  {/* 📄 3페이지: 모의고사 분석 리포트 (Report Page 3)                                */}
                  {/* ========================================================================= */}
                  <section
                    id="report-page-3"
                    className="space-y-6 sm:space-y-8 rounded-2xl transition-all pt-2 overflow-visible w-full"
                  >
                    {/* 3P Top Header Banner */}
                    <div className="p-5 sm:p-6 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-nowrap items-center justify-between gap-4 text-slate-900">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base shrink-0">
                          3P
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 whitespace-nowrap">
                            <span className="text-[11px] font-bold tracking-widest text-blue-600 uppercase whitespace-nowrap">
                              MOCK EXAM PERFORMANCE REPORT · 숭신고 미래인재반
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200 whitespace-nowrap shrink-0">
                              제3면
                            </span>
                          </div>
                          <h2 className="text-xl sm:text-2xl font-serif-kr font-bold text-slate-900 whitespace-nowrap report-heading">
                            모의고사 분석 리포트 (영역별 맞춤 학업 전략)
                          </h2>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 font-medium whitespace-nowrap shrink-0">
                        <span>학생: <strong className="text-slate-900">{currentStudent.name}</strong></span>
                        <span>·</span>
                        <span>{currentStudent.grade}학년 {currentStudent.class ? `${currentStudent.class}반 ` : ''}{currentStudent.number ? `${currentStudent.number}번` : ''}</span>
                        <span>·</span>
                        <span className="text-blue-600 font-semibold">{currentExam?.label || '모의고사'}</span>
                      </div>
                    </div>

                    {/* 5. AI Consulting Report */}
                    <AIReportSection
                      currentStudent={currentStudent}
                      currentExam={currentExam}
                      exams={exams}
                      aiReport={currentAiReport}
                      onUpdateReport={handleUpdateReport}
                    />

                    {/* Page 3 Bottom Official Badge */}
                    <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                      <span className="font-medium text-slate-700">
                        숭신고등학교 미래인재반 모의고사 성적 심층 분석표
                      </span>
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-200 whitespace-nowrap shrink-0">
                        제3면 / 총 3면 (모의고사 심층 분석 및 영역별 맞춤 전략 리포트)
                      </span>
                    </div>
                  </section>
                </>
              )}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-[var(--border)] text-center text-xs text-[var(--muted)] space-y-1 no-print">
          <p className="font-medium text-[var(--ink-secondary)]">
            미래인재반 성적 분석 프로그램 · 숭신고등학교 진로진학상담부
          </p>
          <p>
            학생 및 회차 데이터는 미래인재반 전체 학업 성취도 분석 및 맞춤형 상담을 위해 안전하게 활용됩니다.
          </p>
        </footer>
      </div>
    </div>
  );
}
