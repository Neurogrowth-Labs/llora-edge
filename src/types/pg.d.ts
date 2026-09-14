declare module 'pg' {
  export class Pool {
    constructor(options?: { connectionString?: string; max?: number; idleTimeoutMillis?: number; ssl?: { rejectUnauthorized: boolean } | false });
    query<T = Record<string, unknown>>(text: string, values?: unknown[]): Promise<{ rows: T[]; rowCount: number | null }>;
    connect(): Promise<{ query<T = Record<string, unknown>>(text: string, values?: unknown[]): Promise<{ rows: T[]; rowCount: number | null }>; release(): void }>;
    end(): Promise<void>;
  }
}
