export const formatAiSummary = (raw?: string): string => {
  if (!raw) return '';

  const trimmed = raw.trim();

  if (!trimmed) return '';

  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === 'object') {
      const order = ['subjective', 'objective', 'assessment', 'plan'];
      const lowerKeyed = Object.fromEntries(
        Object.entries(parsed as Record<string, unknown>).map(([k, v]) => [
          k.toLowerCase(),
          v,
        ]),
      );

      const lines = order
        .map((key) => {
          const value = lowerKeyed[key];

          if (!value) return null;

          return `${key[0].toUpperCase()}${key.slice(1)}: ${String(value)}`;
        })
        .filter(Boolean) as string[];

      return lines.length ? lines.join(' • ') : trimmed;
    }
  } catch {
    // keep raw
  }

  return trimmed;
};

export const calculateAge = (dateOfBirth: string): number => {
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};
