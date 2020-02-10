---
layout: page-fullwidth
title:  
,
categories:
    - Gatsby
    - Internationalization
    - Localization
    - l10n
    - i18n
tags:
    - bacon
header: no
breadcrumb: true
meta_description: "Description in the range of 80 to 155 characters."
author: Jack Misteli
---


In a previous post [Creating a multilingual website with Gatsby]() I built [kodou.com](kodou.com) a site which has a Japanese and and English version. The post was a bit long so I didn't talk about some of the utilities I used and how to build the site's menu. If you want the whole code you can checkout my [GitHub repository](https://github.com/Otomakan/kodou).

## Quick summary

In our previous post [Creating a Multilingual Website](/gatsbyjs/create-a-multilanguage-site/), we build a site in Japanese and English. The site's default language is English. This means we have two URL types:
    - The Japanese pages: `kodou.com/ja/team`
    - The English pages `kodou.com/team`

The different pages versions are written in CosmicJS. We make Gatsby aware of the languages we use in `/config/languages`. The in `gatsby-node.js` we create our pages by using templates which we populate with data from CosmicJS. 

Here is a simplified version of what the `team-members` array returned by CosmicJS might look like.

```js
    teamMembers = [
        {
            title: 'CEO',
            fullName: 'Jack Misteli',
            content: 'The CEO of the Company',
            locale: 'en'
        },
        {
            title: 'CEO',
            fullName: 'ジャック・ミステリ',
            content: '会社のCEO',
            locale: 'ja'
        }
    ]
```

After we received the `teamMembers` we create two objects `jaTeamMembers` and `enTeamMembers`. We populate `templates/team` with `jaTeamMembers` to create `/ja/team` and `enTeamMembers` to create `/team`.

## Some internationalization utilities


## Making your site language aware

It is important to be a good webcitizen and make the sites we create accessible. So the first thing we need to do is add our languages to our site's metadata. It might also help you get more targeted search results.

<p class="file-desc">Module: <span>gatsby-config.js</span></p>
```js
    module.export = {
  siteMetadata: {
    title: `Kodou`,
    description: `Kodou site description`,
    author: `Jack Misteli `,
    languages
  },
  //....
```
In our Gatsby application we also pass down to our templates the current language in page's context.

<p class="file-desc">Module: <span>pageGenerator.js</span></p>

```js
// langs contains the languages of our blog and default langKey is the default language of the site
// To be fully programmatic we could calculate langs
// here langs = ['en', 'ja'] and defaultLangKey = 'en'
const {langs, defaultLangKey} = require('../config/languages')
const path = require(`path`)
const {localizeUrl, createLanguagesObject} = require('../utils/localization')

module.exports = async (options, createPage, graphql) => {
    const {query, pageName} = options
    let templateName = options.templateName ? options.templateName : pageName
    const result = await graphql(query)
    if (result.errors)
        console.error(result.errors)
  
    const cosmicJSData = createLanguagesObject(langs)

    Object.values(result.data)[0].edges.forEach(({ node }) => {
    cosmicJSData[node.locale].push(node)
    })

    // we create a new page for each language
    langs.forEach( lang => {
        createPage({
        //  the localizeUrl function creates a url which takes into consideration what the default language is
        path: localizeUrl(lang, defaultLangKey, '/team'),
        component: path.resolve(`src/templates/team.js`),
        context: {
        profiles: profiles[lang],
        //Here we pass the current language to the page
        lang
        }
    })
    })
}
```

Now we can access `lang` in our templates

```js
const {lang} = props.pageContext
```

## Using the internationalization API

The `Intl` API is used for string comparison, number formatting, and date and time formatting. It has a lot of cool features which we won't explore here. We will simply use it here to display dates in the appropriate format. 

We are adding the `react-intl` package in our Layout file.

<p class="file-desc">Module: <span>layout.js</span></p>

```js
import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import "../styles/main.scss"
import Header from "./header"
import { IntlProvider, FormattedDate } from "react-intl"

const Layout = ({ children, location, lang }) => {

  // We populated the siteMetaData in `gatsby-config.js` and are extracting it here for some extra language context
  // The best practice here would be to  directly get that data from `config` but I want to show different ways to do it
  const data = useStaticQuery(graphql`
    query SiteInfoQuery {
      site {
        siteMetadata {
          title
          languages {
            defaultLang
            langs
          }
        }
      }
}
  `)
  // langs is an array of all the supported languages
  // defaultLang is the default site language
  // title is the website's title
  const {langs, defaultLang, title} = data.site.siteMetadata

  return (
    // We use IntlProvider to set the default language of our page
    <IntlProvider
      locale={lang}
      defaultLocale={defaultLang}
    >
      <Header 
        location={location}
        defaultLang={defaultLang}
        languages={langs}
        siteTitle={title} />
        <main className="section">
          <div className="container"> 
            {children}
          </div>
        </main>
        <footer>
          <div className="footer">
            <div className="content has-text-centered">
            {/* FormattedDate will format our date according to the language we set in IntlProvider locale prop */}
              © <FormattedDate value={new Date()}
               year="numeric"
                month="long"
                day="numeric"
                weekday="long" />, Built by 
              <a href="https://jmisteli.com"> Jack Misteli</a>
            </div>
          </div>
        </footer>
    </IntlProvider>
  )
}

export default Layout
```

When the page is generated in English, `<FormattedDate>` will return `Monday, December 9, 2019`.
When the page is generated in Japanese `<FormattedDate>` will return `2019年12月9日月曜日`.

## Creating a menu

You can see that in `Layout` we have a `Header` component. We pass all the language information to the header except the current language prop. We don't pass it because I want to show you another way to the page's current language. 

```js
import { Link } from "gatsby"
import PropTypes from "prop-types"
import React from "react"
import { getCurrentLangKey, getLangs, getUrlForLang } from 'ptz-i18n'
import langmap from 'langmap'
import { localizeUrl, buildMenu } from '../../utils/localization'

const Header = ({ languages, location, defaultLang}) => {

  const url = location.pathname
  const currentLangKey = getCurrentLangKey(languages, defaultLang, url)
  
  // Create a home link by adding a slash before the language and if it
  const homeLink = localizeUrl(currentLangKey, defaultLang, '/')

  // // Get langs return language menu information

  // langsMenu will allow us to build a dropdown with all the available language options
  const langsMenu = buildMenu(languages, defaultLang, currentLangKey, url)
  // On the `/team` page this will return the following array
  //  [{selected: true, link: "/team/", langKey: "en"},
  //  {selected: false, link: "/ja/team/", langKey: "ja"}]

  // All the navigation menu item titles
  const allLanguageTitles = {
    'en':['Concept', 'Work', 'Team', 'News', 'Contact'],
    'ja': ['コンセプト', '仕事', 'チーム', 'ニュース', '連絡先']
  }

  // Selecting the current language and default to english titles
  const currentLanguageTitles = allLanguageTitles[currentLangKey] || allLanguageTitles['en']

  // allNavigationLinks contains all the pages name, with urls in every supported language
  const allNavigationLinks = currentLanguageTitles.map((page, i) => ({
    name: page,
    url: `${homeLink.replace(defaultLang, '')}${allLanguageTitles.en[i].toLowerCase()}`
  }))
  // On the English page it will return 
  // [{name: "Concept", url: "/concept"}, {name: "Work", url: "/work"}, {name: "Team", url: "/team"}...]
  // [{name: "コンセプト", url: "/ja/concept"}, {name: "仕事", url: "/ja/work"}, {name: "チーム", url: "/ja/team"} ...]

  return (
    <nav>
        <Link to={homeLink} className="navbar-item">
            HOME
        </Link>
        {allLinks.map((link, i) => (
        <Link key={i} to={link.url} className="navbar-item">
            {link.name.toUpperCase()}
        </Link>
        ))}
        
        <div className="navbar-language-menu">
            <div className="current-language">
            // langmap is an object with the language keys as object keys and english, original versions of the language
            {langmap[langKey]['englishName']}
            </div>
            <div className="all-languages-dropdown">
                {langsMenu.map((lang)=>(
                    !lang.selected && 
                    <Link key={lang.langKey} to={lang.link} className="navbar-item">
                    {langmap[lang.langKey]['englishName']}
                    </Link>
                ))}
            </div>
        </div>
    </nav>
)}

export default Header
```

And that's it, you have a menu in different which adapts its' link the the user's current language. If you want to check out the utility function I built they are available in [my GitHub repo](https://github.com/Otomakan/kodou/blob/master/utils/localization.js).