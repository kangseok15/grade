import React, { useState } from 'react';
import { ExamRecord, Student, SubjectKey, SubareaScore, SubjectScore } from '../types';
import { SUBJECTS } from '../data/mockData';
import { Upload, FileText, CheckCircle, AlertCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

interface AddExamSectionProps {
  currentStudent: Student;
  onAddExam: (exam: ExamRecord) => void;
}

export const AddExamSection: React.FC<AddExamSectionProps> = ({ currentStudent, onAddExam }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message?: string }>({
    type: 'idle',
  });

  // Form State
  const [label, setLabel] = useState('');
  const [examDate, setExamDate] = useState('');
  const [subjectsState, setSubjectsState] = useState<Record<SubjectKey, {
    name: string;
    raw: string;
    rawMax: string;
    standard: string;
    percentile: string;
    grade: string;
    schoolRank: string;
    sub: { n: string; m: string; s: string; natAvg: string }[];
    weakItems: string;
  }>>(() => {
    const init: any = {};
    SUBJECTS.forEach((s) => {
      init[s.key] = {
        name: s.key === 'elective1' ? '생활과 윤리' : s.key === 'elective2' ? '사회문화' : '',
        raw: '',
        rawMax: s.key === 'history' || s.key === 'elective1' || s.key === 'elective2' ? '50' : '100',
        standard: '',
        percentile: '',
        grade: '',
        schoolRank: '',
        sub: s.subareas.map((name) => ({ n: name, m: '', s: '', natAvg: '' })),
        weakItems: '',
      };
    });
    return init;
  });

  // Handle Image/PDF Upload & Gemini OCR parsing
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus({
      type: 'loading',
      message: 'Gemini AI가 성적표를 분석하고 점수를 추출 중입니다... (약 5~10초)',
    });

    try {
      // Read file as base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;

      const res = await fetch('/api/ocr-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: file.type || 'image/png',
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `서버 오류 (${res.status})`);
      }

      const json = await res.json();
      if (!json.success || !json.data) {
        throw new Error('성적표 데이터를 인식하지 못했습니다.');
      }

      const extracted = json.data;

      // Populate Form with Extracted Data
      if (extracted.label) setLabel(extracted.label);
      if (extracted.examDate) setExamDate(extracted.examDate);

      setSubjectsState((prev) => {
        const next = { ...prev };
        SUBJECTS.forEach((s) => {
          const extSubj = extracted.subjects?.[s.key];
          const extWeak = extracted.weakItems?.[s.key];

          if (extSubj) {
            next[s.key] = {
              ...next[s.key],
              name: extSubj.name || next[s.key].name,
              raw: extSubj.raw != null ? String(extSubj.raw) : next[s.key].raw,
              rawMax: extSubj.rawMax != null ? String(extSubj.rawMax) : next[s.key].rawMax,
              standard: extSubj.standard != null ? String(extSubj.standard) : next[s.key].standard,
              percentile: extSubj.percentile != null ? String(extSubj.percentile) : next[s.key].percentile,
              grade: extSubj.grade != null ? String(extSubj.grade) : next[s.key].grade,
              schoolRank: extSubj.schoolRank || next[s.key].schoolRank,
            };

            // Map subareas
            if (extSubj.sub && Array.isArray(extSubj.sub)) {
              next[s.key].sub = next[s.key].sub.map((row) => {
                const found = extSubj.sub.find((r: any) => r.n === row.n);
                if (found) {
                  return {
                    n: row.n,
                    m: found.m != null ? String(found.m) : row.m,
                    s: found.s != null ? String(found.s) : row.s,
                    natAvg: found.natAvg != null ? String(found.natAvg) : row.natAvg,
                  };
                }
                return row;
              });
            }
          }

          if (extWeak && Array.isArray(extWeak)) {
            next[s.key].weakItems = extWeak.join(', ');
          }
        });
        return next;
      });

      setIsFormOpen(true);
      setUploadStatus({
        type: 'success',
        message: '성적표 인식이 완료되었습니다. 아래 입력값을 확인 후 추가해 주세요.',
      });
    } catch (err: any) {
      console.error('OCR Error:', err);
      setUploadStatus({
        type: 'error',
        message: err.message || '성적표 인식 실패. 아래 양식에 직접 입력해 주세요.',
      });
      setIsFormOpen(true);
    } finally {
      e.target.value = '';
    }
  };

  // Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!label.trim() || !examDate) {
      alert('회차 명칭과 실시일자를 입력해 주세요.');
      return;
    }

    const processedSubjects: Partial<Record<SubjectKey, SubjectScore>> = {};
    const processedWeak: Partial<Record<SubjectKey, number[]>> = {};

    let hasAnyValid = false;

    SUBJECTS.forEach((s) => {
      const cur = subjectsState[s.key];
      const rawNum = parseFloat(cur.raw);
      const gradeNum = parseInt(cur.grade, 10);

      if (!isNaN(rawNum) && !isNaN(gradeNum)) {
        hasAnyValid = true;
        const subjScore: SubjectScore = {
          raw: rawNum,
          rawMax: parseFloat(cur.rawMax) || (s.key === 'history' || s.key === 'elective1' || s.key === 'elective2' ? 50 : 100),
          grade: gradeNum,
        };

        if (cur.name.trim()) subjScore.name = cur.name.trim();
        if (cur.standard.trim()) subjScore.standard = parseFloat(cur.standard);
        if (cur.percentile.trim()) subjScore.percentile = parseFloat(cur.percentile);
        if (cur.schoolRank.trim()) subjScore.schoolRank = cur.schoolRank.trim();

        if (s.hasSub && cur.sub.length > 0) {
          const subs: SubareaScore[] = [];
          cur.sub.forEach((subRow) => {
            const mNum = parseFloat(subRow.m);
            const sNum = parseFloat(subRow.s);
            if (!isNaN(mNum) && !isNaN(sNum)) {
              subs.push({
                n: subRow.n,
                m: mNum,
                s: sNum,
                natAvg: parseFloat(subRow.natAvg) || 0,
              });
            }
          });
          if (subs.length > 0) subjScore.sub = subs;
        }

        processedSubjects[s.key] = subjScore;
      }

      if (cur.weakItems.trim()) {
        const parsedItems = cur.weakItems
          .split(/[\s,]+/)
          .map((n) => parseInt(n.trim(), 10))
          .filter((n) => !isNaN(n));
        processedWeak[s.key] = parsedItems;
      } else {
        processedWeak[s.key] = [];
      }
    });

    if (!hasAnyValid) {
      alert('최소 하나 이상의 과목에 원점수와 등급을 입력해 주세요.');
      return;
    }

    const newRecord: ExamRecord = {
      id: `${currentStudent.name}__${examDate}`,
      studentId: currentStudent.name,
      studentName: currentStudent.name,
      label: label.trim(),
      examDate,
      subjects: processedSubjects,
      weakItems: processedWeak,
    };

    onAddExam(newRecord);
    alert('새 모의고사 성적표가 등록되었습니다!');
    setIsFormOpen(false);
  };

  return (
    <section className="mb-14" id="addExam">
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-serif-kr font-bold text-[var(--ink)]">
            새 성적표 추가
          </h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            성적표 이미지/PDF를 업로드하면 Gemini Vision AI가 성적표를 자동 인식하여 채워줍니다
          </p>
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 md:p-6 shadow-[var(--shadow)]">
        {/* OCR File Upload Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[var(--surface-alt)]/50 border border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--accent)] shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-[var(--ink)]">
                성적표 파일(이미지 또는 PDF) 자동 인식
              </div>
              <div className="text-xs text-[var(--muted)] mt-0.5">
                성적통지표를 올리면 원점수·표준점수·백분위·등급·세부영역을 즉시 추출합니다
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="exam-file-input"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--ink)] text-[var(--paper)] text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              성적표 업로드
            </label>
            <input
              id="exam-file-input"
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => setIsFormOpen((prev) => !prev)}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-[var(--border-strong)] text-xs font-semibold text-[var(--ink)] hover:bg-[var(--surface)] transition-colors cursor-pointer"
            >
              <span>{isFormOpen ? '양식 닫기' : '직접 입력하기'}</span>
              {isFormOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Upload Status Feedback */}
        {uploadStatus.type === 'loading' && (
          <div className="mt-3 p-3 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>{uploadStatus.message}</span>
          </div>
        )}

        {uploadStatus.type === 'success' && (
          <div className="mt-3 p-3 rounded-lg bg-green-500/10 text-[var(--good)] text-xs flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{uploadStatus.message}</span>
          </div>
        )}

        {uploadStatus.type === 'error' && (
          <div className="mt-3 p-3 rounded-lg bg-red-500/10 text-[var(--critical)] text-xs flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{uploadStatus.message}</span>
          </div>
        )}

        {/* Collapsible Manual / Extracted Form */}
        {isFormOpen && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-6 border-t border-[var(--border)] pt-6">
            {/* Exam Metadata */}
            <div className="bg-[var(--surface-alt)]/40 p-4 rounded-xl border border-[var(--border)]">
              <h4 className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider mb-3">
                회차 기본 정보
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
                    회차 명칭 <span className="text-[var(--accent)]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="예: 2026년 7월 고3 전국연합학력평가"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg bg-[var(--paper)] text-[var(--ink)] border border-[var(--border-strong)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
                    실시일자 <span className="text-[var(--accent)]">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg bg-[var(--paper)] text-[var(--ink)] border border-[var(--border-strong)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>
              </div>
            </div>

            {/* Subjects Inputs */}
            <div className="space-y-4">
              {SUBJECTS.map((s) => {
                const cur = subjectsState[s.key];
                return (
                  <div
                    key={`form-subj-${s.key}`}
                    className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)]"
                  >
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[var(--border)]">
                      <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: s.color }} />
                      <h4 className="text-xs font-bold text-[var(--ink)]">
                        {s.name}
                        {(s.key === 'elective1' || s.key === 'elective2') && (
                          <input
                            type="text"
                            placeholder="과목명 (예: 생활과 윤리, 물리학Ⅰ)"
                            value={cur.name}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSubjectsState((p) => ({
                                ...p,
                                [s.key]: { ...p[s.key], name: val },
                              }));
                            }}
                            className="ml-2 text-xs px-2 py-0.5 rounded border border-[var(--border-strong)] bg-[var(--paper)] font-normal"
                          />
                        )}
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 text-xs">
                      <div>
                        <label className="block text-[11px] text-[var(--muted)] font-semibold mb-1">
                          원점수
                        </label>
                        <input
                          type="number"
                          placeholder="원점수"
                          value={cur.raw}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSubjectsState((p) => ({
                              ...p,
                              [s.key]: { ...p[s.key], raw: val },
                            }));
                          }}
                          className="w-full p-1.5 rounded-md border border-[var(--border-strong)] bg-[var(--paper)] num"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-[var(--muted)] font-semibold mb-1">
                          배점
                        </label>
                        <input
                          type="number"
                          placeholder="배점"
                          value={cur.rawMax}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSubjectsState((p) => ({
                              ...p,
                              [s.key]: { ...p[s.key], rawMax: val },
                            }));
                          }}
                          className="w-full p-1.5 rounded-md border border-[var(--border-strong)] bg-[var(--paper)] num"
                        />
                      </div>

                      {s.hasPct && (
                        <>
                          <div>
                            <label className="block text-[11px] text-[var(--muted)] font-semibold mb-1">
                              표준점수
                            </label>
                            <input
                              type="number"
                              placeholder="표준점수"
                              value={cur.standard}
                              onChange={(e) => {
                                const val = e.target.value;
                                setSubjectsState((p) => ({
                                  ...p,
                                  [s.key]: { ...p[s.key], standard: val },
                                }));
                              }}
                              className="w-full p-1.5 rounded-md border border-[var(--border-strong)] bg-[var(--paper)] num"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] text-[var(--muted)] font-semibold mb-1">
                              백분위
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="백분위"
                              value={cur.percentile}
                              onChange={(e) => {
                                const val = e.target.value;
                                setSubjectsState((p) => ({
                                  ...p,
                                  [s.key]: { ...p[s.key], percentile: val },
                                }));
                              }}
                              className="w-full p-1.5 rounded-md border border-[var(--border-strong)] bg-[var(--paper)] num"
                            />
                          </div>
                        </>
                      )}

                      <div>
                        <label className="block text-[11px] text-[var(--muted)] font-semibold mb-1">
                          등급 (1~9)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="9"
                          placeholder="등급"
                          value={cur.grade}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSubjectsState((p) => ({
                              ...p,
                              [s.key]: { ...p[s.key], grade: val },
                            }));
                          }}
                          className="w-full p-1.5 rounded-md border border-[var(--border-strong)] bg-[var(--paper)] num"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-[var(--muted)] font-semibold mb-1">
                          학교석차
                        </label>
                        <input
                          type="text"
                          placeholder="예: 40/159"
                          value={cur.schoolRank}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSubjectsState((p) => ({
                              ...p,
                              [s.key]: { ...p[s.key], schoolRank: val },
                            }));
                          }}
                          className="w-full p-1.5 rounded-md border border-[var(--border-strong)] bg-[var(--paper)] num"
                        />
                      </div>
                    </div>

                    {/* Weak Items Input */}
                    <div className="mt-2.5">
                      <label className="block text-[11px] text-[var(--muted)] font-semibold mb-1">
                        오답(보충학습 필요) 문항 번호 (쉼표 구분)
                      </label>
                      <input
                        type="text"
                        placeholder="예: 11, 12, 15, 28"
                        value={cur.weakItems}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSubjectsState((p) => ({
                            ...p,
                            [s.key]: { ...p[s.key], weakItems: val },
                          }));
                        }}
                        className="w-full p-1.5 text-xs rounded-md border border-[var(--border-strong)] bg-[var(--paper)] num"
                      />
                    </div>

                    {/* Subareas table if subject has subareas */}
                    {s.hasSub && cur.sub.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-[var(--border)]">
                        <div className="text-[11px] font-semibold text-[var(--muted)] mb-1.5">
                          세부영역별 득점 현황
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {cur.sub.map((subRow, sIdx) => (
                            <div
                              key={`${s.key}-sub-${sIdx}`}
                              className="bg-[var(--surface-alt)]/40 p-2 rounded-lg text-xs flex items-center justify-between gap-1.5"
                            >
                              <span className="font-semibold text-[var(--ink)] text-[11px] shrink-0">
                                {subRow.n}
                              </span>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  placeholder="득점"
                                  value={subRow.s}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setSubjectsState((p) => {
                                      const nextSub = [...p[s.key].sub];
                                      nextSub[sIdx] = { ...nextSub[sIdx], s: val };
                                      return { ...p, [s.key]: { ...p[s.key], sub: nextSub } };
                                    });
                                  }}
                                  className="w-11 p-1 text-[11px] text-center rounded border border-[var(--border-strong)] bg-[var(--paper)] num"
                                />
                                <span className="text-[var(--muted)]">/</span>
                                <input
                                  type="number"
                                  placeholder="배점"
                                  value={subRow.m}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setSubjectsState((p) => {
                                      const nextSub = [...p[s.key].sub];
                                      nextSub[sIdx] = { ...nextSub[sIdx], m: val };
                                      return { ...p, [s.key]: { ...p[s.key], sub: nextSub } };
                                    });
                                  }}
                                  className="w-11 p-1 text-[11px] text-center rounded border border-[var(--border-strong)] bg-[var(--paper)] num"
                                />
                                <input
                                  type="text"
                                  placeholder="전국"
                                  title="전국평균"
                                  value={subRow.natAvg}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setSubjectsState((p) => {
                                      const nextSub = [...p[s.key].sub];
                                      nextSub[sIdx] = { ...nextSub[sIdx], natAvg: val };
                                      return { ...p, [s.key]: { ...p[s.key], sub: nextSub } };
                                    });
                                  }}
                                  className="w-11 p-1 text-[11px] text-center rounded border border-[var(--border-strong)] bg-[var(--paper)] num text-[var(--muted)]"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-[var(--border-strong)] text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
              >
                성적표 저장 및 등록
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};
