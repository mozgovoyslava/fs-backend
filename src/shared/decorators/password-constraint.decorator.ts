import { NewPasswordInput } from "@/src/modules/auth/password-recovery/inputs/new-password.input";
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";





@ValidatorConstraint({name: 'IsPasswordConstraint', async: false})
export class IsPasswordConstraint implements ValidatorConstraintInterface {
    

    public validate(passwordRepeat: string, validationArguments?: ValidationArguments): Promise<boolean> | boolean {
        const obj = validationArguments?.object as NewPasswordInput;

        return obj.password === passwordRepeat;
    }


    public defaultMessage(validationArguments?: ValidationArguments): string {
        return 'Пароли не совпадают'
    }
}