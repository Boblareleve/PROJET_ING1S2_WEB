import { ROLE } from '../../share/role';

export function getHomeByRole(role: number): string {
  switch (role) {
    case ROLE.ADMIN:      return "/admin/dashboard"
    case ROLE.STUDENT:    return "/etudiant"
    case ROLE.COMPANY:    return "/entreprise"
    case ROLE.SUPERVISOR: return "/jury"
    default:              return "/auth/login"
  }
}