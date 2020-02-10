---
layout: page-fullwidth
title:  
,
categories:
    - JS
tags:
    - Proxy
    - Vanilla JavaScript
header: no
breadcrumb: true
meta_description: "Description in the range of 80 to 155 characters."
author: Jack Misteli
---

```js
const testHandler = {
  get(values, props, bob) {
    console.log(values, props, bob)
    return values[props]
  }
}

const newProxy = new Proxy ([1, 2, 3], testHandler)
newProxy[0]
```

Proxies are not the most popular JavaScript feature out there. It is probably a bit intimidating for a developers and many of us live just fine without it. I think one of the main reason it is not a popular API is that most of us don't really do a lot of meta programming as web developers. However, we can use proxies in various situations and unlock some useful programming pattern. 

https://www.youtube.com/watch?v=sClk6aB_CPk
MetaProgramming 
Why we need more meta programming?


Why not getters and setters?
We need to hard code the name of the properties. Not as reusable.
function logCoordinates (p) {
  return {
    get x () {
      logger.push(`got x ${p.x});
      return p.x
    },
     set x () {
      logger.push(`set x ${p.x});
      return p.x
    },
    ...
  }
}
One alternative would be using create

function makeLogger(obj) {
  var proxy = Object.create(Object.getPrototypeOf(obj, {}))
  Object.getOwnPropertyNames(obj).forEach(propertyName => {
    var propertyDescriptor = Object.getOwnPropertyDescriptor(obj, propertyName)
    Object.defineProperty(proxy, propertyName, {
      get: function () {
        logger.push(`got ${propertyName} ${obj.propertyName})
        return obj.propertyName
      },
      set: function (val) {
        logger.push(`set ${propertyName} on ${obj} to val)
        obj.propertyName = val
      }
    })
  })
  return proxy
}

PROBLEM Won't catch new properties added after makeLogger was called


The proxy has its own prototype! Important for instanceOf

traps are called traps in analogy to Operating system traps

No trap for === 
No trap for Object.getPrototypeOf(proxy) => proto
proxy instanceOf myFunction
typeof 'proxy' => "obect"

functions have two extra traps:
`call` funcproxy and `construct` new funProxy
handler.get(funproxy, 'construct')
funproxy.prototype

Why it is cool.
Implemented in the JS machine

Handlers can be proxies

```js
let iterableNumberHandler = {
  set: function (target, prop, value) {
    if (typeof value != 'number')
      return false
    return true
  },
   enumerate: function (target, prop) {
     console.log(target, prop)
    return target.keys()
  }
}

let newProx = new Proxy(123, iterableNumberHandler)
```

class MyArray extends Array {
	 mapIgnoreNull(funct) {
        let filteredArray = this.filter(a => !!a);
        return filteredArray.map(funct);
    }
}
​
array = new MyArray(null,1,0,2,undefined,3, '', 4, false, 5)
​
array.mapIgnoreNull(n => n * 2)

const nonNullFilterHandler = {
  set (target, prop, values) {

  }
}

Proxies can't be polyfilled, they require native code.


| Internal Method       | Handler Method           |
|-----------------------|--------------------------|
| [[DefineOwnProperty]] | defineProperty           |
| [[Call]]              | apply                    |
| [[Construct]]         | construct                |


https://web.archive.org/web/20190516002907/http://dealwithjs.io/es6-features-10-use-cases-for-proxy/
https://blog.bitsrc.io/a-practical-guide-to-es6-proxy-229079c3c2f0
http://thecodebarbarian.com/thoughts-on-es6-proxies-performance 
https://2ality.com/2014/12/es6-proxies.html
https://javascript.info/proxy#iteration-with-ownkeys-and-getownpropertydescriptor

Real examples https://github.com/gergob/jsProxy
https://dev.to/deleteman123/3-ways-to-use-es6-proxies-to-enhance-your-objects-mfg

To read:
https://reactjsnews.com/proxies-with-redux-types

PROXY DESIGN PATTERN:
https://www.dofactory.com/javascript/proxy-design-pattern
https://anasshekhamis.com/2017/11/09/proxy-design-pattern-in-javascript/
https://www.joezimjs.com/javascript/javascript-design-patterns-proxy/

```js
const proxy = new Proxy({}, { 
  get: (target, prop, value) => {
    if(!(prop in target)) 
      target[prop] = {}
    
    console.log(prop, target)
    return target[prop]
  }
});
console.log(proxy.lol.bob)
```