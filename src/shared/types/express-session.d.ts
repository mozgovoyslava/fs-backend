import type { SessionMetadata } from '@/src/shared/types/session-metadata.types';
import 'express-session';

declare module 'express-session' {
    interface SessionData {
        userId?: string;
        createdAt?: Date | string;
        metadata?: SessionMetadata
    }
}