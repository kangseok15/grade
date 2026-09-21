import React, { useRef, useEffect } from 'react';
import { StudentProfile, CourseRecord, ConversionMethod } from '../types';
import { ConsultationReportPageTwo } from './ConsultationReportPageTwo';
import {
  calculateGpaSummary,
  calculateSemesterSummaries,
  calculateCategorySummaries,
  calculateSubjectGroupCombinations,
  analyzeTrajectory,
  generateCohortComparativeComment,
} from '../utils/gradeConversion';
import { convertByEducationOffice } from '../data/educationOfficeConversions';
import {
  Award,
  Building2,
  TrendingUp,
  Layers,
  Sparkles,
} from 'lucide-react';

interface ConsultationReportContentProps {
  student: StudentProfile;
  allStudents?: StudentProfile[];
  conversionMethod: ConversionMethod;
  teacherComment: string;
  onCommentChange?: (comment: string) => void;
  isPrintView?: boolean;
}

type RadarAxisKey = '국어' | '수학' | '영어' | '사회' | '과학' | '기타';

interface RadarAxisData {
  axis: RadarAxisKey;
  studentRaw: number;
  studentGpa5: number;
  cohortRaw: number;
  cohortGpa5: number;
  units: number;
}

export const ConsultationReportContent: React.FC<ConsultationReportContentProps> = ({
  student,
  allStudents = [],
  conversionMethod,
  teacherComment,
  onCommentChange,
  isPrintView = false,
}) => {
  // 1. Overall summaries
  const allSummary = calculateGpaSummary(student.records, conversionMethod);
  const avgSummary = calculateGpaSummary(student.records, 'average');
  const semesterSummaries = calculateSemesterSummaries(student.records, conversionMethod);
  const trajectory = analyzeTrajectory(semesterSummaries);

  // 2. 대학 반영 주요 교과군 조합 (전과목, 국영수사과, 국영수사, 국영수과)
  const combinations = calculateSubjectGroupCombinations(student.records, 'average');
  const allComb = combinations.find((c) => c.key === 'all') || combinations[0];
  const kmesHistComb = combinations.find((c) => c.key === 'korean_math_eng_soc_sci_hist') || combinations[1];
  const kmeHistComb = combinations.find((c) => c.key === 'korean_math_eng_soc_hist') || combinations[2];
  const kmesComb = combinations.find((c) => c.key === 'korean_math_eng_sci') || combinations[3];

  const officeKey =
    conversionMethod === 'busan' ||
    conversionMethod === 'gyeonggi' ||
    conversionMethod === 'gwangju' ||
    conversionMethod === 'average'
      ? conversionMethod
      : 'average';

  // 3. 숭신고 미래인재반 동일 학년 학생들 (Cohort)
  const cohortSameGrade = allStudents.filter((s) => s.grade === student.grade);
  const cohortCount = cohortSameGrade.length > 0 ? cohortSameGrade.length : 1;

  // 4. Distinct Semesters for column layout (e.g. ['1-1', '1-2', '2-1'])
  const distinctSemesters = Array.from(new Set(student.records.map((r) => r.semester))).sort();

  // Helper to get semester-specific stats for a subject category
  const getCategorySemesterData = (categoryName: string, sem: string) => {
    let termCourses: CourseRecord[] = [];
    if (
      categoryName === '정보 및 한문 등' ||
      categoryName === '기술가정·정보/제2외국어·한문'
    ) {
      termCourses = student.records.filter(
        (r) =>
          r.semester === sem &&
          (r.category === '기술가정/정보' || r.category === '제2외국어/한문')
      );
    } else if (
      categoryName === '사회' ||
      categoryName === '사회(한국사포함)' ||
      categoryName.startsWith('사회')
    ) {
      termCourses = student.records.filter(
        (r) =>
          r.semester === sem &&
          (r.category === '사회' || r.subjectName.includes('한국사') || r.subjectName.includes('역사'))
      );
    } else {
      termCourses = student.records.filter((r) => r.semester === sem && r.category === categoryName);
    }

    if (termCourses.length === 0) return null;

    const totalUnits = termCourses.reduce((acc, c) => acc + c.units, 0);
    const validGradeCourses = termCourses.filter((c) => typeof c.rankGrade5 === 'number');
    const validRawCourses = termCourses.filter((c) => typeof c.rawScore === 'number');

    const gradeUnits = validGradeCourses.reduce((acc, c) => acc + c.units, 0);
    const weightedGradeSum = validGradeCourses.reduce(
      (acc, c) => acc + c.units * (c.rankGrade5 || 0),
      0
    );
    const gpa5 = gradeUnits > 0 ? +(weightedGradeSum / gradeUnits).toFixed(2) : null;

    const rawUnits = validRawCourses.reduce((acc, c) => acc + c.units, 0);
    const weightedRawSum = validRawCourses.reduce(
      (acc, c) => acc + c.units * (c.rawScore || 0),
      0
    );
    const avgRaw = rawUnits > 0 ? +(weightedRawSum / rawUnits).toFixed(1) : null;

    return {
      courseCount: termCourses.length,
      totalUnits,
      gpa5,
      avgRaw,
    };
  };

  // Build condensed category list (merging 기술·가정/정보 and 제2외국어/한문 as requested)
  const buildCondensedCategoryRows = () => {
    const rawCategories = calculateCategorySummaries(student.records, 'average');

    const resultRows: {
      category: string;
      totalUnits: number;
      weightedGpa5: number;
      weightedGpa9: number;
      avgRawScore: number;
      ratioA: number;
      courseCount: number;
    }[] = [];

    // Core categories
    const mainCats = ['국어', '수학', '영어'];
    mainCats.forEach((catName) => {
      const found = rawCategories.find((c) => c.category === catName);
      if (found) {
        resultRows.push(found);
      }
    });

    // 사회 + 한국사 통합
    const socRecords = student.records.filter(
      (r) => r.category === '사회' || r.subjectName.includes('한국사') || r.subjectName.includes('역사')
    );
    if (socRecords.length > 0) {
      const validGrade = socRecords.filter((r) => typeof r.rankGrade5 === 'number');
      const gUnits = validGrade.reduce((a, c) => a + c.units, 0);
      const gSum = validGrade.reduce((a, c) => a + c.units * (c.rankGrade5 || 0), 0);
      const gpa5 = gUnits > 0 ? +(gSum / gUnits).toFixed(2) : 0;
      const gpa9 = +convertByEducationOffice(gpa5, officeKey).grade9Equivalent.toFixed(2);

      const validRaw = socRecords.filter((r) => typeof r.rawScore === 'number');
      const rUnits = validRaw.reduce((a, c) => a + c.units, 0);
      const rSum = validRaw.reduce((a, c) => a + c.units * (c.rawScore || 0), 0);
      const avgRaw = rUnits > 0 ? +(rSum / rUnits).toFixed(1) : 0;

      const aCount = socRecords.filter((r) => r.achievement === 'A').length;
      const ratioA = Math.round((aCount / socRecords.length) * 100);

      resultRows.push({
        category: '사회(한국사포함)',
        totalUnits: socRecords.reduce((a, c) => a + c.units, 0),
        weightedGpa5: gpa5,
        weightedGpa9: gpa9,
        avgRawScore: avgRaw,
        ratioA,
        courseCount: socRecords.length,
      });
    }

    // 과학
    const sciFound = rawCategories.find((c) => c.category === '과학');
    if (sciFound) {
      resultRows.push(sciFound);
    }

    // 기술가정/정보 + 제2외국어/한문 합치기 (User requested!)
    const practicalRecords = student.records.filter(
      (r) => r.category === '기술가정/정보' || r.category === '제2외국어/한문'
    );
    if (practicalRecords.length > 0) {
      const validGrade = practicalRecords.filter((r) => typeof r.rankGrade5 === 'number');
      const gUnits = validGrade.reduce((a, c) => a + c.units, 0);
      const gSum = validGrade.reduce((a, c) => a + c.units * (c.rankGrade5 || 0), 0);
      const gpa5 = gUnits > 0 ? +(gSum / gUnits).toFixed(2) : 0;
      const gpa9 = +convertByEducationOffice(gpa5, officeKey).grade9Equivalent.toFixed(2);

      const validRaw = practicalRecords.filter((r) => typeof r.rawScore === 'number');
      const rUnits = validRaw.reduce((a, c) => a + c.units, 0);
      const rSum = validRaw.reduce((a, c) => a + c.units * (c.rawScore || 0), 0);
      const avgRaw = rUnits > 0 ? +(rSum / rUnits).toFixed(1) : 0;

      const aCount = practicalRecords.filter((r) => r.achievement === 'A').length;
      const ratioA = Math.round((aCount / practicalRecords.length) * 100);

      resultRows.push({
        category: '정보 및 한문 등',
        totalUnits: practicalRecords.reduce((a, c) => a + c.units, 0),
        weightedGpa5: gpa5,
        weightedGpa9: gpa9,
        avgRawScore: avgRaw,
        ratioA,
        courseCount: practicalRecords.length,
      });
    }

    return resultRows;
  };

  const condensedCategoryRows = buildCondensedCategoryRows();

  // 5. Hexagonal Radar Chart Data (6 Axes: 국어, 수학, 영어, 사회, 과학, 기타)
  const radarAxes: RadarAxisKey[] = ['국어', '수학', '영어', '사회', '과학', '기타'];

  const getAxisRecords = (records: CourseRecord[], axis: RadarAxisKey): CourseRecord[] => {
    if (axis === '국어') return records.filter((r) => r.category === '국어');
    if (axis === '수학') return records.filter((r) => r.category === '수학');
    if (axis === '영어') return records.filter((r) => r.category === '영어');
    if (axis === '사회') return records.filter((r) => r.category === '사회' || r.subjectName.includes('한국사') || r.subjectName.includes('역사'));
    if (axis === '과학') return records.filter((r) => r.category === '과학');
    return records.filter(
      (r) =>
        r.category !== '국어' &&
        r.category !== '수학' &&
        r.category !== '영어' &&
        r.category !== '사회' &&
        r.category !== '과학' &&
        !r.subjectName.includes('한국사')
    );
  };

  const calculateAxisMetrics = (records: CourseRecord[]) => {
    const validRaw = records.filter((r) => typeof r.rawScore === 'number');
    const rawUnits = validRaw.reduce((acc, c) => acc + c.units, 0);
    const rawSum = validRaw.reduce((acc, c) => acc + c.units * (c.rawScore || 0), 0);
    const avgRaw = rawUnits > 0 ? +(rawSum / rawUnits).toFixed(1) : 0;

    const validGrade = records.filter((r) => typeof r.rankGrade5 === 'number');
    const gradeUnits = validGrade.reduce((acc, c) => acc + c.units, 0);
    const gradeSum = validGrade.reduce((acc, c) => acc + c.units * (c.rankGrade5 || 0), 0);
    const avgGpa = gradeUnits > 0 ? +(gradeSum / gradeUnits).toFixed(2) : 0;

    return {
      avgRaw,
      avgGpa,
      units: records.reduce((acc, c) => acc + c.units, 0),
    };
  };

  const radarData: RadarAxisData[] = radarAxes.map((axis) => {
    const studentAxisRecords = getAxisRecords(student.records, axis);
    const sMetrics = calculateAxisMetrics(studentAxisRecords);

    // Cohort peers average
    let cohortRawSum = 0;
    let cohortGpaSum = 0;
    let cohortCountWithAxis = 0;

    cohortSameGrade.forEach((peer) => {
      const peerAxisRecords = getAxisRecords(peer.records, axis);
      if (peerAxisRecords.length > 0) {
        const pMetrics = calculateAxisMetrics(peerAxisRecords);
        if (pMetrics.avgRaw > 0) {
          cohortRawSum += pMetrics.avgRaw;
          cohortGpaSum += pMetrics.avgGpa;
          cohortCountWithAxis += 1;
        }
      }
    });

    const cohortAvgRaw = cohortCountWithAxis > 0 ? +(cohortRawSum / cohortCountWithAxis).toFixed(1) : sMetrics.avgRaw;
    const cohortAvgGpa = cohortCountWithAxis > 0 ? +(cohortGpaSum / cohortCountWithAxis).toFixed(2) : sMetrics.avgGpa;

    return {
      axis,
      studentRaw: sMetrics.avgRaw,
      studentGpa5: sMetrics.avgGpa,
      cohortRaw: cohortAvgRaw,
      cohortGpa5: cohortAvgGpa,
      units: sMetrics.units,
    };
  });

  // Textarea auto-height ref to prevent scrollbars completely
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(195, textareaRef.current.scrollHeight)}px`;
    }
  }, [teacherComment]);

  // SVG Hexagon Geometry - Enlarged to maximize space and reduce outer margin
  const svgCenter = { x: 120, y: 88 };
  const radarRadius = 66;

  const getVertexPoint = (index: number, ratio: number) => {
    const angle = -Math.PI / 2 + (index * (2 * Math.PI)) / 6;
    const r = radarRadius * Math.max(0.08, Math.min(1.0, ratio));
    return {
      x: +(svgCenter.x + r * Math.cos(angle)).toFixed(1),
      y: +(svgCenter.y + r * Math.sin(angle)).toFixed(1),
    };
  };

  const getOuterPoint = (index: number, outerRatio: number) => {
    const angle = -Math.PI / 2 + (index * (2 * Math.PI)) / 6;
    const r = radarRadius * outerRatio;
    return {
      x: +(svgCenter.x + r * Math.cos(angle)).toFixed(1),
      y: +(svgCenter.y + r * Math.sin(angle)).toFixed(1),
    };
  };

  // Center starts at 70점
  const RADAR_BASE_SCORE = 70;
  const RADAR_MAX_SCORE = 100;

  const scoreToRatio = (score: number) => {
    const clamped = Math.max(60, Math.min(RADAR_MAX_SCORE, score));
    if (clamped <= RADAR_BASE_SCORE) {
      return 0.12 * Math.max(0.2, (clamped - 60) / 10);
    }
    return 0.12 + ((clamped - RADAR_BASE_SCORE) / (RADAR_MAX_SCORE - RADAR_BASE_SCORE)) * 0.88;
  };

  const studentPolygonPoints = radarData
    .map((d, i) => {
      const p = getVertexPoint(i, scoreToRatio(d.studentRaw));
      return `${p.x},${p.y}`;
    })
    .join(' ');

  const cohortPolygonPoints = radarData
    .map((d, i) => {
      const p = getVertexPoint(i, scoreToRatio(d.cohortRaw));
      return `${p.x},${p.y}`;
    })
    .join(' ');

  const gridRings = [
    { score: 70, ratio: 0.12, isMajor: true },
    { score: 80, ratio: 0.12 + (10 / 30) * 0.88, isMajor: true },
    { score: 90, ratio: 0.12 + (20 / 30) * 0.88, isMajor: true },
    { score: 100, ratio: 1.0, isMajor: true },
  ];

  return (
    <div className="w-full flex flex-col items-center print:block select-text">
      {/* PAGE 1 SHEET */}
      <div
        id="consultation-report-sheet-p1"
        className="consultation-report-page text-stone-900 bg-white font-sans text-xs leading-normal w-full max-w-[210mm] min-h-[297mm] p-3 sm:p-5 md:p-[7mm] lg:p-[9mm] mx-auto box-border flex flex-col justify-between gap-2 shadow-xl print:shadow-none print:m-0 print:border-none print:p-0"
        style={{
          maxWidth: '210mm',
          minHeight: '297mm',
          boxSizing: 'border-box',
        }}
      >
        {/* Official Document Header - Clean & Dignified */}
        <div className="border-b-2 border-stone-900 pb-2 flex flex-row items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-blue-900 text-[11px] font-black tracking-tight mb-0.5">
              <Building2 className="w-3.5 h-3.5 text-blue-800 shrink-0" />
              <span>숭신고등학교 진로진학상담부 • 미래인재반 심층(내신) 상담자료</span>
            </div>
            <h1 className="text-xl font-black tracking-tight text-stone-950">
              2028 대입 내신 성적 진단 및 9등급 변환 종합 리포트
            </h1>
          </div>
          <div className="text-right text-[10px] text-stone-500 shrink-0 font-mono flex flex-col items-end">
            <span className="inline-block px-2 py-0.5 rounded bg-stone-900 text-white text-[10px] font-black font-mono">
              [ 1 / 2 페이지 ]
            </span>
          </div>
        </div>

      {/* Student Profile Info Grid - 4 Columns */}
      <div className="grid grid-cols-4 gap-2 bg-stone-50 py-1.5 px-3 rounded-md border border-stone-300 text-[11px]">
        <div>
          <span className="text-stone-500 text-[10px] font-bold block">학생 성명</span>
          <span className="font-black text-stone-950 text-xs">{student.name}</span>
        </div>
        <div>
          <span className="text-stone-500 text-[10px] font-bold block">학적</span>
          <span className="font-bold text-stone-900">
            {student.grade}학년 {student.classNum}반 {student.studentNum ? `${student.studentNum}번` : ''}
          </span>
        </div>
        <div>
          <span className="text-stone-500 text-[10px] font-bold block">진로 희망 계열</span>
          <span className="font-bold text-stone-900">{student.track}</span>
        </div>
        <div>
          <span className="text-stone-500 text-[10px] font-bold block">누적 이수 학기 / 단위</span>
          <span className="font-black text-stone-950 font-mono">
            {distinctSemesters.join(', ')} ({allSummary.totalUnits}단위)
          </span>
        </div>
      </div>

      {/* 2-Column Row for Section 1 and Section 2 */}
      <div className="grid grid-cols-2 gap-3 items-stretch">
        {/* Section 1: 5등급제 성적 및 대학 반영 교과군 조합 요약 */}
        <div className="flex flex-col space-y-1.5">
          <h2 className="font-black text-stone-950 flex items-center gap-1.5 text-[11px] border-l-3 border-blue-700 pl-1.5 shrink-0">
            1. 5등급제 성적 및 대학 반영 교과군 조합
          </h2>

          {/* Top 2 Key Indicator Cards (평균 원점수, 과목수, 이수단위 제외) */}
          <div className="grid grid-cols-2 gap-2">
            {/* Card 1: 5등급제 전과목 */}
            <div className="py-1.5 px-2 bg-blue-50/80 rounded border border-blue-300 flex flex-col justify-center">
              <span className="text-[9.5px] font-black text-blue-900 block">
                5등급제 전과목
              </span>
              <span className="text-lg font-black text-blue-950 font-mono leading-tight my-0.5">
                {allSummary.weightedGpa5}등급
              </span>
              <span className="text-[8.5px] text-blue-700 font-bold block">
                단위미반영 {allSummary.unweightedGpa5}등급
              </span>
            </div>

            {/* Card 2: 9등급 변환 */}
            <div className="py-1.5 px-2 bg-amber-50/80 rounded border border-amber-300 flex flex-col justify-center">
              <span className="text-[9.5px] font-black text-amber-900 block">
                ★ 9등급 변환
              </span>
              <span className="text-lg font-black text-amber-950 font-mono leading-tight my-0.5">
                약 {avgSummary.weightedGpa9}등급
              </span>
              <span className="text-[8.5px] text-amber-800 font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-700 shrink-0" />
                <span>{trajectory.trend}</span>
              </span>
            </div>
          </div>

          {/* 4 Major University Combinations Table (과목수, 이수단위, 평균원점수 제외하고 3컬럼으로 간결화) */}
          <div className="border border-stone-300 rounded overflow-hidden flex-1 flex flex-col justify-between">
            <table className="w-full text-center text-xs border-collapse table-fixed h-full">
              <colgroup>
                <col style={{ width: '52%' }} />
                <col style={{ width: '24%' }} />
                <col style={{ width: '24%' }} />
              </colgroup>
              <thead>
                <tr className="bg-stone-200/80 text-stone-950 font-black border-b border-stone-300 text-[10px]">
                  <th className="py-1.5 px-2 text-left border-r border-stone-300">반영 교과군 조합</th>
                  <th className="py-1.5 px-1 border-r border-stone-300 bg-blue-100/60 text-blue-950">
                    5등급제
                  </th>
                  <th className="py-1.5 px-1 bg-amber-100/60 text-amber-950">
                    9등급 변환
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 font-mono text-[10px]">
                {/* 1. 전과목 */}
                <tr className="bg-white">
                  <td className="py-1.5 px-2 font-bold text-stone-950 text-left border-r border-stone-200 font-sans leading-tight">
                    전과목 (학생부 전체)
                  </td>
                  <td className="py-1.5 px-1 border-r border-stone-200 font-black text-blue-950 bg-blue-50/30">
                    {allComb.weightedGpa5}등급
                  </td>
                  <td className="py-1.5 px-1 font-black text-amber-950 bg-amber-50/30">
                    약 {allComb.weightedGpa9}등급
                  </td>
                </tr>

                {/* 2. 국·영·수·사·과·한국사 */}
                <tr className="bg-stone-50/40">
                  <td className="py-1.5 px-2 font-bold text-blue-950 text-left border-r border-stone-200 font-sans leading-tight">
                    국·영·수·사·과·한국사
                  </td>
                  <td className="py-1.5 px-1 border-r border-stone-200 font-black text-blue-950 bg-blue-50/30">
                    {kmesHistComb.weightedGpa5}등급
                  </td>
                  <td className="py-1.5 px-1 font-black text-amber-950 bg-amber-50/30">
                    약 {kmesHistComb.weightedGpa9}등급
                  </td>
                </tr>

                {/* 3. 국·영·수·사 */}
                <tr className="bg-white">
                  <td className="py-1.5 px-2 font-bold text-stone-900 text-left border-r border-stone-200 font-sans leading-tight">
                    국·영·수·사 (인문/사회)
                  </td>
                  <td className="py-1.5 px-1 border-r border-stone-200 font-black text-blue-950 bg-blue-50/30">
                    {kmeHistComb.weightedGpa5}등급
                  </td>
                  <td className="py-1.5 px-1 font-black text-amber-950 bg-amber-50/30">
                    약 {kmeHistComb.weightedGpa9}등급
                  </td>
                </tr>

                {/* 4. 국·영·수·과 */}
                <tr className="bg-stone-50/40">
                  <td className="py-1.5 px-2 font-bold text-stone-900 text-left border-r border-stone-200 font-sans leading-tight">
                    국·영·수·과 (자연/이공)
                  </td>
                  <td className="py-1.5 px-1 border-r border-stone-200 font-black text-blue-950 bg-blue-50/30">
                    {kmesComb.weightedGpa5}등급
                  </td>
                  <td className="py-1.5 px-1 font-black text-amber-950 bg-amber-50/30">
                    약 {kmesComb.weightedGpa9}등급
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: 주요 6대 교과군 역량 분석 (학생 vs 미래인재반 평균 [격차]) */}
        <div className="flex flex-col space-y-1.5">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-stone-950 flex items-center gap-1.5 text-[11px] border-l-3 border-blue-700 pl-1.5 shrink-0">
              2. 6대 교과군 역량 분석 (vs 미래인재반)
            </h2>
            <span className="text-[9px] text-stone-500 font-bold">
              미래인재반 {cohortCount}명 기준
            </span>
          </div>

          <div className="grid grid-cols-12 gap-1.5 p-1.5 bg-stone-50 rounded border border-stone-300 items-center flex-1">
            {/* Left Sub-Column: Hexagonal Radar Chart (Enlarged) */}
            <div className="col-span-7 flex flex-col items-center justify-center">
              <svg
                viewBox="0 0 240 180"
                className="w-full max-w-[210px] h-auto overflow-visible select-none"
              >
                {/* Concentric Hexagon Rings (70, 80, 90, 100) */}
                {gridRings.map((ring, idx) => {
                  const ringPoints = radarAxes
                    .map((_, i) => {
                      const p = getVertexPoint(i, ring.ratio);
                      return `${p.x},${p.y}`;
                    })
                    .join(' ');

                  return (
                    <g key={idx}>
                      <polygon
                        points={ringPoints}
                        fill={ring.score === 70 ? '#f8fafc' : 'none'}
                        stroke={ring.isMajor ? '#94a3b8' : '#e2e8f0'}
                        strokeWidth={ring.score === 100 ? '1.2' : '0.8'}
                      />
                      {ring.isMajor && (
                        <g>
                          <rect
                            x={svgCenter.x + 3}
                            y={svgCenter.y - radarRadius * ring.ratio - 4}
                            width="14"
                            height="8"
                            rx="1.5"
                            fill="#ffffff"
                            stroke="#cbd5e1"
                            strokeWidth="0.5"
                          />
                          <text
                            x={svgCenter.x + 10}
                            y={svgCenter.y - radarRadius * ring.ratio + 2}
                            fontSize="6"
                            fontWeight="bold"
                            fill="#475569"
                            textAnchor="middle"
                          >
                            {ring.score}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* 6 Spoke lines */}
                {radarAxes.map((_, i) => {
                  const p = getVertexPoint(i, 1.0);
                  return (
                    <line
                      key={i}
                      x1={svgCenter.x}
                      y1={svgCenter.y}
                      x2={p.x}
                      y2={p.y}
                      stroke="#cbd5e1"
                      strokeWidth="0.8"
                    />
                  );
                })}

                {/* Polygon 1: 숭신고 미래인재반 평균 (Cohort) */}
                <polygon
                  points={cohortPolygonPoints}
                  fill="rgba(245, 158, 11, 0.18)"
                  stroke="#d97706"
                  strokeWidth="1.8"
                  strokeDasharray="3 2"
                />

                {/* Polygon 2: 학생 성적 (Student) */}
                <polygon
                  points={studentPolygonPoints}
                  fill="rgba(37, 99, 235, 0.25)"
                  stroke="#1d4ed8"
                  strokeWidth="2.2"
                />

                {/* Data Points & Vertex Labels */}
                {radarData.map((d, i) => {
                  const pStudent = getVertexPoint(i, scoreToRatio(d.studentRaw));
                  const pCohort = getVertexPoint(i, scoreToRatio(d.cohortRaw));
                  const pOuter = getOuterPoint(i, 1.20);

                  return (
                    <g key={d.axis}>
                      <circle cx={pCohort.x} cy={pCohort.y} r="2.5" fill="#d97706" />
                      <circle cx={pStudent.x} cy={pStudent.y} r="3" fill="#1d4ed8" />
                      <text
                        x={pOuter.x}
                        y={pOuter.y - 3}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="font-black text-[9.5px]"
                        fill="#0f172a"
                      >
                        {d.axis}
                      </text>
                      <text
                        x={pOuter.x}
                        y={pOuter.y + 6}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="font-mono font-black text-[8px]"
                        fill="#1d4ed8"
                      >
                        {d.studentRaw}점
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Compact Graph Legend */}
              <div className="flex items-center justify-center gap-2.5 mt-1 text-[8.5px] font-bold">
                <span className="flex items-center gap-1 text-blue-900">
                  <span className="w-2 h-2 rounded-xs bg-blue-600 inline-block shrink-0" />
                  {student.name}
                </span>
                <span className="flex items-center gap-1 text-amber-900">
                  <span className="w-2 h-0.5 border-t-2 border-dashed border-amber-600 inline-block shrink-0" />
                  미인반평균
                </span>
              </div>
            </div>

            {/* Right Sub-Column: 1단 (Single Column) 6-Row Scoreboard */}
            <div className="col-span-5 flex flex-col justify-between space-y-1">
              <div className="text-[8.5px] font-black text-stone-700 border-b border-stone-200 pb-0.5 flex justify-between px-0.5">
                <span>교과군</span>
                <span>원점수 / 미인반평균 [격차]</span>
              </div>

              {radarData.map((d) => {
                const diff = +(d.studentRaw - d.cohortRaw).toFixed(1);
                const isHigher = diff > 0;
                const isTie = diff === 0;

                return (
                  <div
                    key={d.axis}
                    className="flex items-center justify-between py-1 px-1 rounded bg-white border border-stone-200 font-mono text-[8.5px]"
                  >
                    <div className="font-sans font-bold text-stone-900 flex items-center gap-1 text-[9px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                      <span>{d.axis}</span>
                    </div>

                    <div className="flex items-center gap-0.5 text-[8px]">
                      <span className="font-bold text-blue-950">
                        {d.studentRaw}
                      </span>
                      <span className="text-stone-300">/</span>
                      <span className="text-stone-500">{d.cohortRaw}</span>
                      <span
                        className={`inline-block font-black text-[7.5px] px-1 py-0.2 rounded-xs ml-0.5 ${
                          isHigher
                            ? 'text-emerald-700 bg-emerald-50'
                            : isTie
                            ? 'text-stone-600 bg-stone-100'
                            : 'text-rose-700 bg-rose-50'
                        }`}
                      >
                        {isHigher ? `+${diff}` : isTie ? '-' : `${diff}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: 주요 교과군별 학기별(1-1, 1-2, 2-1) 성적 상세 및 9등급 변환 */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h2 className="font-black text-stone-950 flex items-center gap-1.5 text-[11px] border-l-3 border-blue-700 pl-1.5">
            3. 주요 교과군별 학기별 성적 추이 및 9등급 변환
          </h2>
          <span className="text-[9.5px] text-stone-500 font-bold">
            * 정보 및 한문, 기술·가정 교과 등 통합 반영
          </span>
        </div>

        <div className="border border-stone-300 rounded-md overflow-hidden">
          <table className="w-full text-center text-xs border-collapse table-fixed">
            <colgroup>
              <col style={{ width: '20%' }} />
              {distinctSemesters.map((sem) => (
                <col key={sem} style={{ width: `${24 / distinctSemesters.length}%` }} />
              ))}
              <col style={{ width: '15%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '8%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '8%' }} />
            </colgroup>
            <thead>
              <tr className="bg-stone-200/80 text-stone-950 font-black border-b border-stone-300 text-[10px]">
                <th className="py-1.5 px-2 text-left border-r border-stone-300">교과군</th>
                {distinctSemesters.map((sem) => (
                  <th key={sem} className="py-1.5 px-0.5 border-r border-stone-300 bg-stone-100">
                    {sem}
                  </th>
                ))}
                <th className="py-1.5 px-1 border-r border-stone-300 bg-blue-100/60 text-blue-950">
                  5등급제 평균
                </th>
                <th className="py-1.5 px-1 border-r border-stone-300 bg-amber-100/60 text-amber-950">
                  9등급 변환
                </th>
                <th className="py-1.5 px-0.5 border-r border-stone-300">총이수단위</th>
                <th className="py-1.5 px-0.5 border-r border-stone-300">평균 원점수</th>
                <th className="py-1.5 px-0.5">A성취 비율</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 font-mono text-[10px]">
              {condensedCategoryRows.map((cat, idx) => {
                return (
                  <tr
                    key={cat.category}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'}
                  >
                    <td className="py-1.5 px-2 font-bold text-stone-950 text-left border-r border-stone-200 font-sans text-[10px] leading-tight">
                      {cat.category}
                    </td>

                    {distinctSemesters.map((sem) => {
                      const semData = getCategorySemesterData(cat.category, sem);
                      return (
                        <td
                          key={sem}
                          className="py-1.5 px-0.5 border-r border-stone-200 text-stone-800 text-[10px]"
                        >
                          {semData ? (
                            <span>
                              <strong className="text-stone-950">{semData.gpa5}</strong>
                              <span className="text-[9px] text-stone-500 font-sans ml-0.5">
                                ({semData.avgRaw})
                              </span>
                            </span>
                          ) : (
                            <span className="text-stone-400 font-sans">-</span>
                          )}
                        </td>
                      );
                    })}

                    <td className="py-1.5 px-1 border-r border-stone-200 font-black text-blue-950 bg-blue-50/30 text-[10px]">
                      {cat.weightedGpa5}등급
                    </td>
                    <td className="py-1.5 px-1 border-r border-stone-200 font-black text-amber-950 bg-amber-50/30 text-[10px]">
                      약 {cat.weightedGpa9}등급
                    </td>
                    <td className="py-1.5 px-0.5 border-r border-stone-200 font-bold text-stone-900 text-[10px]">
                      {cat.totalUnits}단위
                    </td>
                    <td className="py-1.5 px-0.5 border-r border-stone-200 font-bold text-stone-900 text-[10px]">
                      {cat.avgRawScore}점
                    </td>
                    <td className="py-1.5 px-0.5 font-bold text-stone-700 text-[10px]">
                      {cat.ratioA > 0 ? `${cat.ratioA}%` : '0%'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 4: 숭신고등학교 진로진학상담부(미래인재반) 지도교사 종합 상담 의견 - 5줄 및 넉넉한 줄간격/높이 */}
      <div className="flex flex-col space-y-1 my-0.5">
        <div className="flex items-center justify-between">
          <h2 className="font-black text-stone-950 flex items-center gap-1.5 text-[11px] border-l-3 border-blue-700 pl-1.5 shrink-0">
            4. 숭신고등학교 진로진학상담부(미래인재반) 지도교사 종합 상담 의견
          </h2>
          {!isPrintView && onCommentChange && (
            <button
              type="button"
              onClick={() =>
                onCommentChange(
                  generateCohortComparativeComment(
                    student,
                    allStudents,
                    conversionMethod
                  )
                )
              }
              className="text-[9.5px] text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 bg-blue-50 hover:bg-blue-100/80 px-2 py-0.5 rounded border border-blue-200 transition-colors cursor-pointer"
              title="동급생 비교 분석을 바탕으로 구체적인 5줄 상담 의견을 자동 생성합니다."
            >
              <Sparkles className="w-3 h-3 text-blue-600" />
              <span>동급생 비교의견 자동생성</span>
            </button>
          )}
        </div>
        <div className="min-h-[225px] flex flex-col p-3 bg-stone-50 border border-stone-300 rounded-md">
          {isPrintView ? (
            <div className="flex-1 text-stone-900 text-[11px] leading-[1.85] font-medium whitespace-pre-line min-h-[195px]">
              {teacherComment}
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={teacherComment}
              onChange={(e) => onCommentChange && onCommentChange(e.target.value)}
              rows={8}
              className="w-full flex-1 min-h-[195px] overflow-hidden text-[11px] text-stone-900 bg-transparent border-0 focus:ring-0 resize-none font-medium leading-[1.85] p-0 focus:outline-none"
              placeholder="학생의 성취도, 강약점 교과 및 향후 대입 전략에 대한 지도 의견을 입력하세요."
            />
          )}
        </div>
      </div>

      {/* Official Sign-off Footer */}
      <div className="border-t-2 border-stone-900 pt-2 flex flex-row items-center justify-between gap-2 text-[10px] text-stone-700 font-sans shrink-0">
        <div className="flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-blue-800 shrink-0" />
          <span className="font-bold text-stone-900">
            본 리포트는 숭신고 진로진학상담부에서 제작한 프로그램입니다.
          </span>
        </div>
        <div className="flex items-center gap-2 text-right font-bold text-stone-950 shrink-0 whitespace-nowrap">
          <span className="font-mono text-stone-600">[ 1 / 2 ]</span>
        </div>
      </div>
    </div>

    {/* On-screen Visual Page Divider (Hidden when printing) */}
    <div className="print:hidden w-full max-w-[210mm] flex items-center justify-between my-6 py-2.5 px-4 bg-stone-800 text-white rounded-xl shadow-md text-xs font-bold">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>다음 페이지 (2 / 2): 학기별 성적 추이 그래프 및 전체 과목 세부 성적 명세</span>
      </div>
      <span className="bg-stone-700 px-2.5 py-1 rounded text-[11px] font-mono text-stone-200">
        PAGE 2 OF 2
      </span>
    </div>

    {/* PAGE 2 SHEET */}
    <ConsultationReportPageTwo
      student={student}
      allStudents={allStudents}
      conversionMethod={conversionMethod}
    />
  </div>
  );
};
