
---
layout: page-fullwidth
title:  "Creating a multilingual website with Gatsby"
,
categories:
    - Gatsby
tags:
    - Gatsby
    - i18n
    - l10n
    - Netlify
    - Cosmic
header: no
breadcrumb: true
meta_description: "How to create a multilanguage website using Gatsby and Cosmic JS with no localization plugin"
author: Jack Misteli
---

A friend recently asked me too build a website which has a Japanese and an English version. I never wrote a internationalized website but I have strong opinions about how localization should work. So here is one way to approach internationalization.

## A bit of context

There are many ways to approach localization and as always there is no silver bullet. Each approach solves the problem in different ways. So here is my context:

- I want to build a site with as little maintenance cost as possible.
- The content should be created by someone with no programming knowledge.
- The site should not force the user on one version of the site.

This last point is so important to me. I am lucky enough to travel to different countries and sometimes websites force you to use the local version of their site. So when `[array of multinational companies]` forces me to the `[long array of languages I don't understand]` version of the website it drives me mad. I have the same issue with automatic translations of a page.  If I want automatic translation of my website I can use the fantastic [Google translate Chrome extension](https://chrome.google.com/webstore/detail/google-translate/aapbdbdomjkkjkaonfhkkikfgjllcleb?hl=en).

This website is for both Japanese and English users. So all the pages of the site should have an English version and a Japanese version. If the user wants to change the  current version of the website she can click a language menu in the navigation bar.

## My approach

Gatsby and React offer [many tools to approach localization (l10n) and internationalization (i18n)](https://www.gatsbyjs.org/docs/localization-i18n/).

I first used [gatsby-plugin-i18n](https://github.com/angeloocana/gatsby-plugin-i18n) to easily generate routes.

For example, `/page/team.ja.js` will be turned into the following url: `/ja/team` (`ja` is the language code for Japan).

This is a really nice plugin but the problem is that it isn't really programmatic. I have to write a new file for each language. And in each file I had to make a specific GraphQL query to fetch the data. So for example, if I introduce a new language to my CMS I have to create all the routes again with the new language extension.

So instead, I decided to build create l10n without any plugin. All the code for this project is available at [https://github.com/Otomakan/kodou](https://github.com/Otomakan/kodou). 

In this approach the content writer is fully responsible for localization. So when she writes the Japanese version of the website she should make sure that the date formats are correct. This is why we are not using `react-intl`  which relies on the Internationalization API and will be the topic of a future post.

## Setting up Cosmic JS

Cosmic JS allows you do activate localization when you create a new object type.

<p class="text-center">
 <img src="/images/gatsby/localization_object_cosmic.png" loading="lazy" width="600" class="slight-shadow" alt="Crispy bacon with JavaScript">
</p>

Don't forget to select a priority locale otherwise the new object won't save.

In our new site we have a team page so we create a Team Members object. When we create a new Team Member we now can choose its' language. 

<p class="text-center">
 <img src="/images/gatsby/cosmic_team_member_locale.png" loading="lazy" width="600" class="slight-shadow" alt="Crispy bacon with JavaScript">
</p>

Now to connect to access that data from Gatsby we need to run:

```
yarn add gatsby-source-cosmicjs
```

Then we need to configure `gatsby-config.js` by adding the following code in `plugins`.

<p class="file-desc">Module: <span>gatsby-config.js</span></p>
```js
{
  resolve: "gatsby-source-cosmicjs",
  options: {
    bucketSlug: process.env.COSMIC_BUCKET,
    // We add the 'team-members' object type to be able to fetch it later
    objectTypes: ["team-members"],
    // If you have enabled read_key to fetch data (optional).
    apiAccess: {
      read_key: process.env.COSMIC_ENV_KEY,
    }
  }
}
```

In the rest of our code we can access the team member data from Cosmic JS by running:

```js
graphql(`
    {
      allCosmicjsTeamMembers  {
        edges {
        //Here we have the structure of out `team-members` object
          node {
            title
            locale
            content
            metadata {
              profile_picture {
                imgix_url
              }
            }
          }
        }
      }
    }
```

Now the localization magic happens.

## Generating Localized Pages

I wanted my friend to be able to do any changes he wanted by himself. So I completely dropped the `/pages` directory in favor of the `/templates` directory. In Gatsby templates are used for reusable content and the programmatically create pages which is exactly what we need to do!

Before we look at our template file let's see how we can fetch data from Cosmic to create new pages.

<p class="file-desc">Module: <span>gatsby-node.js</span></p>

```js
// langs contains the languages of our blog and default langKey is the default language of the site
// To be fully programmatic we could calculate langs
// here langs = ['en', 'ja'] and defaultLangKey = 'en'
const {langs, defaultLangKey} = require('../data/languages')
const path = require(`path`)
const {localizeUrl, createLanguagesObject} = require('../utils/localization')

exports.createPages = async ({ actions, graphql }) => {
  const { createPage } = actions

  const result = await graphql(`
    {
      allCosmicjsTeamMembers  {
        edges {
          node {
            title
            locale
            content
            metadata {
              profile_picture {
                imgix_url
              }
            }
          }
        }
      }
    }
  `)

  if (result.errors) {
    console.error(result.errors)
  }
  
  // Creates a profiles object with out site's languages 
  const profiles = createLanguagesObject(langs)
  // profiles = {
  // 'en': [],
  // 'ja': []  
  // }

  // converting the raw cosmic data into a more useable data structure
  result.data.allCosmicjsTeamMembers.edges.forEach(({ node }) => {
    profiles[node.locale].push(node)
  }
  // profiles = {
  // 'en': [...all English profiles],
  // 'ja': [...all Japanese profiles]  
  // }

  // we create a new page for each language
  langs.forEach( lang =>{
     createPage({
      //  the localizeUrl function creates a url which takes into consideration what the default language is
      path: localizeUrl(lang, defaultLangKey, '/team'),
      component: path.resolve(`src/templates/team.js`),
      context: {
        profiles: profiles[lang]
      }
    })
  })
}
```

This code will create two new pages with the paths `/ja/team` and `/team` (There is no `/en` since we set English as the default language).

As you can see the `createPage` takes as an argument an object with 3 fields `path`, `component` and `context`. Path is simply the path we want our new page to have. `component` is the template we want to use. `context` is the data we want to pass to our template. Here we pass the profiles written in our desired language.

## Templating

Let's take a look at our team template.

```js
import React from "react"
import Layout from "../components/layout"
import SEO from "../components/seo"

const TeamPage = (props) => {
  // We will see about pageContext in the next section
  const {profiles} = props.pageContext
  return (
  <Layout location={props.location}>
    <SEO title="Team" />
    <h1>Team</h1>
    // Iterating trough the array of profiles
    {profiles.map((profile,i)=>(
      <div key={i} className="columns">
        <div className="column">
          // Here are some nice profile pictures of our team members
          <div className="square-image" style={{backgroundImage: `url("${profile.metadata.profile_picture.imgix_url}")`}}/>
        </div>
        <div className="column is-two-thirds">
          <div className="team-member-title">{profile.title}</div>
          // Here is some html content we get from Cosmic
          <div dangerouslySetInnerHTML={{ __html: profile.content }}/>
        </div>
      </div>
      )
    )}
  </Layout>
  )
}

export default TeamPage
```

To sum up, the code above takes a `profiles` props which is an array of profiles we get from Cosmic JS. Each profile has a profile picture object, a `title` and a `content` field. The `content` is actually a string of HTML so we have to set it using the `dangerouslySetInnerHTML` prop.

For this template to work, it is important to prepare you CSS files in advance to get consistent results. My friend won't be able to add class names or ids in Cosmic's WYSIWYG.

There is much more to say and do but it is already a lot to process I think. I hope it will help a little or a lot in building your own multilanguage site.