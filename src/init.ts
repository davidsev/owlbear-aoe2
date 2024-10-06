import { roomMetadata } from './Metadata/room';
import { grid } from '@davidsev/owlbear-utils';

type initFunction = () => void;

const functions: Map<string, initFunction> = new Map<string, initFunction>();

export function registerInitFunction (name: string, callback: initFunction) {
    functions.set(name, callback);
}

async function init () {
    await grid.awaitReady();
    await roomMetadata.awaitReady();

    const id = window.location.hash.slice(1);
    const callback = functions.get(id);
    if (callback)
        callback();
}

init();
