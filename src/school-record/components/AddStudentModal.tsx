import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { X, UserPlus, Save } from 'lucide-react';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newStudent: StudentProfile) => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [name, setName] = useState('');
  const [school, setSchool] = useState('숭신여자고등학교');
  const [grade, setGrade] = useState(2);
  const [classNum, setClassNum] = useState(1);
  const [studentNum, setStudentNum] = useState(1);
  const [track, setTrack] = useState('자연계열');
  const [memo, setMemo] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const student: StudentProfile = {
      id: `student_${Date.now()}`,
      name: name.trim(),
      school: school.trim() || '고등학교',
      grade: Number(grade),
      classNum: Number(classNum),
      studentNum: Number(studentNum),
      track,
      memo: memo.trim() || undefined,
      records: [],
    };

    onAdd(student);
    onClose();
    setName('');
    setMemo('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-stone-900">새 학생 등록</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-semibold text-stone-700 block mb-1">학생 이름 *</label>
            <input
              type="text"
              required
              placeholder="예: 홍길동"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">학교명</label>
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 font-medium"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">희망 계열/과정</label>
              <select
                aria-label="희망 계열/과정 선택"
                value={track}
                onChange={(e) => setTrack(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 font-medium"
              >
                <option value="자연계열 (과학·공학)">자연계열 (과학·공학)</option>
                <option value="자연계열 (의약·이학)">자연계열 (의약·이학)</option>
                <option value="인문사회계열 (상경·사회과학)">인문사회계열 (상경·사회과학)</option>
                <option value="인문사회계열 (어문·국제)">인문사회계열 (어문·국제)</option>
                <option value="예체능/융합계열">예체능/융합계열</option>
                <option value="일반과정">일반과정</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">학년</label>
              <input
                type="number"
                min="1"
                max="3"
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 font-medium"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">반</label>
              <input
                type="number"
                min="1"
                value={classNum}
                onChange={(e) => setClassNum(Number(e.target.value))}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 font-medium"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">번호</label>
              <input
                type="number"
                min="1"
                value={studentNum}
                onChange={(e) => setStudentNum(Number(e.target.value))}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">진학 목표 및 비고</label>
            <textarea
              rows={3}
              placeholder="예: 서울권 상위 공과대학 학생부종합전형 지원 희망"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-900 font-medium"
            ></textarea>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-stone-900 text-white font-semibold rounded-lg hover:bg-stone-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>등록하기</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
