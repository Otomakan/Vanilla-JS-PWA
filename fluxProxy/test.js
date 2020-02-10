const {createStore} = require('./fluxProxies')


const myStore = createStore({count: 1})

/* actions.js */
const actions = store => ({
  increment: state => ({ count: state.count + 1 }),
  decrement: state => ({ count: state.count - 1 })
});

store.dispatch = { type: 'INCREMENT' }
console.log(myStore)