import { IsPasswordConstraint } from "@/src/shared/decorators/password-constraint.decorator";
import { Field, InputType } from "@nestjs/graphql";
import { IsEmail, IsNotEmpty, IsString, IsUUID, MinLength, Validate } from "class-validator";


@InputType()
export class NewPasswordInput {
    @Field(() => String)
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    public password: string;


    @Field(() => String)
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @Validate(IsPasswordConstraint)
    public passwordRepeat: string;


    @Field(() => String)
    @IsUUID('4')
    @IsNotEmpty()
    token: string;
}