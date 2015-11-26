
import document from 'global/document'
import Vue from 'vue'
import screenMachine from '../../../screenMachine'
import vueComponent from '../../../vueComponent'
import EventEmitter from 'events'
import NativePromise from 'native-promise-only'
import domready from 'domready'
import homeScreen from './screens/home'
import viewLibs from './screens/viewLibs'
import notFound from './screens/notFound'
import views from './vues'

Vue.config.silent = true

const emitter = new EventEmitter()
const config = {
  document,
  components: vueComponent(Vue),
  promises: NativePromise,
  events: {
    emitter,
    trigger: 'emit',
    on: 'addListener',
    off: 'removeListener'
  }
}
const machine = global.machine = screenMachine(config)

views(Vue)
homeScreen(machine)
viewLibs(machine)
notFound(machine)
domready(() => machine.start())
