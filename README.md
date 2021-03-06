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

   `sudo npm install -g seoserver`

3. Now we have access to the Seo Server command line tool

   `seoserver start`

   Which starts an Express server on port 3000 or

   `seoserver -p 4000 start`

   Start it as a background process and log the output

   `seoserver -p 4000 start > seoserver.log &`

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

# Returning HTTP Status Codes other than 200
If your Javascript Application serves up 404 or other pages to users,
then your Seo Server is going to be returning 200 responses to web crawlers
when you really want to return a 404 or other status code.
You can return alternate status codes to web crawlers by updating your
Javascript application to set a special meta tag like this:
```
<meta name="seoserver-http-status" content="404">
```
This will return the same HTML content, but with the status code set to 404.
This will tell the web crawler to no longer index or request this page as desired
and still serve up the 404 page to your real users.
Your Javascript Application will need to be responsible for managing the correct state
of this meta tag.
I suggest defaulting it to a 200 response when the user navigates to a new route
and handling the edge case as needed.

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
    "x_forwarded_proto": null,
    "x_forwarded_host": null,
    "stripSelectors": []
}
```

Toggle `verbose` to turn off verbose logging.

You can set the `X-Forwarded-Proto` and `X-Forwarded-Host` headers in your webserver to pass them along to
the Seo Server or set them in the config file if needed. Both will use the value from the config if set,
then look for the header. `X-Forwarded-Proto` will default to `http` if there is no config value and the
header is not set. `X-Forwarded-Host` must be set in the config or in the header.

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
