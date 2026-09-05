import { createContext } from "react";

export interface UserProfile {
  user_id?: number;
  id?: number;
  email: string;
  store_name: string;
  name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserContextType {
  loading: boolean;
  error: string | null;
  profile: UserProfile | null;
  clearError: () => void;
  login: (email: string, password: string) => Promise<any>;
  register: (payload: { email: string; store_name: string; password: string }) => Promise<any>;
  clearUser: () => void;
  fetchProfile: () => Promise<any>;
  updateStoreName: (storeName: string) => Promise<any>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<any>;
}

export const UserContext = createContext<UserContextType | null>(null);
