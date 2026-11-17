import React, { useState } from 'react';
import { Tag, Sparkles, Check, RotateCcw, Plus, X, AlertTriangle } from 'lucide-react';
import { CognitiveLevel } from '../types/examnova';
import { detectBloomsFromStem, getBloomsMeta } from '../utils/bloomsTaxonomy';

interface BloomsTaxonomyTaggerProps {
  cognitiveLevels: CognitiveLevel[];
  selectedCognitiveLevelId: string;
  targetCognitiveLevelId?: string;
  bloomTags: string[];
  stem: string;
  disabled?: boolean;
  onChangeCognitiveLevel: (cognitiveLevelId: string) => void;
  onChangeBloomTags: (tags: string[]) => void;
  onAutoDetectApplied?: (cognitiveLevelId: string, verbs: string[]) => void;
}

export const BloomsTaxonomyTagger: React.FC<BloomsTaxonomyTaggerProps> = ({
  cognitiveLevels,
  selectedCognitiveLevelId,
  targetCognitiveLevelId,
  bloomTags,
  stem,
  disabled = false,
  onChangeCognitiveLevel,
  onChangeBloomTags,
  onAutoDetectApplied,
}) => {
  const [customVerb, setCustomVerb] = useState('');
  const [detectHint, setDetectHint] = useState<string | null>(null);

  const orderedLevels = [...cognitiveLevels].sort((a, b) => a.order - b.order);
  const activeLevel =
    orderedLevels.find((c) => c.id === selectedCognitiveLevelId) ?? orderedLevels[0];
  const activeMeta = getBloomsMeta(activeLevel);

  const targetLevel = targetCognitiveLevelId
    ? orderedLevels.find((c) => c.id === targetCognitiveLevelId)
    : undefined;
  const targetMeta = targetLevel ? getBloomsMeta(targetLevel) : undefined;
  const isAlignedWithTarget =
    !targetCognitiveLevelId || selectedCognitiveLevelId === targetCognitiveLevelId;

  const toggleVerb = (verb: string) => {
    if (disabled) return;
    const exists = bloomTags.some((t) => t.toLowerCase() === verb.toLowerCase());
    if (exists) {
      onChangeBloomTags(bloomTags.filter((t) => t.toLowerCase() !== verb.toLowerCase()));
    } else {
      onChangeBloomTags([...bloomTags, verb]);
    }
  };

  const handleAddCustomVerb = () => {
    if (disabled) return;
    const clean = customVerb.trim();
    if (!clean) return;
    const formatted = clean.charAt(0).toUpperCase() + clean.slice(1);
    if (!bloomTags.some((t) => t.toLowerCase() === formatted.toLowerCase())) {
      onChangeBloomTags([...bloomTags, formatted]);
    }
    setCustomVerb('');
  };

  const handleAutoDetect = () => {
    if (disabled) return;
    const match = detectBloomsFromStem(stem, orderedLevels);
    if (!match) {
      setDetectHint('No explicit Bloom action verb detected in stem yet. Select a level manually.');
      return;
    }
    const detectedLevel = orderedLevels.find((c) => c.id === match.cognitiveLevelId);
    const meta = getBloomsMeta(detectedLevel);
    onChangeCognitiveLevel(match.cognitiveLevelId);
    const mergedTags = Array.from(new Set([...bloomTags, ...match.matchedVerbs])).slice(0, 5);
    onChangeBloomTags(mergedTags);
    setDetectHint(
      `Classified as ${meta.code} ${meta.shortLabel} (${match.matchedVerbs.join(', ')})`
    );
    onAutoDetectApplied?.(match.cognitiveLevelId, match.matchedVerbs);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-blue-600 shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Bloom&apos;s Taxonomy Classification &amp; Cognitive Tags
            </h3>
            <p className="text-[11px] text-slate-500">
              Classify this item&apos;s cognitive demand (C1–C6) and tag measurable action verbs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isAlignedWithTarget && targetLevel && targetMeta && !disabled && (
            <button
              type="button"
              onClick={() => {
                onChangeCognitiveLevel(targetLevel.id);
                setDetectHint(null);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg whitespace-nowrap shrink-0"
              title={`Reset to Blueprint TOS target (${targetMeta.code} ${targetLevel.name})`}
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to TOS ({targetMeta.code})</span>
            </button>
          )}
          <button
            type="button"
            disabled={disabled || !stem.trim()}
            onClick={handleAutoDetect}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Detect from Stem</span>
          </button>
        </div>
      </div>

      {/* Primary Cognitive Level Selector Grid */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-slate-700">Cognitive Level</span>
          {targetLevel && targetMeta && (
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                isAlignedWithTarget ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {isAlignedWithTarget ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>
                    Aligned with Blueprint TOS ({targetMeta.code} · {targetLevel.name})
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>
                    Reclassified (TOS Target: {targetMeta.code} · {targetLevel.name})
                  </span>
                </>
              )}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {orderedLevels.map((lvl) => {
            const meta = getBloomsMeta(lvl);
            const isSelected = lvl.id === selectedCognitiveLevelId;
            const isTosTarget = targetCognitiveLevelId === lvl.id;
            return (
              <button
                key={lvl.id}
                type="button"
                disabled={disabled}
                onClick={() => {
                  onChangeCognitiveLevel(lvl.id);
                  setDetectHint(null);
                }}
                className={`text-left px-3 py-2 rounded-lg border transition-colors ${
                  isSelected
                    ? meta.activeClass
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                } ${disabled ? 'opacity-75 cursor-default' : 'cursor-pointer'}`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-[11px] font-bold">{meta.code}</span>
                  {isTosTarget && (
                    <span
                      className={`text-[10px] font-mono ${
                        isSelected && lvl.id === 'cog-rem' ? 'text-slate-300' : 'text-slate-400'
                      }`}
                    >
                      TOS
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold truncate mt-0.5">{meta.shortLabel}</div>
              </button>
            );
          })}
        </div>

        {/* Active Level Descriptor */}
        {activeLevel && (
          <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs">
            <div>
              <span className="font-mono font-bold text-slate-800 mr-1.5">{activeMeta.code}</span>
              <span className="font-semibold text-slate-900 mr-1.5">{activeLevel.name}:</span>
              <span className="text-slate-600">{activeLevel.description}</span>
            </div>
            {detectHint && (
              <span className="text-[11px] font-medium text-blue-700">{detectHint}</span>
            )}
          </div>
        )}
      </div>

      {/* Action Verb Tags */}
      <div className="space-y-2.5 pt-2 border-t border-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-slate-700">
            Action Verb Tags ({activeMeta.shortLabel})
          </span>
          <span className="text-[11px] font-mono tabular-nums text-slate-500">
            {bloomTags.length} tag{bloomTags.length === 1 ? '' : 's'} assigned
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {activeMeta.actionVerbs.map((verb) => {
            const active = bloomTags.some((t) => t.toLowerCase() === verb.toLowerCase());
            return (
              <button
                key={verb}
                type="button"
                disabled={disabled}
                onClick={() => toggleVerb(verb)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'border-blue-600 bg-blue-50 text-blue-800'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                } ${disabled ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
              >
                {active && <Check className="w-3 h-3" />}
                <span>{verb}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Tag Input + Active Tag List */}
        {!disabled && (
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={customVerb}
              onChange={(e) => setCustomVerb(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomVerb();
                }
              }}
              placeholder="Add custom Bloom action verb tag (e.g. Interpolate, Sketch)..."
              className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <button
              type="button"
              disabled={!customVerb.trim()}
              onClick={handleAddCustomVerb}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Tag</span>
            </button>
          </div>
        )}

        {bloomTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
            <span className="text-slate-500 font-medium mr-1">Assigned Tags:</span>
            {bloomTags.map((tag) => (
              <span
                key={tag}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border font-mono ${activeMeta.badgeClass}`}
              >
                <span>{tag}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => toggleVerb(tag)}
                    aria-label={`Remove tag ${tag}`}
                    className="hover:text-slate-950"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
