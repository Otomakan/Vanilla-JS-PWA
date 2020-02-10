---
layout: page-fullwidth
title: Creating custom forms with FormData
,
categories:
    - JS
tags:3
    - Javascript
    - Forms
    - React
header: no
breadcrumb: true
meta_description: "Forms are rarely as easy as they seem, FormData is there to help make your life easier."
author: Jack Misteli
---

Building a form is easy to do as long as you don't have an edge case. Then the bacon fat goes down the drain and your pipes are ruined. So you sometimes need some extra tools in your toolbelt to deal with it. `FormData` can be one of your tools.

## The Core API

FormData has a lot of features but the only method that works across all browsers is `append`. Let's say we want to create a social application for people to share their bacon pictures. Here we will create a form that allows users to send a picture with a title and the author's name. Our HTML will look like this:

```html
  <input type="text" name="author"  id="author-input"/>
  <input type="text" name="title" id="title-input"/>
  <input type="file" name="picture" id="picture-input"/>
  <button id="submit-button"> SUBMIT </button>
```

To handle our data we can create the following code:
<p class="file-desc">Module: <span>bacon-form.js</span></p>

```js
   const inputs = document.getElementsByTagName('input');
    // This object will keep track of the changes of inputs
    const applicationState = {
      title: "",
      author: "",
      picture: ""
    }

    document.getElementById('submit-button').onclick = async () => {
        // We create a new form object
      const form = new FormData();
      // we append each element to the form
      form.append('title', applicationState.title);
      form.append('author', applicationState.author);
      form.append('picture', applicationState.picture);

      const res = await fetch('https://postman-echo.com/post', {
        method: 'POST',
        mode: 'no-cors',
        body: form
      });
      // ... Do something with the response
    }

    // The rest of this code is functional
    // It is not directly related to FormData

    // This for loop reflects input changes to the application's state
    for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i]
        const inputName = input.name

        input.onchange = (e) => {
            let value = e.target.value
            // updating the application state according to the input the user interacted with
            if (inputName === 'picture' && e.target.files[0]) {
            setPicture(e.target.files[0]);
            } else {
            applicationState[inputName] = value;
            }
        };
    }
    // setPicture takes a file reads it as a base64URL and assigns that value to application.picture
    const setPicture = (file) => {
      const fr = new FileReader();
      // Reading the data and encoding it as base64 to send it to the server
      fr.readAsDataURL(file);
      // When the data is done loading we assign it to picture
      fr.onloadend = (fileData) => {
        applicationState.picture = fileData.target.result;
      }
    }
```

If this is our input:
<p class="text-center">
 <img src="/images/js/formdata-input.png" loading="lazy" width="600" class="slight-shadow" alt="Input sample with author name Jack Misteli Picture Name Alligator Bacon and a picture file">
</p>

Then we press the submit button then we will roughly get the following request headers:

```json
{
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Content-Length": "4369",
    "Content-Type": "multipart/form-data",
    "Host": "postman-echo.com",
    "Origin": "null",
    "Sec-Fetch-Mode": "no-cors",
    "Sec-Fetch-Site": "cross-site"
}

```

And the following body:

```json
{
    "title": "Alligator Bacon",
    "author": "Jack Misteli",
    "picture": "data:text/javascript;base64,iVBORw0KGgoAA......."
}
```

Please note that `FormData` constructor can take form data as an argument. So you could do:

<p class="file-desc">Module: <span>regular-form.html</span></p>

```html
<form id="user-form">
  <input type="text" name="username">
  <input type="password" name="password">
  <input type="file" name="picture" id="picture-input"/>
  <input type="submit">
</form>
<script>
  document.getElementById('user-form').onsubmit = async function (e) {
      e.preventDefault();
      // here `this` is the user-form HTML element
      const form = new FormData(this);
      ///... send form to server
  }
</script>

```

Another important gotcha, is that `append` does not overwrite a key if it already exists. 

<p class="file-desc">Module: <span>double-bacon-form.js</span></p>

```js
    const form = new FormData();
    form.append('baconType', 'pork');
    form.append('baconType', 'vegan');
    // When you send your form it will look like this:
    // {
    //  baconType: pork
    //  baconType: vegan
    //}
```
If you want to overwrite a key value you will have to use other functions.

## Advanced Forms

`FormData` constructor and the `append` method are available in all browsers. Most of the functions are pretty self-descriptive:

- FormData.has(key) checks if the key exists in the form.
- FormData.set(key, value) changes the value associated to the key.
- FormData.delete(key) deletes the entry associated with the key.

- FormData.get(key) accesses the first value associated with the key.
- FormData.getAll(key) creates an array of all the values associated with a key.

- FormData.keys(), FormData.values(), FormData.entries() are iterators used to get all the keys, associated values or just entries of the FormData.

<p class="t70 text-center">
  That's it if you have any questions you can fire them up on Twitter with a link to the article and I'll do my best to answer them!
</p>