import React, { useEffect, useState } from 'react';
import {
  Bookmark,
  BookmarkPlus,
  Clock,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react';

export interface SavedFilterPreset<T> {
  id: string;
  name: string;
  filters: T;
  summary: string;
  savedAt: string;
}

export interface RecentSearchEntry<T> {
  id: string;
  query: string;
  summary: string;
  filters: T;
  usedAt: string;
}

interface StoredSearchState<T> {
  presets: SavedFilterPreset<T>[];
  recent: RecentSearchEntry<T>[];
}

export function useSavedFilters<T extends { search: string }>(options: {
  storageKey: string;
  currentFilters: T;
  activeSummary: string;
  hasActiveFilters: boolean;
  defaultPresets?: SavedFilterPreset<T>[];
}) {
  const { storageKey, currentFilters, activeSummary, hasActiveFilters, defaultPresets = [] } = options;

  const [store, setStore] = useState<StoredSearchState<T>>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredSearchState<T>;
        return {
          presets: Array.isArray(parsed.presets) ? parsed.presets : defaultPresets,
          recent: Array.isArray(parsed.recent) ? parsed.recent : [],
        };
      }
    } catch {
      // ignore storage read errors
    }
    return {
      presets: defaultPresets,
      recent: [],
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(store));
    } catch {
      // ignore storage write errors
    }
  }, [storageKey, store]);

  const recordRecent = (filtersSnapshot: T = currentFilters, summaryText: string = activeSummary) => {
    const trimmed = filtersSnapshot.search.trim();
    if (!trimmed && !hasActiveFilters) return;

    const label = trimmed || summaryText;
    const filterKey = JSON.stringify(filtersSnapshot);

    setStore((prev) => {
      const filtered = prev.recent.filter(
        (item) => JSON.stringify(item.filters) !== filterKey && item.query.toLowerCase() !== label.toLowerCase()
      );
      const nextEntry: RecentSearchEntry<T> = {
        id: `rec-${Date.now()}`,
        query: trimmed || summaryText,
        summary: summaryText,
        filters: filtersSnapshot,
        usedAt: new Date().toISOString().slice(11, 16),
      };
      return {
        ...prev,
        recent: [nextEntry, ...filtered].slice(0, 6),
      };
    });
  };

  // Auto-record recent text search after typing settles (min 2 chars)
  useEffect(() => {
    const trimmed = currentFilters.search.trim();
    if (trimmed.length < 2) return;
    const timer = window.setTimeout(() => {
      recordRecent(currentFilters, activeSummary);
    }, 1000);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFilters.search]);

  const savePreset = (name: string) => {
    const cleanName = name.trim();
    if (!cleanName) return;
    const entry: SavedFilterPreset<T> = {
      id: `preset-${Date.now()}`,
      name: cleanName,
      filters: { ...currentFilters },
      summary: activeSummary,
      savedAt: new Date().toISOString().slice(0, 10),
    };
    setStore((prev) => ({
      ...prev,
      presets: [entry, ...prev.presets.filter((p) => p.name.toLowerCase() !== cleanName.toLowerCase())].slice(0, 10),
    }));
  };

  const deletePreset = (id: string) => {
    setStore((prev) => ({
      ...prev,
      presets: prev.presets.filter((p) => p.id !== id),
    }));
  };

  const deleteRecent = (id: string) => {
    setStore((prev) => ({
      ...prev,
      recent: prev.recent.filter((r) => r.id !== id),
    }));
  };

  const clearRecent = () => {
    setStore((prev) => ({ ...prev, recent: [] }));
  };

  return {
    presets: store.presets,
    recent: store.recent,
    recordRecent,
    savePreset,
    deletePreset,
    deleteRecent,
    clearRecent,
  };
}

interface SavedFilterBarProps<T> {
  presets: SavedFilterPreset<T>[];
  recent: RecentSearchEntry<T>[];
  hasActiveFilters: boolean;
  suggestedName: string;
  activeSummary: string;
  onApply: (filters: T, summary?: string) => void;
  onSavePreset: (name: string) => void;
  onDeletePreset: (id: string) => void;
  onDeleteRecent: (id: string) => void;
  onClearRecent: () => void;
  onResetFilters: () => void;
}

