import { Moon, Sun, Globe } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';

export function ThemeLangToggle({ variant = 'light' }: { variant?: 'light' | 'header' }) {
  const { theme, toggleTheme, lang, toggleLang } = useSettingsStore();
  const isDark = variant === 'header';

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={toggleLang}
        className={`p-2 rounded-lg text-xs font-semibold transition-colors ${isDark ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
        title={lang === 'ru' ? 'Switch to English' : 'Переключить на русский'}
      >
        <span className="flex items-center gap-1">
          <Globe size={16} />
          <span className="uppercase">{lang}</span>
        </span>
      </button>
      <button
        onClick={toggleTheme}
        className={`p-2 rounded-lg transition-colors ${isDark ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
        title={theme === 'light' ? 'Dark mode' : 'Light mode'}
      >
        {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
      </button>
    </div>
  );
}
