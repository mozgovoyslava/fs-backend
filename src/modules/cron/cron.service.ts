import { PrismaService } from '@/src/core/prisma/prisma.service';
import { MailService } from '@/src/modules/libs/mail/mail.service';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class CronService {


    public constructor(
        private readonly prismaService: PrismaService,
        private readonly mailerService: MailService,
    ) {}


    @Cron('0 0 * * *')
    public async deleteDeactivatedAccounts() {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDay() - 7);
        
        const deactivatedAccounts = await this.prismaService.user.findMany({
            where: {
                isDeactivated: true,
                deactivatedAt: {
                    lte: sevenDaysAgo
                }
            }
        })

        for (const user of deactivatedAccounts) {
            await this.mailerService.sendAccountDeletion(user.email, new Date());
        }

        await this.prismaService.user.deleteMany({
            where: {
                isDeactivated: true,
                deactivatedAt: {
                    lte: sevenDaysAgo
                }
            }
        })
    }
}