export function SavedFilterBar<T>({
  presets,
  recent,
  hasActiveFilters,
  suggestedName,
  activeSummary,
  onApply,
  onSavePreset,
  onDeletePreset,
  onDeleteRecent,
  onClearRecent,
  onResetFilters,
}: SavedFilterBarProps<T>) {
  const [savingOpen, setSavingOpen] = useState(false);
  const [presetName, setPresetName] = useState('');

  const handleOpenSave = () => {
    setPresetName(suggestedName);
    setSavingOpen(true);
  };

  const handleConfirmSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!presetName.trim()) return;
    onSavePreset(presetName.trim());
    setPresetName('');
    setSavingOpen(false);
  };

  return (
    <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs">
      {/* Top Action Strip: Save Filter + Reset */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          {!savingOpen ? (
            <button
              type="button"
              disabled={!hasActiveFilters}
              onClick={handleOpenSave}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap shrink-0 ${
                hasActiveFilters
                  ? 'text-blue-700 bg-blue-50 hover:bg-blue-100'
                  : 'text-slate-400 bg-slate-50 cursor-not-allowed'
              }`}
              title={
                hasActiveFilters
                  ? 'Save current search and filter configuration'
                  : 'Enter a search term or select a filter to save a configuration'
              }
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>Save Filter Config</span>
            </button>
          ) : (
            <form onSubmit={handleConfirmSave} className="flex flex-wrap items-center gap-1.5">
              <input
                type="text"
                required
                autoFocus
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Configuration name..."
                className="px-2.5 py-1 text-xs border border-blue-300 rounded-lg focus:outline-none focus:border-blue-600 w-56"
              />
              <button
                type="submit"
                className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg whitespace-nowrap shrink-0"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setSavingOpen(false)}
                className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 whitespace-nowrap shrink-0"
              >
                Cancel
              </button>
            </form>
          )}

          {hasActiveFilters && !savingOpen && (
            <span className="text-[11px] text-slate-500 truncate max-w-md" title={activeSummary}>
              {activeSummary}
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Saved Configurations Row */}
      {presets.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 mr-1 whitespace-nowrap">
            <Bookmark className="w-3 h-3" />
            <span>Saved Filters:</span>
          </span>
          {presets.map((preset) => (
            <div
              key={preset.id}
              className="inline-flex items-center border border-slate-200 bg-slate-50 hover:border-blue-300 rounded-lg overflow-hidden"
            >
              <button
                type="button"
                onClick={() => onApply(preset.filters, preset.summary)}
                title={preset.summary}
                className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-blue-700 hover:bg-blue-50/70 transition-colors whitespace-nowrap"
              >
                {preset.name}
              </button>
              <button
                type="button"
                onClick={() => onDeletePreset(preset.id)}
                title={`Remove "${preset.name}"`}
                aria-label={`Remove saved filter ${preset.name}`}
                className="px-1.5 py-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border-l border-slate-200 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Recent Searches Row */}
      {recent.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 mr-1 whitespace-nowrap">
            <Clock className="w-3 h-3" />
            <span>Recent Searches:</span>
          </span>
          {recent.map((item) => (
            <div
              key={item.id}
              className="inline-flex items-center border border-slate-200 bg-white hover:border-slate-300 rounded-lg overflow-hidden"
            >
              <button
                type="button"
                onClick={() => onApply(item.filters, item.summary)}
                title={`${item.summary} (${item.usedAt})`}
                className="px-2.5 py-1 text-xs text-slate-700 hover:text-blue-700 hover:bg-slate-50 transition-colors max-w-[200px] truncate"
              >
                {item.query}
              </button>
              <button
                type="button"
                onClick={() => onDeleteRecent(item.id)}
                title="Remove recent search"
                aria-label={`Remove recent search ${item.query}`}
                className="px-1.5 py-1 text-slate-400 hover:text-rose-600 border-l border-slate-100 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={onClearRecent}
            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] text-slate-400 hover:text-rose-600 whitespace-nowrap"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      )}
    </div>
  );
}
