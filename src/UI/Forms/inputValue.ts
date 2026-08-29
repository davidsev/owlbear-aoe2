import { FormElement, type ObUIInput } from '@davidsev/owlbear-ui';

/** Read a number input, falling back to `defaultValue` if the field is blank or unparseable. */
export function numberValue(input: ObUIInput, defaultValue: number): number {
    const value = parseFloat(input.value);
    return Number.isNaN(value) ? defaultValue : value;
}

/** Read a number input that may be left blank, in which case we get null. */
export function nullableNumberValue(input: ObUIInput): number | null {
    const value = parseFloat(input.value);
    return Number.isNaN(value) ? null : value;
}

/** Write a 0-1 fraction into a percentage input, rounding away the float noise from eg. 0.07 * 100. */
export function percentString(value: number): string {
    return Math.round(value * 100).toString();
}

/** Read a percentage input as a 0-1 fraction.  `defaultValue` is the fraction to use if the field is blank or unparseable. */
export function percentValue(input: ObUIInput, defaultValue: number): number {
    const value = parseFloat(input.value);
    return Number.isNaN(value) ? defaultValue : value / 100;
}

/**
 * Check that every control in a form's input map holds something the browser is happy with,
 * eg. no unparseable text and no value that misses the field's step.
 */
export function inputsAreValid(inputs: Record<string, unknown>): boolean {
    return Object.values(inputs).every(input => !(input instanceof FormElement) || input.checkValidity());
}
