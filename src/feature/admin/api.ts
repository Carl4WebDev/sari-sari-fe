import {
  getAdminDemoProfile,
  updateAdminDemoProfile,
  getAdminDemoManagedCustomers,
  createAdminDemoCustomer,
  updateAdminDemoCustomer,
  deleteAdminDemoCustomer,
  restoreAdminDemoCustomer,
  resetAdminDemoCustomerPassword,
} from './demoData';

export type AdminProfileData = {user_id:number;store_name:string;email:string;created_at?:string};
export type ManagedCustomer = AdminProfileData & {deleted_at:string|null};
export const adminSessionKey = 'listahub_admin_session';
export function endAdminSession() {
  sessionStorage.removeItem(adminSessionKey);
  sessionStorage.removeItem('listahub_admin_demo_state');
}

export async function adminRequest<T>(path:string, method='GET', body?:unknown):Promise<T> {
  if (sessionStorage.getItem(adminSessionKey) === 'admin_demo_session') {
    if (path === '/profile') {
      if (method === 'PATCH' && body) {
        return updateAdminDemoProfile(body as { store_name: string; email: string }) as unknown as T;
      }
      return getAdminDemoProfile() as unknown as T;
    }
    if (path === '/profile/password') {
      return { ok: true } as unknown as T;
    }
    if (path === '/customers') {
      if (method === 'POST' && body) {
        return createAdminDemoCustomer(body as { store_name: string; email: string }) as unknown as T;
      }
      return getAdminDemoManagedCustomers() as unknown as T;
    }
    const resetPassMatch = path.match(/^\/customers\/(\d+)\/password$/);
    if (resetPassMatch && method === 'POST') {
      resetAdminDemoCustomerPassword(Number(resetPassMatch[1]), (body as { password: string })?.password || '');
      return { ok: true } as unknown as T;
    }
    const restoreMatch = path.match(/^\/customers\/(\d+)\/restore$/);
    if (restoreMatch) {
      restoreAdminDemoCustomer(Number(restoreMatch[1]));
      return { ok: true } as unknown as T;
    }
    const custMatch = path.match(/^\/customers\/(\d+)$/);
    if (custMatch) {
      const id = Number(custMatch[1]);
      if (method === 'DELETE') {
        deleteAdminDemoCustomer(id);
        return { ok: true } as unknown as T;
      }
      if (method === 'PATCH' && body) {
        return updateAdminDemoCustomer(id, body as { store_name: string; email: string }) as unknown as T;
      }
    }
    if (path === '/logout') {
      endAdminSession();
      return { ok: true } as unknown as T;
    }
    return { ok: true } as unknown as T;
  }

  const base = (import.meta.env.VITE_API_BASE || '').replace(/\/$/,'').replace(/\/api$/,'');
  let response:Response;
  try {
    response = await fetch(`${base}/api/admin${path}`,{method,headers:{'Content-Type':'application/json',Authorization:`Bearer ${sessionStorage.getItem(adminSessionKey) || ''}`},...(body ? {body:JSON.stringify(body)} : {})});
  } catch {throw new Error('Cannot connect to the server. Please check your connection and try again.');}
  const json = await response.json().catch(() => ({}));
  if(response.status===401 && path!=='/login') {endAdminSession();window.location.assign('/login');}
  if(!response.ok) throw new Error(json.message || 'Unable to complete the request. Please try again.');
  return json.data;
}
