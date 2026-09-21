import React, { useState } from 'react';
import { StudentProfile, ConversionMethod } from '../types';
import { calculateGpaSummary } from '../utils/gradeConversion';
import {
  BUSAN_OFFICE_CONVERSION_TABLE,
  GYEONGGI_CONVERSION_TABLE,
  GWANGJU_OFFICE_CONVERSION_TABLE,
  AVERAGE_OFFICE_CONVERSION_TABLE,
  convertByEducationOffice,
} from '../data/educationOfficeConversions';
import {
  CheckCircle,
  Building2,
  TableProperties,
  Info,
} from 'lucide-react';

interface ConversionWorkbenchProps {
  student: StudentProfile;
  conversionMethod: ConversionMethod;
  setConversionMethod: (method: ConversionMethod) => void;
}

export const ConversionWorkbench: React.FC<ConversionWorkbenchProps> = ({
  student,
  conversionMethod,
  setConversionMethod,
}) => {
  const [selectedTable, setSelectedTable] = useState<'busan' | 'gyeonggi' | 'gwangju' | 'average'>(
    conversionMethod === 'gyeonggi'
      ? 'gyeonggi'
      : conversionMethod === 'gwangju'
      ? 'gwangju'
      : conversionMethod === 'average'
      ? 'average'
      : 'busan'
  );

  // GPA summaries by method
  const studentBusan = calculateGpaSummary(student.records, 'busan');
  const studentGyeonggi = calculateGpaSummary(student.records, 'gyeonggi');
  const studentGwangju = calculateGpaSummary(student.records, 'gwangju');
  const studentAverage = calculateGpaSummary(student.records, 'average');
  const studentMid = calculateGpaSummary(student.records, 'midpoint');

  // Current active summary
  const currentSummary =
    conversionMethod === 'gyeonggi'
      ? studentGyeonggi
      : conversionMethod === 'gwangju'
      ? studentGwangju
      : conversionMethod === 'average'
      ? studentAverage
      : conversionMethod === 'midpoint'
      ? studentMid
      : studentBusan;

  const currentOfficeName =
    conversionMethod === 'gyeonggi'
      ? '경기도(12과목합)'
      : conversionMethod === 'gwangju'
      ? '광주시교육청'
      : conversionMethod === 'average'
      ? '3개 교육청 통합 평균'
      : '부산시교육청';

  return (
    <div className="space-y-6" id="conversion-workbench-section">
      {/* Top Banner: Educational Office Benchmark Overview */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-xs p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[var(--border)] gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--korean)] text-white flex items-center justify-center font-bold shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[var(--ink)] tracking-tight">
                  시도교육청 실증 표본 기반 5등급제 ↔ 9등급제 환산 기준표
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-md bg-[var(--korean)]/10 text-[var(--korean)] border border-[var(--korean)]/25 font-semibold">
                  교육청 공식 분석 데이터
                </span>
              </div>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                부산시교육청(15,978명 표본), 경기도 누적비 기준(12과목 등급합), 광주시교육청(고1 과정) 및 3개 시·도 교육청 실측 통합 평균 자료를 비교·조회할 수 있습니다.
              </p>
            </div>
          </div>

          {/* Model Switcher */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[var(--surface-alt)] p-1 rounded-lg border border-[var(--border)] text-xs self-start md:self-auto shrink-0">
            <span className="text-[var(--muted)] font-bold ml-1 mr-1">전체 적용 기준:</span>
            <button
              type="button"
              onClick={() => {
                setConversionMethod('busan');
                setSelectedTable('busan');
              }}
              className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                conversionMethod === 'busan' || conversionMethod === 'conservative'
                  ? 'bg-[var(--korean)] text-white shadow-xs'
                  : 'text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:bg-[var(--border)]'
              }`}
            >
              부산 (15,978명)
            </button>
            <button
              type="button"
              onClick={() => {
                setConversionMethod('gyeonggi');
                setSelectedTable('gyeonggi');
              }}
              className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                conversionMethod === 'gyeonggi'
                  ? 'bg-[var(--korean)] text-white shadow-xs'
                  : 'text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:bg-[var(--border)]'
              }`}
            >
              경기도 (12과목합)
            </button>
            <button
              type="button"
              onClick={() => {
                setConversionMethod('gwangju');
                setSelectedTable('gwangju');
              }}
              className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                conversionMethod === 'gwangju'
                  ? 'bg-[var(--korean)] text-white shadow-xs'
                  : 'text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:bg-[var(--border)]'
              }`}
            >
              광주 (고1 과정)
            </button>
            <button
              type="button"
              onClick={() => {
                setConversionMethod('average');
                setSelectedTable('average');
              }}
              className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                conversionMethod === 'average'
                  ? 'bg-[var(--korean)] text-white shadow-xs'
                  : 'text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:bg-[var(--border)]'
              }`}
            >
              3개 교육청 평균
            </button>
          </div>
        </div>

        {/* Current Student's Conversion Highlight */}
        <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[var(--korean)]/60 border border-[var(--korean)]/25">
            <span className="text-xs font-bold text-[var(--korean)] uppercase block">
              {student.name} 학생 5등급제 평균
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-[var(--korean)]">
                {currentSummary.weightedGpa5}등급
              </span>
              <span className="text-xs text-[var(--korean)]">
                (단위 미반영 {currentSummary.unweightedGpa5}등급)
              </span>
            </div>
            <p className="text-[11px] text-[var(--korean)]/80 mt-1">
              이수단위수 가중 합산 기준 (현 2028 개편 5등급제)
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--accent-soft)]/60 border border-[var(--accent)]/25">
            <span className="text-xs font-bold text-[var(--accent)] uppercase block">
              {currentOfficeName} 기준 9등급 환산
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-[var(--accent)]">
                약 {currentSummary.weightedGpa9}등급
              </span>
              <span className="text-xs font-bold text-[var(--accent)]">
                (상위 약 {convertByEducationOffice(currentSummary.weightedGpa5, conversionMethod === 'average' ? 'average' : conversionMethod === 'gyeonggi' ? 'gyeonggi' : conversionMethod === 'gwangju' ? 'gwangju' : 'busan').cumulativeRatio}%)
              </span>
            </div>
            <p className="text-[11px] text-[var(--accent)]/80 mt-1">
              2015 개정 9등급제(수시 대입 실적 비교군) 대응치
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--ink-secondary)]">대입 지원 가이드</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-[var(--border)] text-[var(--ink)] font-semibold">
                진학 진단
              </span>
            </div>
            <p className="text-xs text-[var(--ink-secondary)] mt-1 leading-snug">
              5등급제 <strong>{currentSummary.weightedGpa5}등급</strong>은 기존 9등급제의 <strong>{currentSummary.weightedGpa9}등급</strong> 수준으로 평가되며, 상위 15개교 학생부교과/종합 안정권 지원의 핵심 지표가 됩니다.
            </p>
            <div className="text-[11px] text-[var(--muted)] mt-1 pt-1 border-t border-[var(--border)]">
              현재 <strong className="text-[var(--ink-secondary)]">{currentOfficeName}</strong> 공식 기준표가 전체 성적표에 적용 중입니다.
            </div>
          </div>
        </div>
      </div>

      {/* Main Official Data Table & Analysis */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-xs overflow-hidden">
        {/* Table Selector Header */}
        <div className="p-4 border-b border-[var(--border)] bg-[var(--surface-alt)]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TableProperties className="w-4 h-4 text-[var(--korean)]" />
            <span className="text-sm font-bold text-[var(--ink)]">
              {selectedTable === 'busan' && '부산광역시교육청 관내 5등급제 누적 등급평균 분석자료 (고1~고2-1, 15,978명 표본)'}
              {selectedTable === 'gyeonggi' && '경기도/베리타스알파 누적비 기준 12과목 등급 합 환산 9등급 테이블'}
              {selectedTable === 'gwangju' && '광주광역시교육청 5등급 등급평균(고1 과정) 누적비율 ↔ 9등급제 환산 기준'}
              {selectedTable === 'average' && '부산·경기·광주 3개 시·도 교육청 실측 표본 통합 평균 환산표 (종합 지표)'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-[var(--border-strong)] p-0.5 bg-[var(--surface)] text-xs">
              <button
                type="button"
                onClick={() => setSelectedTable('busan')}
                className={`px-3 py-1 rounded-md font-semibold cursor-pointer ${
                  selectedTable === 'busan'
                    ? 'bg-[var(--korean)] text-white'
                    : 'text-[var(--ink-secondary)] hover:text-[var(--ink)]'
                }`}
              >
                부산시교육청 (1.6만명)
              </button>
              <button
                type="button"
                onClick={() => setSelectedTable('gyeonggi')}
                className={`px-3 py-1 rounded-md font-semibold cursor-pointer ${
                  selectedTable === 'gyeonggi'
                    ? 'bg-[var(--korean)] text-white'
                    : 'text-[var(--ink-secondary)] hover:text-[var(--ink)]'
                }`}
              >
                경기도 (12과목합)
              </button>
              <button
                type="button"
                onClick={() => setSelectedTable('gwangju')}
                className={`px-3 py-1 rounded-md font-semibold cursor-pointer ${
                  selectedTable === 'gwangju'
                    ? 'bg-[var(--korean)] text-white'
                    : 'text-[var(--ink-secondary)] hover:text-[var(--ink)]'
                }`}
              >
                광주시교육청 (고1과정)
              </button>
              <button
                type="button"
                onClick={() => setSelectedTable('average')}
                className={`px-3 py-1 rounded-md font-semibold cursor-pointer ${
                  selectedTable === 'average'
                    ? 'bg-[var(--korean)] text-white'
                    : 'text-[var(--ink-secondary)] hover:text-[var(--ink)]'
                }`}
              >
                3개 교육청 통합평균
              </button>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
          {selectedTable === 'busan' && (
            <table className="w-full text-xs text-center border-collapse whitespace-nowrap min-w-[680px]">
              <thead className="bg-[var(--surface-alt)] text-[var(--ink-secondary)] font-bold sticky top-0 z-10 border-b border-[var(--border)] whitespace-nowrap">
                <tr>
                  <th className="py-2.5 px-3 whitespace-nowrap">5등급제 등급평균 (고2 1학기까지)</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">2학년 1학기 누적비 (%)</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">9등급제 등급평균 환산치</th>
                  <th className="py-2.5 px-3 text-[var(--muted)] whitespace-nowrap">현재 학생 위치 대조</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-[var(--ink)] whitespace-nowrap">
                {BUSAN_OFFICE_CONVERSION_TABLE.map((row, idx) => {
                  const isCurrent =
                    Math.abs(row.grade5 - currentSummary.weightedGpa5) < 0.05 ||
                    (row.grade5 === 1.0 && currentSummary.weightedGpa5 <= 1.02);

                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-[var(--surface-alt)] transition-colors whitespace-nowrap ${
                        isCurrent ? 'bg-[var(--accent-soft)]/70 font-extrabold text-[var(--accent)]' : idx % 2 === 1 ? 'bg-[var(--surface-alt)]/40' : ''
                      }`}
                    >
                      <td className="py-2 px-3 font-semibold text-[var(--korean)] whitespace-nowrap">
                        {row.grade5.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span className="font-mono whitespace-nowrap">{row.cumulativeRatio.toFixed(2)}%</span>
                      </td>
                      <td className="py-2 px-3 font-bold text-[var(--accent)] whitespace-nowrap">
                        {row.grade9Equivalent.toFixed(2)}등급
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        {isCurrent ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-0.5 rounded-full whitespace-nowrap">
                            ★ {student.name} 학생 구간 ({currentSummary.weightedGpa5}등급)
                          </span>
                        ) : (
                          <span className="text-[var(--muted)] whitespace-nowrap">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {selectedTable === 'gyeonggi' && (
            <table className="w-full text-xs text-center border-collapse whitespace-nowrap min-w-[760px]">
              <thead className="bg-[var(--surface-alt)] text-[var(--ink-secondary)] font-bold sticky top-0 z-10 border-b border-[var(--border)] whitespace-nowrap">
                <tr>
                  <th className="py-2.5 px-3 whitespace-nowrap">5등급제 등급 평균</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">12과목 등급 합</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">누적비 (%)</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">누적비 기준 환산 9등급</th>
                  <th className="py-2.5 px-3 text-[var(--muted)] whitespace-nowrap">현재 학생 위치 대조</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-[var(--ink)] whitespace-nowrap">
                {GYEONGGI_CONVERSION_TABLE.map((row, idx) => {
                  const isCurrent =
                    Math.abs(row.grade5 - currentSummary.weightedGpa5) < 0.05 ||
                    (row.grade5 === 1.0 && currentSummary.weightedGpa5 <= 1.02);

                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-[var(--surface-alt)] transition-colors whitespace-nowrap ${
                        isCurrent ? 'bg-[var(--accent-soft)]/70 font-extrabold text-[var(--accent)]' : idx % 2 === 1 ? 'bg-[var(--surface-alt)]/40' : ''
                      }`}
                    >
                      <td className="py-2 px-3 font-semibold text-[var(--korean)] whitespace-nowrap">
                        {row.grade5.toFixed(3)}
                      </td>
                      <td className="py-2 px-3 font-mono text-[var(--ink-secondary)] whitespace-nowrap">
                        {row.grade5Sum12}
                      </td>
                      <td className="py-2 px-3 font-mono whitespace-nowrap">
                        {row.cumulativeRatio.toFixed(2)}%
                      </td>
                      <td className="py-2 px-3 font-bold text-[var(--accent)] whitespace-nowrap">
                        {row.grade9Equivalent.toFixed(2)}등급
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        {isCurrent ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-0.5 rounded-full whitespace-nowrap">
                            ★ {student.name} 학생 구간 ({currentSummary.weightedGpa5}등급)
                          </span>
                        ) : (
                          <span className="text-[var(--muted)] whitespace-nowrap">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {selectedTable === 'gwangju' && (
            <table className="w-full text-xs text-center border-collapse whitespace-nowrap min-w-[850px]">
              <thead className="bg-[var(--surface-alt)] text-[var(--ink-secondary)] font-bold sticky top-0 z-10 border-b border-[var(--border)] whitespace-nowrap">
                <tr>
                  <th className="py-2.5 px-3 whitespace-nowrap">5등급 등급평균 (고1 과정)</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">누적비율 (%)</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">9등급 등급평균 (2025년 3학년 졸업생 기준)</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">9등급 등급평균 (2024년 3학년 졸업생 기준)</th>
                  <th className="py-2.5 px-3 text-[var(--muted)] whitespace-nowrap">현재 학생 위치 대조</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-[var(--ink)] whitespace-nowrap">
                {GWANGJU_OFFICE_CONVERSION_TABLE.map((row, idx) => {
                  const isCurrent =
                    Math.abs(row.grade5 - currentSummary.weightedGpa5) < 0.08 ||
                    (row.grade5 === 1.0 && currentSummary.weightedGpa5 <= 1.05);

                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-[var(--surface-alt)] transition-colors whitespace-nowrap ${
                        isCurrent ? 'bg-[var(--accent-soft)]/70 font-extrabold text-[var(--accent)]' : idx % 2 === 1 ? 'bg-[var(--surface-alt)]/40' : ''
                      }`}
                    >
                      <td className="py-2 px-3 font-semibold text-[var(--korean)] whitespace-nowrap">
                        {row.grade5.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 font-mono whitespace-nowrap">
                        {row.cumulativeRatio.toFixed(2)}%
                      </td>
                      <td className="py-2 px-3 font-bold text-[var(--accent)] whitespace-nowrap">
                        {row.grade9Equivalent.toFixed(2)}등급
                      </td>
                      <td className="py-2 px-3 font-semibold text-[var(--ink-secondary)] whitespace-nowrap">
                        {row.grade9Grad2024?.toFixed(2)}등급
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        {isCurrent ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-0.5 rounded-full whitespace-nowrap">
                            ★ {student.name} 학생 구간 ({currentSummary.weightedGpa5}등급)
                          </span>
                        ) : (
                          <span className="text-[var(--muted)] whitespace-nowrap">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {selectedTable === 'average' && (
            <table className="w-full text-xs text-center border-collapse whitespace-nowrap min-w-[850px]">
              <thead className="bg-[var(--surface-alt)] text-[var(--ink-secondary)] font-bold sticky top-0 z-10 border-b border-[var(--border)] whitespace-nowrap">
                <tr>
                  <th className="py-2.5 px-3 whitespace-nowrap">5등급제 등급</th>
                  <th className="py-2.5 px-3 whitespace-nowrap text-[var(--ink-secondary)]">부산 (1.6만명) 9등급</th>
                  <th className="py-2.5 px-3 whitespace-nowrap text-[var(--ink-secondary)]">경기 (12과목합) 9등급</th>
                  <th className="py-2.5 px-3 whitespace-nowrap text-[var(--ink-secondary)]">광주 (고1과정) 9등급</th>
                  <th className="py-2.5 px-3 whitespace-nowrap bg-[var(--korean)]/10 text-[var(--korean)] border-x border-[var(--korean)]/25">
                    ★ 3개 교육청 통합 평균 9등급
                  </th>
                  <th className="py-2.5 px-3 whitespace-nowrap bg-[var(--korean)]/10 text-[var(--korean)] border-r border-[var(--korean)]/25">
                    평균 누적비 (%)
                  </th>
                  <th className="py-2.5 px-3 text-[var(--muted)] whitespace-nowrap">현재 학생 위치 대조</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-[var(--ink)] whitespace-nowrap">
                {AVERAGE_OFFICE_CONVERSION_TABLE.map((row, idx) => {
                  const isCurrent =
                    Math.abs(row.grade5 - currentSummary.weightedGpa5) < 0.04 ||
                    (row.grade5 === 1.0 && currentSummary.weightedGpa5 <= 1.02);

                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-[var(--surface-alt)] transition-colors whitespace-nowrap ${
                        isCurrent
                          ? 'bg-[var(--accent-soft)]/70 font-extrabold text-[var(--accent)]'
                          : idx % 2 === 1
                          ? 'bg-[var(--surface-alt)]/40'
                          : ''
                      }`}
                    >
                      <td className="py-2 px-3 font-semibold text-[var(--korean)] whitespace-nowrap">
                        {row.grade5.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-[var(--ink-secondary)] whitespace-nowrap">
                        {row.busanGrade9.toFixed(2)}등급
                        <span className="text-[10px] text-[var(--muted)] ml-1">({row.busanCumRatio.toFixed(1)}%)</span>
                      </td>
                      <td className="py-2 px-3 text-[var(--ink-secondary)] whitespace-nowrap">
                        {row.gyeonggiGrade9.toFixed(2)}등급
                        <span className="text-[10px] text-[var(--muted)] ml-1">({row.gyeonggiCumRatio.toFixed(1)}%)</span>
                      </td>
                      <td className="py-2 px-3 text-[var(--ink-secondary)] whitespace-nowrap">
                        {row.gwangjuGrade9.toFixed(2)}등급
                        <span className="text-[10px] text-[var(--muted)] ml-1">({row.gwangjuCumRatio.toFixed(1)}%)</span>
                      </td>
                      <td className="py-2 px-3 font-black text-[var(--korean)] bg-[var(--korean)]/60 border-x border-[var(--korean)]/20 whitespace-nowrap">
                        {row.avgGrade9.toFixed(2)}등급
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-[var(--korean)] bg-[var(--korean)]/60 border-r border-[var(--korean)]/20 whitespace-nowrap">
                        {row.avgCumRatio.toFixed(2)}%
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        {isCurrent ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-0.5 rounded-full whitespace-nowrap">
                            ★ {student.name} 학생 구간 ({currentSummary.weightedGpa5}등급)
                          </span>
                        ) : (
                          <span className="text-[var(--muted)] whitespace-nowrap">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Educational Office Research Key Insights Box */}
        <div className="p-4 bg-[var(--surface-alt)] border-t border-[var(--border)] space-y-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[var(--korean)]" />
            <h4 className="text-xs font-bold text-[var(--ink)]">
              시도교육청 실증 연구 핵심 공통점 및 진학 시사점
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-[var(--ink-secondary)]">
            <div className="p-3 bg-[var(--surface)] rounded-lg border border-[var(--border)] space-y-1">
              <div className="font-bold text-[var(--korean)] flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-[var(--korean)]" />
                5등급제 1.00의 누적 비율
              </div>
              <p className="text-[var(--ink-secondary)] leading-relaxed text-[11px]">
                부산(고2-1 누적) 0.68%, 경기도 1.20%, 광주(고1 누적) 2.00%로 학년이 올라갈수록 올 1등급 학생 비율이 급격히 감소(0.2~0.4% 수렴)합니다.
              </p>
            </div>

            <div className="p-3 bg-[var(--surface)] rounded-lg border border-[var(--border)] space-y-1">
              <div className="font-bold text-[var(--accent)] flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-[var(--accent)]" />
                9등급제 환산 시 실질 등급
              </div>
              <p className="text-[var(--ink-secondary)] leading-relaxed text-[11px]">
                5등급제 1.00은 기존 9등급 기준 <strong>1.28~1.51등급</strong> 수준이며, 2.00등급은 기존 <strong>3.16~3.30등급</strong> 선으로 환산됩니다.
              </p>
            </div>

            <div className="p-3 bg-[var(--surface)] rounded-lg border border-[var(--border)] space-y-1">
              <div className="font-bold text-[var(--good)] flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-[var(--good)]" />
                의약학 및 주요대 수시 지원선
              </div>
              <p className="text-[var(--ink-secondary)] leading-relaxed text-[11px]">
                한두 과목 2등급(평균 1.1~1.3 내외)이 발생하더라도 9등급제 1.4~2.1등급 수준이므로 서울 주요대 및 지역인재 의약학 계열 지원이 충분히 가능합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
