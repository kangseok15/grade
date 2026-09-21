import React, { useState, useMemo } from 'react';
import { StudentProfile, ConversionMethod } from '../types';
import { calculateGpaSummary } from '../utils/gradeConversion';
import { convertByEducationOffice } from '../data/educationOfficeConversions';
import {
  UNIVERSITY_ADMISSION_DATA,
  UniversityAdmissionCut,
} from '../data/universityAdmissionData';
import {
  Building2,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Award,
  ChevronRight,
  TrendingUp,
  GraduationCap,
} from 'lucide-react';

interface UniversityAdmissionSimulatorProps {
  student: StudentProfile;
  conversionMethod: ConversionMethod;
}

export const UniversityAdmissionSimulator: React.FC<
  UniversityAdmissionSimulatorProps
> = ({ student, conversionMethod }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<string>('all');
  const [selectedAdmissionType, setSelectedAdmissionType] =
    useState<string>('all');
  const [selectedChance, setSelectedChance] = useState<string>('all');

  // GPA summaries
  const gpaSummary = calculateGpaSummary(student.records, conversionMethod);
  const studentGrade9 = gpaSummary.weightedGpa9;
  const studentGrade5 = gpaSummary.weightedGpa5;

  const officeKey =
    conversionMethod === 'busan' ||
    conversionMethod === 'gyeonggi' ||
    conversionMethod === 'gwangju' ||
    conversionMethod === 'average'
      ? conversionMethod
      : 'average';

  const officeCumRatio = convertByEducationOffice(
    studentGrade5,
    officeKey
  ).cumulativeRatio;

  // Custom grade9 override for what-if exploration
  const [customGrade9, setCustomGrade9] = useState<number | null>(null);
  const activeGrade9 = customGrade9 ?? studentGrade9;

  // Determine admission chance
  const getChance = (
    cut70: number,
    studentGrade: number
  ): {
    status: '안정' | '적정' | '소신' | '상향';
    diff: number;
    color: string;
    bg: string;
    border: string;
  } => {
    // Note: in Korean grade system, lower number is better!
    // diff = studentGrade - cut70
    // If studentGrade is 1.5 and cut70 is 1.8 -> diff = -0.3 (student is better by 0.3)
    const diff = +(studentGrade - cut70).toFixed(2);

    if (diff <= -0.15) {
      return {
        status: '안정',
        diff,
        color: 'text-[var(--good)]',
        bg: 'bg-[var(--good)]/10',
        border: 'border-[var(--good)]/25',
      };
    } else if (diff <= 0.1) {
      return {
        status: '적정',
        diff,
        color: 'text-[var(--korean)]',
        bg: 'bg-[var(--korean)]/10',
        border: 'border-[var(--korean)]/25',
      };
    } else if (diff <= 0.35) {
      return {
        status: '소신',
        diff,
        color: 'text-[var(--accent)]',
        bg: 'bg-[var(--accent-soft)]',
        border: 'border-[var(--accent)]/25',
      };
    } else {
      return {
        status: '상향',
        diff,
        color: 'text-[var(--critical)]',
        bg: 'bg-[var(--critical)]/10',
        border: 'border-[var(--critical)]/25',
      };
    }
  };

  // Filtered universities
  const filteredList = useMemo(() => {
    return UNIVERSITY_ADMISSION_DATA.filter((item) => {
      // Track filter
      if (selectedTrack !== 'all' && item.track !== selectedTrack) return false;

      // Admission type filter
      if (
        selectedAdmissionType !== 'all' &&
        item.admissionType !== selectedAdmissionType
      )
        return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchUniv = item.universityName.toLowerCase().includes(query);
        const matchMajor = item.majorName.toLowerCase().includes(query);
        const matchNotes = item.notes?.toLowerCase().includes(query) ?? false;
        if (!matchUniv && !matchMajor && !matchNotes) return false;
      }

      // Chance filter
      if (selectedChance !== 'all') {
        const chance = getChance(item.cut70_grade9, activeGrade9);
        if (chance.status !== selectedChance) return false;
      }

      return true;
    });
  }, [
    searchQuery,
    selectedTrack,
    selectedAdmissionType,
    selectedChance,
    activeGrade9,
  ]);

  // Counts by chance
  const chanceCounts = useMemo(() => {
    let safe = 0;
    let target = 0;
    let reach = 0;
    let highReach = 0;

    UNIVERSITY_ADMISSION_DATA.forEach((item) => {
      const c = getChance(item.cut70_grade9, activeGrade9);
      if (c.status === '안정') safe++;
      else if (c.status === '적정') target++;
      else if (c.status === '소신') reach++;
      else highReach++;
    });

    return { safe, target, reach, highReach, total: UNIVERSITY_ADMISSION_DATA.length };
  }, [activeGrade9]);

  return (
    <div className="space-y-6" id="university-admission-section">
      {/* Top Banner & Strategy Summary */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-xs p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-[var(--border)] gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--korean)] text-white flex items-center justify-center font-bold shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[var(--ink)] tracking-tight">
                  2028 대입 수시 목표 대학·학과별 지원선 유불리 시뮬레이터
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-md bg-[var(--korean)]/10 text-[var(--korean)] border border-[var(--korean)]/25 font-semibold">
                  2025 전년도 70% 컷 매칭
                </span>
              </div>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                5등급제 성적을 교육청 환산 9등급 기준치로 대입하여, 서울 주요대 및 의약학계열 수시(교과·종합) 합격선과 안정·적정·소신을 실시간 판정합니다.
              </p>
            </div>
          </div>

          {/* Current Student's Benchmark Card */}
          <div className="flex items-center gap-3 bg-[var(--surface-alt)] border border-[var(--border)] p-2.5 rounded-xl text-xs self-start lg:self-auto">
            <div className="border-r border-[var(--border)] pr-3">
              <span className="text-[10px] text-[var(--muted)] font-bold block">
                {student.name} 학생 5등급제
              </span>
              <span className="text-base font-black text-[var(--ink)]">
                {studentGrade5}등급
              </span>
            </div>
            <div className="border-r border-[var(--border)] pr-3">
              <span className="text-[10px] text-[var(--accent)] font-bold block">
                적용 9등급 환산치
              </span>
              <span className="text-base font-black text-[var(--accent)] font-mono">
                약 {activeGrade9.toFixed(2)}등급
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[var(--korean)] font-bold block">
                상위 누적비율
              </span>
              <span className="text-base font-bold text-[var(--korean)] font-mono">
                {officeCumRatio}%
              </span>
            </div>
          </div>
        </div>

        {/* What-if Grade Slider */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--accent)]" />
            <span className="font-bold text-[var(--ink)]">
              목표 9등급 환산치 시뮬레이션:
            </span>
            <input
              type="range"
              min="1.0"
              max="3.0"
              step="0.05"
              value={activeGrade9}
              onChange={(e) => setCustomGrade9(Number(e.target.value))}
              className="w-36 accent-[var(--korean)] cursor-pointer"
            />
            <span className="font-mono font-bold text-[var(--korean)] bg-[var(--korean)]/10 px-2 py-0.5 rounded border border-[var(--korean)]/25">
              {activeGrade9.toFixed(2)}등급
            </span>
            {customGrade9 !== null && (
              <button
                onClick={() => setCustomGrade9(null)}
                className="text-[11px] text-[var(--muted)] hover:text-[var(--ink)] underline cursor-pointer"
              >
                원래대로 ({studentGrade9}등급)
              </button>
            )}
          </div>

          {/* Quick Chance Counts */}
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="px-2.5 py-1 rounded-md bg-[var(--good)]/15 text-[var(--good)] font-bold border border-[var(--good)]/30">
              안정 {chanceCounts.safe}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-[var(--korean)]/15 text-[var(--korean)] font-bold border border-[var(--korean)]/30">
              적정 {chanceCounts.target}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-[var(--accent-soft)] text-[var(--accent)] font-bold border border-[var(--accent)]/30">
              소신 {chanceCounts.reach}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-[var(--critical)]/15 text-[var(--critical)] font-bold border border-[var(--critical)]/30">
              상향 {chanceCounts.highReach}
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="대학명, 학과명, 전형 메모 검색 (예: 서울대, 컴공, 반도체...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[var(--surface-alt)] border border-[var(--border-strong)] rounded-lg text-xs outline-hidden focus:border-[var(--korean)]/50 focus:bg-[var(--surface)]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Track */}
          <select
            value={selectedTrack}
            onChange={(e) => setSelectedTrack(e.target.value)}
            className="px-2.5 py-2 bg-[var(--surface-alt)] border border-[var(--border-strong)] rounded-lg font-semibold text-[var(--ink-secondary)] outline-hidden cursor-pointer"
          >
            <option value="all">계열 전체</option>
            <option value="의약">의약학 계열</option>
            <option value="자연">자연·공학 계열</option>
            <option value="인문">인문·사회 계열</option>
          </select>

          {/* Admission Type */}
          <select
            value={selectedAdmissionType}
            onChange={(e) => setSelectedAdmissionType(e.target.value)}
            className="px-2.5 py-2 bg-[var(--surface-alt)] border border-[var(--border-strong)] rounded-lg font-semibold text-[var(--ink-secondary)] outline-hidden cursor-pointer"
          >
            <option value="all">전형 전체</option>
            <option value="교과">학생부교과</option>
            <option value="종합">학생부종합</option>
          </select>

          {/* Chance */}
          <select
            value={selectedChance}
            onChange={(e) => setSelectedChance(e.target.value)}
            className="px-2.5 py-2 bg-[var(--surface-alt)] border border-[var(--border-strong)] rounded-lg font-semibold text-[var(--ink-secondary)] outline-hidden cursor-pointer"
          >
            <option value="all">지원 가능선 전체</option>
            <option value="안정">안정 지원선</option>
            <option value="적정">적정 지원선</option>
            <option value="소신">소신 지원선</option>
            <option value="상향">상향 지원선</option>
          </select>
        </div>
      </div>

      {/* University Matching Table */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[560px] overflow-y-auto">
          <table className="w-full text-xs text-center border-collapse whitespace-nowrap min-w-[760px]">
            <thead className="bg-[var(--surface-alt)] text-[var(--ink-secondary)] font-bold sticky top-0 z-10 border-b border-[var(--border)]">
              <tr>
                <th className="py-2.5 px-3 text-left">대학교</th>
                <th className="py-2.5 px-3 text-left">모집단위 (학과)</th>
                <th className="py-2.5 px-2">계열</th>
                <th className="py-2.5 px-2">전형 유형</th>
                <th className="py-2.5 px-3 bg-[var(--border)]/60 text-[var(--ink)]">전년도 70% 컷</th>
                <th className="py-2.5 px-3 bg-[var(--accent-soft)] text-[var(--accent)]">내 환산 등급</th>
                <th className="py-2.5 px-3">격차 (내등급 - 컷)</th>
                <th className="py-2.5 px-3">진학 판정</th>
                <th className="py-2.5 px-4 text-left">전형 특징 및 비고</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-[var(--ink)]">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[var(--muted)]">
                    선택한 조건에 부합하는 대학·모집단위가 없습니다.
                  </td>
                </tr>
              ) : (
                filteredList.map((univ) => {
                  const chance = getChance(univ.cut70_grade9, activeGrade9);

                  return (
                    <tr
                      key={univ.id}
                      className={`hover:bg-[var(--surface-alt)] transition-colors ${
                        chance.status === '안정'
                          ? 'bg-[var(--good)]/20'
                          : chance.status === '적정'
                          ? 'bg-[var(--korean)]/20'
                          : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-left font-bold text-[var(--ink)] flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" />
                        <span>{univ.universityName}</span>
                      </td>
                      <td className="py-2.5 px-3 text-left font-semibold text-[var(--ink)]">
                        {univ.majorName}
                      </td>
                      <td className="py-2.5 px-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            univ.track === '의약'
                              ? 'bg-[var(--critical)]/15 text-[var(--critical)]'
                              : univ.track === '자연'
                              ? 'bg-[var(--korean)]/15 text-[var(--korean)]'
                              : 'bg-[var(--korean)]/15 text-[var(--korean)]'
                          }`}
                        >
                          {univ.track}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 font-medium">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            univ.admissionType === '교과'
                              ? 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]/25'
                              : 'bg-[var(--good)]/10 text-[var(--good)] border-[var(--good)]/25'
                          }`}
                        >
                          {univ.admissionType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-[var(--ink-secondary)] bg-[var(--surface-alt)]/60">
                        {univ.cut70_grade9.toFixed(2)}등급
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-[var(--accent)] bg-[var(--accent-soft)]/60">
                        {activeGrade9.toFixed(2)}등급
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold">
                        <span
                          className={
                            chance.diff <= 0 ? 'text-[var(--good)]' : 'text-[var(--critical)]'
                          }
                        >
                          {chance.diff > 0 ? `+${chance.diff}` : chance.diff}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${chance.bg} ${chance.color} ${chance.border}`}
                        >
                          {chance.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-left text-[11px] text-[var(--muted)]">
                        {univ.notes || '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Information Callout */}
        <div className="p-4 bg-[var(--surface-alt)] border-t border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[var(--ink-secondary)]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[var(--korean)] shrink-0" />
            <span>
              * 본 시뮬레이터의 합격선은 2024~2025 대입 수시 70% 컷 실적에 기반한 참고치이며, 2028 수능 최저학력기준 및 대학별 환산식에 따라 달라질 수 있습니다.
            </span>
          </div>
          <span className="font-mono text-[var(--muted)] text-[11px] shrink-0">
            총 {filteredList.length}개 모집단위 표시 중
          </span>
        </div>
      </div>
    </div>
  );
};
