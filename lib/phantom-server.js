var page = require('webpage').create(),
    system = require('system'),
    config = require('../bin/config'),
    stripSelectors = config.stripSelectors || [];

page.open(system.args[1], function (status) {
    page.evaluate(function(selectors) {
        selectors.forEach(function(selector) {
            Array.prototype.forEach.call(document.querySelectorAll(selector), function(element) {
                element.parentNode.removeChild(element);
            });
        });
    }, stripSelectors);
    console.log(page.content);
    phantom.exit(0);
});
