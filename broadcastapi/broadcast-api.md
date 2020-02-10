---
layout: page-fullwidth
title:  Broadcast API
,
categories:
    - JS
tags:
    - bacon
header: no
breadcrumb: true
meta_description: "Description in the range of 80 to 155 characters."
author: Jack Misteli
---

Using the Broadcast API may sound fancy and daunting but it is super easy and useful.

## Why use the Broadcast API

Try to log into one of your favorite websites (I tried it on youtube.com). Then, open in a separate tab the same website. Normally you will be logged in both pages. Then log out on one of your tabs. On most sites, it will look like you are logged in one page and logged off the other.

Your windows are in different states: logged in vs logged out. That's not great and if you are a maniac tabber (like me) it can lead to some confusion.

This can even be a security issue. Imagine your user is in a coffee shop using the company dashboard. He logs off to take a toilet break and leaves the computer on. If the application was opened in multiple tabs one could access the data available in the other tabs (on screen or maybe some JWT token).

## Broadcast API code

Here is a very simple example that you can copy paste in a local HTML file:

```html
<!DOCTYPE html>

<body>
  <!-- The title will change to greet the user -->
  <h1 id="title">Hey</h1>
  <input id="name-field" placeholder="Enter Your Name"/>
</body>

<script>

var bc = new BroadcastChannel('gator_channel');

(()=>{
  const title = document.getElementById('title');
  const nameField = document.getElementById('name-field');
  const setTitle = (name) => {
    title.innerHTML = 'Hey ' + name;
  }

  bc.onmessage = (messageEvent) => {
    // If our broadcast message is 'update_title' then get the new title from localStorage
    if (messageEvent.data === 'update_title') {
      // localStorage is domain specific so when it changes in one window it changes in the other
      setTitle(localStorage.getItem('title'));
    }
  }
  
  // When the page loads check if the title is in our localStorage
  if (localStorage.getItem('title')) {
    setTitle(localStorage.getItem('title'));
  } else {
    setTitle('please tell us your name');
  }

  nameField.onchange = (e) => {
    const inputValue = e.target.value;
    // In the localStorage we set title to the user's input
    localStorage.setItem('title', inputValue);
    // Update the title on the current page 
    setTitle(inputValue);
    // Tell the other pages to update the title
    bc.postMessage('update_title');
  }
})()
</script>

```

This page has a title and an input. When the user enters her name in the input we store the name in the local storage under the key `userName`. Then we set the title of our application to `'Hey' + userName`. So if the user's name is `Sarah` the page will show "Hey Sarah".

If we didn't have a `BroadcastChannel` when the user enters her name in one window it wouldn't update the other window. Without the broadcast channel in our code, the user would have to refresh the second window to update the title.

So in our first line, we create a `BroadcastChannel` called "gator_channel". We then create a message receiver using the `onmessage` method. We set `onmessage` to a function that takes one argument (aka an event message). Then in our code, we check that the name of the message is `update_title`. If so, we extract the user name from the local storage.

Whenever we call `postMessage` on the broadcast channel, it will call `onmessage` in the other windows. So if I input Jack in window 1, then window 1 will call `bc.postMessage('updated_title')`. This will activate `onmessage` on window 2 and any other window opened on the same origin.

## Where it will work

Unlike other APIs such as `window.postMessage` or  you don't need to know anything about the other windows or tabs opened. The Broadcast Channel will work on any tab or window which is in the same origin (same scheme, host and port).

This means that you can broadcast messages from `https://alligator.io/` to `https://alligator.io/js/broadcast-channels`. All you need is to have a BroadcastChanel object on both pages using the same channel name:

```js
const bs = new BroadcastChannel('alligator_channel');
bc.onmessage = (eventMessage) => {
  // do something different on each page
}
```

If the hosts are different it won't work:
- https://alligator.io
- https://www.alligator.io

If the ports are different it won't work:
- https://alligator.io
- https://alligator.io:8080

If the schemes are different it won't work. That is similar to different ports since the standard is that http and https respectively use port 80 and 443.
- http://alligator.io
- https://alligator.io

Broadcast channels will not work if one of the windows is in incognito mode or across browsers (e.g. Firefox to Chrome).

## Browser compatibility

According to (caniuse.com)[https://caniuse.com/#feat=broadcastchannel], the broadcast API is available to about 75.6% of users. Safari and Internet Explorer don't have any support for it yet.

To my knowledge, the most popular polyfill is https://github.com/pubkey/broadcast-channel. You can use it almost exactly like the Broadcast API. If it detects that the Broadcast API is available it will use it automatically for faster results. Otherwise, it will use IndexedDB or LocalStorage.

## What messages we can pass

You can pass anything that can be cloned using the structured clone algorithm. That includes almost everything except symbols:
- All primitive types except symbols (Boolean, Null, Undefined, Number, BigInt, String)
- Boolean and String objects
- Dates
- Regular Expressions
- Blobs
- Files, FileLists
- ArrayBuffers, ArrayBufferViews
- ImageBitmaps, ImageDatas
- Arrays, Objects, Maps and Sets

If you try sending something like a Symbol, you will get an error on the sending side.

Let's update our code and use objects instead of strings.

```js
  bc.onmessage = (messageEvent) => {
    const data = messageEvent.data
    // If our broadcast message is 'update_title' then get the new title from localStorage
    switch (data.type) {
      case 'update_title':
        if (data.title){
          setTitle(data.title);
        }
        else
          setTitle(localStorage.getItem('title'));
        break
      default:
        console.log('we received a message')
    }
  };
  // ... Skipping Code
  bc.postMessage({type: 'update_title', title: inputValue});

```

## Things you can do with Broadcast Channels

There are many things we can imagine. The most obvious use case is to share states. For example, if you use something like Flux to manage your state, you can broadcast a message so that your store remains the same across tabs. We can also imagine building something similar for state machines.

We saw that we can also send large files in different formats. We might be able to save some bandwidth by sharing large files such as images across tabs.

## Closing a broadcast channel

Closing a broadcast channel is super easy. You simply have to run:

```js
bc.close()
```

You might want to close or open channels depending on the state of your application. For instance, when you are logged in you might have a specific channel to share your application's state. You might want to close that channel when you log out.
