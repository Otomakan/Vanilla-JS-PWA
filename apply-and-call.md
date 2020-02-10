---
layout: page-fullwidth
title:  "Apply and call in a functional ES6 World"
categories:
    - JS
tags:
    - Pure JavaScript
    - apply
    - call
    - this
header: no
breadcrumb: true
meta_description: "The time and places to use apply and call in you JavaScript Code"
author: Jack Misteli
---

In a JavaScript world where arrow (functions)[] are everywhere, object and array destructuring are the norm, and functional programming seems has won the popularity; writing about `apply` and `call` is hard. In this world we don't have any practical use for these functions. So you probably don't need to know about it today (except maybe in a job interview to test your curiosity). But who knows we  might need if functional programing is replaced by another programing paradigm.

## What are `apply` and `call`

`Apply` and `call` are used to call functions. Done... next section please. But, they really are that simple: apply and call execute the function that they are attached to and you can pass two arguments the first one is the executing context of the function and second is the list of arguments. The only difference between `call` and `apply` is that `call` takes a list of arguments and `apply` takes an array:


## Cute tricks

Here are a few cute tricks that will help you understand `call` and `apply`.

<!-- <p class="file-desc">Module: <span>arrayToArguments.js</span></p> -->
```js
    Math.max(1,322, 89,23, 6)
    // this function returns the highest number in the list 322
    //If you have an array
    const myNums = [1,322, 89,23, 6]
    Math.apply(null, myNums)
    // My nums is converted to the same list of arguments used above
```

<!-- <p class="file-desc">Module: <span>coolConcat.js</span></p> -->
```js
  // To merge two arrays before ES6 you had to do something like
  let firstStarWars = ["Star Wars", "The Empire Strikes Back", "Return of the Jedi"]
  let prequals =  ["The Phantom Menace", "Attack of the Clones", "Revenge of the Sith"]
  let allStarWars = firstStarWars.concat(prequal)

  // But you can use push with apply imagine we create the allStarWars
  let allStarWars = ["Star Wars", "The Empire Strikes Back", "Return of the Jedi"]
  // allStarWars in release chronology
  [].push.apply(allStarWars, prequals)
  // allStarWars === ["Star Wars", "The Empire Strikes Back", "Return of the Jedi", "The Phantom Menace", "Attack of the Clones", "Revenge of the Sith"]

  // allStarWars in story line chronology
  [].unshift.apply(allStarWars, prequals)
  // allStarWars === ["The Phantom Menace", "Attack of the Clones", "Revenge of the Sith", "Star Wars", "The Empire Strikes Back", "Return of the Jedi"]

  // Note that we can replace [] by any array and it will have the exact same effect
  // Try changing [] for allStarWars, Array.prototype or any array!
 ```

## The killer of cute tricks

 With ES6 and the spread operator you can destructure objects and arrays and achieve the same results as above.
<!-- <p class="file-desc">Module: <span>dieCuteTricks.js</span></p> -->
```js 
  Math.max(...allNums)
  // returns 322

  allStarWars.push(...prequals)
  // allStarWars === ["Star Wars", "The Empire Strikes Back", "Return of the Jedi", "The Phantom Menace", "Attack of the Clones", "Revenge of the Sith"]
```

If you are using ES6 I really don't see any reason anymore to ever use `apply`. You can just use `.call(context, ...arguments) and you will achieve the same results. Now that `apply` is out of the picture we can focus on `call`.

## `call` under the hood

