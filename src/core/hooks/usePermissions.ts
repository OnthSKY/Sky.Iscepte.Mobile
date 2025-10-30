import { useMemo } from 'react';
import { hasPermission, Role } from '../config/permissions';

export const usePermissions = (role: Role) => {
  return useMemo(
    () => ({
      can: (permission: string) => hasPermission(role, permission),
      role,
    }),
    [role]
  );
};

export default usePermissions;


