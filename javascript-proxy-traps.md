---
layout: page-fullwidth
title: Javascript Proxy Traps 
,
categories:
    - JS
tags:
    - Proxy
    - Vanilla JavaScript
header: no
breadcrumb: true
meta_description: 'Description in the range of 80 to 155 characters.'
author: Jack Misteli
---

Proxies are a really cool JavaScript feature. If you like meta programming you probably are already familiar with them. In this article we are not going to get in to programming design patterns or get meta or even understand how proxies work. Usually articles about traps always have the same examples to set private properties with proxies. It is a great example. However, here we are going to look at all the traps you can use. The examples are not meant to be real world use cases, the goal is to help you understand how `Proxy` traps work.

## Traps? What? It already sounds ominous

I don't really like the word trap. I've read everywhere that the word comes from the domain of operating systems (even Brendan Eich mentions it at JSConfEU 2010). However I am not exactly sure why. Maybe it is because traps in the context of operating systems are synchronous and can interrupt the normal execution of the program. 

Traps are internal method detection tools. Whenever you interact with an object, you are calling [an essential internal method](https://www.ecma-international.org/ecma-262/10.0/index.html#sec-invariants-of-the-essential-internal-methods). Proxies allow you to intercept the execution of a given internal method. 

So when you run:

```js
const profile = {};
profile.firstName = 'Jack';
```

You are telling your JavaScript engine to call the [[SET]] internal method. So the `set` trap will call a function to execute before `profile.firstName` is set to `'Jack'`.

```js
const kickOutJacksHandler = {
  set: function (target, prop, val) {
    if (prop === 'firstName' && val === 'Jack') {
      return false;
    }
    target[prop] = val;
    return true;
  }
}
```

Here our `set` trap will reject any program which tries to create a profile with the first name `Jack`.

```js
  const noJackProfile  = new Proxy ({}, kickOutJacksHandler);
  noJackProfile.firstName = 'Charles';
  // console will show {} 'firstName' 'Charles'
  // noJackProfile.firstName === 'Charles'
  //This won't work because we don't allow firstName to equal Jack

  newProfileProxy.firstName = 'Jack';
  // console will show {firstName: 'Charles'} 'firstName' 'Charles'
  // noJackProfile.firstName === 'Charles'
```

## What can I proxy

Anything that satisfies:

```js
typeof MyThing === 'object'
```
This means arrays, functions, object and even ....

```js
console.log(typeof new Proxy({},{}) ==='object')
// logs 'TRUE' well actually just true... I got a bit excited...
```

PROXIES! You just can't proxy anything if your browser doesn't support it since there are no fully functional polyfills or transpiling options (more on that in another post).

## All the proxy traps

There are 13 traps in JavaScript! I chose not to classify them, I'll present them from what I think are the most useful to less useful (sort of). It is not an official classification feel free to disagree. I am not even convinced by my own ranking.

Before we get started, here is a little cheat sheet copied from the ECMA specifications.  

| Internal Method       | Handler Method           |
|-----------------------|--------------------------|
| [[GetPrototypeOf]]    | getPrototypeOf           |
| [[SetPrototypeOf]]    | setPrototypeOf           |
| [[IsExtensible]]      | isExtensible             |
| [[PreventExtensions]] | preventExtensions        |
| [[GetOwnProperty]]    | getOwnPropertyDescriptor |
| [[HasProperty]]       | has                      |
| [[Get]]               | get                      |
| [[Delete]]            | deleteProperty           |
| [[DefineOwnProperty]] | defineProperty           |
| [[Enumerate]]         | enumerate                |
| [[OwnPropertyKeys]]   | ownKeys                  |
| [[Call]]              | apply                    |
| [[Construct]]         | construct                |

## Get, Set and Delete: The super basic

We already saw `set`, let's take a look at `get` and `delete`. Side note: When you use `set` or `delete` you have to return `true` or `false` to tell the JavaScript engine if the key should be modified.

```js
  const logger = []

  const loggerHandler = {
    get: function (target, prop) {
      logger.push(`Someone  accessed '${prop}' on object ${target.name} at ${new Date()}`);
      return target[prop] || target.getItem(prop) || undefined;
    },
  }

  const secretProtectorHandler = {
    deleteProperty: function (target, prop) {
      // If the key we try to delete contains to substring 'secret' we don't allow the user to delete it
      if (prop.includes('secret')){
        return false;
      }
      return true;
    }
  };

  const sensitiveDataProxy = new Proxy (
    {name:'Secret JS Object', secretOne: 'I like weird JavaScript Patterns'},
    {...loggerHandler, ...secretProtectorHandler}
  );

  const {secretOne} = sensitiveDataProxy;
  //logger = ['Someone tried to accessed 'secretOne' on object Secret JS Object at Mon Dec 09 2019 23:18:54 GMT+0900 (Japan Standard Time)']

  delete sensitiveDataProxy.secretOne;
  // returns false it can't be deleted!

  // sensitiveDataProxy equals  {name: 'Secret JS Object', secretOne: 'I like weird JavaScript Patterns'}
```

## Playing With Keys

Let's say we have a web server that gets some application data to our route. We want to keep that data in our controller. But maybe we want to make sure it doesn't get misused. The `ownKeys` trap will activate once when we try to access the object's keys.

```js
const createProxiedParameters  = (reqBody, allowed) => {
  return new Proxy (reqBody, {
    ownKeys: function (target) {
      return Object.keys(target).filter(key => allowed.includes(key))
    }
  });
};

const allowedKeys = ['firstName', 'lastName', 'password'];

const reqBody = {lastName:'Misteli', firstName:'Jack', password:'pwd', nefariousCode:'MWUHAHAHAHA'};

const proxiedParameters = createProxiedParameters(reqBody, allowedKeys);

const parametersKeys =  Object.keys(proxiedParameters)
// parametersKeys equals ["lastName", "firstName", "password"]
const parametersValues = parametersKeys.map(key => reqBody[key]);
// parameterValues equals ['Misteli', 'Jack', 'pwd']

for (let key in proxiedParameters) {
  console.log(key, proxiedParameters[key]);
}
// logs:
// lastName Misteli
// firstName Jack
// password pwd

// The trap will also work with these functions
Object.getOwnPropertyNames(proxiedParameters);
// returns ['lastName', 'firstName', 'password']
Object.getOwnPropertySymbols(proxiedParameters);
// returns []
```

 In a real application you should NOT clean your parameters like this. However, you can build a more complex system based on proxies.

## Overloading in arrays

Have you always dreamt of using the `in` operator with arrays, but have always been to shy to ask how?

```js
function createInArray(arr) {
  return new Proxy(arr, {
      has: function (target, prop) {
        return target.includes(prop);
      }
    });
};

const myCoolArray  =  createInArray(['cool', 'stuff']);
console.log('cool' in myCoolArray);
// logs true
console.log('not cool' in myCoolArray);
// logs false
```

The `has` trap intercepts methods which attempts to check if a property exists in an object using the `in` operator.


## Control function call rate with apply

`apply` is used to intercept function calls. Here we are going to look at a very simple caching proxy. 

The `createCachedFunction` takes a `func` argument. The 'cachedFunction' has an `apply` (aka `[[Call]]`) trap which is called every time we run `cachedFunction(arg)`. Our handler also has a `cache` property which stores the arguments used to call the function and the result of the function. In the `[[Call]]` / `apply` trap we check if the function was already called with that argument. If so, we return the cached result. If not we create a new entry in our cache with the cached result.

This is not a complete solution. There are a lot of pitfalls. I tried to keep it short to make it easier to understand. Our assumption is that the function input and output are a single number or string and that the proxied function always returns same output for a given input.

```js
const createCachedFunction = (func) => {
  const handler = {
    // cache where we store the arguments we already called and their result
    cache : {},
    // applu is the [[Call]] trap
    apply: function (target, that, args) {
      // we are assuming the function only takes one argument
      const argument = args[0];
      // we check if the function was already called with this argument
      if (this.cache.hasOwnProperty(argument)) {
        console.log('function already called with this argument!');
        return this.cache[argument];
      }
      // if the function was never called we call it and store the result in our cache
      this.cache[argument] = target(...args);
      return this.cache[argument];
    }
  }
  return new Proxy (func, handler);
};

// awesomeSlowFunction returns an awesome version of your argument
// awesomeSlowFunction resolves after 3 seconds
const awesomeSlowFunction = (arg) => {
  const promise = new Promise(function(resolve, reject) {
    window.setTimeout(()=>{
      console.log('Slow function called');
      resolve('awesome ' + arg);
      }, 3000);
    });
  return promise;
};

const cachedFunction = createCachedFunction(awesomeSlowFunction);

const main = async () => {
  const awesomeCode = await cachedFunction('code');
  console.log('awesomeCode value is: ' + awesomeCode);
  // After 3 seconds (the time for setTimeOut to resolve) the output will be :
  // Slow function called
  //  awesomeCode value is: awesome code

  const awesomeYou = await cachedFunction('you');
  console.log('awesomeYou value is: ' + awesomeYou);
    // After 6 seconds (the time for setTimeOut to resolve) the output will be :
  // Slow function called
  //  awesomeYou value is: awesome you

  // We are calling cached function with the same argument
  const awesomeCode2 = await cachedFunction('code');
  console.log('awesomeCode2 value is: ' + awesomeCode2);
  // IMMEDIATELY after awesomeYou resolves the output will be:
  // function already called with this argument!
  // awesomeCode2 value is: awesome code
}

main()
```

This is a bit tougher to chew than the other code snippets. If you don't understand the code try copy pasting it in your developer console and add some `console.log()` or try your own delayed functions.

## DefineProperty

`defineProperty` is really similar to `set`, it is called whenever `Object.defineProperty` is called, but also when you try to set a property using `=`. You get some extra granularity with an additional `descriptor` argument

```js
const handler = {
  defineProperty: function (target, prop, descriptor) {
    // For some reason we don't accept enumerable or writeable properties 
    const {enumerable, writable} = descriptor
    if (enumerable === true || writable === true)
      return false;
    
    return Object.defineProperty(target, prop, descriptor);
  }
};

const profile = {name: 'bob', friends:['Al']};
const profileProxied = new Proxy(profile, handler);
profileProxied.age = 30;
// Age is enumerable so profileProxied still equals  {name: 'bob', friends:['Al']};

Object.defineProperty(profileProxied, 'age', {value: 23, enumerable: false, writable: false})
//We set enumerable to false so profile.age === 23
```

## Construct

`apply` and call are the two function traps. `construct` intercepts the `new` operator. I find [MDN's example](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) on function constructor extension really cool. So I will share my simplified version of it.

```js

const extend = (superClass, subClass) => {
  const handler = {
    construct: function (target, args) {
      const newObject = {}
      // we populate the new object with the arguments from
      superClass.call(newObject, ...args);
      subClass.call(newObject, ...args);
      return newObject;
    },
  }
  return  new Proxy(subClass, handler);
}

const Person = function(name) {
  this.name = name;
};

const Boy = extend(Person, function(name, age) {
  this.age = age;
  this.gender = 'M'
});

const Peter = new Boy('Peter', 13);
console.log(Peter.gender);  // 'M'
console.log(Peter.name); // 'Peter'
console.log(Peter.age);  // 13

```

## Don't tell me what to do!

`Object.isExtensible` checks if we can add property to an object and `Object.preventExtensions` allows us to prevent properties from being added. In this code snippet we create a trick or treat transaction. Imagine a kid going to a door, asking for treats but he doesn't know what's the maximum amount of candy he can get. If he asks how much he can get, the allowance  will drop.

```js

function createTrickOrTreatTransaction (limit) {
  const extensibilityHandler = {
    preventExtensions:  function (target) {
      target.full = true;
      // this will prevent the user from even changing the existing values
      return  Object.freeze(target);
    },
    set:  function (target, prop, val) {
      target[prop] = val;
      const candyTotal = Object.values(target).reduce((a,b) => a + b, 0) - target.limit;

      if (target.limit - candyTotal <= 0) {
        // if you try to cheat the system and get more that your candy allowance, we clear your bag
        if (target.limit - candyTotal < 0 )
          target[prop] = 0;
        // Target is frozen so we can't add any more properties

        this.preventExtensions(target);
      }  
    },
    isExtensible: function (target) {
      // Kids can check their candy limit 
      console.log( Object.values(target).reduce((a,b) => a + b, 0) - target.limit);
      // But it will drop their allowance by one
      target.limit -= 1;
      // This will return the sum of all our keys
      return Reflect.isExtensible(target);
    }
  }
  return new Proxy ({limit}, extensibilityHandler);
};

const candyTransaction = createTrickOrTreatTransaction(10);

Object.isExtensible(candyTransaction);
// console will log 10
// Now candyTransaction.limit = 9

candyTransaction.chocolate  = 6;

// The candy provider got tired and decided to interrupt the negotiations early
Object.preventExtensions(candyTransaction);
// now candyTransaction equals to {limit: 9, chocolate: 6, full: true}

candyTransaction.chocolate = 20;
//  candyBag equals to {limit: 9, chocolate: 6, full: true}
// Chocolates did not go change to 20 because we called freeze in the preventExtensions trap

const secondCandyTransaction = createTrickOrTreatTransaction(10);

secondCandyTransaction.reeses = 8;
secondCandyTransaction.nerds = 30;
// secondCandyTransaction equals to {limit: 10, reeses: 8, nerds: 0, full: true}
// This is because we called preventExtensions inside the set function if a kid tries to shove in extra candies

secondCandyTransaction.sourPatch = 30;
// secondCandyTransaction equals to {limit: 10, reeses: 8, nerds: 0, full: true}
```

## GetOwnPropertyDescriptor

Wanna see something weird?

```js
let candies = new Proxy({}, {
  // as seen above ownKeys is called once before we iterate
  ownKeys(target) {
    console.log('in own keys', target);
    return ['reeses', 'nerds', 'sour patch'];
  },
// on the other end getOwnPropertyDescriptor at every iteration
  getOwnPropertyDescriptor(target, prop) { 
    console.log('in getOwnPropertyDescriptor', target, prop);
    return {
      enumerable: false,
      configurable: true
    };
  }
});

const candiesObject = Object.keys(candies);
// console will log:
// in own keys {}
// in getOwnPropertyDescriptor {} reeses
// in getOwnPropertyDescriptor {} nerds
// in getOwnPropertyDescriptor {} sour patch
// BUT ! candies == {} and candiesObject == []
```

This is because we set enumerable as false. If you set enumerable to `true` then `candiesObject` will be equal to `['reeses', 'nerds', 'sour patch']`.

## Prototype Get and Set

Not sure when this will come in handy. Not even sure when setPrototypeOf comes handy but here it goes. HEre we';; use setPrototype trap to check if the prototype of our object has been tampered with.

```js
const createSolidPrototype = (proto) => {
  const handler = {
    setPrototypeOf: function (target, props) {
      target.hasBeenTampered = true;
      return false;
    },
    getPrototypeOf: function () {
      console.log('getting prototype')
    },
    getOwnProperty: function() {
      console.log('called: ' + prop);
      return { configurable: true, enumerable: true, value: 10 };
    }
  };
};
```



## Enumerate

Enumerate allowed us to intercept the `for ... in` unfortunately we can't use it since ECMAScript 2016. You can find more about that decision in this [TC39 meeting note](https://github.com/rwaldron/tc39-notes/blob/c4466ea1977d17a0fa607e3ab9ff63504dba004f/meetings/2016-01/jan-28.md).

I tested a script on Firefox 40 just so that you don't say I lied to you when I promised 13 traps.

```js
const alphabeticalOrderer = {
  enumerate: function (target) {
    console.log(target, 'enumerating');
    // We are filtering out any key that has a number or capital letter in it and sorting them
    return Object.keys(target).filter(key=> !/\d|[A-Z]/.test(key)).sort()[Symbol.iterator]();
  }
};

const languages = {
  france: 'French',
  Japan: 'Japanese',
  '43J': '32jll',
  alaska: 'American'
};

const languagesProxy = new Proxy (languages, alphabeticalOrderer);

for (var lang in languagesProxy){
  console.log(lang);
}
// console outputs:
// Object { france: 'French', japan: 'Japanese', 43J: '32jll', alaska: 'American' } enumerating
// alaska
// france

// Usually it would output
// france
// Japan
// 43J
// alaska
```

<p class="t70 text-center">
You might have noticed that we don't use `Reflect` to make things simpler. We will cover `eflect` in another post. It the meantime I hope you had fun. We will also build a practical software to get a bit more hands on next time.
</p>