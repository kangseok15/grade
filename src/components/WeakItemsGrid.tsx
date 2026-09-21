import React, { useState } from 'react';
import { ExamRecord, Student, SubjectKey } from '../types';
import {
  SUBJECTS,
  subjectDisplayName,
  itemTypeLabel,
  itemTypeDetail,
  ITEM_TYPE_MAPS,
  ItemBlueprintItem,
} from '../data/mockData';
import {
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Layers,
  Search,
  X,
  Sparkles,
  Info,
  FileQuestion,
} from 'lucide-react';

interface WeakItemsGridProps {
  currentStudent: Student;
  currentExam: ExamRecord | undefined;
}

export const WeakItemsGrid: React.FC<WeakItemsGridProps> = ({ currentStudent, currentExam }) => {
  const [showBlueprint, setShowBlueprint] = useState(false);
  const [selectedBlueprintKey, setSelectedBlueprintKey] = useState<string>('1-2026-06');
  const [blueprintSearch, setBlueprintSearch] = useState<string>('');
  const [inspectedWeakItem, setInspectedWeakItem] = useState<{
    num: number;
    subjectName: string;
    detail: ItemBlueprintItem;
  } | null>(null);

  if (!currentExam) return null;

  const grade = currentStudent?.grade || (currentExam.label.includes('고3') ? '3' : currentExam.label.includes('고2') ? '2' : '1');
  const examMonth = currentExam.examDate.slice(5, 7);
  const examYear = currentExam.examDate.slice(0, 4);
  const currentKey = `${grade}-${examYear}-${examMonth}`;

  const activeKey = ITEM_TYPE_MAPS[selectedBlueprintKey] ? selectedBlueprintKey : (ITEM_TYPE_MAPS[currentKey] ? currentKey : '1-2026-06');
  const activeBlueprint = ITEM_TYPE_MAPS[activeKey] || ITEM_TYPE_MAPS[`${grade}-2026-${examMonth}`] || ITEM_TYPE_MAPS['1-2026-06'];

  const blueprintOptions = [
    { key: '3-2026-06', label: '고3 6월 모의평가', sub: '한국교육과정평가원 주관 (수능 실전형)' },
    { key: '1-2026-09', label: '고1 9월 모의고사', sub: '인천광역시교육청 주관 (도형·집합/수학1)' },
    { key: '2-2026-09', label: '고2 9월 모의고사', sub: '인천광역시교육청 주관 (수학Ⅱ 본격 반영)' },
    { key: '1-2026-06', label: '고1 6월 모의고사', sub: '부산광역시교육청 주관' },
    { key: '2-2026-06', label: '고2 6월 모의고사', sub: '부산광역시교육청 주관' },
    { key: '1-2026-03', label: '고1 3월 모의고사', sub: '중학교 전 범위 출제' },
    { key: '2-2026-03', label: '고2 3월 모의고사', sub: '고1 전 범위 출제' },
  ];

  const renderBlueprintRange = (item: {
    from?: number;
    to?: number;
    items?: number[];
    rangeText?: string;
  }) => {
    if (item.rangeText) return item.rangeText;
    if (item.items && item.items.length > 0) return `${item.items.join(', ')}번`;
    if (item.from != null && item.to != null) {
      return item.from === item.to ? `${item.from}번` : `${item.from}번~${item.to}번`;
    }
    return '';
  };

  const matchesSearch = (item: ItemBlueprintItem) => {
    if (!blueprintSearch.trim()) return true;
    const q = blueprintSearch.trim().toLowerCase();
    const range = renderBlueprintRange(item).toLowerCase();
    const label = (item.label || '').toLowerCase();
    const concept = (item.concept || '').toLowerCase();
    const category = (item.category || '').toLowerCase();
    const desc = (item.description || '').toLowerCase();

    // Check if query is a number
    const num = parseInt(q, 10);
    if (!isNaN(num)) {
      if (item.items && item.items.includes(num)) return true;
      if (item.from != null && item.to != null && num >= item.from && num <= item.to) return true;
    }

    return (
      range.includes(q) ||
      label.includes(q) ||
      concept.includes(q) ||
      category.includes(q) ||
      desc.includes(q)
    );
  };

  const hasAnyWeakItems = Object.values(currentExam.weakItems || {}).some(
    (arr) => Array.isArray(arr) && arr.length > 0
  );

  return (
    <section className="mb-10" id="weak">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-serif-kr font-bold text-[var(--ink)] whitespace-nowrap">
            오답(보충학습 필요) 문항 분석
          </h2>
          <p className="text-xs text-[var(--muted)] mt-0.5 whitespace-nowrap truncate" title={hasAnyWeakItems ? '선택 회차 검토 문항 번호 및 세부 출제 유형 (문항 클릭 시 세부 분석 확인)' : '※ 학급별 성적일람표 등록 회차는 개별 문항 정오답 데이터가 포함되지 않습니다.'}>
            {hasAnyWeakItems
              ? '선택 회차 검토 문항 번호 및 세부 출제 유형 (문항 클릭 시 세부 분석 확인)'
              : '※ 학급별 성적일람표 등록 회차는 개별 문항 정오답 데이터가 포함되지 않습니다.'}
          </p>
        </div>

        {/* Blueprint Toggle Button */}
        <button
          type="button"
          onClick={() => {
            if (!showBlueprint) {
              if (ITEM_TYPE_MAPS[currentKey]) {
                setSelectedBlueprintKey(currentKey);
              }
            }
            setShowBlueprint(!showBlueprint);
          }}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border whitespace-nowrap shrink-0 ${
            showBlueprint
              ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-sm'
              : 'bg-[var(--surface)] text-[var(--ink-secondary)] hover:text-[var(--accent)] border-[var(--border)] hover:border-[var(--accent)]/40 shadow-xs'
          }`}
          title="2026년 전국연합학력평가 문항 분석표 확인"
        >
          <BookOpen className="w-3.5 h-3.5 shrink-0" />
          <span className="whitespace-nowrap">문항 분석 기준표</span>
          {showBlueprint ? (
            <ChevronUp className="w-3.5 h-3.5 ml-0.5 shrink-0" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 ml-0.5 shrink-0" />
          )}
        </button>
      </div>

      {/* Item Detail Modal/Popover when a weak item is clicked */}
      {inspectedWeakItem && (
        <div className="mb-6 p-4.5 bg-amber-500/5 border-2 border-amber-500/30 rounded-xl shadow-[var(--shadow)] animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-amber-500/20">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-500 text-white">
                {inspectedWeakItem.subjectName} {inspectedWeakItem.num}번
              </span>
              <span className="text-sm font-bold text-[var(--ink)]">
                {inspectedWeakItem.detail.concept || inspectedWeakItem.detail.label}
              </span>
              {inspectedWeakItem.detail.category && (
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)]">
                  {inspectedWeakItem.detail.category}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setInspectedWeakItem(null)}
              className="p-1 rounded-md text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-hover)]"
              aria-label="닫기"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-[var(--ink-secondary)]">
            <div className="bg-[var(--surface)] p-3 rounded-lg border border-[var(--border)]">
              <span className="text-[11px] font-bold text-[var(--accent)] block mb-1">
                출제 개념 및 단원
              </span>
              <p className="leading-relaxed text-[var(--ink)]">
                {inspectedWeakItem.detail.concept || inspectedWeakItem.detail.label}
              </p>
            </div>
            <div className="bg-[var(--surface)] p-3 rounded-lg border border-[var(--border)]">
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block mb-1">
                주요 분석 및 특징
              </span>
              <p className="leading-relaxed text-[var(--ink)]">
                {inspectedWeakItem.detail.description || '기본 개념 숙지 및 유형별 반복 풀이를 통해 실수를 방지해야 하는 문항입니다.'}
              </p>
            </div>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>오답 원인을 오답노트에 정리하고, 동일 단원의 기출 변형 문항을 최소 3문항 이상 복습하세요.</span>
          </div>
        </div>
      )}

      {/* Collapsible Blueprint Card */}
      {showBlueprint && (
        <div className="mb-6 p-4.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-[var(--shadow)] animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[var(--accent)]" />
              <div>
                <h3 className="text-sm font-bold text-[var(--ink)]">
                  2026년 전국연합학력평가 세부 문항 분석표
                </h3>
                <p className="text-[11px] text-[var(--muted)]">
                  단원 및 출제 개념, 문항별 주요 분석 및 특징을 과목별로 확인하실 수 있습니다.
                </p>
              </div>
            </div>

            {/* Quick Switch Tabs */}
            <div className="flex flex-wrap gap-1.5">
              {blueprintOptions.map((opt) => {
                const isSelected = selectedBlueprintKey === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setSelectedBlueprintKey(opt.key)}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                      isSelected
                        ? 'bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/30 font-bold shadow-xs'
                        : 'text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-hover)]'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Box in Blueprint */}
          <div className="mb-4 flex items-center gap-2 bg-[var(--bg)] px-3 py-1.5 rounded-lg border border-[var(--border)] max-w-md">
            <Search className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" />
            <input
              type="text"
              value={blueprintSearch}
              onChange={(e) => setBlueprintSearch(e.target.value)}
              placeholder="문항 번호 또는 개념 검색 (예: 17, 21, 나머지정리, 빈칸, 어법)..."
              className="w-full bg-transparent text-xs text-[var(--ink)] placeholder-[var(--muted)] focus:outline-none"
            />
            {blueprintSearch && (
              <button
                type="button"
                onClick={() => setBlueprintSearch('')}
                className="text-[var(--muted)] hover:text-[var(--ink)] text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Blueprint Content Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. 국어 영역 */}
            <div className="bg-[var(--bg)] p-3 rounded-lg border border-[var(--border)] flex flex-col h-[480px]">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border)] shrink-0">
                <span className="text-xs font-bold text-[var(--ink)]">1교시 국어 (총 45문항)</span>
                <span className="text-[10px] text-[var(--muted)] font-medium">화작 / 문법 / 독서 / 문학</span>
              </div>
              <div className="flex-1 overflow-y-auto pr-1 space-y-2">
                {activeBlueprint?.korean ? (
                  activeBlueprint.korean.filter(matchesSearch).length > 0 ? (
                    activeBlueprint.korean.filter(matchesSearch).map((item, idx) => (
                      <div
                        key={`bp-kor-${idx}`}
                        className="p-2 rounded bg-[var(--surface)] border border-[var(--border)]/70 text-xs"
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-bold text-[var(--accent)] text-[11px] shrink-0">
                            {renderBlueprintRange(item)}
                          </span>
                          {item.category && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent-soft)] text-[var(--accent)] font-medium">
                              {item.category}
                            </span>
                          )}
                        </div>
                        <div className="font-semibold text-[var(--ink)] text-[11px] mb-0.5">
                          {item.concept || item.label}
                        </div>
                        {item.description && (
                          <div className="text-[10.5px] text-[var(--ink-secondary)] leading-relaxed">
                            {item.description}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-[11px] text-[var(--muted)] p-3 text-center">검색 결과가 없습니다.</div>
                  )
                ) : (
                  <div className="text-[11px] text-[var(--muted)]">분석 기준표 준비 중</div>
                )}
              </div>
            </div>

            {/* 2. 수학 영역 */}
            <div className="bg-[var(--bg)] p-3 rounded-lg border border-[var(--border)] flex flex-col h-[480px]">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border)] shrink-0">
                <span className="text-xs font-bold text-[var(--ink)]">2교시 수학 (총 30문항)</span>
                <span className="text-[10px] text-[var(--muted)] font-medium">객관식 21 / 단답형 9</span>
              </div>
              <div className="flex-1 overflow-y-auto pr-1 space-y-2">
                {activeBlueprint?.math ? (
                  activeBlueprint.math.filter(matchesSearch).length > 0 ? (
                    activeBlueprint.math.filter(matchesSearch).map((item, idx) => (
                      <div
                        key={`bp-math-${idx}`}
                        className="p-2 rounded bg-[var(--surface)] border border-[var(--border)]/70 text-xs"
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-bold text-[var(--accent)] text-[11px] shrink-0">
                            {renderBlueprintRange(item)}
                          </span>
                          {item.category && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent-soft)] text-[var(--accent)] font-medium">
                              {item.category}
                            </span>
                          )}
                        </div>
                        <div className="font-semibold text-[var(--ink)] text-[11px] mb-0.5">
                          {item.concept || item.label}
                        </div>
                        {item.description && (
                          <div className="text-[10.5px] text-[var(--ink-secondary)] leading-relaxed">
                            {item.description}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-[11px] text-[var(--muted)] p-3 text-center">검색 결과가 없습니다.</div>
                  )
                ) : (
                  <div className="text-[11px] text-[var(--muted)]">분석 기준표 준비 중</div>
                )}
              </div>
            </div>

            {/* 3. 영어 영역 */}
            <div className="bg-[var(--bg)] p-3 rounded-lg border border-[var(--border)] flex flex-col h-[480px]">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border)] shrink-0">
                <span className="text-xs font-bold text-[var(--ink)]">3교시 영어 (총 45문항)</span>
                <span className="text-[10px] text-[var(--muted)] font-medium">듣기 17 / 독해 28</span>
              </div>
              <div className="flex-1 overflow-y-auto pr-1 space-y-2">
                {activeBlueprint?.english ? (
                  activeBlueprint.english.filter(matchesSearch).length > 0 ? (
                    activeBlueprint.english.filter(matchesSearch).map((item, idx) => (
                      <div
                        key={`bp-eng-${idx}`}
                        className="p-2 rounded bg-[var(--surface)] border border-[var(--border)]/70 text-xs"
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-bold text-[var(--accent)] text-[11px] shrink-0">
                            {renderBlueprintRange(item)}
                          </span>
                          {item.category && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent-soft)] text-[var(--accent)] font-medium">
                              {item.category}
                            </span>
                          )}
                        </div>
                        <div className="font-semibold text-[var(--ink)] text-[11px] mb-0.5">
                          {item.concept || item.label}
                        </div>
                        {item.description && (
                          <div className="text-[10.5px] text-[var(--ink-secondary)] leading-relaxed">
                            {item.description}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-[11px] text-[var(--muted)] p-3 text-center">검색 결과가 없습니다.</div>
                  )
                ) : (
                  <div className="text-[11px] text-[var(--muted)]">분석 기준표 준비 중</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weak Items Content */}
      {!hasAnyWeakItems ? (
        <div className="py-8 px-5 sm:px-6 text-center rounded-xl bg-[var(--surface-alt)] border border-[var(--border)] flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2.5">
            <FileQuestion className="w-5 h-5" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-[var(--ink)] mb-1">
            정오답표가 제공되지 않아 분석할 수 없습니다
          </h3>
          <p className="text-xs text-[var(--muted)] max-w-lg leading-relaxed">
            해당 시험({currentExam.label})은 문항별 정오답표(보충학습 필요 문항)가 제공되지 않는 회차(수능 모의평가 등)이므로 공통 오답 및 킬러문항을 분석할 수 없습니다.
          </p>
          <div className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] text-[var(--muted)] bg-[var(--surface)] px-3 py-1 rounded-full border border-[var(--border)]">
            <span>※ 한국교육과정평가원 수능 모의평가 및 학급별 성적일람표 등록 회차는 문항별 정오답 데이터가 기재되지 않습니다.</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {SUBJECTS.map((s) => {
            const rawItems = currentExam.weakItems[s.key as SubjectKey] || [];
            const items = [...rawItems].sort((a, b) => a - b);
            const subjData = currentExam.subjects[s.key as SubjectKey];
            const sName = subjectDisplayName(s, subjData, currentStudent?.grade);

            return (
              <div
                key={s.key}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-sm shrink-0"
                        style={{ backgroundColor: s.color }}
                      />
                      <h3 className="text-sm font-bold text-[var(--ink)]">
                        {sName}
                      </h3>
                    </div>

                    <span className="text-xs text-[var(--muted)] font-medium">
                      {items.length > 0 ? `${items.length}문항` : '오답 없음'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 min-h-[38px] items-center">
                    {items.length === 0 ? (
                      <div className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] text-[var(--good)] bg-green-500/10 px-3 py-1.5 rounded-md font-medium whitespace-nowrap shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="whitespace-nowrap">전 문항 정답</span>
                      </div>
                    ) : (
                      items.map((num) => {
                        const detail = itemTypeDetail(
                          currentStudent,
                          currentExam,
                          s.key as SubjectKey,
                          num
                        );
                        const typeLabel = detail?.label || itemTypeLabel(
                          currentStudent,
                          currentExam,
                          s.key as SubjectKey,
                          num
                        );

                        const hasDetail = detail && (detail.concept || detail.description);

                        return (
                          <button
                            type="button"
                            key={`weak-${s.key}-${num}`}
                            onClick={() => {
                              if (detail) {
                                setInspectedWeakItem({
                                  num,
                                  subjectName: sName,
                                  detail,
                                });
                              }
                            }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-[13px] font-bold transition-all ${
                              hasDetail
                                ? 'bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/30 hover:border-[var(--accent)] hover:shadow-xs cursor-pointer'
                                : 'bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/20 cursor-default'
                            } whitespace-nowrap shrink-0`}
                            title={detail?.description ? `${detail.label} - ${detail.description} (클릭하여 상세 보기)` : undefined}
                          >
                            <span className="num whitespace-nowrap">{num}번</span>
                            {typeLabel && (
                              <span className="font-medium text-xs opacity-90 border-l border-[var(--accent)]/30 pl-1.5 ml-0.5 whitespace-nowrap">
                                {typeLabel}
                              </span>
                            )}
                            {hasDetail && (
                              <Info className="w-3 h-3 text-[var(--accent)] opacity-70 ml-0.5 shrink-0" />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {items.length > 0 && (
                  <div className="mt-3 pt-2 text-[11px] text-[var(--muted)] flex items-center justify-between border-t border-[var(--border)] whitespace-nowrap overflow-hidden">
                    <div className="flex items-center gap-1 whitespace-nowrap truncate" title="번호를 누르면 출제 개념과 특징을 확인할 수 있음.">
                      <AlertCircle className="w-3 h-3 text-[var(--accent)] shrink-0" />
                      <span className="whitespace-nowrap truncate">번호를 누르면 출제 개념과 특징을 확인할 수 있음.</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
