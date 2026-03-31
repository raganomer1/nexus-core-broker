import React, { useState, useCallback } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ConfirmDeleteState {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
}

export function useConfirmDelete() {
  const [state, setState] = useState<ConfirmDeleteState>({
    open: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  const confirmDelete = useCallback((title: string, description: string, onConfirm: () => void) => {
    setState({ open: true, title, description, onConfirm });
  }, []);

  const close = useCallback(() => {
    setState(s => ({ ...s, open: false }));
  }, []);

  return { state, confirmDelete, close };
}

export function ConfirmDeleteDialog({ state, onClose }: { state: ConfirmDeleteState; onClose: () => void }) {
  return (
    <AlertDialog open={state.open} onOpenChange={open => { if (!open) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{state.title}</AlertDialogTitle>
          <AlertDialogDescription>{state.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => { state.onConfirm(); onClose(); }}
          >
            Удалить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
