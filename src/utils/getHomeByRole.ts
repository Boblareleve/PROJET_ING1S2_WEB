import { ROLE } from '../../share/role';

export function getHomeByRole(role: number): string {
  switch (role) {
    case ROLE.ADMIN:      return "/admin/dashboard"
    case ROLE.STUDENT:    return "/student"
    case ROLE.COMPANY:    return "/company"
    case ROLE.SUPERVISOR: return "/supervisor"
    default:              return "/auth/login"
  }
}