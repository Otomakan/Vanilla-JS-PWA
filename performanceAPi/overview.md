---
layout: page-fullwidth
title:  How to get started with the JS Performance API
,
categories:
    - JS
tags:
    - Javascript
    - Performance
    - Performance API
header: no
breadcrumb: true
meta_description: "An overview of the Javascript APIs available to monitor your website's performance in the wild"
author: Jack Misteli
---

Performance, performance, performance. You can have the best website in the world if it takes 2 minutes to load nobody will see it. If your website takes two minutes to load it probably won't be too hard to figure out why. Optimization is trickier when you try to bring down your average load time from 1 second to 0.85 second.

There are a lot of tools which can help you understand how your application works locally. The Performance API is here to help us have a granular understanding of our web pages in the wild. You can get real  data and see how your site works in different browsers, networks, parts of the world and more!

The performance API is often described as a constellation of APIs. There are too many things to describe all of it in a single article. In this post, we will show the most basic features to get you started with performance monitoring.

 The API is evolving and there are many new features and deprecations to come. Level 2s of all the performance APIs coming up: some of them are partially implemented, some of them are still drafts. So you should regularly check out MDN or W3 for the most recent updates.

## How to access performance data

The most basic way to measure a program's performance is to use `performance.now()`. This will return the current time at sub-millisecond resolution. If you want to dig into high-resolution time, I highly recommend reading [W3C's Editor's draft on that topic](https://w3c.github.io/perf-timing-primer/#high-resolution-time).

`performance.now` only allows you to measure what's in your JavaScript code (aka User Performance).

To access different DOM and browser events we have 3 functions:

- `getEntries()` returns all the available performance entries. Try running `performance.getEntries()` on the current page, and you will see a big array. Initially, almost of the entries will relate to all the images, scripts and other things which are loaded by the page (aka resources). The

```js
const tenthEntry = performance.getEntries()[10]
// on alligator.io it will return the following object
// { initiatorType: "script",
// nextHopProtocol: "h2",
// workerStart: 526.8099999520928,
// redirectStart: 0,
// ....
// decodedBodySize: 0,
// serverTiming: [],
// name: "https://d33wubrfki0l68.cloudfront.net/bundles/e2203d1b1c14952473222bcff4c58a8bd9fef14a.js",
// entryType: "resource",
// startTime: 315.5049999477342,
// duration: 231.48499999661
//}
// We can see this is a resource entry for a script loaded from cloudfront
```

- getEntriesByType() is like `getEntries()` but will give you some possibility to filter the results. There are 7 types that you can query:
        - frame: Very experimental feature which allows developers to get data about how much work is done by the browser in one event loop. If the browser is doing too much work in one loop, the frame rate will drop and the user experience will be poor.  
        - resource: This relates to all the resources which are downloaded by the site.
        - mark: These are custom markers that can be used to calculate the speed of your code.
        - measure: Measures allow us to easily measure the difference between two marks.
        - paint: The pain entries relate to the pixels displayed on the screen.
        - longtask: Long tasks are any task which take over 50ms to execute.

    We will dive into some of these types in the next sections. Here is a simple example to get started:

```js
    const paintEntries = performance.getEntriesByType('paint')
    // paint Entries[0] equals {
    //    name: "first-paint",
    //    entryType: "paint",
    //    startTime: 342.160000000149,
    //    duration: 0,
    //    }
    // paintEntries[1] equals {
    //    name: "first-contentful-paint",
    //    entryType: "paint",
    //    startTime: 342.160000000149,
    //    duration: 0,
    // }
```
- getEntriesByName(entryName) filters all the entries by name.
```js
const nativeLogoPerfEntry = performance.getEntriesByName('https://alligator.io/#native_logo#')[0];
// It will return performance information related to the logo's performance:
// {initiatorType: "img",
// nextHopProtocol: "",
// workerStart: 539.6649999311194,
// ........
// name: "https://alligator.io/#native_logo#",
// entryType: "resource",
// startTime: 539.5149999530986,
// duration: 94.24000000581145
//}
```

If you are looking for higher level information about the site's performance you can also call `performance.toJSON()`.

## Audit your functions

The most basic tool is `now` which we described above.

```js
const firstNow = performance.now()
// This loop is just to simulate slow calculations
for (let i = 0; i < 100000; i++){
    var ii = Math.sqrt(i)
}
const secondNow = performance.now()

const howLongDidOurLoopTake = secondNow - firstNow
// on my laptop it returns howLongDidOurLoopTake == 4.08500000089407 in milliseconds
```

The problem with `now` is that it is a bit difficult to manage if you have many measurements. A more useful tool is `mark` which creates some performance entries which you can query later on. Then you can combine markers and create new entries using `measure`.

