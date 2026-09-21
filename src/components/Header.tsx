import React from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  Users, 
  ChevronDown, 
  BookOpen, 
  TrendingUp, 
  Scale, 
  Layers 
} from 'lucide-react';
import { Student } from '../types';

interface HeaderProps {
  currentStudent: Student;
  allStudents: Student[];
  onSelectStudent: (student: Student) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedGrade: number;
  setSelectedGrade: (grade: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStudent,
  allStudents,
  onSelectStudent,
  activeTab,
  setActiveTab,
  selectedGrade,
  setSelectedGrade,
}) => {
  // 학년별 학생 목록 필터링
  const gradeStudents = allStudents.filter(s => s.grade === selectedGrade);

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* 좌측: 로고 및 타이틀 ('모의고사' 제거 & 축소 방지) */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-red-700 flex items-center justify-center text-white shadow-sm shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-stone-900 tracking-tight whitespace-nowrap">
                성적 분석 시스템
              </h1>
              <p className="text-xs text-stone-500 hidden sm:block">
                학생 맞춤형 성적 진단 및 진학 가이드
              </p>
            </div>
          </div>

          {/* 중앙: 탭 내비게이션 (데스크톱) */}
          <nav className="hidden lg:flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              종합 성적
            </button>
            <button
              onClick={() => setActiveTab('weakness')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'weakness'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              문항 분석
            </button>
            <button
              onClick={() => setActiveTab('minimum')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'minimum'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              수능최저
            </button>
            <button
              onClick={() => setActiveTab('ai-report')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'ai-report'
                  ? 'bg-red-700 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI 총평
            </button>
          </nav>

          {/* 우측: 학년 / 반 / 번호 셀렉터 (shrink-0 및 whitespace-nowrap 적용으로 잘림 해결) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* 학년/반/번호 표시 알약 박스 */}
            <div className="flex items-center bg-stone-100/90 hover:bg-stone-100 rounded-full px-3 py-1.5 border border-stone-200/80 text-xs sm:text-sm font-medium text-stone-800 shrink-0 whitespace-nowrap">
              {/* 학년 선택 */}
              <div className="relative flex items-center pr-2 border-r border-stone-300">
                <select
                  value={selectedGrade}
                  onChange={(e) => {
                    const nextGrade = Number(e.target.value);
                    setSelectedGrade(nextGrade);
                    const firstStudentInGrade = allStudents.find(s => s.grade === nextGrade);
                    if (firstStudentInGrade) onSelectStudent(firstStudentInGrade);
                  }}
                  className="appearance-none bg-transparent pr-4 font-semibold text-stone-800 cursor-pointer focus:outline-none"
                >
                  <option value={1}>1학년</option>
                  <option value={2}>2학년</option>
                  <option value={3}>3학년</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-0 pointer-events-none" />
              </div>

              {/* 반 / 번호 및 이름 선택 */}
              <div className="relative flex items-center pl-2">
                <select
                  value={currentStudent.id}
                  onChange={(e) => {
                    const student = allStudents.find(s => s.id === e.target.value);
                    if (student) onSelectStudent(student);
                  }}
                  className="appearance-none bg-transparent pr-4 font-semibold text-stone-800 cursor-pointer focus:outline-none max-w-[130px] sm:max-w-[180px] truncate"
                >
                  {gradeStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.classNum ? `${s.classNum}반 ${s.studentNum}번 ${s.name}` : s.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-0 pointer-events-none" />
              </div>
            </div>

            {/* 빠른 전환 아이콘 버튼 (선택사항) */}
            <button
              onClick={() => {
                const currentIndex = gradeStudents.findIndex(s => s.id === currentStudent.id);
                const nextIndex = (currentIndex + 1) % gradeStudents.length;
                if (gradeStudents[nextIndex]) {
                  onSelectStudent(gradeStudents[nextIndex]);
                }
              }}
              title="다음 학생으로 전환"
              className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors shrink-0"
            >
              <Users className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
