import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { NotificationService } from './notification.service';
import { Authorized } from '@/src/shared/decorators/authorized.decorator';
import { type User } from '@prisma/client';
import { Authorization } from '@/src/shared/decorators/auth.decorator';
import { NotificationModel } from '@/src/modules/notification/models/notification.model';
import { ChangeNotificationSettingsResponse } from '@/src/modules/notification/models/notifications-settings.model';
import { ChangeNotificationsSettingsInput } from '@/src/modules/notification/inputs/change-notification-settings.input';

@Resolver('Notification')
export class NotificationResolver {
    constructor(private readonly notificationService: NotificationService) {}


    @Authorization()
    @Query(() => Number, {name: 'findUnreadNotificationsCount'})
    public async findUnreadCount(
        @Authorized() user: User
    ) {
        return this.notificationService.findUnreadCount(user)
    }

    @Authorization()
    @Query(() => [NotificationModel], {name: 'findNotificationsByUser'})
    public async findNotificationsByUser(
        @Authorized() user: User
    ) {
        return this.notificationService.findByUser(user)
    }

    @Authorization()
    @Mutation(() => ChangeNotificationSettingsResponse, {name: 'changeNotificationSettings'})
    public async changeNotificationSettings(
        @Authorized() user: User,
        @Args('data') input: ChangeNotificationsSettingsInput
    ) {
        return this.notificationService.changeSettings(user, input)
    }
}
