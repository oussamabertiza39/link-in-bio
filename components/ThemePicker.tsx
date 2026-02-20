'use client';

import { Button } from '@/components/ui/button';

const themes = ['minimal', 'sunset', 'midnight'];

export function ThemePicker({ currentTheme, onSelect }: { currentTheme: string; onSelect: (theme: string) => void }) {
  return (
    <div className="flex gap-2">
      {themes.map((theme) => (
        <Button key={theme} onClick={() => onSelect(theme)} className={currentTheme === theme ? '' : 'bg-muted text-white'}>
          {theme}
        </Button>
      ))}
    </div>
  );
}
