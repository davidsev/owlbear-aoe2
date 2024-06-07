import { registerInitFunction } from './init';
import { initBackground } from './background';
import './UI';
import { initSettingsForm, initStyleForm } from './UI/Forms/init';

registerInitFunction('background', initBackground);
registerInitFunction('settings-form', initSettingsForm);
registerInitFunction('style-form', initStyleForm);
