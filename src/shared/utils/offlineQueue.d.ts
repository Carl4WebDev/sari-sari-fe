export function getQueue(): any[];
export function getQueueSize(): number;
export function enqueue(options: any): any;
export function dequeue(id: string): void;
export function clearQueue(): void;
export function replayQueue(sendFn?: any): Promise<any[]>;
