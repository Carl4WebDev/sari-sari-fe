export function getProductsApi(): Promise<any>;
export function getArchivedProductsApi(): Promise<any>;
export function createProductApi(payload: any): Promise<any>;
export function updateProductApi(id: number, payload: any): Promise<any>;
export function archiveProductApi(id: number): Promise<any>;
export function reactivateProductApi(id: number): Promise<any>;
export function deleteProductApi(id: number): Promise<any>;
