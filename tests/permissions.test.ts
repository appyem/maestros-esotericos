import { describe, it, expect } from 'vitest';

import { ROLE_PERMISSIONS, type UserRole } from '@/types/auth';

describe('Security: Role Permissions Matrix', () => {
  it('should deny all permissions to PUBLIC role', () => {
    expect(ROLE_PERMISSIONS.PUBLIC).toHaveLength(0);
  });

  it('should allow CLIENTE to read their own profile and data', () => {
    const clientePerms = ROLE_PERMISSIONS.CLIENTE;
    expect(clientePerms).toContain('profile.read.self');
    expect(clientePerms).toContain('profile.update.self');
    expect(clientePerms).toContain('client.read.self');
    expect(clientePerms).toContain('conversation.read.self');
  });

  it('should deny CLIENTE from managing system or accessing other users data', () => {
    const clientePerms = ROLE_PERMISSIONS.CLIENTE;
    expect(clientePerms).not.toContain('system.manage');
    expect(clientePerms).not.toContain('client.read.all');
    expect(clientePerms).not.toContain('roles.manage');
  });

  it('should allow MAESTRO to read assigned clients and consultations', () => {
    const maestroPerms = ROLE_PERMISSIONS.MAESTRO;
    expect(maestroPerms).toContain('client.read.assigned');
    expect(maestroPerms).toContain('consultation.read.assigned');
    expect(maestroPerms).not.toContain('client.read.all'); // No debe ver todos los clientes
  });

  it('should allow ADMINISTRADOR to manage orders and read all non-sensitive data', () => {
    const adminPerms = ROLE_PERMISSIONS.ADMINISTRADOR;
    expect(adminPerms).toContain('client.read.all');
    expect(adminPerms).toContain('order.manage');
    expect(adminPerms).not.toContain('system.manage'); // No debe poder gestionar el sistema global
    expect(adminPerms).not.toContain('roles.manage'); // No debe poder cambiar roles
  });

  it('should grant SUPER_ADMIN all critical system permissions', () => {
    const superAdminPerms = ROLE_PERMISSIONS.SUPER_ADMIN;
    expect(superAdminPerms).toContain('system.manage');
    expect(superAdminPerms).toContain('roles.manage');
    expect(superAdminPerms).toContain('permissions.manage');
    expect(superAdminPerms).toContain('audit.read');
  });

  it('should have valid permissions array for every defined role', () => {
    const roles: UserRole[] = ['PUBLIC', 'CLIENTE', 'MAESTRO', 'ADMINISTRADOR', 'SUPER_ADMIN'];
    
    roles.forEach((role) => {
      expect(ROLE_PERMISSIONS[role]).toBeDefined();
      expect(Array.isArray(ROLE_PERMISSIONS[role])).toBe(true);
    });
  });
});
