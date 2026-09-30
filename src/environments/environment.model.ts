export interface DevAutoLogin {
  email: string;
  password: string;
  clinicId: number;
}

export interface Environment {
  production: boolean;
  apiUrl: string;
  devAutoLogin: DevAutoLogin | null;
}
