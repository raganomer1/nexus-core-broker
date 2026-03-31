import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface Props {
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
  onPageChange: (p: number) => void;
  onPerPageChange: (p: number) => void;
  selectedCount?: number;
}

export default function TablePagination({ page, totalPages, total, perPage, onPageChange, onPerPageChange, selectedCount }: Props) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-3 border-t text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <span>Показано {Math.min((page - 1) * perPage + 1, total)}–{Math.min(page * perPage, total)} из {total}</span>
        {selectedCount != null && selectedCount > 0 && <span>· Выбрано: {selectedCount}</span>}
      </div>
      <div className="flex items-center gap-1">
        <Select value={String(perPage)} onValueChange={v => { onPerPageChange(Number(v)); onPageChange(1); }}>
          <SelectTrigger className="w-[70px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {[10, 25, 50, 100].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => onPageChange(1)}><ChevronsLeft size={14} /></Button>
        <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => onPageChange(page - 1)}><ChevronLeft size={14} /></Button>
        <span className="px-2 text-xs">{page}/{totalPages}</span>
        <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}><ChevronRight size={14} /></Button>
        <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => onPageChange(totalPages)}><ChevronsRight size={14} /></Button>
      </div>
    </div>
  );
}
