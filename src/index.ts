import { init, registerInitFunction } from './init';
import { initBackground } from './background';
import './UI';
import { initSettingsForm } from './UI/SettingsForm/init';

window.init = init;

registerInitFunction('background', initBackground);
registerInitFunction('settings-form', initSettingsForm);
