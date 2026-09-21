import React, { useState, useEffect } from 'react';
import { ExamRecord, Student, AIReportEntry, SubjectKey } from '../types';
import { SUBJ_BY_KEY, subjectDisplayName } from '../data/mockData';
import { buildAiPrompt, prevExamFor, subjectCompare, fmt1, generateDeterministicConsultingReport } from '../utils/analysis';
import { Sparkles, Copy, RefreshCw, AlertTriangle, Check, FileDown, Image as ImageIcon, FileQuestion } from 'lucide-react';
import { exportAiReportToPdf, exportAiReportToImage } from '../utils/exportReport';

interface AIReportSectionProps {
  currentStudent: Student;
  currentExam: ExamRecord | undefined;
  exams: ExamRecord[];
  aiReport: AIReportEntry | undefined;
  onUpdateReport: (report: AIReportEntry, targetKey?: string) => void;
}

export const AIReportSection: React.FC<AIReportSectionProps> = ({
  currentStudent,
  currentExam,
  exams,
  aiReport,
  onUpdateReport,
}) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [exportStatusMsg, setExportStatusMsg] = useState('');
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  const prevExam = currentExam ? prevExamFor(exams, currentExam) : undefined;
  const currentKey = currentExam ? `${currentStudent.name}__${currentExam.id}` : '';

  // Default deterministic report derived from verified student score data and blueprint:
  const defaultReportSubjects = React.useMemo(() => {
    if (!currentExam) return [];
    return generateDeterministicConsultingReport(currentStudent, currentExam, prevExam);
  }, [currentStudent, currentExam, prevExam]);

  // Active report subjects: user-generated or deterministic fallback
  const reportSubjects =
    aiReport?.subjects && aiReport.subjects.length > 0
      ? aiReport.subjects
      : defaultReportSubjects;

  // Generate consulting report via server-side Gemini API
  const handleGenerate = async (force: boolean = false) => {
    if (!currentExam) return;
    const targetKey = `${currentStudent.name}__${currentExam.id}`;
    onUpdateReport({ status: 'loading' }, targetKey);
    setExportError(null);

    try {
      const prompt = buildAiPrompt(currentStudent, currentExam, prevExam, exams);

      const res = await fetch('/api/ai-consulting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          student: currentStudent,
          exam: currentExam,
          prevExam,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        let rawErr = errJson.error || `서버 에러 (${res.status})`;
        // Clean JSON strings if raw JSON was returned
        if (typeof rawErr === 'string' && rawErr.trim().startsWith('{')) {
          try {
            const parsed = JSON.parse(rawErr);
            rawErr = parsed?.error?.message || parsed?.message || rawErr;
          } catch {}
        }
        throw new Error(rawErr);
      }

      const json = await res.json();
      if (!json.success || !Array.isArray(json.data)) {
        throw new Error('리포트 데이터 형식이 올바르지 않습니다.');
      }

      onUpdateReport(
        {
          status: 'done',
          subjects: json.data,
          generatedAt: new Date().toISOString(),
        },
        targetKey
      );
    } catch (err: any) {
      console.error('AI Consulting generation error:', err);
      let errMsg = err.message || '리포트 생성 중 오류가 발생했습니다. 다시 시도해 주세요.';
      if (errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE')) {
        errMsg = '일시적인 AI 서버 트래픽 급증이 감지되었습니다. 잠시 후 [다시 생성]을 눌러주세요.';
      }
      onUpdateReport(
        {
          status: 'error',
          message: errMsg,
          subjects: defaultReportSubjects,
        },
        targetKey
      );
    }
  };

  // Automatically initialize default pedagogical report on student/exam selection
  useEffect(() => {
    if (!currentExam || !currentKey) return;
    if (aiReport?.status === 'done') return;
    if (!aiReport || aiReport.status === 'idle') {
      onUpdateReport(
        {
          status: 'done',
          subjects: defaultReportSubjects,
          generatedAt: new Date().toISOString(),
        },
        currentKey
      );
    }
  }, [currentStudent.name, currentExam?.id, aiReport?.status, defaultReportSubjects, currentKey]);

  if (!currentExam) return null;

  const hasAnyWeakItems = Object.values(currentExam.weakItems || {}).some(
    (arr) => Array.isArray(arr) && arr.length > 0
  );

  // Copy text to clipboard in exact format requested by user
  const handleCopy = () => {
    if (!reportSubjects || reportSubjects.length === 0) return;

    const lines: string[] = [];
    reportSubjects.forEach((item, idx) => {
      if (item.headline) {
        lines.push(item.headline);
      } else {
        const subj = SUBJ_BY_KEY[item.subjectKey as SubjectKey];
        const subjData = currentExam.subjects[item.subjectKey as SubjectKey];
        const title = subj ? subjectDisplayName(subj, subjData) : item.subjectKey;
        lines.push(`${idx + 1}. ${title} 영역`);
      }

      if (item.bullets && item.bullets.length > 0) {
        item.bullets.forEach((b) => lines.push(`- ${b}`));
      }
      lines.push('');
    });

    navigator.clipboard.writeText(lines.join('\n').trim()).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    });
  };

  // Export as A4 PDF using robust exportAiReportToPdf
  const handlePdfExport = async () => {
    const reportElement = document.getElementById('ai-report-printable');
    if (!reportElement || isExportingPdf) return;

    try {
      setIsExportingPdf(true);
      setExportError(null);
      await exportAiReportToPdf(
        reportElement,
        currentStudent.name,
        currentExam.label,
        (progress) => {
          setExportStatusMsg(progress.message);
        }
      );
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error: any) {
      console.error('PDF Export Error:', error);
      setExportError('PDF 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsExportingPdf(false);
      setExportStatusMsg('');
    }
  };

  // Export as PNG Image
  const handleImageExport = async () => {
    const reportElement = document.getElementById('ai-report-printable');
    if (!reportElement || isExportingImage) return;

    try {
      setIsExportingImage(true);
      setExportError(null);
      await exportAiReportToImage(
        reportElement,
        currentStudent.name,
        currentExam.label,
        (progress) => {
          setExportStatusMsg(progress.message);
        }
      );
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error: any) {
      console.error('Image Export Error:', error);
      setExportError('이미지 저장 중 오류가 발생했습니다.');
    } finally {
      setIsExportingImage(false);
      setExportStatusMsg('');
    }
  };

  return (
    <section className="mb-2" id="aiReport">
      <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-xs text-slate-900">
        {/* Header Action Row (Excluded from export/print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 no-print no-export">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>
              {hasAnyWeakItems
                ? '지난 회차 대비 변화, 세부영역 배점 대비 득점률, 2회 연속 오답 문항을 종합 진단합니다.'
                : '문항별 정오답표 미제공 회차는 공인 등급·표준점수·백분위 지표를 기반으로 수능 맞춤 학업 전략을 수립합니다.'}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
              <Check className="w-3 h-3" />
              실제 성적 기반 진단
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              title="예시 서식대로 텍스트 전체 복사"
            >
              {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              {copySuccess ? '복사 완료' : '텍스트 복사'}
            </button>

            <button
              type="button"
              onClick={handlePdfExport}
              disabled={isExportingPdf || isExportingImage}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
              title="이 리포트 페이지만 단독으로 PDF 저장합니다."
            >
              <FileDown className="w-3.5 h-3.5" />
              {isExportingPdf ? (exportStatusMsg || 'PDF 생성 중...') : '단독 PDF'}
            </button>

            <button
              type="button"
              onClick={() => handleGenerate(true)}
              disabled={aiReport?.status === 'loading'}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer disabled:opacity-50"
              title="현재 성적 데이터로 리포트를 다시 분석하고 저장합니다."
            >
              {aiReport?.status === 'loading' ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              )}
              {aiReport?.status === 'done' ? '모의고사 분석 리포트 다시 생성' : '모의고사 분석 리포트 생성'}
            </button>
          </div>
        </div>

        {/* Export Notification / Success Banner */}
        {exportSuccess && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-medium flex items-center gap-2 no-print no-export">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>모의고사 분석 리포트 파일 저장이 완료되었습니다!</span>
          </div>
        )}

        {exportError && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-300 text-red-800 text-xs font-medium flex items-center gap-2 no-print no-export">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{exportError}</span>
          </div>
        )}

        {/* Status Notifications */}
        {aiReport?.status === 'loading' && (
          <div className="py-4 px-4 my-3 bg-blue-50/70 border border-blue-200 rounded-xl text-center text-slate-600 text-xs flex items-center justify-center gap-2 no-print no-export">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
            <span>AI 모델이 추가 학습 조언을 심층 작성 중입니다...</span>
          </div>
        )}

        {aiReport?.status === 'error' && (
          <div className="my-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2 no-print no-export">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{aiReport.message} (기본 맞춤 전략 리포트로 정상 표시됩니다)</span>
          </div>
        )}

        {/* Printable AI Report Content - Always rendered so it is never missing on PDF export */}
        {reportSubjects && reportSubjects.length > 0 && (
          <div
            id="ai-report-printable"
            className="mt-4 space-y-6 bg-white p-6 sm:p-8 rounded-xl border border-slate-200"
          >
            <div className="border-b pb-4 border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold text-blue-600 tracking-wider uppercase">
                  MOCK EXAM ANALYSIS REPORT
                </span>
                <h3 className="text-lg font-serif-kr font-bold text-slate-900 mt-0.5">
                  {currentStudent.name} 학생 모의고사 분석 리포트
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  기준: {currentExam.label} ({currentExam.examDate}) ·{' '}
                  {currentStudent.school || '숭신고등학교'} {currentStudent.grade}학년 {currentStudent.class ? `${currentStudent.class}반 ` : ''}{currentStudent.number ? `${currentStudent.number}번` : ''}
                </p>
              </div>
              <div className="text-right text-[11px] text-slate-500 font-medium">
                숭신고등학교 미래인재반 진로진학상담부
              </div>
            </div>

            {!hasAnyWeakItems && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 flex items-start gap-2.5">
                <FileQuestion className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">※ 문항별 정오답표 미기재 회차 안내</p>
                  <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                    해당 시험(수능 모의평가 등)은 문항별 정오답표(보충학습 필요 문항)가 제공되지 않는 회차이므로, 실제 성적표의 과목별 표준점수, 백분위, 등급 및 선택과목 지표만을 바탕으로 영역별 성취도 진단 및 수능 대비 실전 로드맵을 수립하였습니다.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {reportSubjects.map((item, idx) => {
                const subj = SUBJ_BY_KEY[item.subjectKey as SubjectKey];
                const subjData = currentExam.subjects[item.subjectKey as SubjectKey];
                const displayName = subj ? subjectDisplayName(subj, subjData) : item.subjectKey;
                const cmp = subjectCompare(currentExam, prevExam, item.subjectKey as SubjectKey);

                return (
                  <div
                    key={item.subjectKey}
                    className="border-l-4 pl-4 py-2 bg-slate-50/60 rounded-r-lg"
                    style={{ borderColor: subj?.color || '#2563eb' }}
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span
                        className="px-2 py-0.5 rounded text-[11px] font-bold tracking-wide whitespace-nowrap shrink-0"
                        style={{
                          backgroundColor: `${subj?.color || '#2563eb'}18`,
                          color: subj?.color || '#2563eb',
                        }}
                      >
                        {displayName}
                      </span>

                      {/* Previous Exam Comparison Pill */}
                      {cmp && (
                        <div className="comparison-pill flex flex-nowrap items-center gap-2 text-[11px] text-slate-600 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0 overflow-visible">
                          <span className="whitespace-nowrap inline-flex items-center gap-1 shrink-0">
                            <span className="whitespace-nowrap">지난 회차 대비:</span>
                            <b
                              className={`font-semibold whitespace-nowrap shrink-0 ${
                                cmp.gradeDelta > 0
                                  ? 'text-emerald-600'
                                  : cmp.gradeDelta < 0
                                  ? 'text-rose-600'
                                  : 'text-slate-600'
                              }`}
                            >
                              {cmp.gradeDelta > 0
                                ? `▲ ${cmp.gradeDelta}등급 상승`
                                : cmp.gradeDelta < 0
                                ? `▼ ${Math.abs(cmp.gradeDelta)}등급 하락`
                                : '동일 등급 유지'}
                            </b>
                          </span>

                          {cmp.pctDelta != null && (
                            <span className="whitespace-nowrap inline-flex items-center gap-0.5 shrink-0">
                              (백분위{' '}
                              <b className="text-slate-900 num whitespace-nowrap">
                                {cmp.pctDelta >= 0 ? '+' : ''}
                                {fmt1(cmp.pctDelta)}%p
                              </b>
                              )
                            </span>
                          )}

                          {cmp.repeated.length > 0 && (
                            <span className="text-rose-600 font-bold whitespace-nowrap shrink-0">
                              · 2회 연속 오답: {cmp.repeated.join(', ')}번
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Headline formatted like 1. 국어 영역 (2등급 / 백분위 93.12) */}
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-2 font-sans-kr leading-snug whitespace-nowrap report-heading">
                      {item.headline || `${idx + 1}. ${displayName} 영역`}
                    </h4>

                    {/* Bullet Points with '-' prefix */}
                    <ul className="space-y-2 text-xs md:text-[13px] leading-relaxed text-slate-700">
                      {item.bullets.map((b, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2">
                          <span className="font-bold text-slate-400 shrink-0 select-none">-</span>
                          <span className="flex-1">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-200 text-right text-xs text-slate-500 font-medium">
              작성자 : 숭신고등학교 미래인재반 진로진학상담부
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
