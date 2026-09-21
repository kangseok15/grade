import React from 'react';
import { ExamRecord, SubjectKey } from '../types';
import { SUBJECTS, subjectDisplayName } from '../data/mockData';
import { fmt1, gradeColor, prevExamFor } from '../utils/analysis';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface OverviewCardsProps {
  currentExam: ExamRecord | undefined;
  exams: ExamRecord[];
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ currentExam, exams }) => {
  if (!currentExam) {
    return (
      <div className="p-8 text-center bg-[var(--surface)] border border-[var(--border)] rounded-2xl text-[var(--muted)]">
        성적 데이터가 없습니다. 아래에서 새 성적표를 추가해 주세요.
      </div>
    );
  }

  const prevExam = prevExamFor(exams, currentExam);

  return (
    <section className="mb-10" id="overview">
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-serif-kr font-bold text-[var(--ink)]">과목별 현재 성적</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {SUBJECTS.map((s) => {
          const data = currentExam.subjects[s.key as SubjectKey];
          if (!data) return null;

          const prevData = prevExam?.subjects[s.key as SubjectKey];
          let deltaInfo: { type: 'up' | 'down' | 'flat'; text: string } | null = null;

          if (prevData) {
            const diff = prevData.grade - data.grade; // positive = grade number reduced = improved
            if (diff > 0) {
              deltaInfo = { type: 'up', text: `▲ ${diff}등급` };
            } else if (diff < 0) {
              deltaInfo = { type: 'down', text: `▼ ${Math.abs(diff)}등급` };
            } else {
              deltaInfo = { type: 'flat', text: '동일' };
            }
          }

          return (
            <div
              key={s.key}
              className="bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-strong)] rounded-xl p-3 sm:p-3.5 shadow-[var(--shadow)] transition-all flex flex-col justify-between relative overflow-hidden"
              style={{ borderTop: `3px solid ${s.color}` }}
            >
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <h3 className="text-xs sm:text-[13px] font-bold text-[var(--ink)] truncate" title={subjectDisplayName(s, data)}>
                    {subjectDisplayName(s, data)}
                  </h3>
                </div>

                <div className="flex items-baseline justify-between gap-1.5 my-1">
                  <div className="flex items-baseline gap-1 shrink-0">
                    <span
                      className="text-2xl sm:text-3xl font-serif-kr font-bold num leading-none"
                      style={{ color: gradeColor(data.grade) }}
                    >
                      {data.grade}
                    </span>
                    <span className="text-xs text-[var(--muted)] font-medium whitespace-nowrap">등급</span>
                  </div>

                  {deltaInfo && (
                    <span
                      className={`text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-0.5 whitespace-nowrap shrink-0 ${
                        deltaInfo.type === 'up'
                          ? 'text-[var(--good)] bg-green-500/10'
                          : deltaInfo.type === 'down'
                          ? 'text-[var(--critical)] bg-red-500/10'
                          : 'text-[var(--muted)] bg-[var(--surface-alt)]'
                      }`}
                    >
                      {deltaInfo.type === 'up' && <TrendingUp className="w-3 h-3 shrink-0" />}
                      {deltaInfo.type === 'down' && <TrendingDown className="w-3 h-3 shrink-0" />}
                      {deltaInfo.type === 'flat' && <Minus className="w-3 h-3 shrink-0" />}
                      <span className="whitespace-nowrap">{deltaInfo.text}</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-[var(--border)] text-[11.5px] sm:text-xs space-y-1">
                <div className="flex justify-between items-center text-[var(--muted)]">
                  <span className="whitespace-nowrap">원점수</span>
                  <b className="text-[var(--ink-secondary)] font-semibold num whitespace-nowrap">
                    {data.raw != null ? `${data.raw} / ${data.rawMax}` : <span className="text-[var(--muted)] font-normal text-[11px]">일람표 미기재</span>}
                  </b>
                </div>

                {/* 표준점수 & 백분위: 영어와 한국사는 절대평가로 제외 */}
                {s.hasPct && data.standard != null && (
                  <div className="flex justify-between items-center text-[var(--muted)]">
                    <span className="whitespace-nowrap">표준점수</span>
                    <b className="text-[var(--ink-secondary)] font-semibold num whitespace-nowrap">{data.standard}</b>
                  </div>
                )}

                {s.hasPct && data.percentile != null && (
                  <div className="flex justify-between items-center text-[var(--muted)]">
                    <span className="whitespace-nowrap">백분위</span>
                    <b className="text-[var(--ink-secondary)] font-semibold num whitespace-nowrap">
                      {fmt1(data.percentile)}
                    </b>
                  </div>
                )}

                {!s.hasPct && (
                  <div className="flex justify-between items-center text-[var(--muted)] text-[11px] pt-0.5">
                    <span className="shrink-0 whitespace-nowrap">평가</span>
                    <span className="text-[var(--muted)] font-medium whitespace-nowrap">9등급 절대평가</span>
                  </div>
                )}

                {data.schoolRank && (
                  <div className="flex justify-between items-center text-[var(--muted)]">
                    <span className="whitespace-nowrap">학교석차</span>
                    <b className="text-[var(--ink-secondary)] font-semibold num whitespace-nowrap">{data.schoolRank}</b>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
