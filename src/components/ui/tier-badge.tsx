// components/ui/tier-badge.tsx
interface TierBadgeProps {
    tier: string;
    size?: 'sm' | 'md' | 'lg';
  }
  
  const tierConfig: Record<string, { bg: string; text: string; border: string; icon: string }> = {
    common: {
      bg: 'bg-zinc-500/20',
      text: 'text-zinc-400',
      border: 'border-zinc-500/30',
      icon: '⚪',
    },
    uncommon: {
      bg: 'bg-blue-500/20',
      text: 'text-blue-400',
      border: 'border-blue-500/30',
      icon: '🔵',
    },
    rare: {
      bg: 'bg-purple-500/20',
      text: 'text-purple-400',
      border: 'border-purple-500/30',
      icon: '🟣',
    },
    legendary: {
      bg: 'bg-yellow-500/20',
      text: 'text-yellow-400',
      border: 'border-yellow-500/30 animate-pulse',
      icon: '🌟',
    },
  };
  
  export function TierBadge({ tier, size = 'md' }: TierBadgeProps) {
    const config = tierConfig[tier.toLowerCase()] || tierConfig.common;
    
    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-2 text-base',
    };
  
    return (
      <span
        className={`
          inline-flex items-center gap-1 rounded-full border font-medium
          ${config.bg} ${config.text} ${config.border} ${sizes[size]}
        `}
      >
        <span>{config.icon}</span>
        <span className="capitalize">{tier}</span>
      </span>
    );
  }