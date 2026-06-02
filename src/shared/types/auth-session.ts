/**
 * بيانات المستخدم من GET /v1/users/me (المصدر الرئيسي بعد تسجيل الدخول).
 */
export interface AuthUser {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  /** مثل Warehouse Manager من /users/me */
  position: string;
  /** الدور كما يعيده الـ backend، مثل WAREHOUSE_MANAGER */
  backendRole: string;
  accessLevel: string;
  userActive: boolean;
  tenantType: string;
  tenantId: number;
  tenantName: string;
  /** مدة صلاحية access token بالثواني */
  expiresInSeconds: number;
}
