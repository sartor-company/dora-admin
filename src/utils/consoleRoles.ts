import type { ApiTeamMember } from '../types/api';

const CONSOLE_ROLE_LABELS: Record<string, string> = {
  batch: 'Batch Admin',
  brand: 'Brand Manager',
  inv: 'Investigation Officer',
};

export function teamMemberRoleLabel(member: ApiTeamMember): string {
  if (member.consoleRole && CONSOLE_ROLE_LABELS[member.consoleRole]) {
    return CONSOLE_ROLE_LABELS[member.consoleRole];
  }
  return member.role || 'Staff';
}

export const CONSOLE_ROLE_OPTIONS = [
  { value: 'batch' as const, label: 'Batch Admin' },
  { value: 'brand' as const, label: 'Brand Manager' },
  { value: 'inv' as const, label: 'Investigation Officer' },
];
