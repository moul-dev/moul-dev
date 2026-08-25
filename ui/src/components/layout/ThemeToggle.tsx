import React from 'react';
import { SparkleIcon, SunIcon, MoonIcon } from '@phosphor-icons/react';
import { Button, TooltipTrigger, Tooltip } from '@moul-dev/ui';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, resolvedTheme, cycleTheme } = useTheme();

  const getThemeDetails = () => {
    switch (theme) {
      case 'system':
        return {
          icon: <SparkleIcon size={16} weight="duotone" />,
          label: `System`,
          nextThemeLabel: 'Light',
          ariaLabel: `Current theme: System (${resolvedTheme}). Click to switch to Light mode`,
        };
      case 'light':
        return {
          icon: <SunIcon size={16} weight="duotone" />,
          label: 'Light',
          nextThemeLabel: 'Dark',
          ariaLabel: 'Current theme: Light. Click to switch to Dark mode',
        };
      case 'dark':
        return {
          icon: <MoonIcon size={16} weight="duotone" />,
          label: 'Dark',
          nextThemeLabel: 'System',
          ariaLabel: 'Current theme: Dark. Click to switch to System mode',
        };
    }
  };

  const { icon, label, ariaLabel } = getThemeDetails();

  return (
    <TooltipTrigger delay={250}>
      <Button
        variant="outline"
        size="sm"
        onPress={cycleTheme}
        aria-label={ariaLabel}
        isIcon={true}
      >
        {icon}
      </Button>
      <Tooltip offset={8}>{label}</Tooltip>
    </TooltipTrigger>
  );
};

