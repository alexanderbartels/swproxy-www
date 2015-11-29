# swproxy 
[![NPM version][npm-image]][npm-url] [![wercker status](https://app.wercker.com/status/ad827be9e837ad12afdd9c0b63e83bf6/m/master "wercker status")](https://app.wercker.com/project/bykey/ad827be9e837ad12afdd9c0b63e83bf6)
[![Dependency Status][daviddm-image]][daviddm-url]

## work in progress

## How to use the RewriteMod

```javascript
// register the mod
proxy.registerMod(ModRewrite);

// define a new rewrite rule
proxy.rewriteRule(new RegExp('.*/some/path', ''), '/some/other/path', {});

// change the domain for every request that ends with /some/path
proxy.rewriteRule(new RegExp('.*/(some/path)', ''), 'https://example.com/$1', {});
```

### proxy.rewriteRule(srcUrl, destUrl, modifiers);
srcUrl:
   - the rule will only executed for requests, that matches this regular expression.

destUrl: 
  - the request Url will be modified, so the that the destUrl will be used, to make the final request.

modifiers:
  - modifiers are an JavaScript Object "{}"
  - They can be swproxy specific like 'stopPropagation'. See (doc)[https://github.com/alexanderbartels/swproxy#modifier] for more information.
  - ...

[npm-image]: https://badge.fury.io/js/swproxy-mod-rewrite.svg
[npm-url]: https://npmjs.org/package/swproxy-mod-rewrite
[daviddm-image]: https://david-dm.org/alexanderbartels/swproxy-mod-rewrite.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/alexanderbartels/swproxy-mod-rewrite

