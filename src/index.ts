import {provide} from 'angular2/core';

import {Store, Dispatcher, provideStoreFn} from './store';

export const provideStore = provideStoreFn(provide);

export {Store, Dispatcher}

export * from './interfaces';

export * from './utils';
