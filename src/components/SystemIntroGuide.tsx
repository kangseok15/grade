import React, { useState, useMemo } from 'react';
import { ROSTER } from '../data/mockData';
import { ExamRecord } from '../types';
import { compareStudentHakbeon } from '../utils/analysis';
import {
  GraduationCap,
  FileText,
  BarChart3,
  Sparkles,
  ShieldCheck,
  Layers,
  ChevronRight,
  CheckCircle2,
  Users,
  Search,
  BookOpen,
} from 'lucide-react';

interface SystemIntroGuideProps {
  onSelectStudent: (studentName: string, grade: string) => void;
  currentGrade: string;
  onGradeChange: (grade: string) => void;
  exams?: ExamRecord[];
}

export const SystemIntroGuide: React.FC<SystemIntroGuideProps> = ({
  onSelectStudent,
  currentGrade,
  onGradeChange,
  exams,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState<string>(currentGrade || '1');

  // Filter roster by grade and search query, sorted by:
  // 1. 성적표 있는 학생들 우선
  // 2. 학번 순 (학년 -> 반 -> 번호)
  const filteredRoster = useMemo(() => {
    return ROSTER.filter((item) => {
      const matchGrade = filterGrade === 'all' || item.grade === filterGrade;
      const matchQuery =
        !searchQuery.trim() ||
        item.name.includes(searchQuery.trim()) ||
        `${item.grade}학년`.includes(searchQuery.trim()) ||
        `${item.class}반`.includes(searchQuery.trim());
      return matchGrade && matchQuery;
    }).sort((a, b) => {
      if (exams && exams.length > 0) {
        const hasA = exams.some((e) => e.studentName === a.name);
        const hasB = exams.some((e) => e.studentName === b.name);
        if (hasA !== hasB) return hasA ? -1 : 1;
      }
      return compareStudentHakbeon(a, b);
    });
  }, [filterGrade, searchQuery, exams]);

  return (
    <div className="space-y-10 animate-fade-in">
      {/* 1. Hero Introduction Card */}
      <section className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 lg:p-10 shadow-[var(--shadow)] relative overflow-hidden">
        <div className="w-full space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-bold border border-[var(--accent)]/20">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>숭신고등학교 진로진학상담부 제작</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif-kr font-bold text-[var(--ink)] tracking-tight leading-tight">
            숭신고등학교 미래인재반<br className="hidden sm:inline" />
            <span className="text-[var(--accent)]"> 모의고사·내신 성적 통합 분석 시스템</span>
          </h1>

          <p className="text-sm sm:text-base text-[var(--ink-secondary)] leading-relaxed break-keep">
            <span className="block">
              본 시스템은 숭신고등학교 미래인재반 학생들의 전국연합학력평가·수능 모의평가 성적과 내신(학생부) 성적 데이터를 누적 집계·분석하여,
            </span>
            <span className="block">
              영역별 성적 추이 진단, 취약 문항 정밀 추적, 내신 5등급제·9등급제 환산, 그리고 1:1 맞춤형 대입 전략 수립을 하나의 학생 선택 화면에서 돕기 위해 개발된 공식 성적 관리 프로그램입니다.
            </span>
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--muted)]">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              공인 성적통지표 100% 실데이터 연동
            </span>
            <span className="inline-block w-1 h-1 rounded-full bg-[var(--border-strong)]" />
            <span className="inline-flex items-center gap-1">
              <Layers className="w-4 h-4 text-[var(--accent)]" />
              3페이지 완성형 A4 심층 리포트
            </span>
            <span className="inline-block w-1 h-1 rounded-full bg-[var(--border-strong)]" />
            <span className="inline-flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-amber-500" />
              '미래인재반 담당 선생님의 모의고사 심층 분석 리포트' 제공
            </span>
            <span className="inline-block w-1 h-1 rounded-full bg-[var(--border-strong)]" />
            <span className="inline-flex items-center gap-1">
              <GraduationCap className="w-4 h-4 text-[var(--accent)]" />
              상단 '내신 성적 분석' 탭에서 학생부(내신) 진학상담 리포트 통합 제공
            </span>
          </div>
        </div>
      </section>

      {/* 2. System Core Features (3-Page Report Structure) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-serif-kr font-bold text-[var(--ink)]">
              성적 분석표 구성 및 특징
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-0.5">
              학생 개인별로 3면에 걸쳐 모의고사 성적을 다각도로 심층 진단합니다.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {/* Page 1 Feature Card */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/20">
                  제1면
                </span>
                <BarChart3 className="w-5 h-5 text-[var(--accent)]" />
              </div>
              <h3 className="text-base font-bold text-[var(--ink)] mb-2">
                성적 개요 & 회차별 추이
              </h3>
              <ul className="text-xs text-[var(--ink-secondary)] space-y-2 leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent)] shrink-0 mt-0.5" />
                  <span><strong>국·수·영·탐 종합 개요</strong>: 원점수, 표준점수, 백분위, 등급 및 직전 시험 대비 득점 변동 표시</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent)] shrink-0 mt-0.5" />
                  <span><strong>다회차 성적 추이 차트</strong>: 응시한 모의고사 전 회차의 등급 및 백분위 변화를 직관적인 선 그래프로 시각화</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent)] shrink-0 mt-0.5" />
                  <span><strong>수시 납치 방지 정시 지원선</strong>: 주요 과목 백분위 합 기반 목표 대학 군별 가이드 제시</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent)] shrink-0 mt-0.5" />
                  <span><strong>대학별 수능 최저학력기준 시뮬레이터</strong>: 3합 7(탐구2), 3합 7(탐구1), 3합 8(탐구1), 2합 5(탐구1) 4대 기준 판정 및 가상 등급 시뮬레이션</span>
                </li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--border)] text-[11px] text-[var(--muted)]">
              성적 흐름 및 수능 최저학력기준 진단
            </div>
          </div>

          {/* Page 2 Feature Card */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  제2면
                </span>
                <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-base font-bold text-[var(--ink)] mb-2">
                세부영역 & 오답 정밀 분석
              </h3>
              <ul className="text-xs text-[var(--ink-secondary)] space-y-2 leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>세부 하위영역별 득점률</strong>: 국어(어휘·이해·추론), 수학(계산·이해·추론·해결), 영어(듣기·읽기) 등 배점 대비 성취율 비교</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>2회 연속 오답 문항 추적</strong>: 직전 시험과 이번 시험에서 동일 유형이나 연속으로 틀린 취약 문항 정밀 식별</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>정답률 등급별 취약점 분류</strong>: A·B·C·D·E 난이도별 정답률 기준 문항 분석으로 실전 대비력 강화</span>
                </li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--border)] text-[11px] text-[var(--muted)]">
              취약점 도출 및 개념 보완 포인트
            </div>
          </div>

          {/* Page 3 Feature Card */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                  제3면
                </span>
                <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-base font-bold text-[var(--ink)] mb-2">
                모의고사 심층 분석 리포트 (맞춤 전략)
              </h3>
              <ul className="text-xs text-[var(--ink-secondary)] space-y-2 leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <span><strong>과목별 정밀 종합 진단</strong>: 이전 회차 대비 성적 변화와 세부영역 득점률을 바탕으로 과목별 강점·약점 분석</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <span><strong>맞춤형 실천 행동 요령</strong>: 연속 오답 및 취약 영역을 극복하기 위한 일일·주간 구체적 학습 로드맵 제시</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <span><strong>자동 생성 & 영구 보존</strong>: 학생 선택 시 자동 진단되며, 언제 열어도 일관된 리포트 유지</span>
                </li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--border)] text-[11px] text-[var(--muted)]">
              맞춤 피드백 & 1:1 진학 상담 자료
            </div>
          </div>
        </div>
      </section>

      {/* 3. Step-by-Step User Guide */}
      <section className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 shadow-[var(--shadow)]">
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] tracking-wider uppercase mb-1">
            <BookOpen className="w-4 h-4" />
            <span>HOW TO USE</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif-kr font-bold text-[var(--ink)]">
            시스템 사용 방법 안내
          </h2>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
            간단한 4단계 조작으로 학생의 심층 성적표를 조회하고 완성형 PDF로 저장할 수 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Step 1 */}
          <div className="bg-[var(--surface-alt)] p-4 sm:p-5 rounded-xl border border-[var(--border)] flex flex-col justify-between">
            <div>
              <div className="w-7 h-7 rounded-lg bg-[var(--accent)] text-white font-bold text-xs flex items-center justify-center mb-3">
                01
              </div>
              <h3 className="text-sm font-bold text-[var(--ink)] mb-1.5">
                학년 및 학생 선택
              </h3>
              <p className="text-xs text-[var(--ink-secondary)] leading-relaxed">
                상단 헤더의 드롭다운(1·2·3학년)에서 학생을 고르거나, 아래 학생 명단 카드에서 이름을 바로 클릭합니다.
              </p>
            </div>
            <div className="mt-3 text-[11px] text-[var(--muted)]">
              총 45명 미래인재반 등록
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-[var(--surface-alt)] p-4 sm:p-5 rounded-xl border border-[var(--border)] flex flex-col justify-between">
            <div>
              <div className="w-7 h-7 rounded-lg bg-[var(--accent)] text-white font-bold text-xs flex items-center justify-center mb-3">
                02
              </div>
              <h3 className="text-sm font-bold text-[var(--ink)] mb-1.5">
                모의고사 회차 선택
              </h3>
              <p className="text-xs text-[var(--ink-secondary)] leading-relaxed">
                성적표 상단의 <strong>[응시 회차]</strong> 버튼(예: 3월, 6월, 9월 등)을 눌러 원하는 시험 시점을 선택합니다.
              </p>
            </div>
            <div className="mt-3 text-[11px] text-[var(--muted)]">
              회차별 성적 즉시 반영
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-[var(--surface-alt)] p-4 sm:p-5 rounded-xl border border-[var(--border)] flex flex-col justify-between">
            <div>
              <div className="w-7 h-7 rounded-lg bg-[var(--accent)] text-white font-bold text-xs flex items-center justify-center mb-3">
                03
              </div>
              <h3 className="text-sm font-bold text-[var(--ink)] mb-1.5">
                1·2·3면 심층 분석 열람
              </h3>
              <p className="text-xs text-[var(--ink-secondary)] leading-relaxed">
                스크롤을 내려 성적 개요와 추이(1면), 세부영역 및 오답(2면), AI 종합 분석 리포트(3면)를 확인합니다.
              </p>
            </div>
            <div className="mt-3 text-[11px] text-[var(--muted)]">
              리포트 자동 생성 & 저장
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-[var(--surface-alt)] p-4 sm:p-5 rounded-xl border border-[var(--border)] flex flex-col justify-between">
            <div>
              <div className="w-7 h-7 rounded-lg bg-[var(--accent)] text-white font-bold text-xs flex items-center justify-center mb-3">
                04
              </div>
              <h3 className="text-sm font-bold text-[var(--ink)] mb-1.5">
                개별 및 학년 일괄 PDF 저장
              </h3>
              <p className="text-xs text-[var(--ink-secondary)] leading-relaxed">
                상단 <strong>[PDF로 저장]</strong>(3쪽) 또는 <strong>[학년 일괄 PDF]</strong>(15명 전원 45쪽)를 클릭하여 인쇄용 완성형 PDF를 다운로드할 수 있습니다.
              </p>
            </div>
            <div className="mt-3 text-[11px] text-[var(--muted)]">
              45쪽 일괄 통합 패키지 지원
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive Student Roster Directory (Quick Access) */}
      <section className="space-y-4" id="roster-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-serif-kr font-bold text-[var(--ink)] flex items-center gap-2">
              <Users className="w-5 h-5 text-[var(--accent)]" />
              <span>미래인재반 학생 명단 (빠른 성적표 열람)</span>
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-0.5">
              원하는 학생 카드를 클릭하면 즉시 해당 학생의 3페이지 모의고사 성적 분석표로 이동합니다.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="학생 이름 또는 반 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-[var(--surface)] border border-[var(--border-strong)] text-[var(--ink)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
        </div>

        {/* Grade Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2 overflow-x-auto no-scrollbar">
          {[
            { id: '1', label: '1학년 (15명)' },
            { id: '2', label: '2학년 (15명)' },
            { id: '3', label: '3학년 (15명)' },
            { id: 'all', label: '전체 (45명)' },
          ].map((tab) => {
            const isSelected = filterGrade === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setFilterGrade(tab.id);
                  if (tab.id !== 'all') onGradeChange(tab.id);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--accent)] text-white shadow-xs'
                    : 'bg-[var(--surface)] text-[var(--ink-secondary)] hover:bg-[var(--surface-alt)] border border-[var(--border)]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Student Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredRoster.map((student) => {
            return (
              <button
                key={`${student.grade}-${student.name}`}
                type="button"
                onClick={() => onSelectStudent(student.name, student.grade || '1')}
                className="relative overflow-hidden text-left p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] hover:shadow-md group cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-bold text-[var(--muted)] bg-[var(--surface-alt)] px-1.5 py-0.5 rounded">
                      {student.grade}학년 {student.class ? `${student.class}반 ` : ''}{student.number ? `${student.number}번` : ''}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        student.track === '자연'
                          ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300'
                          : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {student.track}
                    </span>
                  </div>

                  <div className="font-bold text-sm text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors flex items-center justify-between">
                    <span>{student.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--muted)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[var(--border)] text-[10px] text-[var(--muted)] group-hover:text-[var(--ink-secondary)] flex items-center justify-between">
                  <span>성적 분석표</span>
                  {exams && exams.some((e) => e.studentName === student.name) ? (
                    <span className="font-semibold text-[var(--accent)]">열람 →</span>
                  ) : (
                    <span className="font-normal text-[var(--muted)]">성적 미등록</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {filteredRoster.length === 0 && (
          <div className="text-center py-10 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-xs text-[var(--muted)]">
            검색 결과와 일치하는 미래인재반 학생이 없습니다.
          </div>
        )}
      </section>
    </div>
  );
};
