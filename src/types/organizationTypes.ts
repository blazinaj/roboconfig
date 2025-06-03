export type OrganizationRole = 'owner' | 'admin' | 'member';

export type Organization = {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  role: OrganizationRole;
  created_at: string;
};

export type OrganizationMember = {
  organization_id: string;
  user_id: string;
  email: string;
  full_name?: string;
  role: OrganizationRole;
  joined_at: string;
};

export type OrganizationInvitation = {
  id: string;
  organization_id: string;
  email: string;
  role: 'admin' | 'member';
  token: string;
  expires_at: string;
  created_at: string;
};