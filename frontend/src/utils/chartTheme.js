export function getChartTheme(isDark) {
  return {
    grid: isDark ? '#334155' : '#e2e8f0',
    axis: isDark ? '#94a3b8' : '#64748b',
    tooltip: {
      backgroundColor: isDark ? 'rgba(30, 41, 59, 0.96)' : 'rgba(255, 255, 255, 0.96)',
      border: 'none',
      borderRadius: '12px',
      color: isDark ? '#f1f5f9' : '#0f172a',
      boxShadow: isDark
        ? '0 8px 24px rgb(0 0 0 / 0.45)'
        : '0 4px 14px rgb(15 23 42 / 0.08)',
    },
  };
}
