import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Edit, FileText, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useListNotes, useCreateNote, useUpdateNote, useDeleteNote, getListNotesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function NotesPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const id = Number(tripId);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notes, isLoading } = useListNotes(id, { query: { enabled: !!id, queryKey: getListNotesQueryKey(id) } });
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  const [newContent, setNewContent] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  const handleCreate = async () => {
    if (!newContent.trim()) return;
    try {
      await createNote.mutateAsync({ tripId: id, data: { content: newContent.trim() } });
      queryClient.invalidateQueries({ queryKey: getListNotesQueryKey(id) });
      setNewContent("");
    } catch { toast({ title: "Failed to create note", variant: "destructive" }); }
  };

  const handleUpdate = async (noteId: number) => {
    if (!editContent.trim()) return;
    try {
      await updateNote.mutateAsync({ tripId: id, noteId, data: { content: editContent.trim() } });
      queryClient.invalidateQueries({ queryKey: getListNotesQueryKey(id) });
      setEditingId(null);
    } catch { toast({ title: "Failed to update note", variant: "destructive" }); }
  };

  const handleDelete = async (noteId: number) => {
    try {
      await deleteNote.mutateAsync({ tripId: id, noteId });
      queryClient.invalidateQueries({ queryKey: getListNotesQueryKey(id) });
    } catch { toast({ title: "Failed to delete note", variant: "destructive" }); }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Button variant="ghost" className="mb-4 -ml-2 text-muted-foreground" onClick={() => setLocation(`/trips/${id}`)}>
          <ArrowLeft size={16} className="mr-2" />
          Back to trip
        </Button>
        <h1 className="font-serif text-4xl font-bold text-foreground">Trip Journal</h1>
        <p className="text-muted-foreground mt-1">Jot down reminders, notes, and ideas for your trip</p>
      </motion.div>

      {/* New note */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-border">
          <CardContent className="pt-5 pb-5">
            <Textarea
              placeholder="Write a note or reminder..."
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              rows={3}
              className="resize-none mb-3"
              data-testid="textarea-note"
            />
            <Button onClick={handleCreate} disabled={createNote.isPending || !newContent.trim()} className="font-medium" data-testid="button-add-note">
              <Plus size={16} className="mr-2" />
              {createNote.isPending ? "Adding..." : "Add note"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {isLoading ? (
        <div className="space-y-4"><Skeleton className="h-28 rounded-2xl" /><Skeleton className="h-28 rounded-2xl" /></div>
      ) : notes?.length === 0 ? (
        <Card className="border-dashed border-2 border-border bg-muted/20">
          <CardContent className="py-14 text-center">
            <FileText size={32} className="text-primary/40 mx-auto mb-3" />
            <p className="text-muted-foreground">Your trip journal is empty. Add your first note above.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {notes?.slice().reverse().map((note, i) => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className="border-border hover:border-primary/20 transition-colors group">
                  <CardContent className="pt-4 pb-4">
                    {editingId === note.id ? (
                      <div>
                        <Textarea
                          value={editContent}
                          onChange={e => setEditContent(e.target.value)}
                          rows={3}
                          className="resize-none mb-3"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleUpdate(note.id)} disabled={updateNote.isPending}>
                            <Check size={14} className="mr-1.5" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                            <X size={14} className="mr-1.5" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-foreground whitespace-pre-wrap leading-relaxed">{note.content}</p>
                        <div className="flex items-center justify-between mt-3">
                          <p className="text-xs text-muted-foreground">
                            {new Date(note.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => { setEditingId(note.id); setEditContent(note.content); }}>
                              <Edit size={13} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(note.id)}>
                              <Trash2 size={13} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
