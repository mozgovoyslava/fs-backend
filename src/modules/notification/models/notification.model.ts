import { UserModel } from '@/src/modules/auth/account/models/user.model'
import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql'
import { $Enums, NotificationType, type Notification } from '@prisma/client'


registerEnumType(NotificationType, {
    name: 'NotificationType'
})

@ObjectType()
export class NotificationModel implements Notification {
    @Field(() => ID)
    public id!: string

    @Field(() => Boolean)
    isRead!: boolean

    @Field(() => String)
    message!: string

    @Field(() => NotificationType)
    type!: NotificationType

    @Field(() => String)
    userId!: string

    @Field(() => UserModel)
    user!: UserModel
    
    @Field(() => Date)
    public createdAt!: Date

    @Field(() => Date)
    public updatedAt!: Date
}