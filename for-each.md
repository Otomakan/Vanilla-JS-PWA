---
layout: page-fullwidth
title:  "ForEach in Javascript"
categories:
    - JS
tags:
    - forEach
    - Javascript
header: no
breadcrumb: true
meta_description: "The ins, outs and common pitfalls of forEach in Javascript"
author: Jack Misteli
---

Array.prototype.ForEach is a nice little feature introduced in ECMAScript 2015 which allows us to access each element of an array in order.

## The basics

I think most of us know the alphabet so here is an easy example:


<p class="file-desc">Module: <span>letters.js</span></p>

```js
let letters = ['a', 'b', 'c'];

letters.forEach((letter, index, arr) => {
  console.log(letter,index, arr, this);
});
//The console will output
// 'a', 0, ['a', 'b', 'c']
// 'b', 1, ['a', 'b', 'c']
// 'c', 2, ['a', 'b', 'c']
```

You can also declare a function outside

<p class="file-desc">Module: <span>makeAShoppingList.js</span></p>

```js

const addToShoppingList (ingredient, shoppingList) {
  shoppingList[ingredient] = -~shoppingList[ingredient];
}

const pancakeIngredients = ['🥚', '🥓', 'flour', '🥛'];
const omeletIngredients = ['🧀', '🥚', '🥚'];
const  todaysList = {};

pancakeIngredients.forEach(addIngredients, todaysList);
omeletIngredients.forEach(addIngredients, todaysList);

// todaysList = {
//   flour: 1
//   🥓: 1
//   🥚: 3
//   🥛: 1
//   🧀: 1
// }
```

## Under the hood

Here is a simplified version of the callback flow as described in the ECMAScript documentation. We skip over a few steps which aren't really replicable in Javascript code. Just image this as a translation of ECMA specifications. You can use this code break down to understand the different behaviors we will describe in this post.

<p class="file-desc">Module: <span>myForEach.js</span></p>

```js
const myForEach = (array, callback) => {
  // Before iterating through the array forEach checks the value of array and sets a len variable
  let k = 0;
  // If the argument passed doesn't have a property len then forEach returns
  if(!array.length)
    return;
  //  checking if callback is callable
  if (typeof callback != 'function')
    return;
  // The user can set a custom this context
  let len = array.length;
  
  // iterating until k reaches the length of the array - 1
  while(k<len){
    // if the array doesn't have a k element at index k then we return
    if(!array[k]){
      return;
    }
    let element = array[k];
    try {
      // notice the three elements used in the callback
      callback(element, k, array);
    } catch(e) {
      throw e;
    }
    // Increase k to reach the next item in the array
    k += 1;
  }
  // forEach never returns anything (return undefined is the same as return)
  return undefined;
};
```

## What is `element` ?

As you can see from myForEach implementation, we get the value of the element by assignment:

```js
let element = array[k];
```

element references array[k] so if in our callback we call modify element it won't change the element in the array

```js
const ruinYourElements = (element, index) => {
  element = '乁( ◔ ౪◔)「 ';
}
const verySeriousArray = ['business', 'files', 'documents']
verySeriousArray.forEach(ruinYourElements)
// verySeriousArray =  ['business', 'files', 'documents']`
// You failed to ruin my array
```

In this code, `element` goes from being assigned to `array[k]` to being assigned to  `'乁( ◔ ౪◔)「 '`. `array[k]` never knows about that reassignment. 
BUT things are different with objects!

```js
const ruiningYourNames = (element, index) => {
  element.name = '乁( ◔ ౪◔)「 ';
}
const verySeriousArray = [{name:'business'}, {name:'files'}, {name:'documents'}];
verySeriousArray.forEach(ruiningYourNames);
// verySeriousArray =  [{name: "乁( ◔ ౪◔)「 "}, {name: "乁( ◔ ౪◔)「 "}, {name: "乁( ◔ ౪◔)「 "}]
// You succeeded at ruining my array
```

The changes occur because `element` still references `array[k]`. If we wanted to prevent such a behavior we would have to make a [deep clone](/js/deep-cloning-javascript-objects/) of `array[k]` in `myForEach`:

<p class="file-desc">Module: <span>myForEach.js</span></p>

```js
  if(typeof array[k] === 'object'){
    let element = JSON.parse(JSON.stringify(array[k]));
  }
