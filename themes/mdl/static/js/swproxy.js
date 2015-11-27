/**
 * The Proxy for service workers
 */
/*eslint-disable no-console */
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var SwProxy = (function () {
  function SwProxy(serviceWorker) {
    var _this = this;

    _classCallCheck(this, SwProxy);

    this.installRules = [];
    this.activateRules = [];
    this.fetchRules = [];
    this.serviceWorker = serviceWorker;

    this.serviceWorker.addEventListener('install', function (event) {
      return _this.onInstall(event);
    });
    this.serviceWorker.addEventListener('activate', function (event) {
      return _this.onActivate(event);
    });
    this.serviceWorker.addEventListener('fetch', function (event) {
      return _this.onFetch(event);
    });
  }

  /*eslint-enable no-console */

  /**
   * registers a mod
   *
   * @param mod should be from the type swproxy-mod
   *
   * return true if registration was successful, otherwise false
   */

  _createClass(SwProxy, [{
    key: 'registerMod',
    value: function registerMod(mod) {
      var factoryMethodName = mod.factoryMethodName();

      //mod already registered?
      if (typeof this[factoryMethodName] === 'function') {
        return false;
      }

      if (typeof mod.factoryMethod === 'function') {
        this[factoryMethodName] = mod.factoryMethod(this);
        return true;
      }

      return false;
    }

    /**
     * adds a new rule, that will be executed, if the install event gets fired.
     * The rule should return a Promise.
     *
     * @param {object} the rule to be executed.
     */
  }, {
    key: 'addInstallRule',
    value: function addInstallRule(rule) {
      this.installRules.push(rule);
    }

    /**
     * adds a new rule, that will be executed, if the activate event gets fired.
     * The rule should return a Promise.
     *
     * @param {object} the rule to be executed.
     */
  }, {
    key: 'addActivateRule',
    value: function addActivateRule(rule) {
      this.activateRules.push(rule);
    }

    /**
     * adds a new rule, that will be executed, if the fetch event gets fired.
     * The rule should return a Promise.
     *
     * @param {object} the rule to be executed.
     */
  }, {
    key: 'addFetchRule',
    value: function addFetchRule(rule) {
      this.fetchRules.push(rule);
    }

    /**
     * called if the install event from the service worker is fired
     */
  }, {
    key: 'onInstall',
    value: function onInstall(event) {
      if (this.installRules.length === 0) {
        return;
      }

      console.log('install event fired: ', event);

      var rules = this.filterRules(this.installRules, event);
      event.waitUntil(this.callPromiseChain(event, rules));
    }

    /**
     * called if the activate event from the service worker is fired
     */
  }, {
    key: 'onActivate',
    value: function onActivate(event) {
      // This happens when the old version is gone.
      // Here you can make changes that would have broken the old version,
      // such as deleting old caches and migrating data.

      // Fetch (and other) events will be delayed until this promise settles.
      // This may delay the load of a page & resources,
      // so use install for anything that can be done while an old version is still in control.
      if (this.activateRules.length === 0) {
        return;
      }

      console.log('activate event fired: ', event);

      var rules = this.filterRules(this.activateRules, event);
      event.waitUntil(this.callPromiseChain(event, rules));
    }

    /**
     * called if the fetch event from the service worker is fired
     */
  }, {
    key: 'onFetch',
    value: function onFetch(event) {
      if (this.fetchRules.length === 0) {
        return;
      }

      console.log('fetch event fired: ', event);

      var rules = this.filterRules(this.fetchRules, event);
      event.respondWith(this.callPromiseChain(event, rules));
    }

    /**
     * calls the promise from every given rule in a sync loop.
     *
     * @param request the service worker request
     * @param rules rules withe the promise to execute
     *
     * @return Prmoise returned by the promise chain
     */
  }, {
    key: 'callPromiseChain',
    value: function callPromiseChain(event, rules) {
      var _this2 = this;

      var modifiableEvent = this.copyEvent(event);
      // execute all rules in sync, like here => https://github.com/DukeyToo/es6-promise-patterns
      return rules.reduceRight(function (prev, curr) {
        return prev.then(function (result) {
          return curr.execute(event, result);
        });
      }, new Promise(function (resolve) {
        return resolve(modifiableEvent);
      })).then(function (e) {
        if (e.type === 'fetch') {
          return _this2.doFetch(e);
        }
        return new Promise(function (resolve) {
          return resolve(e);
        });
      });
    }
  }, {
    key: 'doFetch',
    value: function doFetch(event) {
      /*eslint-disable no-undef */
      return fetch(event.request.url, event.request);
      /*eslint-enable no-undef */
    }

    /**
     * create a modifiable copy from the given ServiceWorker event
     *
     * @param event event to copy
     * @returns {{}} object with the data from the given event
       */
  }, {
    key: 'copyEvent',
    value: function copyEvent(event) {
      var eventPropsToCopy = ['timeStamp', 'type', 'returnValue', 'request', 'path', 'isReload', 'eventPhase', 'defaultPrevented'];

      var copyEvent = {};
      eventPropsToCopy.forEach(function (prop) {
        copyEvent[prop] = event[prop] && typeof event[prop].clone === 'function' ? event[prop].clone() : event[prop];
      });

      // the request property is not available on all events
      if (copyEvent.request) {
        (function () {
          var requestPropsToCopy = ['bodyUsed', 'credentials', 'integrity', 'method', 'mode', 'redirect', 'referrer', 'url'];
          var requestToCopy = copyEvent.request;

          copyEvent.request = {};
          requestPropsToCopy.forEach(function (prop) {
            copyEvent.request[prop] = requestToCopy[prop] && typeof requestToCopy[prop].clone === 'function' ? requestToCopy[prop].clone() : requestToCopy[prop];
          });

          copyEvent.request.headers = {};
        })();
      }

      return copyEvent;
    }

    /**
     * filters the given rules to match the given route
     *
     * @param rules {Array} array with rules. Each rule should provide a function #match(request || event).
     * @param filterObject the route or event to check
     * @returns {Array} with all rules that should be executed for the given filterObject
     */
  }, {
    key: 'filterRules',
    value: function filterRules(rules, filterObject) {
      return rules.filter(function (r) {
        return r.match && r.match(filterObject) && r;
      });
    }
  }]);

  return SwProxy;
})();