import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type RedisClientType } from 'redis';


@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    public readonly client: RedisClientType;

    public constructor(private readonly configService: ConfigService) {
        this.client = createClient({
            url: configService.getOrThrow<string>('REDIS_URL'),
        });

        this.client.on('error', (err) => {
            // eslint-disable-next-line no-console
            console.error('Redis client error:', err);
        });
    }

    public async onModuleInit() {
        if (!this.client.isOpen) {
            await this.client.connect();
        }
    }

    public async onModuleDestroy() {
        if (this.client.isOpen) {
            await this.client.quit();
        }
    }
}


