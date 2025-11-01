import { useMemo } from 'react';
import { hasPermission } from '../config/permissions';
import { Role } from '../config/appConstants';

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


