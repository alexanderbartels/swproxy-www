
/*eslint-disable no-alert, no-console */
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var ModRewriteRule = (function () {
  function ModRewriteRule(srcUrl, destUrl, modifier) {
    _classCallCheck(this, ModRewriteRule);

    console.log('Rewrite rule created: ', srcUrl, destUrl, modifier);

    this.srcUrl = srcUrl;
    this.destUrl = destUrl;
    this.modifier = modifier;
  }

  /*eslint-enable no-alert, no-console */

  /**
   * The Proxy for service workers
   */

  _createClass(ModRewriteRule, [{
    key: 'match',
    value: function match(event) {
      return this.srcUrl.test(event.request.url);
    }
  }, {
    key: 'execute',
    value: function execute(originalEvent, event) {
      var _this = this;

      console.log('execute rule for request: ', this.destUrl, originalEvent, event);

      return new Promise(function (resolve) {
        var matches = _this.srcUrl.exec(event.request.url);
        var calculatedUrl = _this.destUrl;

        matches.forEach(function (match, i) {
          calculatedUrl = calculatedUrl.replace('$' + i, match);
        });

        event.request.url = calculatedUrl;
        resolve(_this.mergeModifier(event, _this.modifier));
      });
    }

    /**
     * merges the current available modifiers into the event object
     * @param event
     * @param modifier
     * @returns {*}
       */
  }, {
    key: 'mergeModifier',
    value: function mergeModifier(event, modifier) {
      event.stopPropagation = modifier.stopPropagation;
      return event;
    }
  }]);

  return ModRewriteRule;
})();

var ModRewrite = (function () {
  function ModRewrite() {
    _classCallCheck(this, ModRewrite);
  }

  _createClass(ModRewrite, null, [{
    key: 'factoryMethodName',

    /**
     *
     * @returns {string} name for the factory method
     */
    value: function factoryMethodName() {
      return 'rewriteRule';
    }

    /**
     *
     * @param proxy the swproxy instances
     * @returns {Function} function that returns a factory function to create rules
     */
  }, {
    key: 'factoryMethod',
    value: function factoryMethod(swproxy) {
      return function (srcUrl, destUrl, modifier) {
        var rule = new ModRewriteRule(srcUrl, destUrl, modifier);
        swproxy.addFetchRule(rule);
        return rule;
      };
    }
  }]);

  return ModRewrite;
})();