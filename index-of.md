---
layout: page-fullwidth
title:  
,
categories:
    - JS
tags:
    - indexof
    - Array
    - String
    - Javascript
header: no
breadcrumb: true
meta_description: "An overview of how indexof() works with strings and arrays in Javascript"
author: Jack Misteli
---

When you need to find an element in an array or a string, `indexof()` is one of your best friends.

## `indexOf` in Arrays

Code first explanation later:


<p class="file-desc">Module: <span>findSpencer.js</span></p>

```js
const zoo = ['🐒', '🦄', '🐊', '🐸', '🐙'];
const spencersIndex = zoo.indexOf('🐊');
// spencersIndex === 2
const spencer = zoo[spencersIndex];
// spencer === '🐊'
```

In its' simplest version, `indexOf` takes one argument which is the element we are trying to find. Then it returns the first element it finds the element `el` in the array which satisfies `el === target`. This means that even if there are two matches in your array indexOf will only return one result. The result is the first occurrence in the array (reading the array from left to right).

But let's say we are also looking for Skyler (Spencer's sister). Then we can add an extra optional argument to start the search from a different index.

<p class="file-desc">Module: <span>findSkyler.js</span></p>

```js
const zoo = ['🐒', '🦄', '🐊', '🐸', '🐙',  '🐊']; // Skyler just arrived!
const spencersIndex = zoo.indexOf('🐊'); // === 2 same as before

// We start searching after 
const skylersIndex = zoo.indexOf('🐊', spencersIndex + 1);
// skylersIndex === 5
```

We can also create a function that returns all the indices based on indexOf.

<p class="file-desc">Module: <span>indicesOf.js</span></p>

```js
// Try to think of ways to make indicesOf more performant
Array.prototype.indicesOf = function (target) {
  const result = [];
  let currentIndex = 0;
  while(true) {
    // here this ===  the array on which we call `indicesOf`
    const targetIndex = this.indexOf(target, currentIndex);
    if (targetIndex == -1)
      break;
   
    result.push(targetIndex);

    currentIndex = targetIndex +1;
  }

  return result;
}
const zoo = ['🐒', '🦄', '🐊', '🐸', '🐙',  '🐊']; // Skyler just arrived!
const alligatorsIndices = zoo.indicesOf('🐊');
// mokeysindices returns [2, 5]
```

## What can't you find with indexOf

You might have noticed that we interrupt the search by using triple equal comparison `el === target` which is a (strict equality comparison)[]. This means for example that we can't test for arrays, objects or functions other than by reference.

```js
const simpleArray = [1, 2, 3];
const simpleFunction = () => {console.log('hey')};
const simpleObject = {alligator: 'cage'};

const compositeArray = [simpleArray, simpleFunction, simpleObject];

// These all work as expected because we compare by reference
compositeArray.indexOf(simpleArray); // returns 0
compositeArray.indexOf(simpleFunction); // returns 1
compositeArray.indexOf(simpleObject); // returns 2

// These won't work 
compositeArray.indexOf([1, 2, 3]); // returns -1
compositeArray.indexOf(() => {console.log('hey')}); // returns -1
compositeArray.indexOf({alligator: 'cage'}) // returns -1

```

## A Deep indexOf

Let's say we want to create a utility to also check for objects, functions and 

<p class="file-desc">Module: <span>inDepthIndexOf.js</span></p>

```js
Array.prototype.deepIndexOf = function (target) {
  // If the target is an object, array or a function, we give it a special treatment
  if (typeof target === 'object' || typeof target === 'function') {
    // We stringify the target 
    const searchTarget = target.toString()
    // We loop through all of the elements of the array
    for (let index = 0; index < this.length; index++){
      const element = this[index]
      // We check if the element in the array is an object or a function AND if so we check if its' stringified value is equal to our target
      if ((typeof element === 'object' || typeof target === 'function') && element.toString() === searchTarget) {
        // if we have a match we interrupt the loop and return the index
        return index
      }
    }
    // if nothing matched we return -1
    return -1
  }
  return this.indexOf(target)
}

const simpleArray = [1, 2, 3];
const simpleFunction = () => {console.log('hey')};
const simpleObject = {alligator: 'cage'};

const compositeArray = [simpleArray, simpleFunction, simpleObject];

// These all work as expected because we compare by reference
compositeArray.deepIndexOf(simpleArray); // returns 0
// ... You know the rest
// These will work!
compositeArray.deepIndexOf([1, 2, 3]); // returns 0
compositeArray.deepIndexOf(() => {console.log('hey')}); // returns 1
compositeArray.deepIndexOf({alligator: 'cage'}) // returns 2

```

There are many ways to improve this code. If you have some time on your hands, try to think of how to make it more accurate and performant. I'd love to read your ideas on Twitter.

## Performance

It is much slower than simply doing a for loop. That doesn't mean that `indexOf ` is slow. If your array is small  you will never see the difference between indexOf() or a for loop. If your array is so big that you can notice a difference between the two methods, then you should probably wonder why your array is so big and how you could optimize the search. You can find [performance benchmarks on JSPerf](https://jsperf.com/thor-indexof-vs-for).

```js
  var spencersIndex
  // This is faster than indexOf('🐊') but it is much uglier
  for(var index = 0; index < zoo.length; index ++) {
    if (zoo[index] === '🐊')
      spencersIndex = index
  }
  // spencers Index === 2
```

## `indexOf` in Strings

You can port all the logic from `Array.indexOf` to this section. Let's code!

<p class="file-desc">Module: <span>whereIsSpencer.js</span></p>

```js
const whereIsSpencer = "We are all looking for Spencer the alligator. Spencer is a dear friend. Lookout here comes 🐊!"

const spencersIndex = whereIsSpencer.indexOf('Spencer');
// spencersIndex ===  23

// to find find the second occurence of 'Spencer',
// we need to add one to the position of spencer #1
const secondSpencerIndex = whereIsSpencer.indexOf('Spencer', spencersIndex + 1);
// secondSpencerIndex ===  46

const alligatorIndex = whereIsSpencer.indexOf('🐊');
// alligatorIndex ===  91

// Be careful the search is case sensitive!
const lowerCaseSpencer = whereIsSpencer.indexOf('spencer');
// lowerCaseSpencer === -1
```

Now we can create the same `indicesOf` function for `Array.prototype.string`.

<p class="file-desc">Module: <span>indicesOfStrings.js</span></p>

```js
// This is a bit more concise than the previous indicesOf function
// But it is exactly the same logic
String.prototype.indicesOf = function (target) {
  let currentIndex = this.indexOf(target);
  const allIndices = []
  while(currentIndex != -1) {
    allIndices.push(currentIndex);
    currentIndex =  this.indexOf(target, currentIndex +1 );
  }

  return allIndices;
}

const whereIsSpencer = "We are all looking for Spencer the alligator. Spencer is a dear friend. Lookout here comes 🐊!";

const spencerIndices = whereIsSpencer.indicesOf('Spencer');
// spencerIndices equals [23, 46]
```
I hope you had fun reading this post if you have any suggestions, questions or comments feel free to ask on [Twitter](https://twitter.com/alligatorio).