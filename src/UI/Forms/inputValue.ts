/** Read a number input, falling back to `defaultValue` if the field is blank or unparseable. */
export function numberValue(input: HTMLInputElement, defaultValue: number): number {
    const value = parseFloat(input.value);
    return Number.isNaN(value) ? defaultValue : value;
}

/** Read a percentage input as a 0-1 fraction.  `defaultValue` is the fraction to use if the field is blank or unparseable. */
export function percentValue(input: HTMLInputElement, defaultValue: number): number {
    const value = parseInt(input.value, 10);
    return Number.isNaN(value) ? defaultValue : value / 100;
}
