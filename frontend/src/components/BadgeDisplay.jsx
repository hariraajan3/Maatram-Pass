import React from 'react';
import { Award, Star, Zap, Clock, Users, Trophy } from 'lucide-react';

const BADGE_CONFIG = {
  EVENT_1:          { label: 'First Step',       icon: Star,   color: 'text-yellow-500 bg-yellow-50' },
  EVENT_5:          { label: '5 Events',          icon: Award,  color: 'text-blue-500 bg-blue-50' },
  EVENT_10:         { label: '10 Events',         icon: Award,  color: 'text-purple-500 bg-purple-50' },
  HOURS_10:         { label: '10 Hours',          icon: Clock,  color: 'text-green-500 bg-green-50' },
  HOURS_25:         { label: '25 Hours',          icon: Clock,  color: 'text-teal-500 bg-teal-50' },
  HOURS_50:         { label: '50 Hours',          icon: Zap,    color: 'text-orange-500 bg-orange-50' },
  LEADERBOARD_TOP1: { label: '#1 Leaderboard',    icon: Trophy, color: 'text-yellow-600 bg-yellow-50' },
  LEADERBOARD_TOP2: { label: '#2 Leaderboard',    icon: Trophy, color: 'text-gray-500 bg-gray-50' },
  LEADERBOARD_TOP3: { label: '#3 Leaderboard',    icon: Trophy, color: 'text-amber-600 bg-amber-50' },
};

export default function BadgeDisplay({ type, size = 'md' }) {
  const cfg = BADGE_CONFIG[type];
  if (!cfg) return null;
  const Icon = cfg.icon;
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 24 : 18;
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs';
  const padding = size === 'sm' ? 'px-2 py-1' : size === 'lg' ? 'px-3 py-2' : 'px-2.5 py-1.5';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${padding} ${textSize} ${cfg.color}`}>
      <Icon size={iconSize} />
      {cfg.label}
    </span>
  );
}
