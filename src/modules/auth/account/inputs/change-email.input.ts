import { Field, InputType } from "@nestjs/graphql";
import {IsString, IsNotEmpty, IsEmail, } from 'class-validator'


@InputType()
export class ChangeEmailInput {
    @Field()
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    public email!: string;
}
