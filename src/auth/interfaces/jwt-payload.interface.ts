export interface JwtPayload {
    email: string;
    sub: number;  // El ID del usuario
    sessionId: number;
  }
  