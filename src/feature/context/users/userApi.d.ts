export function loginUser(email: string, password: string): Promise<any>;
export function registerUser(payload: any): Promise<any>;
export function getProfile(): Promise<any>;
export function updateStoreName(store_name: string): Promise<any>;
export function changePassword(current_password: string, new_password: string): Promise<any>;
export function logoutUser(): Promise<any>;
