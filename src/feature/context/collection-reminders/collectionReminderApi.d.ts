export function createReminderApi(payload: any): Promise<any>;
export function getDashboardRemindersApi(): Promise<any>;
export function getBorrowerRemindersApi(borrowerId: number): Promise<any>;
export function updateReminderStatusApi(reminderId: number, status: string): Promise<any>;
export function deleteReminderApi(reminderId: number): Promise<any>;
export function remindAgainApi(reminderId: number): Promise<any>;
export function sendReminderSmsApi(reminderId: number): Promise<any>;
