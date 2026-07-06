import type { RoleId } from '../types';
import type { TenantProfile } from '../store/authStore';

export function resolveConsoleRole(data: {
  accountType: string;
  consoleRole?: string;
}): RoleId {
  if (data.accountType === 'admin') return 'owner';
  const r = data.consoleRole as RoleId | undefined;
  if (r === 'batch' || r === 'brand' || r === 'inv') return r;
  return 'owner';
}

export function mapLoginToProfile(data: Record<string, unknown>): TenantProfile {
  const accountType = data.accountType as 'admin' | 'user';
  const consoleRole = resolveConsoleRole({
    accountType,
    consoleRole: data.consoleRole as string | undefined,
  });
  const companyName =
    accountType === 'admin'
      ? (data.fullName as string)
      : (data.tenantName as string) || (data.fullName as string);

  return {
    _id: data._id as string,
    fullName: companyName,
    displayName: accountType === 'user' ? (data.fullName as string) : undefined,
    email: data.email as string,
    token: data.token as string,
    accountType,
    consoleRole,
    role: data.role as string | undefined,
    clientCode: data.clientCode as string | undefined,
    rcNumber: data.rcNumber as string | undefined,
    industry: data.industry as string | undefined,
    phone: data.phone as string | undefined,
    address: data.address as string | undefined,
    scBand: data.scBand as TenantProfile['scBand'],
    engagement: data.engagement as TenantProfile['engagement'],
    smsCredits: data.smsCredits as number | undefined,
    pinCredits: data.pinCredits as number | undefined,
    batchCalCredits: data.batchCalCredits as number | undefined,
    verifyDomain: data.verifyDomain as string | undefined,
    domainTier: data.domainTier as string | undefined,
    crmEnabled: data.crmEnabled as boolean | undefined,
    crmTier: data.crmTier as string | null | undefined,
    crmSeats: data.crmSeats as number | undefined,
    campaignStacking: data.campaignStacking as boolean | undefined,
    platformStatus: data.platformStatus as string | undefined,
  };
}
