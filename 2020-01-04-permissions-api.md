---
layout: page-fullwidth
title:  Permissions API
,
categories:
    - JS
tags:
    - bacon
header: no
breadcrumb: true
meta_description: "How to manage all of your permissions in one place"
author: Jack Misteli
---

If you have ever created a web application which requires different features (like push notifications, webcam access, midi access), you probably noticed that their APIs look very different.

```js 
// for the geolocation API you need to call getCurrentPosition to check if geolocation is accessible
navigator.geolocation.getCurrentPosition(gotLocation, didNotGetLocation);

// for notifications we can directly check on the Notification object

if (Notification.permission == 'granted')
  // do notification stuff
if (Notification.permission == 'denied')
  // ask for notification access ....

```

This is not very handy.

The permission API allows us to have overview of the permissions available on our pages. What we mean by "permission" is whether we can access a specific feature with our code. Features that require permission to access them with code are called powerful features. Camera, midi, notifications, geolocation
 are all powerful features.

All powerful feature's APIs are a bit different. Thus, it can be a pain to figure out what is the state each feature's permissions. With the permissions API, we manage all the permissions' statuses with a single interface.


## Permissions API Basics

The permission API is very experimental at this stage and should be used carefully. You should only use it if it is mission critical and you can keep up with future breaking changes. For instance, Chrome used to support `navigator.permissions.revoke`. It doesn't work anymore despite MDN's browser support information.

At the time of the writing, `query` is the only property we can access from then `permissions` interface. `query` takes an object as an argument called a PermissionDescriptor. The permission descriptor has one field called 'name' which is the name of the permission you want to access.  

```js
// This query will give us information about the permissions attached to the camera
navigator.permissions.query({name: 'camera'})
```

The query returns a promise which resolves to a PermissionStatus. PermissionStatus has two fields: state and onchange.

```js
navigator.permissions.query({name: 'camera'}).then( permissionStatus => {
  console.log(permissionStatus)
  // in my browser on this page it logs:
  //{
  //   status: "prompt",
  //   onchange: null,
  // }
})
```

`state` has 3 possible states: "granted", "denied" and "prompt". "granted" means that we have access to the feature. "denied" means that we won't be able to access the feature. "prompt" means that the User-Agent (i.e. the browser) will ask the user for permission if we try to access that feature.

Some PermissionDescriptor have additional fields. [You can read more about them here](https://w3c.github.io/permissions/#geolocation). For example, `camera`'s PermissionDescriptor has an additional field called `deviceId` if you want to target a specific camera. Your query might look like this: `.query({name: 'camera', deviceId: "my-device-id"})`.

`onchange` is an event listener which activates whenever the permissions of the queried feature changes.

```js
navigator.permissions.query({name:'camera'}).then(res => {
  res.onchange = ((e)=>{
    // detecting if the event is a change
    if (e.type === 'change'){
      // checking what the new permissionStatus state is
      const newState = e.target.state
      if (newState === 'denied') {
        console.log('why did you decide to block us?')
      } else if (newState === 'granted') {
        console.log(' we will be together forever!')
      } else {
        console.log('thanks for reverting things back to normal')
      }
    }
  })
})
```

## All permissions API

There are a lot of different powerful permissions and browser support is very uneven. In the following script, you can see all the permissions described by [W3C's editor's draft](https://w3c.github.io/permissions/#permission-registry) in the `permissionsName` variable. The `getAllPermissions` function returns an array wit the different permissions available and their state. Please note that the result will change depending on your browser, the user's preference and of course the website's setup.

```js
const permissionsNames = [
  "geolocation",
  "notifications",
  "push",
  "midi",
  "camera",
  "microphone",
  "speaker",
  "device-info",
  "background-fetch",
  "background-sync",
  "bluetooth",
  "persistent-storage",
  "ambient-light-sensor",
  "accelerometer",
  "gyroscope",
  "magnetometer",
  "clipboard",
  "display-capture",
  "nfc"
]

const getAllPermissions = async () => {
  const allPermissions = []
  // We use Promise.all to wait until all the permission queries are resolved
  await Promise.all(
    permissionsNames.map(async permissionName => {
        try {
          let permission
          switch (permissionName) {
            case 'push':
              // Not necessary but right now Chrome only supports push messages with  notifications
              permission = await navigator.permissions.query({name: permissionName, userVisibleOnly: true})
              break
            default:
              permission = await navigator.permissions.query({name: permissionName})
          }
          console.log(permission)
          allPermissions.push({permissionName, state: permission.state})
        }
        catch(e){
          allPermissions.push({permissionName, state: 'error', errorMessage: e.toString()})
        }
    })
  )
  return allPermissions
}

```

If I then run the following code in my developer console on alligator.io:

```js
(async function () {
  const allPermissions = await getAllPermissions()
  console.log(allPermissions)
})()
```

<p class="text-center">
 <img src="/images/js/get-all-permissions.png" loading="lazy" width="600" class="slight-shadow" alt="Crispy bacon with JavaScript">
</p>

## Permissions in workers

So far we only used the `navigator.permissions` API because it is much easier to write concise examples. The Permissions API is also available inside of workers. `WorkerNavigator.permissions` which allows us to check permissions inside our workers.

<p class="t70 text-center">
  Hopefully you know have a better idea on how to use the Permission API. It is not very complicated, nor is it essential but it does make it much easier for us to manage permissions. There will probably be some new features and changes to the API and we'll keep you updated!
</p>