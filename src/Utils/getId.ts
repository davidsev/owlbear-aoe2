export const baseId = 'uk.co.davidsev.owlbear-aoe2';

export function getId (id ?: string): string {
    if (id)
        return `${baseId}/${id}`;
    else
        return baseId;
}
