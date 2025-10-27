export function extractMeta(latex = '') {
  const meta = { changes: [], todo: [] };
  // Find meta block between markers
  const start = latex.indexOf('% === META START ===');
  const end = latex.indexOf('% === META END ===');
  if (start === -1 || end === -1 || end < start) return meta;
  const block = latex.substring(start, end).split('\n');
  let mode = null;
  for (const line of block) {
    const trimmed = line.trim();
    if (trimmed.startsWith('% CHANGES:')) { mode = 'changes'; continue; }
    if (trimmed.startsWith('% TODO:')) { mode = 'todo'; continue; }
    if (!trimmed.startsWith('% -')) continue;
    const item = trimmed.replace(/^%\s*-\s*/, '').trim();
    if (!item) continue;
    if (mode === 'changes') meta.changes.push(item);
    else if (mode === 'todo') meta.todo.push(item);
  }
  return meta;
}