If you look at the ECMA specification you can see that (`call` is extremely simple)[https://www.ecma-international.org/ecma-262/6.0/#sec-function.prototype.call]. When `call` is called it make a few type checks and conversion then executes the target function with the context as well as the arguments.

```js
  function starWarsResource(resourceType) {
    this.information = {}
    this.resourceType =  resourceType
    this.name
  }
  function Planet(name) {
    this.name = name
    starWarsResource.call(this, 'planet')
  }
  const tatooine = new Planet('Tatooine')
  // tatooine = {name: "Tatooine", information: {}, resourceType: "planet"}

  // Careful look what happens if we pass a different context
  function WonkyPlanet(name) {
    starWarsResource.call(null, 'planet')
  }
  const wonkyPlanet = new WonkyPlanet('earth')
  // wonkyPlanet = {}
  // But now there is are three global variables called `name`, `information` and `resourceType`

  console.log(name)
  // This will log 'earth' even if we never wrote `var name = 'earth'`
```

This is bad to say the least. We find a similar effect if we use arrow functions. First of all they cannot be constructors, so we cannot describe `Planet` with an arrow function. Arrow function have their own `this` so you can't force another context on them.

```js
  const starWarsResource = (resourceType) => {
    this.information = {}
    this.resourceType = resourceType
  }
  function WonkyPlanet (name)  {
    // This doesn't work as expected anymore!
    this.name = name
    starWarsResource.call(this, 'planet')
  }
  const tatooine = new WonkyPlanet('Tatooine')
  // tatooine = {}
  console.log(name)
  // logs "Tatooine"
```

`starWarsResource` decided of its' own scope and it is the global scope.

## Should I use `call`?

If you are wondering if you should use it you probably shouldn't. There are a lot of modern patterns that allow similar effects to `call`. 

```js
  class StarWarsResource {
    constructor(resourceType) {
      this.information = {}
      this.name
      this.resourceType = resourceType
    }
  }
  class Planet extends StarWarsResource  {
    constructor(name){
      super('planet')
      this.name = name
    }
  }
  const tatooine = new Planet('Tatooine')
  // tatooine = {name: "Tatooine", information: {}, resourceType: "planet"}
```

This is much cleaner isn't it? Interestingly under the hood the babel transpiler used to use `call` to extend classes, so it's not completely useless. You can checkout (this link to see how it works)[https://babeljs.io/en/repl#?babili=false&browsers=&build=&builtIns=false&spec=false&loose=false&code_lz=ATDGBsEMGduBlALpATgdVdASgU2gewFcVQdgBvAKBBFHwDtpEVDRF8UAKFPIknACoBPAA44AlBWo0QiABYBLaADoF9AGYcAtpEQKGwALwUAvtJnyly-pC05zNSyp4FipYWKPAXfd6PsyZiBBYFCwwAAKUPQ4iMA4AB6IOPQAJnBIqBgo2LxuZFIydIzMrOxcNnbiVDIg0IRiXADkItGxTeIOsooqlWTGfQ4hIcVMwMjs-Gr9wDEA7pFtiJxNArr4UzEdQA&debug=false&forceAllTransforms=false&shippedProposals=false&circleciRepo=&evaluate=false&fileSize=false&timeTravel=false&sourceType=module&lineWrap=true&presets=es2015%2Ces2015-loose&prettier=false&targets=&version=7.7.4&externalPlugins=].

## call and functional programming

I think the rise of functional programming is the main reason why `call` is not relevant anymore. I personally prefer a purely functional style of in JavaScript so it doesn't bother me. Functional programming means we trying to avoid any type of objects in our code. We have functions calling functions calling functions. In that perspective, functions have to be pure, states should be independent and objects immutable. In other words, functions shouldn't care about context, they should only care about arguments.

That being said, I think it is important not to completely disregard other design patterns. Even if I say use a functional style, I cheat every now and then. If you're using classes use classes not call. 


## Experimenting with functional calls

Now I wanted to see how I could incorporate `call` in a functional perspective. And here is what I came up with:


```js
  // This is simply a helper which fetches data from api and returns the body
  async function getAndDeserialize(url) {
    const res = await fetch(url)
    const body = await res.json()
    return body
  }

  // getStarWars info queries the SWAPI star wars API to get details about a Star Wars entity
  // The query involves a resourceType (like I want a planet, a person or a starship...)
  async function getStarWarsInfo(searchQuery) {
    console.log(this, searchQuery)
    // We extract the variably type
    const resourceType = this.resourceType
    if (!this.resourceType)
      throw new Error('resourceType is not defined!')
    // In the Star Wars API available types include: people, planets, films, starships...
    const stringQuery = `${this.resourceType}/?searchget=${searchQuery}`
    const info = await getAndDeserialize('https://swapi.co/api/' + stringQuery)

    // we set the `information` key to the result of the api call
    this.information = info.results[0]
  }
  async function setFilmsTitles() {
    // We declare a new key on the context called filmTitles
    this.filmTitles = []
    console.log(this.information)
    // We get the films' urls from the current context
    const filmsUrls = this.information.films
    for(let i = 0; i < filmsUrls.length; i++){
      // Getting film details from the SWAPI API
      const filmObject = await getAndDeserialize(filmsUrls[i])
      // We push the film titles after we get the details from the SWAPI API
      this.filmTitles.push(filmObject.title)
    }
  }

  async function getFullPerson() {
    this.resourceType = 'people'
    await getStarWarsInfo.call(this, this.name)
    await setFilmsTitles.call(this)
  }

  async function getFullPlanet() {
    this.resourceType = 'planets'
    await getStarWarsInfo.call(this, this.name)
    await setFilmsTitles.call(this)
  }

  const luke = {
    name: 'luke'
  }
  const tattoine = {
    name: 'Tatooine'
  }
  getFullPerson.call(luke)
  getFullPlanet.call(tattoine)

  //  function Person(name) {
  //   this.resource = 'people'
  //   this.name = name
  //   this.setDetails = async function () {
  //     // `name` is passed as an argument to getStarWarsInfo: getStarWarsInfo(name) 
  //      await  getStarWarsInfo.call(this, name)
  //   }
  //   this.setMovieTitles = async function () {
  //     await setFilmsTitles.call(this)
  //   }
  // }

  // (async () => {
  //   const luke = new Person('luke')
  //   await luke.call(setDetails()
  //   // Now luke.information = {
  //       // films: (5) ["https://swapi.co/api/films/2/", "https://swapi.co/api/films/6/", "https://swapi.co/api/films/3/", "https://swapi.co/api/films/1/", "https://swapi.co/api/films/7/"]
  //       // gender: "male"
  //       // hair_color: "blond"
  //       // height: "172"
  //   await luke.setMovieTitles()
  //   // After the promise resolves luke.filmTitles = ["The Empire Strikes Back", "Revenge of the Sith", "Return of the Jedi", "A New Hope", "The Force Awakens"]
  // })()
```

You can see from this code that `call` is used to make the data related to `luke` available to `getStarWarsInfo`. Now let's try calling `setFilmsTitle` with the wrong context.

```js
  const filmTitles = await setFilmsTitles()
  // TypeError: Cannot read property 'films' of undefined
  const filmTitles = setFilmsTitles.call(this)
  // TypeError: Cannot read property 'films' of undefined
  const mockInfo = {information:{ films:["https://swapi.co/api/films/2/", "https://swapi.co/api/films/6/"]}}
  const filmTitles = await setFilmsTitles.call(mockInfo)
  // After the promise resolve: mockInfo = {
  //     filmTitles: ["The Empire Strikes Back", "Revenge of the Sith"]
  //     films: ["https://swapi.co/api/films/2/", "https://swapi.co/api/films/6/"]
  // }
```

<!-- <p class="file-desc">Module: <span>coolConcat.js</span></p> -->
```js
  function StarWarsResource () {}
```

This code looks functional because we have functions calling functions. But it isn't. It's important to remember that in JavaScript a function is an object, a very special object. In all the functions declared above we use functions like objects which each have a state so it isn't functional.


## Why we don't need `apply` and `call`


## Apply Call And Arrow functions

Arrow functions are stubborn, they will not let you choose what `this` to pass to them. So `apply` and `call` will not work with them.


This article can be a bit dry, so if you're not familiar with `this` so I would recommend maybe reading (this article)[https://alligator.io/js/this-keyword/]. But if you're too lazy to open a new tab:

## What is `this` ?

`this` is scary but it is just an object. Try `console.log(this)` in different objects, function and prototypes or whatever other abstraction you find interesting. Among other things `this` shows the properties you have access to at a given point in your code.


```

 const 
```

Strict mode exceptions and restriction
"If this is evaluated within strict mode code, then the this value is not coerced to an object. A this value of null or undefined is not converted to the global object and primitive values are not converted to wrapper objects. The this value passed via a function call (including calls made using Function.prototype.apply and Function.prototype.call) do not coerce the passed this value to an object (9.2.1.2, 19.2.3.1, 19.2.3.3)."


26.1.1Reflect.apply ( target, thisArgument, argumentsList )
When the apply function is called with arguments target, thisArgument, and argumentsList the following steps are taken:

If IsCallable(target) is false, throw a TypeError exception.
Let args be CreateListFromArrayLike(argumentsList).
ReturnIfAbrupt(args).
Perform PrepareForTailCall().
Return Call(target, thisArgument, args).


19.2.3.1Function.prototype.apply ( thisArg, argArray )
When the apply method is called on an object func with arguments thisArg and argArray, the following steps are taken:

If IsCallable(func) is false, throw a TypeError exception.
If argArray is null or undefined, then
Return Call(func, thisArg).
Let argList be CreateListFromArrayLike(argArray).
ReturnIfAbrupt(argList ).
Perform PrepareForTailCall().
Return Call(func, thisArg, argList).
The length property of the apply method is 2.

NOTE 1The thisArg value is passed without modification as the this value. This is a change from Edition 3, where an undefined or null thisArg is replaced with the global object and ToObject is applied to all other values and that result is passed as the this value. Even though the thisArg is passed without modification, non-strict functions still perform these transformations upon entry to the function.

NOTE 2If func is an arrow function or a bound function then the thisArg will be ignored by the function [[Call]] in step 6.


<!-- trye to reproduce https://stackoverflow.com/questions/41354099/getting-error-createlistfromarraylike-called-on-non-object-when-trying-to-use-a -->