import { Environment } from './environment.model';

export const environment: Environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/',
  devAutoLogin: { email: 'ana.garcia@clinic.com', password: 'password123', clinicId: 1 }
};
