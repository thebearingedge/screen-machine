
export default function vues(Vue) {

  Vue.component('ParentVue', {
    template: `<div>
                <h1>Say hello to my little friend.</h1>
                <sm-view name="nested"></sm-view>
              </div>`
  })

  Vue.component('SimpleVue', {
    template: `<span>Welcome to {{ place }}</span>`
  })

}
