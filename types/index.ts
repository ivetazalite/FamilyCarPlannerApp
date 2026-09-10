export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'member';
  color: string;
  createdAt: string;
}

export interface Reservation {
  id: string;
  userId: string;
  user: User;
  title: string;
  startTime: string;
  endTime: string;
  notes?: string;
  status: 'ACTIVE' | 'CANCELLED';
  reminderAt?: string;
  createdAt: string;
}

export interface VehicleStatus {
  batteryPercent: number;
  isCharging: boolean;
  estimatedRangeKm: number;
  lastUpdated: string;
  dataSource: 'mock' | 'official';
  isStale: boolean;
}

export interface FamilySettings {
  timezone: string;
  vehicleName: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  color: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
