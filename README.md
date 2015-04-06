# Welcome!
Seo Server is a command line tool that runs a server that allows
GoogleBot (and any other crawlers) to crawl your heavily Javascript
built websites. The tool works with very little changes to your
server or client side code.

This entire site is driven by Javascript (view the source at https://github.com/apiengine/seoserver-site).
Click the `What does Google see?` button at the bottom of each page to see Seo Server in action.

# How it works
<img src="http://yuml.me/5b1b60bb" />

Seo Server runs http://phantomjs.org/ (headless webkit browser) which renders the page fully and
returns the fully executed code to GoogleBot.

# Getting started
1. you must install PhantomJs and link into your bin so that Seo Server can call it.
2. Seo Server is an NPM module so install via

...`sudo npm install -g seoserver`
3. Now we have access to the Seo Server command line tool

...`seoserver start`
...Which starts an Express server on port 3000 or
...`seoserver -p 4000 start`
...Start it as a background process and log the output
...`seoserver -p 4000 start > seoserver.log &`

# Telling GoogleBot to fetch from Seo Server
To tell GoogleBot that we are using ajaxed content we simply add to our sites
index.html file the Google specific
<a href="https://developers.google.com/webmasters/ajax-crawling/docs/specification">meta tag</a>.
If you view the source of this page you can see we have included the tag below.
`<meta name="fragment" content="!">`
Now whenever GoogleBot visits any of our pages it will try to load `?_escaped_fragment_=pathname`
So if we were using Apache with mod rewrite and mod proxy, we can include in our .htaccess
```
RewriteCond %{QUERY_STRING} ^_escaped_fragment_=(.*)$
RewriteRule (.*) http://address-of-seoserver:3000/%1? [P]
```
Now all request from GoogleBot will be returned fully rendered.
How GoogleBot sees the page can be tested with Google
<a href="http://www.google.com/webmasters/">WebMasters</a>
(they allow you to simulate Google crawls and see the result instantly).

# For other crawlers
Using mod rewrite, we can send other crawlers to Seo Server also
```
RewriteCond %{HTTP_USER_AGENT} ^DuckDuckBot/1.0;
RewriteRule (.*) http://address-of-seoserver:3000/%1? [P]
```

# FAQ
Nothing here yet, but check out the examples on the left to see different types of ajaxed content.
Also ask questions and give feedback on GitHub <a href="https://github.com/apiengine/seoserver/issues">issues</a>.

# Configuration
There are two configuration files in `bin/`: `config.json` and `phantom-config.json`.

## config.json
`config.json` contains the configuration for the seoserver and has two options. The default configuration follows:
```
{
    "verbose": true,
    "stripSelectors": []
}
```

Toggle `verbose` to turn off verbose logging.

Add css selectors for elements you want removed from the resulting HTMLSnapshot to `stripSelectors`.
For example, you may want to remove your javascript `script` tag so that no further javascript processes
once the content reaches the crawler.

## phantom-config.json
`phantom-config.json` contains the configuration for phantomjs and is passed to
phantomjs using the `--config` command line option.

See http://phantomjs.org/api/command-line.html for more information on the options you can use to configure phantomjs.

The default phantomjs configuration is empty.

A suggested `phantom-config.json` following:
```
{
    "webSecurityEnabled": false,
    "sslProtocol": "any",
    "ignoreSslErrors": true,
    "autoLoadImages": false,
    "offlineStorageDefaultQuota": 0
}
```
