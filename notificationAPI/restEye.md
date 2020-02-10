---
layout: page-fullwidth
title:  Creating a PWA with the Notifications API
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

I wanted to write one of my usual 'overview post' about the notification API. But thought this time I would spice it up and write an app which explains the API. All the code snippets will focus on the Notification API, if you want to see all the code you can see it on [GitHub](https://github.com/Otomakan/jmisteli.github.iosnippets/resteye).

## What I want the app to do 




<!-- all the options 
An options object containing any custom settings that you want to apply to the notification. The possible options are:
dir: The direction in which to display the notification. It defaults to auto, which just adopts the browser's language setting behavior, but you can override that behaviour by setting values of ltr and rtl (although most browsers seem to ignore these settings.)
lang: The notification's language, as specified using a DOMString representing a BCP 47 language tag. See the Sitepoint ISO 2 letter language codes page for a simple reference.
badge: A USVString containing the URL of the image used to represent the notification when there isn't enough space to display the notification itself.
body: A DOMString representing the body text of the notification, which is displayed below the title.
tag: A DOMString representing an identifying tag for the notification.
icon: A USVString containing the URL of an icon to be displayed in the notification.
image: a USVString containing the URL of an image to be displayed in the notification.
data: Arbitrary data that you want associated with the notification. This can be of any data type.
vibrate: A vibration pattern for the device's vibration hardware to emit with the notification.
renotify: A Boolean specifying whether the user should be notified after a new notification replaces an old one. The default is false, which means they won't be notified.
requireInteraction: Indicates that a notification should remain active until the user clicks or dismisses it, rather than closing automatically. The default value is false.
actions: An array of NotificationActions representing the actions available to the user when the notification is presented. These are options the user can choose among in order to act on the action within the context of the notification itself. The action's name is sent to the service worker notification handler to let it know the action was selected by the user.
silent: A Boolean specifying whether the notification is silent  (no sounds or vibrations  issued), regardless of the device settings. The default is false, which means it won't be silent. -->

Let action be a new NotificationAction.

Set action’s action to entry’s name.

Set action’s title to entry’s title.

Set action’s icon to entry’s icon URL.

NotificationAction
{
  required DOMString action;
  required DOMString title;
  USVString icon;
}