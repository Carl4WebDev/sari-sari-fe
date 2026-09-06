import { useState } from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";

interface BorrowerNote {
  borrower_note_id: number;
  note_text: string;
  created_at: string;
}

interface BorrowerNotesCardProps {
  notes: BorrowerNote[];
  isOnline: boolean;
  onCreateNote: (noteText: string) => Promise<boolean>;
  onUpdateNote: (noteId: number, noteText: string) => Promise<boolean>;
  onDeleteNote: (noteId: number) => Promise<void>;
}

export default function BorrowerNotesCard({
  notes,
  isOnline,
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
}: BorrowerNotesCardProps) {
  const { t } = useTranslation();

  const [noteInput, setNoteInput] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingNoteText, setEditingNoteText] = useState("");
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    noteId: number | null;
  }>({ isOpen: false, noteId: null });

  const handleAddNote = async () => {
    if (!noteInput.trim()) return;
    const ok = await onCreateNote(noteInput.trim());
    if (ok) {
      setNoteInput("");
    }
  };

  const handleSaveEdit = async () => {
    if (!editingNoteId || !editingNoteText.trim()) return;
    const ok = await onUpdateNote(editingNoteId, editingNoteText.trim());
    if (ok) {
      setEditingNoteId(null);
      setEditingNoteText("");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.noteId) return;
    const idToDelete = deleteModal.noteId;
    setDeleteModal({ isOpen: false, noteId: null });
    await onDeleteNote(idToDelete);
  };

  return (
    <div className="border-t border-slate-200/80 pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h2 className="text-base font-black text-slate-950 tracking-tight">{t("details.notes")}</h2>
        </div>
        <span className="rounded-full bg-slate-100 text-slate-600 text-xs font-black px-2.5 py-0.5">
          {(notes || []).length}
        </span>
      </div>

      <div className="space-y-3 max-h-72 overflow-y-auto">
        {(notes || []).length === 0 && (
          <div className="rounded-3xl bg-slate-50/60 border border-slate-200/80 p-8 text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <p className="text-xs font-black text-slate-900">
              {t("details.no_notes")}
            </p>
            <p className="text-[11px] font-semibold text-slate-400">
              Add private remarks or notes about this borrower below.
            </p>
          </div>
        )}

        {(notes || []).map((note) => (
          <div
            key={note.borrower_note_id}
            className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 text-xs font-semibold text-slate-800 space-y-2.5 shadow-2xs hover:border-slate-300 transition"
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 border-b border-slate-100 pb-2">
              <span>{new Date(note.created_at).toLocaleDateString()}</span>
              {isOnline && (
                <div className="flex gap-2">
                  {editingNoteId === note.borrower_note_id ? (
                    <>
                      <button
                        type="button"
                        onClick={handleSaveEdit}
                        className="rounded-xl bg-slate-950 px-3 py-1 text-xs font-black text-white cursor-pointer active:scale-95"
                      >
                        {t("details.save")}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingNoteId(null);
                          setEditingNoteText("");
                        }}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700 cursor-pointer active:scale-95"
                      >
                        {t("details.cancel")}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingNoteId(note.borrower_note_id);
                          setEditingNoteText(note.note_text);
                        }}
                        className="rounded-xl px-2.5 py-1 text-[11px] font-black text-blue-600 hover:bg-blue-50 cursor-pointer transition"
                      >
                        {t("details.edit")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteModal({ isOpen: true, noteId: note.borrower_note_id })}
                        className="rounded-xl px-2.5 py-1 text-[11px] font-black text-rose-600 hover:bg-rose-50 cursor-pointer transition"
                      >
                        {t("details.delete")}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {editingNoteId === note.borrower_note_id ? (
              <textarea
                value={editingNoteText}
                onChange={(e) => setEditingNoteText(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white resize-none"
              />
            ) : (
              <p className="leading-relaxed text-slate-900 font-bold">{note.note_text}</p>
            )}
          </div>
        ))}
      </div>

      {isOnline && (
        <div className="flex gap-2">
          <input
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            placeholder={t("details.add_note_placeholder")}
            className="flex-1 rounded-2xl border border-slate-200/90 bg-white px-4 py-3.5 text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 transition shadow-2xs"
          />

          <button
            type="button"
            onClick={handleAddNote}
            className="rounded-2xl bg-slate-900 hover:bg-slate-800 px-6 py-3.5 text-xs sm:text-sm font-black text-white shadow-md shadow-slate-950/20 transition active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <span>{t("details.send")}</span>
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-backdrop-fade">
          <div className="w-full max-w-sm bg-white/95 backdrop-blur-xl rounded-[2rem] p-6 shadow-2xl shadow-slate-950/20 border border-slate-200/90 overflow-hidden text-center animate-modal-pop">
            <h2 className="text-base font-black text-slate-950 tracking-tight">{t("details.delete")}</h2>
            <p className="mt-2 text-xs font-semibold text-slate-500 leading-relaxed">{t("details.confirm_delete_note")}</p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteModal({ isOpen: false, noteId: null })}
                className="flex-1 rounded-2xl border border-slate-200/90 py-3 text-xs font-black text-slate-700 hover:bg-slate-50 transition active:scale-[0.98] cursor-pointer"
              >
                {t("details.cancel")}
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 rounded-2xl bg-rose-600 hover:bg-rose-700 py-3 text-xs font-black text-white shadow-md transition active:scale-[0.98] cursor-pointer"
              >
                {t("details.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