```

If you want to change the value of an element in the array you have to modify the third element in the callback: `arr`:

```js
const ruinYourArray = (element, index, arr) => {
  arr[index] = '乁( ◔ ౪◔)「 ';
}

const verySeriousArray = ['business', 'files', 'documents']
verySeriousArray.forEach(ruinYourArray)
// verySeriousArray = ["乁( ◔ ౪◔)「 ", "乁( ◔ ౪◔)「 ", "乁( ◔ ౪◔)「 "]
// We succesfuly ruined the serious array, nobody will be able to do serious business anymore
```

## How the loop works

ForEach will iterate for as long as the initial array length. So if the array is 5 items long, it will iterate 5 times, no more.

<p class="file-desc">Module: <span>pushingTheEnvelope.js</span></p>

```js
const reasonableShoppingList = ['🍈', '🥗'];
reasonableShoppingList.forEach((item)=> {
  // Here is a 10 year old trying to highjack my health 
  reasonableShoppingList.push('🥞');
  console.log(`bought ${item}`);
})
// console will output:
// bought 🍈 bought 🥗 because forEach called the callback reasonableShoppingList.length = 2 times
//reasonableShoppingList = ["🍈", "🥗", "🥞", "🥞"] so make sure to clean your array before you go shopping again!
```

However, the iterations can be interrupted early in 2 mains cases:

1. We reached a point of the array which doesn't exist anymore.

<p class="file-desc">Module: <span>letters.js</span></p>

```js
const pop =  (letter, index, arr) =>{
  console.log(letter, i);
  arr.pop();
}
letters.forEach(pop);
// 'a'
// 'b'
// letters = 'a'
```

Be careful when you modify arrays especially using `shift`! Sometimes you will have some counterintuitive results:

<p class="file-desc">Module: <span>letters.js</span></p>

```js
  letters.forEach((letter, i, shift)=>{
    console.log(letter, i);
    arr.shift();
  });
  // 'a'
  // 'c'
  // letters = 'a'
```
Checkout `myForEach` think about it and it will make sense.

2.  The callback function crashed

```js
const showCity = (user) => {
  console.log(user.address.city);
}

const users = [
  {
    name:'bob',
    address:{
      zipCode: 60633,
      city: 'Chicago'
    }
  },
  {
    name:'charles'
  },
  {
    name:'Sarah',
    address: {
      city: 'Chicago'
    }
  }
];

users.forEach(showCity);
//  Console will output: 'Chicago'.Then we'll get:
// Uncaught TypeError: Cannot read property 'city' of undefined
```

Charles does not have an address field so showCity returns a type error which interrupts forEach and we never access Sarah's address.

## Using forEach in legacy browsers 

there are still a users using legacy browsers which do not support .forEach in these cases there are some workarounds but your safest bet is to use for loops. But if you want to be able to use all ECMA2015 functionalities, you should use a polyfill or [es5 shims](https://github.com/es-shims/es5-shim/blob/592c8f49d4d6ec0fb2f588bebdd52f6b439903e2/es5-sham.js#L442).

## forEach() vs map()

As you can see in `myForEach`, forEach always returns undefined on the other hand [`map` returns a new array](/js/map-array-method/).

## Asynchronous forEach

If you enjoy coding with [`async` and `await`](/js/async-functions/) you might not get the behaviors you expect:

<p class="file-desc">Module: <span>cheeseShopping.js</span></p>

```js
  // We are going to the cheese shop and ask the vendor what cheese we need for our dish
const cheeseShopping = async (dishes) => {
  const whatCheeseShouldIUse = async (dish) => {
    // Set timeout is used to simulate an API call
    await new Promise(resolve => setTimeout(resolve, 200));

    switch (dish) {
      case 'Pasta':
        return  'Parmesan'
      case 'Gratin':
        return  'Gruyère'
      case 'Cheeseburger':
        return  'American Cheese'
      default:
        return  'Tomme'
    };
  };

  const requiredCheeses = [];

  dishes.forEach( async (dish) => {
    const recommendation = await whatCheeseShouldIUse(dish)
    //  We never reach this code because foreach doesn't wait for await and goes to the next loop
    requiredCheeses.push(recommendation)
  })
  // requiredCheeses = [] 
  
  // this await is useless because forEach is not a promise
  await dishes.forEach( dish => {
    const recommendation =  whatCheeseShouldIUse(dish);
    // Is a promise so we push a promise and not the result of the promise
    requiredCheeses.push(recommendation);
  });
  //requiredCheeses = [Promise, Promise, Promise]
  };

  await dishes.asyncForEach( async dish => {
    const recommendation = await whatCheeseShouldIUse(dish);
    // Is a promise so we push a promise and not the result of the promise
    requiredCheeses.push(recommendation);
  });
  return requiredCheeses;
}

