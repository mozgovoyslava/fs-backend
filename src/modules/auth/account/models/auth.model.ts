import { UserModel } from "@/src/modules/auth/account/models/user.model";
import { Field, ObjectType } from "@nestjs/graphql";



@ObjectType()
export class AuthModel {


    @Field(() => UserModel, {nullable: true})
    public user!: UserModel | null

    @Field(() => String, {nullable: true})
    public message!: string | null
}
