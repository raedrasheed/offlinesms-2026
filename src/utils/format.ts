export const truncate = (input: string, max: number) =>
  input.length > max ? input.slice(0, max - 1) + '…' : input;

export const normalizePhone = (raw: string): string => {
  const trimmed = raw.trim();
  if (trimmed.startsWith('+')) return '+' + trimmed.slice(1).replace(/\D/g, '');
  return '+' + trimmed.replace(/\D/g, '');
};
