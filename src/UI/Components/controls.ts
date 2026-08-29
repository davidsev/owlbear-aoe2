import '@davidsev/owlbear-ui';
import type { ObUIInput, ObUIMultiSelect, ObUISelect } from '@davidsev/owlbear-ui';

/** An `<obui-select>` whose value is narrowed to the keys of the options it was built with. */
export interface EnumSelect<T extends Record<string, string>> extends ObUISelect {
    value: Extract<keyof T, string>;
}

/** An `<obui-multi-select>` whose values are narrowed to the keys of the options it was built with. */
export interface EnumMultiSelect<T extends Record<string, string>> extends ObUIMultiSelect {
    value: Extract<keyof T, string>[];
}

/** Build a select for an enum, keeping the enum's type on the way in and out. */
export function enumSelect<T extends Record<string, string>>(options: T): EnumSelect<T> {
    const select = document.createElement('obui-select') as EnumSelect<T>;
    select.options = options;
    return select;
}

/** Build a multi-select for an enum, keeping the enum's type on the way in and out. */
export function enumMultiSelect<T extends Record<string, string>>(options: T): EnumMultiSelect<T> {
    const select = document.createElement('obui-multi-select') as EnumMultiSelect<T>;
    select.options = options;
    return select;
}

/** Build a number input, optionally with the usual native constraints. */
export function numberInput(options: Partial<Pick<ObUIInput, 'min' | 'max' | 'step' | 'placeholder'>> = {}): ObUIInput {
    return Object.assign(document.createElement('obui-input'), { type: 'number' }, options);
}
