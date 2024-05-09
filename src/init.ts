import { roomMetadata } from './Metadata/room';
import { awaitReady } from '@davidsev/owlbear-utils';

let functions: Map<string, Function> = new Map<string, Function>();

export function registerInitFunction (name: string, callback: Function) {
    functions.set(name, callback);
}

export async function init () {
    await awaitReady();
    await roomMetadata.awaitReady();

    const id = window.location.hash.slice(1);
    const callback = functions.get(id);
    if (callback) callback();
}
