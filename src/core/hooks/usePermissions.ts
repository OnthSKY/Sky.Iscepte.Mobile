import { useMemo } from 'react';
import { hasPermission } from '../config/permissions';
import { Role } from '../config/appConstants';

export const usePermissions = (role: Role) => {
  return useMemo(
    () => ({
      can: (permission: string) => hasPermission(role, permission),
      canAny: (permissions: string[]) => permissions.some(p => hasPermission(role, p)),
      role,
    }),
    [role]
  );
};

export default usePermissions;


