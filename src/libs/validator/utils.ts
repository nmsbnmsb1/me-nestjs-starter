import { HttpStatus } from "@nestjs/common"

export const ExecptionId = 'invalid_validation'

export type ValidationExecption = {
    http_status: number,
    id: string,
    description: { fieldName: string, message: string }[]
}
export function getValidationExecption(descriptions: { fieldName: string, message: string }[]): ValidationExecption
export function getValidationExecption(fieldName: string, message: string): ValidationExecption
export function getValidationExecption(val: any, message?: string): ValidationExecption {
    let description: any;
    if (typeof val === 'string' && message !== undefined) {
        description = [{ fieldName: val, message }]
    } else {
        description = val
    }
    description.toString = () => {
        return description.map(item => `${item.fieldName}: ${item.message}`).join(', ');
    }
    //
    return {
        http_status: HttpStatus.BAD_REQUEST,
        id: ExecptionId,
        description,
    }
}