```js
performance.mark('beginSquareRootLoop');
// This loop is just to simulate slow calculations
for (let i = 0; i < 1000000; i++){
    var ii = Math.sqrt(i);
}
performance.mark('endSquareRootLoop');
// Then anywhere in your code you can use

// We create a new entry called measureSquareRootLoop which combines our two marks
performance.measure('measureSquareRootLoop','beginSquareRootLoop', 'endSquareRootLoop');

console.log(performance.getEntriesByName('beginSquareRootLoop'));
// {detail: null,
// name: "beginSquareRootLoop",
// entryType: "mark",
// startTime: 3745.360000000801,
// duration: 0}

console.log(performance.getEntriesByName('measureSquareRootLoop'));
// {detail: null,
// name: "measureSquareRootLoop",
// entryType: "measure",
// startTime: 3745.360000000801, This is the same as beginSquareRootLoop
// duration: 9.904999984428287 shows the time it took to get from beginSquareRootLoop to endSquareRootLoop
//}
```

## Navigation

Navigation is used to get a granular understanding of the  critical steps to build your web page. The safest way to access the Navigation data is to do:

```js
const navigationEntry = performance.getEntriesByType('navigation')[0]
```

In my browser I get:

```js
{
    unloadEventStart: 213.41000002576038,
    unloadEventEnd: 213.41000002576038,
    domInteractive: 975.8100000326522,
    domContentLoadedEventStart: 982.2649999987334,
    domContentLoadedEventEnd: 1217.9650000180118,
    domComplete: 2000.960000033956,
    loadEventStart: 2001.044999982696,
    loadEventEnd: 2008.6500000325032,
    type: "reload",
    redirectCount: 0,
    initiatorType: "navigation",
    nextHopProtocol: "",
    workerStart: 2.5550000136718154,
    redirectStart: 0,
    redirectEnd: 0,
    fetchStart: 2.5599999935366213,
    domainLookupStart: 2.5599999935366213,
    domainLookupEnd: 2.5599999935366213,
    connectStart: 2.5599999935366213,
    connectEnd: 2.5599999935366213,
    secureConnectionStart: 0,
    requestStart: 2.5599999935366213,
    responseStart: 107.46500000823289,
    responseEnd: 214.3950000172481,
transferSize: 0,
    encodedBodySize: 0,
    decodedBodySize: 0,
    serverTiming: [],
    name: "https://alligator.io/",
    entryType: "navigation",
    startTime: 0,
    duration: 2008.6500000325032
}
```

We will dive in some more detailed explanations about how to use that data in a future post. But in the meantime here is a visualization of the navigation timeline.  

<p class="text-center">
 <img src="/images/js/performance-navigation-timeline.png" loading="lazy" width="600" class="slight-shadow" alt="Performance Navigation TimeLine On Alligator.io">
</p>

## Resource

Anytime a resource is loaded by a page we can find its' trace in the Performance Entries. All we have to do to get them is run `performance.getEntriesByType('resource')`. This includes images, scripts, CSS files and more. So for example if we want to focus on the performance of images on the site we can run:

```js
performance.getEntriesByType('resource').filter(resource=> resource.initiatorType == 'img')
```

Here is one of the resources from alligator.io

```js
{
    initiatorType: "img",
    nextHopProtocol: "h2",
    workerStart: 551.2149999849498,
    redirectStart: 0,
    redirectEnd: 0,
    fetchStart: 551.3149999896996,
    domainLookupStart: 0,
    domainLookupEnd: 0,
    connectStart: 0,
    connectEnd: 0,
    secureConnectionStart: 0,
    requestStart: 0,
    responseStart: 0,
    responseEnd: 560.1850000093691,
    transferSize: 0,
    encodedBodySize: 0,
    decodedBodySize: 0,
    serverTiming: [],
    name: "https://d33wubrfki0l68.cloudfront.net/39d2d2905588dad289b228deb021d51449f6143d/a3baf/images/logos/gatsby-logo.svg",
    entryType: "resource",
    startTime: 222.0450000022538,
    duration: 338.1400000071153
}
```

This entry has a lot of 0 values as you can see, that is because we are restricted by CORS (this is a big limit of the resource timing API). So the following properties will always return 0: redirectStart, redirectEnd, domainLookupStart, domainLookupEnd, connectStart, connectEnd, secureConnectionStart, requestStart, and responseStart.

## Paint

The paint API relates to events that draw pixels on the window. As we saw in a previous snippet, we have access to "First Time to Pain" and "First Contentful Paint". If you worked on frontend optimization tools like Lighthouse, you might be familiar with these terms. The first time to paint is when the first pixel shows up on the user screen. The first contentful paint is when an element defined in the DOM is first rendered. To optimize the first contentful pain you can reduce render-blocking scripts and stylesheets, use HTTP caching, optimize JavaScript bootup and more!

These are useful metrics but are pretty limited if you are trying to understand what your users see. In order to have a good idea of your users' performance perception; we need to combine multiple metrics.

<p class="t70 text-center">
The performance API is gigantic and is rapidly changing. The best place to look for updates is of course Alligator.io, but if you want to explore this topic really in depth you should check out (W3's website)[https://www.w3.org/webperf/] where you can find the latest working drafts and recommendations.
</p>