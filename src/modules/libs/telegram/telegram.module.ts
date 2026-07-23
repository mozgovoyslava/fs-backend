import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getTelegrafConfig } from '@/src/core/config/telegraf.config';

@Module({
    providers: [TelegramService],
    imports: [
        TelegrafModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: getTelegrafConfig
        })
    ],
    exports: [TelegramService]
})
export class TelegramModule {}
