
importScripts('./js/swproxy.js');
importScripts('./js/swproxy-mod-rewrite.js');

var proxy = new SwProxy(self);
proxy.registerMod(ModRewrite);

/*
proxy.registerMod({
    factoryMethodName: () => 'rewriteRule',
    factoryMethod: (swproxy) => {
        return (url, rule, modifiers) => {
            swproxy.addFetchRule({
                match: (event) => {
                    return url.test(event.request.url);
                },
                execute: (originalEvent, event) => {
                    console.log('execute rule for request: ', rule, originalEvent, event);
                    return new Promise((resolve) => {
                        var matches = url.exec(event.request.url);
                        var destUrl = rule;

                        matches.forEach((match, i) => {
                            destUrl = destUrl.replace('$' + i, match);
                        });

                        event.request.url = destUrl;
                        resolve(event);
                    });
                }
            });
        }
    }
});
*/

// proxy.rewriteRule("asd", "Regex should match", "Modifiers");
proxy.rewriteRule(new RegExp('.*/swproxy/mods$', ''), 'http://cors.maxogden.com/https://registry.npmjs.org/-/_view/byKeyword?startkey=[%22swproxy%22]&endkey=[%22swproxy%22,%7B%7D]&group_level=3', {});
