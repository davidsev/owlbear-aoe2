import { css, unsafeCSS } from 'lit';
import style from '../style.css';
import { CSSResult, CSSResultGroup } from '@lit/reactive-element/css-tag';

export function defaultCSS (strings: TemplateStringsArray, ...values: (CSSResultGroup | number)[]): CSSResult {
    return css`
        ${unsafeCSS(style)}
        ${css(strings, ...values)}
    `;
}
