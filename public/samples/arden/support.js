/*
 * Local preview runtime for *.dc.html files.
 * Renders the <x-dc> template ({{ expr }}, <sc-for>, <sc-if>, style-hover, onX handlers, ref)
 * with the component class from <script type="text/x-dc"> using React 18.
 * Only needed when opening the file directly in a browser.
 */
(function () {
  var REACT = 'https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js';
  var REACT_DOM = 'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js';

  var hide = document.createElement('style');
  hide.textContent = 'x-dc{display:none!important}';
  document.head.appendChild(hide);

  function load(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = src; s.async = false; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  var ready = new Promise(function (res) {
    if (document.readyState !== 'loading') res();
    else document.addEventListener('DOMContentLoaded', res);
  });

  Promise.all([load(REACT), load(REACT_DOM), ready]).then(boot).catch(function (err) {
    console.error('[dc] runtime failed to start', err);
    hide.remove();
  });

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var VOID = { input: 1, img: 1, br: 1, hr: 1, meta: 1, link: 1, source: 1, area: 1, col: 1, wbr: 1 };
  var NO_WS = { svg: 1, g: 1, select: 1, table: 1, thead: 1, tbody: 1, tr: 1, 'sc-for': 1, 'sc-if': 1 };
  var BOOL = { required: 1, disabled: 1, checked: 1, multiple: 1, readonly: 1, autofocus: 1, hidden: 1, novalidate: 1 };
  var RENAME = { 'class': 'className', 'for': 'htmlFor', tabindex: 'tabIndex', readonly: 'readOnly', maxlength: 'maxLength', autocomplete: 'autoComplete', novalidate: 'noValidate', autofocus: 'autoFocus', colspan: 'colSpan', rowspan: 'rowSpan' };
  var EVENTS = { onclick: 'onClick', onmouseenter: 'onMouseEnter', onmouseleave: 'onMouseLeave', onscroll: 'onScroll', onsubmit: 'onSubmit', onchange: 'onChange', oninput: 'onInput', onkeydown: 'onKeyDown', onkeyup: 'onKeyUp', onfocus: 'onFocus', onblur: 'onBlur', onpointerdown: 'onPointerDown', onpointerup: 'onPointerUp' };

  var hoverCss = [], hoverN = 0;
  var fnCache = {};

  function evalExpr(expr, scope) {
    try {
      var f = fnCache[expr] || (fnCache[expr] = new Function('s', 'with(s){return (' + expr + ');}'));
      return f(scope);
    } catch (e) { console.warn('[dc] expression failed: ' + expr + ' — ' + e); return undefined; }
  }
  function interp(str, scope) {
    var whole = /^\s*\{\{([\s\S]+?)\}\}\s*$/.exec(str);
    if (whole && str.indexOf('{{') === str.lastIndexOf('{{')) return evalExpr(whole[1], scope);
    return str.replace(/\{\{([\s\S]+?)\}\}/g, function (_, e) { var v = evalExpr(e, scope); return v == null ? '' : v; });
  }
  function camel(p) {
    if (p.indexOf('--') === 0) return p;
    if (p.indexOf('-ms-') === 0) p = p.slice(1);
    return p.replace(/^-/, '').replace(/-([a-z])/g, function (_, c) { return c.toUpperCase(); })
      .replace(/^(webkit|moz)/, function (m) { return m.charAt(0).toUpperCase() + m.slice(1); });
  }
  function splitDecls(css) {
    var out = [], depth = 0, q = null, cur = '';
    for (var i = 0; i < css.length; i++) {
      var c = css[i];
      if (q) { if (c === q) q = null; }
      else if (c === '"' || c === "'") q = c;
      else if (c === '(') depth++;
      else if (c === ')') depth--;
      else if (c === ';' && depth === 0) { out.push(cur); cur = ''; continue; }
      cur += c;
    }
    out.push(cur);
    return out.map(function (d) {
      var k = d.indexOf(':');
      return k < 0 ? null : [d.slice(0, k).trim(), d.slice(k + 1).trim()];
    }).filter(function (d) { return d && d[0] && d[1] !== ''; });
  }
  function parseStyle(css) {
    var o = {};
    splitDecls(String(css)).forEach(function (d) { o[camel(d[0])] = d[1]; });
    return o;
  }

  // ---- compile DOM template into descriptors ----
  function compile(node, parentTag) {
    if (node.nodeType === 3) {
      var t = node.nodeValue;
      if (!t.trim()) return NO_WS[parentTag] ? null : { k: 'text', v: ' ' };
      return { k: 'text', v: t.replace(/\s+/g, ' ') };
    }
    if (node.nodeType !== 1) return null;
    var tag = node.localName;
    if (tag === 'helmet') return null;
    var kids = function () {
      var out = [];
      node.childNodes.forEach(function (c) { var d = compile(c, tag); if (d) out.push(d); });
      return out;
    };
    if (tag === 'sc-for') return { k: 'for', list: node.getAttribute('list'), as: node.getAttribute('as') || 'item', c: kids() };
    if (tag === 'sc-if') return { k: 'if', v: node.getAttribute('value'), c: kids() };
    var svg = node.namespaceURI === SVG_NS;
    var attrs = [], cls = null;
    for (var i = 0; i < node.attributes.length; i++) {
      var a = node.attributes[i], n = a.name;
      if (n.indexOf('hint-') === 0 || (n === 'class' && node.hasAttribute('style-hover'))) continue;
      if (n === 'style-hover') {
        cls = 'dch-' + (++hoverN);
        hoverCss.push('.' + cls + ':hover{' + splitDecls(a.value).map(function (d) { return d[0] + ':' + d[1] + ' !important'; }).join(';') + '}');
        continue;
      }
      attrs.push([n, a.value]);
    }
    if (cls) attrs.push(['class', cls + (node.getAttribute('class') ? ' ' + node.getAttribute('class') : '')]);
    return { k: 'el', tag: tag, svg: svg, a: attrs, c: VOID[tag] ? [] : kids() };
  }

  function propsFor(d, scope) {
    var p = {};
    d.a.forEach(function (pair) {
      var n = pair[0], raw = pair[1];
      var v = raw.indexOf('{{') >= 0 ? interp(raw, scope) : raw;
      if (n === 'style') { p.style = parseStyle(v); return; }
      if (EVENTS[n]) { if (typeof v === 'function') p[EVENTS[n]] = v; return; }
      if (n === 'ref') { if (v && typeof v === 'object') p.ref = v; return; }
      if (BOOL[n]) { p[RENAME[n] || n] = v === '' || v === true || v === n || (v !== false && v !== 'false' && v != null); return; }
      if (RENAME[n]) { p[RENAME[n]] = v; return; }
      if (d.svg && n.indexOf('-') > 0 && n.indexOf('data-') !== 0 && n.indexOf('aria-') !== 0) { p[camel(n)] = v; return; }
      p[n] = v;
    });
    return p;
  }

  function renderList(list, scope, R) {
    var out = [];
    list.forEach(function (d) {
      var r = render(d, scope, R);
      if (r != null) out.push(r);
    });
    return out;
  }
  function render(d, scope, R) {
    if (d.k === 'text') return d.v.indexOf('{{') >= 0 ? interp(d.v, scope) : d.v;
    if (d.k === 'if') return evalExpr(d.v.replace(/^\s*\{\{|\}\}\s*$/g, ''), scope) ? R.createElement(R.Fragment, null, renderList(d.c, scope, R)) : null;
    if (d.k === 'for') {
      var items = evalExpr(d.list.replace(/^\s*\{\{|\}\}\s*$/g, ''), scope) || [];
      return items.map(function (item, i) {
        var s = Object.create(scope); s[d.as] = item; s.$index = i;
        return R.createElement(R.Fragment, { key: i }, renderList(d.c, s, R));
      });
    }
    var kids = renderList(d.c, scope, R);
    return R.createElement.apply(null, [d.tag, propsFor(d, scope)].concat(kids));
  }

  function boot() {
    var R = window.React, RD = window.ReactDOM;
    var host = document.querySelector('x-dc');
    var script = document.querySelector('script[data-dc-script]');
    if (!host || !script) { hide.remove(); return; }

    var helmet = host.querySelector('helmet');
    if (helmet) while (helmet.firstChild) document.head.appendChild(helmet.firstChild);

    var tpl = [];
    host.childNodes.forEach(function (c) { var d = compile(c, 'root'); if (d && !(d.k === 'text' && !d.v.trim())) tpl.push(d); });
    if (hoverCss.length) {
      var hs = document.createElement('style');
      hs.textContent = hoverCss.join('\n');
      document.head.appendChild(hs);
    }

    var defaults = {};
    try {
      var schema = JSON.parse(script.getAttribute('data-props') || '{}');
      Object.keys(schema).forEach(function (k) { if ('default' in schema[k]) defaults[k] = schema[k]['default']; });
    } catch (e) { /* no props */ }

    // component scripts use `class Component extends DCLogic`, so the base must be a real ES class
    var Base = class DCLogic extends R.Component {
      renderVals() { return {}; }
      render() { return R.createElement(R.Fragment, null, renderList(tpl, this.renderVals() || {}, R)); }
    };

    var Comp = new Function('DCLogic', 'React', script.textContent + '\n;return Component;')(Base, R);

    var root = document.createElement('div');
    root.id = 'dc-root';
    host.parentNode.insertBefore(root, host);
    host.remove();
    hide.remove();
    RD.createRoot(root).render(R.createElement(Comp, defaults));
  }
})();