const dishes = ['Original Cheese Platter', 'Pasta', 'Cheeseburger'];
cheeseShopping(dishes);
```

So what can we do ? We need to create a custom forEach which can wait for all of the promises to resolve before it moves on. There are a lot of things you can do to create that effect such as:

<p class="file-desc">Module: <span>cheeseShopping.js</span></p>

```js
Array.prototype.asyncForEach = async function (callback) {
  let k = 0;
  while (k < this.length) {
    if(!this[k])
      return;
    let element = this[k];
    await callback(element, k, this);
    k += 1;
  };
};
```

To understand why we use `function` instead of arrow functions you should checkout [Arrow Functions](/js/arrow-functions/)

```js
const cheeseShopping = async (dishes) => {
  // ... Skipping some code
  await dishes.asyncforEach( async dish => {
    const recommendation =  await whatCheeseShouldIUse(dish);
    requiredCheeses.push(recommendation);
  })
  //requiredCheeses = ["Tomme", "Parmesan", "American Cheese"]
  
  return requiredCheeses;
};
```

## Performance:
ForEach loops are slower than a classic forLoop. In an array of a million elements in Chrome forEach took between 50 and 100ms to add random numbers to each element of the array. A for loop was between 30 and 40 seconds and so did myForEach. The only scenario where such a difference would be relevant is if you're looping through an array of millions of elements a million consecutive times. 

## The DOM Trap:
Be careful! Not everything that looks like an array is an array:
```js
const divs = document.getElementsByTagName('div');
divs.forEach(doSomething);
// Uncaught TypeError: divs.forEach is not a function
```

That's because `divs` is not an array ! It is a special object called a DOMCollection which is an iterable object. So you can only do:
```js
for (let i = 0; i < divs.length; i++){
  doSomething(divs[i], i);
}
```
Or mess with HTMLCollection's prototype and add a forEach to force it to behave like the native forEach of your browser (but you probably should not do it):
```js
HTMLCollection.prototype.forEach = Array.prototype.forEach;
```

<!-- 

const

What if the letters are in the wrong order?  -->

<!-- ## Some extra `this`

You might notice that `that` is not useful whatsoever in this code. In reality you can pass a specific this context to forEach. `This` is a blogpost on its' own so if you're not familiar with `this` it will be a bit difficult to understand. Hopefully the following  example will help:
<p class="file-desc">Module: <span>thisthat.js</span></p>

```js
Array.prototype.addIngredients  = function (newIngredients) {
  newIngredients.forEach((ing)=>{
    this.push(ing)
  })
}
let that = this
Array.prototype.addToIngredients  = function (newIngredients) {
  newIngredients.forEach((ing)=>{
    that.pancakeIngredients.push(ing)
  }, that)
}
``` -->

## Performance:

For loops are always fastest but it loops are so fast that it is barely possible that you looping method is the overhead of your code. A more intersting finding is that map and forEach can vary greatly in performance (relatively not in absolute values) depending on their native implementation. So sometimes `map` is faster than `forEach`. 
So you can do:

```js
const addRandom = (el) => {el += Math.random()}
const getSpeed = (func) => {
  var t0 = performance.now();
    func()
  var t1 = performance.now();
  console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.");
}
function testPerformanceLoop (arr) {
  getSpeed(()=>{
    for (let i = 0; i< arr.length; i++){
      addRandom(arr[i])
    }
  })
}

function testPerformanceForEach (arr) {
  getSpeed(()=>{
    arr.forEach((el)=>{
      el += Math.random()
    })
  })
}


function testPerformanceMyForEach (arr) {
getSpeed(()=>{
  myForEach(arr, (el)=>{
    el += Math.random()
  })
})
}

function testPerformanceMap (arr) {
getSpeed(()=>{
  arr.forEach((el)=>{
    el += Math.random()
  })
})
}

const giantArray = []
let i = 0
while (i<1000000){
  giantArray.push(Math.random())
  i+=1
}
```