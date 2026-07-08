export const TYPE_CONFIG: Record<string, { color: string; bg: string }> = {
  'زامل':    { color: 'text-amber-700 dark:text-amber-300',    bg: 'bg-amber-100 dark:bg-amber-900/40 border-amber-200 dark:border-amber-700/50' },
  'نشيد':    { color: 'text-violet-700 dark:text-violet-300',  bg: 'bg-violet-100 dark:bg-violet-900/40 border-violet-200 dark:border-violet-700/50' },
  'مرثية':   { color: 'text-slate-700 dark:text-slate-300',    bg: 'bg-slate-100 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700/50' },
  'أوبريت':   { color: 'text-emerald-700 dark:text-emerald-300',bg: 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-700/50' },
};

export const ALL_TYPES = Object.keys(TYPE_CONFIG);

export const getTypeConfig = (type?: string | null) => {
  if (!type) return { color: 'text-muted-foreground', bg: 'bg-muted border-border' };
  return TYPE_CONFIG[type] || { color: 'text-muted-foreground', bg: 'bg-muted border-border' };
};
