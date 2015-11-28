if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then(function(registration) {
        // Registration was successful
        console.log('ServiceWorker registration successful with scope: ',    registration.scope);
    }).catch(function(err) {
        // registration failed :(
        console.log('ServiceWorker registration failed: ', err);
    });
}

console.log("main.js loaded");

// save templates
var templateCache = {};

// setup mustache templating
var parseTags = new Array();
parseTags.push("[[");
parseTags.push("]]");

/**
 * initiate a template and add it to the cache
 * @param id id from the template
 */
var initTemplate = function(id) {
    var tpl = document.querySelector('#' + id);
    var tplHtml = tpl.innerHTML;

    Mustache.parse(tplHtml, parseTags);
    templateCache[id] = tplHtml;
}

initTemplate('tplModList');

/**
 * load the swproxy-mods from own Server (/swproxy/mods)
 * @returns {Promise}
 */
var loadMods = function() {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/swproxy/mods', true);
        xhr.onload = function(e) {
            console.log('Server response status: ', this.status);
            if (this.status == 200) {
                resolve(JSON.parse(this.response));
            }
            reject();
        };
        xhr.send();
    });
};

/**
 * Because npm set no CORS Header, we need to load the data from a proxy
 * @returns {Promise}
 */
var loadModsViaProxy = function() {
    console.log("Mods not loaded from ServiceWorker!");
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'http://cors.maxogden.com/https://registry.npmjs.org/-/_view/byKeyword?startkey=[%22swproxy-mod%22]&endkey=[%22swproxy-mod%22,%7B%7D]&group_level=3', true);
        xhr.onload = function(e) {
            console.log('Server response status (via proxy): ', this.status);
            if (this.status == 200) {
                resolve(JSON.parse(this.response));
            }
            reject();
        };
        xhr.send();
    });
};

/**
 * shows the mods on the webpage
 * @param mods
 */
var showMods = function (mods) {

    var rows = [];
    for (var i = 0; i < mods.rows.length; i++) {
        rows.push({
            name: mods.rows[i].key[1], // package name
            description: mods.rows[i].key[2], // package description
            href: 'https://www.npmjs.com/package/' + mods.rows[i].key[1] // link to view package on npm
        });
    }

    var rendered = Mustache.render(templateCache['tplModList'], {rows: rows});
    var container = document.querySelector('#resultContainer');
    container.innerHTML = rendered;
};

/**
 * shows a error on the webpage
 */
var showNetworkError = function () {
    console.log('loading mods failed with network error');
};

// load mods from own server, if it fail, try to load via proxy
loadMods()
    .then(undefined, loadModsViaProxy)
    .then(showMods, showNetworkError);