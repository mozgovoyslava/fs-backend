import { UserModel } from '@/src/modules/auth/account/models/user.model'
import { Field, ID, ObjectType } from '@nestjs/graphql'
import { type NotificationSettings } from '@prisma/client'


@ObjectType()
export class NotificationSettingsModel implements NotificationSettings {
    @Field(() => ID)
    public id!: string

    @Field(() => Boolean)
    siteNotifications!: boolean

    @Field(() => Boolean)
    telegramNotifications!: boolean

    @Field(() => String)
    userId!: string

    @Field(() => UserModel)
    user!: UserModel
    
    @Field(() => Date)
    public createdAt!: Date

    @Field(() => Date)
    public updatedAt!: Date
}


@ObjectType()
export class ChangeNotificationSettingsResponse {

    @Field(() => NotificationSettingsModel)
    public notificationSettings!: NotificationSettingsModel

    @Field(() => String, {nullable: true})
    public telegramAuthToken!: string
}