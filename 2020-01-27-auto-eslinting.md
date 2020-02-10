---
layout: page-fullwidth
title:  "Lint On Save With VSCode"
,
categories:
    - JS
tags:
    - eslint
    - workflow
header: no
breadcrumb: true
meta_description: "How to lint your code with a simple CTRL-S using eslint and VSCode"
author: Jack Misteli
---

We need style guides to write consistent, reusable and clean code. But when you have been working 10 hours a day on a project for the past 3 months it is hard to notice an extra indentation in your code or a single quote instead of a double quote.

That's what linters are for. They are here to yell at you "THIS CODE IS UGLY GO FIX IT". I personally do not enjoy getting yelled at. That's why I use auto-save linting.

Auto-save linting corrects my documents as I press the save button.

## Linting Setup

First, I would recommend installing the amazing [`ESLint` extension available in Visual Studios' marketplace](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint).

We all have different preferences and needs for our projects. This is not an eslint lesson. If you are not familiar with eslint I would recommend to install their CLI tool globally.

```
npm install -g eslint
# Or for yarn users
yarn global add eslint
``

Now we can you the CLI walkthrough.

```bash
# First initialize your project
npm init
# Then we can use the walkthrough
eslint --init
```

You should see something like this:

<p class="text-center">
 <img src="/js/images/eslint-init.PNG" loading="lazy" width="600" class="slight-shadow" alt="dirty code which I can't show in alt with annotations from vscode">
</p>

Or run:

```sh
mkdir .vscode
touch settings.json
```

Now let's create a Javascript file: 

<p class="text-center">
 <img src="/js/images/eslint-first-try.PNG" loading="lazy" width="600" class="slight-shadow" alt="dirty code which I can't show in alt with annotations from vscode">
</p>

You can see that `helloYou` is underlined. If I hover it I can see the following message: "'helloYou' is assigned a value but never used". This is because the rule `.eslint(no-unused-vars)` is activated and tells me to use the variable.

This can be fixed if I write:

```js
const helloYou    = (name)=> {
  name = 'you' || name   ;
  console.log("hello" + name + "!" )
}

// I am using the variable helloYou
console.log(helloYou)
```

You can see that there are other problems with this code that eslint is not pointing out.

## Adding Rules

In alligator.io the rule is that we have to use single quotes and semi-colons in our code. `eslint --init` created a file called `eslintrc.js` (or .yml or .json if that's option you selected).

<p class="file-desc">Module: <span>.eslintrc.js</span></p>

```js
module.exports = {
    'env': {
        'browser': true,
        'es6': true,
        'node': true
    },
    'extends': 'eslint:recommended',
    'globals': {
        'Atomics': 'readonly',
        'SharedArrayBuffer': 'readonly'
    },
    'parserOptions': {
        'ecmaVersion': 2018,
        'sourceType': 'module'
    },
    'rules': {
    }
};
```

The rules section is empty so let's fill it up.

```js
module.exports = {
  // ...
  'rules': {
    // we only want single quotes
    'quotes': ['error', 'single'],
    // we want to force semicolons
    'semi': ['error', 'always'],
    // we use 2 spaces to indent our code
    'indent': ['error', 2],
    // we want to avoid useless spaces
    'no-multi-spaces': ['error']
  }
}
```

If we go back to our js file we will see:

<p class="text-center">
 <img src="/js/images/eslint-watch-problems.PNG" loading="lazy" width="600" class="slight-shadow" alt="dirty code which I can't show in alt with annotations from vscode">
</p>

If you have the Eslint extension installed you can use `CTRL + SHIFT + P` to open the Command Palette. Then search for "ESLint fix all auto-fixable Problems" and press enter.

Now my dirty code looks like this:

```js
const helloYou = (name)=> {
  name = 'you' || name ;
  console.log('hello' + name + '!' );
};

console.log(helloYou());
```

Beautiful!

## Adding autosave

Sometimes I forget to run the auto-fix command. But I never (almost) forget to save my files. Thankfully we can set up eslint to run auto-fix every time I run `CTRL + S`.

You can use For ESLint to work correctly, you must change the VSCode preferences. Go to File > Preferences > Settings > Workplace and try to find:

```
Editor: Code Actions On Save
Code action kinds to be run on save.

Edit in settings.json
```

Then click settings.json. Or you can create a .vscode folder and create a file called settings.json inside.
```sh
mkdir .vscode
touch .vscode/settings.json
# Or for windows users
new-item .vscode/settings.json
```

In `settings.json` paste the following code.

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": ["javascript"]
 }
 ```

Now all you need to to is save your files to automatically apply your linting rules (as long as they are auto-fixable).