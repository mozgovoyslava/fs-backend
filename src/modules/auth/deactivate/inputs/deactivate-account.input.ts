import { Field, InputType } from "@nestjs/graphql";
import {IsString, IsNotEmpty, MinLength, Length, IsEmail} from 'class-validator'


@InputType()
export class DeactivateAccountInput {
    @Field(() => String)
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    public email!: string;


    @Field(() => String)
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    public password!: string;

    @Field(() => String, {nullable: true})
    public pin?: string;
}
