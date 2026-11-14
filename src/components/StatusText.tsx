import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  RotateCcw,
  FileEdit,
  Send,
  ShieldCheck,
  Archive,
  CircleDashed,
} from 'lucide-react';

interface StatusTextProps {
  status: string;
  className?: string;
}

export const StatusText: React.FC<StatusTextProps> = ({ status, className = '' }) => {
  const normalized = status.toLowerCase();

  let colorClass = 'text-slate-600';
  let Icon = CircleDashed;

  if (
    normalized === 'active' ||
    normalized === 'approved' ||
    normalized === 'accepted' ||
    normalized === 'ready' ||
    normalized === 'available'
  ) {
    colorClass = 'text-emerald-700';
    Icon = CheckCircle2;
  } else if (
    normalized === 'submitted' ||
    normalized === 'submitted for review' ||
    normalized === 'in review' ||
    normalized === 'reviewed' ||
    normalized === 'pending approval' ||
    normalized === 'pending final approval'
  ) {
    colorClass = 'text-blue-700';
    Icon = normalized.includes('review') || normalized.includes('approval') ? ShieldCheck : Send;
  } else if (
    normalized === 'returned' ||
    normalized === 'returned to author' ||
    normalized === 'returned for revision' ||
    normalized === 'suspended' ||
    normalized === 'rejected'
  ) {
    colorClass = 'text-rose-700';
    Icon = RotateCcw;
  } else if (
    normalized === 'incomplete' ||
    normalized === 'in progress' ||
    normalized === 'in assembly' ||
    normalized === 'assigned' ||
    normalized === 'reserved'
  ) {
    colorClass = 'text-amber-700';
    Icon = Clock;
  } else if (normalized === 'draft') {
    colorClass = 'text-slate-600';
    Icon = FileEdit;
  } else if (normalized === 'archived' || normalized === 'retired') {
    colorClass = 'text-slate-500';
    Icon = Archive;
  } else if (normalized === 'not started') {
    colorClass = 'text-slate-400';
    Icon = AlertCircle;
  } else if (normalized === 'used in active exam') {
    colorClass = 'text-indigo-700';
    Icon = ShieldCheck;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap ${colorClass} ${className}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{status}</span>
    </span>
  );
};
