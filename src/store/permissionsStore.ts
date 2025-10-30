import { create } from 'zustand';
import roles from '../mocks/roles.json';
import packages from '../mocks/packages.json';
import users from '../mocks/users.json';

export interface PermissionDetail {
  actions: string[];
  fields: string[];
  notifications: string[];
}

interface PermissionStore {
  modulePermissions: Record<string, PermissionDetail>;
  loadPermissions: (userId: number) => void;
}

export const usePermissionStore = create<PermissionStore>((set) => ({
  modulePermissions: {},
  loadPermissions: (userId) => {
    const user: any = (users as any).find((u: any) => u.id === userId);
    if (!user) return;

    const role: any = (roles as any).find((r: any) => r.id === user.role);
    const pkg: any = (packages as any).find((p: any) => p.id === user.package);

    const filteredModules: string[] = pkg ? pkg.allowedModules : [];
    const rolePerms: Record<string, PermissionDetail> = role ? role.permissions : {};

    const finalPerms: Record<string, PermissionDetail> = {};

    filteredModules.forEach((mod) => {
      const base = (rolePerms as any)[mod] || { actions: [], fields: [], notifications: [] };
      const custom = (user.customPermissions || {})[mod] || {};

      finalPerms[mod] = {
        actions: Array.from(new Set([...(base.actions || []), ...(custom.actions || [])])),
        fields: Array.from(new Set([...(base.fields || []), ...(custom.fields || [])])),
        notifications: Array.from(new Set([...(base.notifications || []), ...(custom.notifications || [])])),
      };
    });

    set({ modulePermissions: finalPerms });
  },
}));

export default usePermissionStore;


