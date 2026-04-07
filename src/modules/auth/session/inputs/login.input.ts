import { Field, InputType } from "@nestjs/graphql";
import {IsString, IsNotEmpty, MinLength, Length} from 'class-validator'


@InputType()
export class LoginInput {
    @Field(() => String)
    @IsString()
    @IsNotEmpty()
    public login: string;


    @Field(() => String)
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    public password: string;

    @Field(() => String, {nullable: true})
    public pin?: string;
}