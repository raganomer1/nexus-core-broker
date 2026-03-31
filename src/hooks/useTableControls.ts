import { useState, useMemo } from 'react';

export type SortDir = 'asc' | 'desc' | null;

export function useTableControls<T>(data: T[], defaultPerPage = 25) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(defaultPerPage);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc');
      else if (sortDir === 'desc') { setSortKey(null); setSortDir(null); }
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return data;
    return [...data].sort((a, b) => {
      const av = (a as any)[sortKey];
      const bv = (b as any)[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = typeof av === 'string' ? av.localeCompare(bv, 'ru') : av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const safePage = Math.min(page, totalPages);
  const paginated = sorted.slice((safePage - 1) * perPage, safePage * perPage);

  const sortIcon = (key: string) => {
    if (sortKey !== key || !sortDir) return ' ↕';
    return sortDir === 'asc' ? ' ↑' : ' ↓';
  };

  return { sorted, paginated, page: safePage, setPage, perPage, setPerPage, totalPages, toggleSort, sortIcon, sortKey, sortDir };
}
