import { Field, InputType } from "@nestjs/graphql";
import {IsString, IsNotEmpty, MinLength} from 'class-validator'


@InputType()
export class ChangePasswordInput {
    @Field()
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    public oldPassword!: string;

    @Field()
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    public newPassword!: string;
}
