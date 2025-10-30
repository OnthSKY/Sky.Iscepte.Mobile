import type { Role } from '../../core/config/permissions';

export interface UserProfile {
  id: string;
  name: string;
  role: Role;
}


