import { init, registerInitFunction } from './init';
import { initBackground } from './background';

window.init = init;

registerInitFunction('background', initBackground);
