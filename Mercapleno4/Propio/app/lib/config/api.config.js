export const API_ENDPOINTS = {
  auth: {
    login: "/api/auth/login",
    documentTypes: "/api/auth/document-types",
    verifyLoginCode: "/api/auth/verify-login-code",
    register: "/api/auth/register",
    verifyEmail: "/api/auth/verify-email",
    resendVerification: "/api/auth/resend-verification",
    requestPasswordReset: "/api/auth/request-password-reset",
    resetPassword: "/api/auth/reset-password"
  },
  admin: {
    users: "/api/admin/users"
  },
  products: {
    crud: "/api/productos",
    catalogs: "/api/productos/catalogos"
  },
  sales: {
    base: "/api/sales",
    reports: "/api/sales/reports"
  },
  movements: {
    base: "/api/movimientos",
    documents: "/api/movimientos/documentos"
  }
};
