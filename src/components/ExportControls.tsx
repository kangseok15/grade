import React, { useState, useRef } from 'react';
import {
  FileDown,
  Image,
  Printer,
  Loader2,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Copy,
  X,
  Download,
  AlertCircle,
  Users,
  StopCircle,
} from 'lucide-react';
import {
  exportReportToPdf,
  exportPageToImage,
  exportBothPagesToImages,
  copyDataUrlToClipboard,
  createA4Pdf,
  appendReportPagesToPdf,
  triggerFileDownload,
  sanitizeFileName,
  ExportProgress,
  ExportResult,
} from '../utils/exportReport';
import { Student } from '../types';

interface ExportControlsProps {
  page1Id?: string;
  page2Id?: string;
  page3Id?: string;
  studentName: string;
  examLabel: string;
  currentGrade?: string;
  students?: Student[];
  onSwitchStudent?: (studentName: string) => void;
}

export const ExportControls: React.FC<ExportControlsProps> = ({
  page1Id = 'report-page-1',
  page2Id = 'report-page-2',
  page3Id = 'report-page-3',
  studentName,
  examLabel,
  currentGrade = '1',
  students = [],
  onSwitchStudent,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printError, setPrintError] = useState<string | null>(null);

  // Batch Export State
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchGrade, setBatchGrade] = useState<string>(currentGrade);
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{
    current: number;
    total: number;
    studentName: string;
    percent: number;
    status: string;
    isDone?: boolean;
    fileName?: string;
  } | null>(null);
  const cancelBatchRef = useRef<boolean>(false);

  const getElements = () => {
    const p1 = document.getElementById(page1Id);
    const p2 = document.getElementById(page2Id);
    const p3 = page3Id ? document.getElementById(page3Id) : null;
    if (!p1 || !p2) {
      setProgress({
        status: 'error',
        message: '성적 분석표 요소를 화면에서 찾을 수 없습니다.',
      });
      return null;
    }
    return { p1, p2, p3 };
  };

  const handlePdfExport = async () => {
    const els = getElements();
    if (!els) return;
    setIsExporting(true);
    setProgress({ status: 'capturing_page1', message: 'PDF 문서 생성 준비 중...' });
    try {
      const result = await exportReportToPdf(els.p1, els.p2, els.p3, studentName, examLabel, (p) => setProgress(p));
      setExportResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSingleImageExport = async (page: 1 | 2 | 3) => {
    const els = getElements();
    if (!els) return;
    const targetEl = page === 1 ? els.p1 : page === 2 ? els.p2 : els.p3;
    if (!targetEl) {
      setProgress({
        status: 'error',
        message: `${page}페이지 요소를 화면에서 찾을 수 없습니다.`,
      });
      return;
    }
    setIsMenuOpen(false);
    setIsExporting(true);
    try {
      const result = await exportPageToImage(targetEl, studentName, examLabel, page, (p) => setProgress(p));
      setExportResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleBatchImageExport = async () => {
    const els = getElements();
    if (!els) return;
    setIsMenuOpen(false);
    setIsExporting(true);
    try {
      const result = await exportBothPagesToImages(els.p1, els.p2, els.p3, studentName, examLabel, (p) => setProgress(p));
      setExportResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    try {
      // In sandboxed iframes (e.g. AI Studio preview), window.print() can be blocked
      const isIframe = window.self !== window.top;
      if (isIframe) {
        // Still try calling window.print()
        try {
          window.print();
        } catch {
          // If browser throws sandboxed iframe error, show modal
          setShowPrintModal(true);
          return;
        }
        // Also open helpful guidance modal so users know how to get pristine A4 print
        setShowPrintModal(true);
      } else {
        window.print();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn('Print error:', message);
      setPrintError(message);
      setShowPrintModal(true);
    }
  };

  const handleCopyImage = async (dataUrl: string, label: string) => {
    const success = await copyDataUrlToClipboard(dataUrl);
    if (success) {
      setCopyStatus(`${label} 복사 완료! 한글(HWP)이나 메신저에 Ctrl+V로 붙여넣기 하세요.`);
    } else {
      setCopyStatus('클립보드 복사를 지원하지 않는 브라우저입니다. 다운로드 버튼을 이용해주세요.');
    }
    setTimeout(() => setCopyStatus(null), 3000);
  };

  const handleCancelBatch = () => {
    cancelBatchRef.current = true;
    setIsBatchRunning(false);
  };

  const handleStartBatchExport = async (targetGrade: string) => {
    const allGradeStudents = students.filter((s) => s.grade === targetGrade);
    if (allGradeStudents.length === 0) {
      alert(`${targetGrade}학년에 등록된 학생이 없습니다.`);
      return;
    }

    const targetStudents: Student[] = allGradeStudents;

    cancelBatchRef.current = false;
    setIsBatchRunning(true);
    setBatchProgress({
      current: 0,
      total: targetStudents.length,
      studentName: targetStudents[0]?.name || '',
      percent: 0,
      status: `일괄 PDF 생성 준비 중 (${targetGrade}학년 전체 ${targetStudents.length}명)...`,
    });

    const pdf = createA4Pdf();

    try {
      for (let i = 0; i < targetStudents.length; i++) {
        if (cancelBatchRef.current) {
          break;
        }

        const st = targetStudents[i];
        setBatchProgress({
          current: i + 1,
          total: targetStudents.length,
          studentName: st.name,
          percent: Math.round((i / targetStudents.length) * 100),
          status: `${st.name} 학생 (제${st.grade}학년) 3페이지 렌더링 중...`,
        });

        // Switch student so DOM reflects their records
        if (onSwitchStudent) {
          onSwitchStudent(st.name);
        }

        // Allow React state update and charts layout
        await new Promise((resolve) => setTimeout(resolve, 520));
        await new Promise((resolve) => requestAnimationFrame(resolve));

        if (cancelBatchRef.current) break;

        const p1 = document.getElementById(page1Id);
        const p2 = document.getElementById(page2Id);
        const p3 = page3Id ? document.getElementById(page3Id) : null;

        if (p1 && p2) {
          await appendReportPagesToPdf(pdf, p1, p2, p3, i === 0);
        }

        // Brief cooldown to yield main thread for garbage collection
        await new Promise((resolve) => setTimeout(resolve, 120));
      }

      if (!cancelBatchRef.current) {
        setBatchProgress({
          current: targetStudents.length,
          total: targetStudents.length,
          studentName: '전체 완료',
          percent: 100,
          status: 'PDF 문서 패키징 및 다운로드 준비 중...',
        });

        const safeExam = sanitizeFileName(examLabel || '모의고사');
        const fileName = `[숭신고_미래인재반]_${targetGrade}학년_${safeExam}_성적분석표(${targetStudents.length}명_${targetStudents.length * 3}쪽).pdf`;
        const blob = pdf.output('blob');
        const blobUrl = URL.createObjectURL(blob);
        triggerFileDownload(blobUrl, fileName);

        setBatchProgress({
          current: targetStudents.length,
          total: targetStudents.length,
          studentName: '다운로드 완료',
          percent: 100,
          status: `${targetGrade}학년 전체 (총 ${targetStudents.length * 3}쪽) 통합 PDF 생성이 완료되었습니다!`,
          isDone: true,
          fileName,
        });
      }
    } catch (err) {
      console.error('Batch PDF Export Error:', err);
      alert('일괄 PDF 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsBatchRunning(false);
    }
  };

  // Safe new-tab URL with print trigger parameter
  const printUrl = (() => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('print', 'true');
      return url.toString();
    } catch {
      return window.location.href;
    }
  })();

  return (
    <div className="relative no-print">
      {/* Top Banner / Export Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--surface-alt)] border border-[var(--border)] rounded-xl px-4 py-2.5 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--good)] animate-pulse" />
          <span className="text-xs font-semibold text-[var(--ink)]">
            성적표 저장 & 인쇄
          </span>
          <span className="hidden sm:inline-block text-[11px] text-[var(--muted)]">
            · 1면(성적 추이) & 2면(세부영역 및 오답) & 3면(모의고사 분석 리포트) A4 규격
          </span>
        </div>

        <div className="flex items-center gap-2 relative">
          {/* Batch PDF Download Button */}
          {students.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setBatchGrade(currentGrade);
                setShowBatchModal(true);
              }}
              disabled={isExporting || isBatchRunning}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[var(--accent)] bg-[var(--surface)] border border-[var(--accent)]/30 hover:bg-[var(--accent-soft)] active:scale-98 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              title="선택한 학년 전체 학생의 성적표를 묶어 45쪽 단일 PDF로 일괄 생성합니다."
            >
              <Users className="w-3.5 h-3.5" />
              <span>학년 일괄 PDF</span>
              <span className="text-[10px] font-semibold opacity-90 px-1 py-0.2 bg-[var(--accent)]/10 rounded">
                15명
              </span>
            </button>
          )}

          {/* PDF Download Button */}
          <button
            type="button"
            onClick={handlePdfExport}
            disabled={isExporting || isBatchRunning}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-[var(--accent)] hover:opacity-90 active:scale-98 transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title="1페이지, 2페이지, 3페이지(모의고사 분석 리포트)를 묶어 3페이지 완성형 A4 PDF로 다운로드합니다."
          >
            {isExporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileDown className="w-3.5 h-3.5" />
            )}
            <span>PDF로 저장</span>
            <span className="text-[10px] font-normal opacity-90 px-1 py-0.2 bg-black/20 rounded">
              3페이지
            </span>
          </button>

          {/* Image Download Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--ink)] bg-[var(--surface)] border border-[var(--border-strong)] hover:bg-[var(--surface-alt)] active:scale-98 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="고해상도 PNG 이미지로 저장합니다."
            >
              <Image className="w-3.5 h-3.5 text-[var(--ink-secondary)]" />
              <span>이미지로 저장</span>
              <ChevronDown className={`w-3 h-3 text-[var(--muted)] transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-68 bg-[var(--surface)] border border-[var(--border-strong)] rounded-xl shadow-lg p-1.5 z-30 text-xs text-[var(--ink)] space-y-1">
                  <div className="px-2.5 py-1 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
                    이미지(PNG) 다운로드 선택
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSingleImageExport(1)}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-[var(--surface-alt)] flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-[var(--ink)]">1페이지 이미지 저장</div>
                      <div className="text-[10px] text-[var(--muted)]">성적 개요 + 회차별 성적 추이</div>
                    </div>
                    <span className="text-[10px] font-medium bg-[var(--surface-alt)] px-1.5 py-0.5 rounded text-[var(--ink-secondary)]">PNG</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSingleImageExport(2)}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-[var(--surface-alt)] flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-[var(--ink)]">2페이지 이미지 저장</div>
                      <div className="text-[10px] text-[var(--muted)]">세부영역 득점률 + 오답 문항 분석</div>
                    </div>
                    <span className="text-[10px] font-medium bg-[var(--surface-alt)] px-1.5 py-0.5 rounded text-[var(--ink-secondary)]">PNG</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSingleImageExport(3)}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-[var(--surface-alt)] flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-[var(--ink)]">3페이지 이미지 저장</div>
                      <div className="text-[10px] text-[var(--muted)]">모의고사 분석 리포트 (과목별 전략)</div>
                    </div>
                    <span className="text-[10px] font-medium bg-[var(--surface-alt)] px-1.5 py-0.5 rounded text-[var(--ink-secondary)]">PNG</span>
                  </button>

                  <div className="h-px bg-[var(--border)] my-1" />

                  <button
                    type="button"
                    onClick={handleBatchImageExport}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-[var(--surface-alt)] flex items-center justify-between text-[var(--accent)] font-semibold transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>1·2·3페이지 모두 다운로드</span>
                    </div>
                    <span className="text-[10px] font-normal text-[var(--muted)]">3장 일괄</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Direct Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            title="성적표를 A4 규격으로 인쇄합니다."
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:bg-[var(--surface-alt)] active:scale-98 transition-colors cursor-pointer text-xs font-semibold"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">인쇄</span>
          </button>

          {/* Open in New Window Link (Guaranteed Print/Download Full Tab) */}
          <a
            href={printUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="브라우저 새 창에서 전체 화면으로 열기 (인쇄 및 저장 권장)"
            className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:bg-[var(--surface-alt)] transition-colors inline-flex items-center justify-center text-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Progress Floating Toast */}
      {progress && progress.status !== 'idle' && (
        <div className="mt-2 flex items-center justify-between gap-2.5 px-4 py-2.5 bg-[var(--surface)] border border-[var(--border-strong)] rounded-lg shadow-sm text-xs transition-all animate-fade-in">
          <div className="flex items-center gap-2">
            {progress.status === 'done' ? (
              <CheckCircle2 className="w-4 h-4 text-[var(--good)] shrink-0" />
            ) : progress.status === 'error' ? (
              <AlertCircle className="w-4 h-4 text-[var(--critical)] shrink-0" />
            ) : (
              <Loader2 className="w-4 h-4 text-[var(--accent)] animate-spin shrink-0" />
            )}
            <span className={`font-medium ${progress.status === 'error' ? 'text-[var(--critical)]' : 'text-[var(--ink)]'}`}>
              {progress.message}
            </span>
          </div>

          {progress.status === 'done' && (
            <button
              type="button"
              onClick={() => setProgress(null)}
              className="text-[var(--muted)] hover:text-[var(--ink)] p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📥 내보내기 완료 & 미리보기 모달 (브라우저 차단/샌드박스 완벽 대비)             */}
      {/* ========================================================================= */}
      {exportResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-[var(--surface)] border border-[var(--border-strong)] rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-alt)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[var(--good)]/15 text-[var(--good)] flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[var(--ink)]">
                    성적 분석표 저장이 완료되었습니다!
                  </h3>
                  <p className="text-xs text-[var(--muted)]">
                    자동 다운로드가 되지 않은 경우 아래 버튼을 직접 클릭하시거나 이미지를 복사/저장하세요.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setExportResult(null)}
                className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-6">
              {copyStatus && (
                <div className="p-3 rounded-lg bg-[var(--good)]/10 border border-[var(--good)]/30 text-xs font-semibold text-[var(--good)] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{copyStatus}</span>
                </div>
              )}

              {/* Direct Download Action Strip */}
              <div className="p-4 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)] space-y-3">
                <div className="text-xs font-bold text-[var(--ink)]">
                  파일 직접 다운로드:
                </div>
                <div className="flex flex-wrap gap-2">
                  {exportResult.pdfBlobUrl && (
                    <a
                      href={exportResult.pdfBlobUrl}
                      download={exportResult.fileName}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-xs font-bold shadow-xs hover:opacity-90 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>PDF 파일 다운로드</span>
                    </a>
                  )}

                  {exportResult.page1DataUrl && (
                    <a
                      href={exportResult.page1DataUrl}
                      download={`[숭신고_미래인재반]_${studentName}_1페이지.png`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border-strong)] text-[var(--ink)] text-xs font-semibold hover:bg-[var(--surface-alt)] transition-all"
                    >
                      <Download className="w-3.5 h-3.5 text-[var(--muted)]" />
                      <span>1페이지 PNG 다운로드</span>
                    </a>
                  )}

                  {exportResult.page2DataUrl && (
                    <a
                      href={exportResult.page2DataUrl}
                      download={`[숭신고_미래인재반]_${studentName}_2페이지.png`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border-strong)] text-[var(--ink)] text-xs font-semibold hover:bg-[var(--surface-alt)] transition-all"
                    >
                      <Download className="w-3.5 h-3.5 text-[var(--muted)]" />
                      <span>2페이지 PNG 다운로드</span>
                    </a>
                  )}

                  {exportResult.page3DataUrl && (
                    <a
                      href={exportResult.page3DataUrl}
                      download={`[숭신고_미래인재반]_${studentName}_3페이지.png`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border-strong)] text-[var(--ink)] text-xs font-semibold hover:bg-[var(--surface-alt)] transition-all"
                    >
                      <Download className="w-3.5 h-3.5 text-[var(--muted)]" />
                      <span>3페이지 PNG 다운로드</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Image Previews & Quick Copy */}
              <div className="space-y-4">
                <div className="text-xs font-bold text-[var(--ink)] flex items-center justify-between">
                  <span>생성된 성적표 미리보기 및 클립보드 복사:</span>
                  <span className="text-[11px] font-normal text-[var(--muted)]">
                    마우스 우클릭으로도 저장 가능
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {exportResult.page1DataUrl && (
                    <div className="border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--surface-alt)]">
                      <div className="p-2 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface)] text-[11px] font-semibold text-[var(--ink)]">
                        <span>제1면 (성적 추이)</span>
                        <button
                          type="button"
                          onClick={() => handleCopyImage(exportResult.page1DataUrl!, '1페이지')}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-[var(--border)] text-[10px] text-[var(--accent)] hover:bg-[var(--surface-alt)] transition-colors cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>복사</span>
                        </button>
                      </div>
                      <div className="p-2 bg-white max-h-64 overflow-hidden flex items-center justify-center">
                        <img
                          src={exportResult.page1DataUrl}
                          alt="1페이지 성적표 미리보기"
                          className="w-full object-contain rounded shadow-xs"
                        />
                      </div>
                    </div>
                  )}

                  {exportResult.page2DataUrl && (
                    <div className="border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--surface-alt)]">
                      <div className="p-2 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface)] text-[11px] font-semibold text-[var(--ink)]">
                        <span>제2면 (세부영역 및 오답)</span>
                        <button
                          type="button"
                          onClick={() => handleCopyImage(exportResult.page2DataUrl!, '2페이지')}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-[var(--border)] text-[10px] text-[var(--accent)] hover:bg-[var(--surface-alt)] transition-colors cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>복사</span>
                        </button>
                      </div>
                      <div className="p-2 bg-white max-h-64 overflow-hidden flex items-center justify-center">
                        <img
                          src={exportResult.page2DataUrl}
                          alt="2페이지 성적표 미리보기"
                          className="w-full object-contain rounded shadow-xs"
                        />
                      </div>
                    </div>
                  )}

                  {exportResult.page3DataUrl && (
                    <div className="border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--surface-alt)]">
                      <div className="p-2 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface)] text-[11px] font-semibold text-[var(--ink)]">
                        <span>제3면 (모의고사 리포트)</span>
                        <button
                          type="button"
                          onClick={() => handleCopyImage(exportResult.page3DataUrl!, '3페이지')}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-[var(--border)] text-[10px] text-[var(--accent)] hover:bg-[var(--surface-alt)] transition-colors cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>복사</span>
                        </button>
                      </div>
                      <div className="p-2 bg-white max-h-64 overflow-hidden flex items-center justify-center">
                        <img
                          src={exportResult.page3DataUrl}
                          alt="3페이지 성적표 미리보기"
                          className="w-full object-contain rounded shadow-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-alt)] flex items-center justify-end">
              <button
                type="button"
                onClick={() => setExportResult(null)}
                className="px-4 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border-strong)] text-xs font-semibold text-[var(--ink)] hover:bg-[var(--surface-alt)] transition-colors cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🖨️ 인쇄 안내 모달 (iframe 제한 완벽 대응)                                  */}
      {/* ========================================================================= */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-[var(--surface)] border border-[var(--border-strong)] rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center font-bold">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--ink)] font-serif-kr">
                    성적표 인쇄 안내
                  </h3>
                  <span className="text-xs text-[var(--muted)]">
                    숭신고 미래인재반 모의고사 성적 심층 분석표 (A4 2페이지)
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowPrintModal(false);
                  setPrintError(null);
                }}
                className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[var(--ink-secondary)] leading-relaxed">
              <div className="p-3.5 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)] space-y-2">
                <p className="font-semibold text-[var(--ink)]">
                  💡 미리보기(iframe) 환경에서 인쇄가 열리지 않으셨나요?
                </p>
                <p>
                  브라우저의 보안 정책으로 인해 작은 창(iframe) 내부에서는 인쇄 대화상자가 차단될 수 있습니다. 아래 <strong>[새 창에서 열어 인쇄하기]</strong> 버튼을 누르시면 온전한 전체 창에서 즉시 인쇄(Ctrl+P)하실 수 있습니다.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[11px] space-y-1.5">
                <div className="font-bold text-[var(--ink)]">인쇄 최적화 설정 안내:</div>
                <div>• 용지 방향: <strong>세로 (Portrait)</strong></div>
                <div>• 여백: <strong>기본</strong> 또는 <strong>최소</strong></div>
                <div>• 옵션: <strong>배경 그래픽 인쇄(Background graphics) 체크</strong> (차트 및 등급 색상 정상 출력)</div>
              </div>

              {printError && (
                <div className="text-[11px] text-[var(--critical)]">
                  상태: {printError}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowPrintModal(false);
                  setPrintError(null);
                }}
                className="px-3.5 py-2 rounded-lg border border-[var(--border)] text-xs font-semibold text-[var(--ink-secondary)] hover:bg-[var(--surface-alt)] cursor-pointer"
              >
                닫기
              </button>

              <button
                type="button"
                onClick={() => {
                  try {
                    window.print();
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="px-3.5 py-2 rounded-lg border border-[var(--border-strong)] bg-[var(--surface-alt)] text-xs font-semibold text-[var(--ink)] hover:bg-[var(--border)] cursor-pointer"
              >
                다시 인쇄 시도
              </button>

              <a
                href={printUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-xs font-bold shadow-xs hover:opacity-90 transition-all cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>새 창에서 열어 인쇄하기</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Batch Export Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-[var(--surface)] border border-[var(--border-strong)] rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--ink)] font-serif-kr">
                    미래인재반 학년별 성적표 일괄 PDF 생성
                  </h3>
                  <span className="text-xs text-[var(--muted)]">
                    전체 학생 3페이지 리포트를 묶어 45쪽 단일 A4 책자 PDF로 다운로드
                  </span>
                </div>
              </div>
              {!isBatchRunning && (
                <button
                  type="button"
                  onClick={() => {
                    setShowBatchModal(false);
                    setBatchProgress(null);
                  }}
                  className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Target Grade & Scope Selector */}
            {!isBatchRunning && !batchProgress?.isDone && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--ink-secondary)] mb-1.5">
                    1. 대상 학년 선택:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { grade: '1', label: '1학년' },
                      { grade: '2', label: '2학년' },
                      { grade: '3', label: '3학년' },
                    ].map((g) => {
                      const isSel = batchGrade === g.grade;
                      const count = students.filter((s) => s.grade === g.grade).length;
                      return (
                        <button
                          key={g.grade}
                          type="button"
                          onClick={() => setBatchGrade(g.grade)}
                          className={`p-2.5 rounded-xl text-center border transition-all cursor-pointer ${
                            isSel
                              ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-xs'
                              : 'bg-[var(--surface-alt)] border-[var(--border)] text-[var(--ink)] hover:border-[var(--border-strong)]'
                          }`}
                        >
                          <div className="font-bold text-sm">{g.grade}학년</div>
                          <div className={`text-[11px] mt-0.5 ${isSel ? 'text-white/80' : 'text-[var(--muted)]'}`}>
                            {count}명 등록
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Students Preview */}
                <div className="p-3 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)] text-xs">
                  {(() => {
                    const gradeStudents = students.filter((s) => s.grade === batchGrade);
                    return (
                      <>
                        <div className="text-[11px] font-bold text-[var(--ink-secondary)] mb-1.5 flex items-center justify-between">
                          <span>{batchGrade}학년 인쇄 대상 학생 명단:</span>
                          <span className="text-[var(--accent)] font-semibold">
                            {gradeStudents.length}명 (총 {gradeStudents.length * 3}페이지)
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 text-[11px] text-[var(--ink)]">
                          {gradeStudents.map((st, idx) => (
                            <span
                              key={st.id || idx}
                              className="px-2 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)]"
                            >
                              {idx + 1}. {st.name}
                            </span>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-[var(--ink-secondary)] space-y-1 leading-relaxed">
                  <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>저메모리 최적화 렌더링 엔진 적용</span>
                  </div>
                  <p className="text-[11px]">
                    • 전원 렌더링 시 브라우저 메모리 초과를 방지하기 위해 <strong>고효율 압축(JPEG DCT)</strong>과 <strong>메모리 즉시 회수</strong> 기술이 적용되었습니다.
                  </p>
                </div>
              </div>
            )}

            {/* Live Progress Bar */}
            {(isBatchRunning || batchProgress) && (
              <div className="space-y-3 p-4 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[var(--ink)] flex items-center gap-2">
                    {isBatchRunning ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--accent)]" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                    <span>{batchProgress?.status || '진행 중...'}</span>
                  </span>
                  <span className="font-bold text-[var(--accent)]">
                    {batchProgress?.percent ?? 0}%
                  </span>
                </div>

                <div className="w-full bg-[var(--border)] h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--accent)] transition-all duration-300 rounded-full"
                    style={{ width: `${batchProgress?.percent ?? 0}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-[var(--muted)]">
                  <span>
                    진행: {batchProgress?.current || 0} / {batchProgress?.total || 0}명
                  </span>
                  <span>현재: {batchProgress?.studentName}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
              {isBatchRunning ? (
                <button
                  type="button"
                  onClick={handleCancelBatch}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 cursor-pointer"
                >
                  <StopCircle className="w-4 h-4" />
                  <span>일괄 생성 중단</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBatchModal(false);
                      setBatchProgress(null);
                    }}
                    className="px-4 py-2 rounded-lg border border-[var(--border)] text-xs font-semibold text-[var(--ink-secondary)] hover:bg-[var(--surface-alt)] cursor-pointer"
                  >
                    닫기
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartBatchExport(batchGrade)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-xs font-bold shadow-xs hover:opacity-90 transition-all cursor-pointer"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>
                      {batchGrade}학년 전체({students.filter((s) => s.grade === batchGrade).length}명) PDF 다운로드
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
