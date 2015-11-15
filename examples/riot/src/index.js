
'use strict';

import document from 'global/document';
import riot from 'riot';
import screenMachine from '../../../screenMachine';
import riotComponent from '../../../riotComponent';
import EventEmitter from 'events';
import NativePromise from 'native-promise-only';
import domready from 'domready';
import homeScreen from './screens/home';
import viewLibs from './screens/viewLibs';
import notFound from './screens/notFound';

const emitter = new EventEmitter();
const config = {
  components: riotComponent(riot),
  document,
  promises: NativePromise,
  events: {
    emitter,
    trigger: 'emit',
    on: 'addListener',
    off: 'removeListener'
  }
};
const machine = global.machine = screenMachine(config);

require('./tags/all');

homeScreen(machine);
viewLibs(machine);
notFound(machine);
domready(() => machine.start());
