/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const D = globalThis, Z = D.ShadowRoot && (D.ShadyCSS === void 0 || D.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, F = Symbol(), Y = /* @__PURE__ */ new WeakMap();
let _t = class {
  constructor(t, e, s) {
    if (this._$cssResult$ = !0, s !== F) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (Z && t === void 0) {
      const s = e !== void 0 && e.length === 1;
      s && (t = Y.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), s && Y.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const vt = (r) => new _t(typeof r == "string" ? r : r + "", void 0, F), At = (r, ...t) => {
  const e = r.length === 1 ? r[0] : t.reduce((s, i, o) => s + ((n) => {
    if (n._$cssResult$ === !0) return n.cssText;
    if (typeof n == "number") return n;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + n + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + r[o + 1], r[0]);
  return new _t(e, r, F);
}, St = (r, t) => {
  if (Z) r.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const s = document.createElement("style"), i = D.litNonce;
    i !== void 0 && s.setAttribute("nonce", i), s.textContent = e.cssText, r.appendChild(s);
  }
}, tt = Z ? (r) => r : (r) => r instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const s of t.cssRules) e += s.cssText;
  return vt(e);
})(r) : r;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Et, defineProperty: wt, getOwnPropertyDescriptor: xt, getOwnPropertyNames: Pt, getOwnPropertySymbols: Ct, getPrototypeOf: Ot } = Object, g = globalThis, et = g.trustedTypes, Nt = et ? et.emptyScript : "", B = g.reactiveElementPolyfillSupport, N = (r, t) => r, z = { toAttribute(r, t) {
  switch (t) {
    case Boolean:
      r = r ? Nt : null;
      break;
    case Object:
    case Array:
      r = r == null ? r : JSON.stringify(r);
  }
  return r;
}, fromAttribute(r, t) {
  let e = r;
  switch (t) {
    case Boolean:
      e = r !== null;
      break;
    case Number:
      e = r === null ? null : Number(r);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(r);
      } catch {
        e = null;
      }
  }
  return e;
} }, K = (r, t) => !Et(r, t), st = { attribute: !0, type: String, converter: z, reflect: !1, useDefault: !1, hasChanged: K };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), g.litPropertyMetadata ?? (g.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let x = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = st) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const s = Symbol(), i = this.getPropertyDescriptor(t, s, e);
      i !== void 0 && wt(this.prototype, t, i);
    }
  }
  static getPropertyDescriptor(t, e, s) {
    const { get: i, set: o } = xt(this.prototype, t) ?? { get() {
      return this[e];
    }, set(n) {
      this[e] = n;
    } };
    return { get: i, set(n) {
      const h = i == null ? void 0 : i.call(this);
      o == null || o.call(this, n), this.requestUpdate(t, h, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? st;
  }
  static _$Ei() {
    if (this.hasOwnProperty(N("elementProperties"))) return;
    const t = Ot(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(N("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(N("properties"))) {
      const e = this.properties, s = [...Pt(e), ...Ct(e)];
      for (const i of s) this.createProperty(i, e[i]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [s, i] of e) this.elementProperties.set(s, i);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, s] of this.elementProperties) {
      const i = this._$Eu(e, s);
      i !== void 0 && this._$Eh.set(i, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const s = new Set(t.flat(1 / 0).reverse());
      for (const i of s) e.unshift(tt(i));
    } else t !== void 0 && e.push(tt(t));
    return e;
  }
  static _$Eu(t, e) {
    const s = e.attribute;
    return s === !1 ? void 0 : typeof s == "string" ? s : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    var t;
    this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (t = this.constructor.l) == null || t.forEach((e) => e(this));
  }
  addController(t) {
    var e;
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(t), this.renderRoot !== void 0 && this.isConnected && ((e = t.hostConnected) == null || e.call(t));
  }
  removeController(t) {
    var e;
    (e = this._$EO) == null || e.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), e = this.constructor.elementProperties;
    for (const s of e.keys()) this.hasOwnProperty(s) && (t.set(s, this[s]), delete this[s]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return St(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    var t;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (t = this._$EO) == null || t.forEach((e) => {
      var s;
      return (s = e.hostConnected) == null ? void 0 : s.call(e);
    });
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    var t;
    (t = this._$EO) == null || t.forEach((e) => {
      var s;
      return (s = e.hostDisconnected) == null ? void 0 : s.call(e);
    });
  }
  attributeChangedCallback(t, e, s) {
    this._$AK(t, s);
  }
  _$ET(t, e) {
    var o;
    const s = this.constructor.elementProperties.get(t), i = this.constructor._$Eu(t, s);
    if (i !== void 0 && s.reflect === !0) {
      const n = (((o = s.converter) == null ? void 0 : o.toAttribute) !== void 0 ? s.converter : z).toAttribute(e, s.type);
      this._$Em = t, n == null ? this.removeAttribute(i) : this.setAttribute(i, n), this._$Em = null;
    }
  }
  _$AK(t, e) {
    var o, n;
    const s = this.constructor, i = s._$Eh.get(t);
    if (i !== void 0 && this._$Em !== i) {
      const h = s.getPropertyOptions(i), a = typeof h.converter == "function" ? { fromAttribute: h.converter } : ((o = h.converter) == null ? void 0 : o.fromAttribute) !== void 0 ? h.converter : z;
      this._$Em = i;
      const c = a.fromAttribute(e, h.type);
      this[i] = c ?? ((n = this._$Ej) == null ? void 0 : n.get(i)) ?? c, this._$Em = null;
    }
  }
  requestUpdate(t, e, s, i = !1, o) {
    var n;
    if (t !== void 0) {
      const h = this.constructor;
      if (i === !1 && (o = this[t]), s ?? (s = h.getPropertyOptions(t)), !((s.hasChanged ?? K)(o, e) || s.useDefault && s.reflect && o === ((n = this._$Ej) == null ? void 0 : n.get(t)) && !this.hasAttribute(h._$Eu(t, s)))) return;
      this.C(t, e, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: s, reflect: i, wrapped: o }, n) {
    s && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t) && (this._$Ej.set(t, n ?? e ?? this[t]), o !== !0 || n !== void 0) || (this._$AL.has(t) || (this.hasUpdated || s || (e = void 0), this._$AL.set(t, e)), i === !0 && this._$Em !== t && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (e) {
      Promise.reject(e);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var s;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [o, n] of this._$Ep) this[o] = n;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [o, n] of i) {
        const { wrapped: h } = n, a = this[o];
        h !== !0 || this._$AL.has(o) || a === void 0 || this.C(o, void 0, n, a);
      }
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), (s = this._$EO) == null || s.forEach((i) => {
        var o;
        return (o = i.hostUpdate) == null ? void 0 : o.call(i);
      }), this.update(e)) : this._$EM();
    } catch (i) {
      throw t = !1, this._$EM(), i;
    }
    t && this._$AE(e);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    var e;
    (e = this._$EO) == null || e.forEach((s) => {
      var i;
      return (i = s.hostUpdated) == null ? void 0 : i.call(s);
    }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((e) => this._$ET(e, this[e]))), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
x.elementStyles = [], x.shadowRootOptions = { mode: "open" }, x[N("elementProperties")] = /* @__PURE__ */ new Map(), x[N("finalized")] = /* @__PURE__ */ new Map(), B == null || B({ ReactiveElement: x }), (g.reactiveElementVersions ?? (g.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const U = globalThis, it = (r) => r, L = U.trustedTypes, rt = L ? L.createPolicy("lit-html", { createHTML: (r) => r }) : void 0, $t = "$lit$", y = `lit$${Math.random().toFixed(9).slice(2)}$`, yt = "?" + y, Ut = `<${yt}>`, E = document, H = () => E.createComment(""), T = (r) => r === null || typeof r != "object" && typeof r != "function", Q = Array.isArray, Mt = (r) => Q(r) || typeof (r == null ? void 0 : r[Symbol.iterator]) == "function", q = `[ 	
\f\r]`, O = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, ot = /-->/g, nt = />/g, b = RegExp(`>|${q}(?:([^\\s"'>=/]+)(${q}*=${q}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), at = /'/g, ht = /"/g, gt = /^(?:script|style|textarea|title)$/i, Ht = (r) => (t, ...e) => ({ _$litType$: r, strings: t, values: e }), ct = Ht(1), P = Symbol.for("lit-noChange"), u = Symbol.for("lit-nothing"), lt = /* @__PURE__ */ new WeakMap(), v = E.createTreeWalker(E, 129);
function mt(r, t) {
  if (!Q(r) || !r.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return rt !== void 0 ? rt.createHTML(t) : t;
}
const Tt = (r, t) => {
  const e = r.length - 1, s = [];
  let i, o = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", n = O;
  for (let h = 0; h < e; h++) {
    const a = r[h];
    let c, p, l = -1, _ = 0;
    for (; _ < a.length && (n.lastIndex = _, p = n.exec(a), p !== null); ) _ = n.lastIndex, n === O ? p[1] === "!--" ? n = ot : p[1] !== void 0 ? n = nt : p[2] !== void 0 ? (gt.test(p[2]) && (i = RegExp("</" + p[2], "g")), n = b) : p[3] !== void 0 && (n = b) : n === b ? p[0] === ">" ? (n = i ?? O, l = -1) : p[1] === void 0 ? l = -2 : (l = n.lastIndex - p[2].length, c = p[1], n = p[3] === void 0 ? b : p[3] === '"' ? ht : at) : n === ht || n === at ? n = b : n === ot || n === nt ? n = O : (n = b, i = void 0);
    const $ = n === b && r[h + 1].startsWith("/>") ? " " : "";
    o += n === O ? a + Ut : l >= 0 ? (s.push(c), a.slice(0, l) + $t + a.slice(l) + y + $) : a + y + (l === -2 ? h : $);
  }
  return [mt(r, o + (r[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), s];
};
class k {
  constructor({ strings: t, _$litType$: e }, s) {
    let i;
    this.parts = [];
    let o = 0, n = 0;
    const h = t.length - 1, a = this.parts, [c, p] = Tt(t, e);
    if (this.el = k.createElement(c, s), v.currentNode = this.el.content, e === 2 || e === 3) {
      const l = this.el.content.firstChild;
      l.replaceWith(...l.childNodes);
    }
    for (; (i = v.nextNode()) !== null && a.length < h; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const l of i.getAttributeNames()) if (l.endsWith($t)) {
          const _ = p[n++], $ = i.getAttribute(l).split(y), j = /([.?@])?(.*)/.exec(_);
          a.push({ type: 1, index: o, name: j[2], strings: $, ctor: j[1] === "." ? Rt : j[1] === "?" ? jt : j[1] === "@" ? Dt : I }), i.removeAttribute(l);
        } else l.startsWith(y) && (a.push({ type: 6, index: o }), i.removeAttribute(l));
        if (gt.test(i.tagName)) {
          const l = i.textContent.split(y), _ = l.length - 1;
          if (_ > 0) {
            i.textContent = L ? L.emptyScript : "";
            for (let $ = 0; $ < _; $++) i.append(l[$], H()), v.nextNode(), a.push({ type: 2, index: ++o });
            i.append(l[_], H());
          }
        }
      } else if (i.nodeType === 8) if (i.data === yt) a.push({ type: 2, index: o });
      else {
        let l = -1;
        for (; (l = i.data.indexOf(y, l + 1)) !== -1; ) a.push({ type: 7, index: o }), l += y.length - 1;
      }
      o++;
    }
  }
  static createElement(t, e) {
    const s = E.createElement("template");
    return s.innerHTML = t, s;
  }
}
function C(r, t, e = r, s) {
  var n, h;
  if (t === P) return t;
  let i = s !== void 0 ? (n = e._$Co) == null ? void 0 : n[s] : e._$Cl;
  const o = T(t) ? void 0 : t._$litDirective$;
  return (i == null ? void 0 : i.constructor) !== o && ((h = i == null ? void 0 : i._$AO) == null || h.call(i, !1), o === void 0 ? i = void 0 : (i = new o(r), i._$AT(r, e, s)), s !== void 0 ? (e._$Co ?? (e._$Co = []))[s] = i : e._$Cl = i), i !== void 0 && (t = C(r, i._$AS(r, t.values), i, s)), t;
}
class kt {
  constructor(t, e) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = e;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: e }, parts: s } = this._$AD, i = ((t == null ? void 0 : t.creationScope) ?? E).importNode(e, !0);
    v.currentNode = i;
    let o = v.nextNode(), n = 0, h = 0, a = s[0];
    for (; a !== void 0; ) {
      if (n === a.index) {
        let c;
        a.type === 2 ? c = new R(o, o.nextSibling, this, t) : a.type === 1 ? c = new a.ctor(o, a.name, a.strings, this, t) : a.type === 6 && (c = new zt(o, this, t)), this._$AV.push(c), a = s[++h];
      }
      n !== (a == null ? void 0 : a.index) && (o = v.nextNode(), n++);
    }
    return v.currentNode = E, i;
  }
  p(t) {
    let e = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(t, s, e), e += s.strings.length - 2) : s._$AI(t[e])), e++;
  }
}
class R {
  get _$AU() {
    var t;
    return ((t = this._$AM) == null ? void 0 : t._$AU) ?? this._$Cv;
  }
  constructor(t, e, s, i) {
    this.type = 2, this._$AH = u, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = s, this.options = i, this._$Cv = (i == null ? void 0 : i.isConnected) ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const e = this._$AM;
    return e !== void 0 && (t == null ? void 0 : t.nodeType) === 11 && (t = e.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, e = this) {
    t = C(this, t, e), T(t) ? t === u || t == null || t === "" ? (this._$AH !== u && this._$AR(), this._$AH = u) : t !== this._$AH && t !== P && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Mt(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== u && T(this._$AH) ? this._$AA.nextSibling.data = t : this.T(E.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    var o;
    const { values: e, _$litType$: s } = t, i = typeof s == "number" ? this._$AC(t) : (s.el === void 0 && (s.el = k.createElement(mt(s.h, s.h[0]), this.options)), s);
    if (((o = this._$AH) == null ? void 0 : o._$AD) === i) this._$AH.p(e);
    else {
      const n = new kt(i, this), h = n.u(this.options);
      n.p(e), this.T(h), this._$AH = n;
    }
  }
  _$AC(t) {
    let e = lt.get(t.strings);
    return e === void 0 && lt.set(t.strings, e = new k(t)), e;
  }
  k(t) {
    Q(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let s, i = 0;
    for (const o of t) i === e.length ? e.push(s = new R(this.O(H()), this.O(H()), this, this.options)) : s = e[i], s._$AI(o), i++;
    i < e.length && (this._$AR(s && s._$AB.nextSibling, i), e.length = i);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    var s;
    for ((s = this._$AP) == null ? void 0 : s.call(this, !1, !0, e); t !== this._$AB; ) {
      const i = it(t).nextSibling;
      it(t).remove(), t = i;
    }
  }
  setConnected(t) {
    var e;
    this._$AM === void 0 && (this._$Cv = t, (e = this._$AP) == null || e.call(this, t));
  }
}
class I {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, s, i, o) {
    this.type = 1, this._$AH = u, this._$AN = void 0, this.element = t, this.name = e, this._$AM = i, this.options = o, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = u;
  }
  _$AI(t, e = this, s, i) {
    const o = this.strings;
    let n = !1;
    if (o === void 0) t = C(this, t, e, 0), n = !T(t) || t !== this._$AH && t !== P, n && (this._$AH = t);
    else {
      const h = t;
      let a, c;
      for (t = o[0], a = 0; a < o.length - 1; a++) c = C(this, h[s + a], e, a), c === P && (c = this._$AH[a]), n || (n = !T(c) || c !== this._$AH[a]), c === u ? t = u : t !== u && (t += (c ?? "") + o[a + 1]), this._$AH[a] = c;
    }
    n && !i && this.j(t);
  }
  j(t) {
    t === u ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class Rt extends I {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === u ? void 0 : t;
  }
}
class jt extends I {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== u);
  }
}
class Dt extends I {
  constructor(t, e, s, i, o) {
    super(t, e, s, i, o), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = C(this, t, e, 0) ?? u) === P) return;
    const s = this._$AH, i = t === u && s !== u || t.capture !== s.capture || t.once !== s.once || t.passive !== s.passive, o = t !== u && (s === u || i);
    i && this.element.removeEventListener(this.name, this, s), o && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    var e;
    typeof this._$AH == "function" ? this._$AH.call(((e = this.options) == null ? void 0 : e.host) ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class zt {
  constructor(t, e, s) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    C(this, t);
  }
}
const V = U.litHtmlPolyfillSupport;
V == null || V(k, R), (U.litHtmlVersions ?? (U.litHtmlVersions = [])).push("3.3.2");
const Lt = (r, t, e) => {
  const s = (e == null ? void 0 : e.renderBefore) ?? t;
  let i = s._$litPart$;
  if (i === void 0) {
    const o = (e == null ? void 0 : e.renderBefore) ?? null;
    s._$litPart$ = i = new R(t.insertBefore(H(), o), o, void 0, e ?? {});
  }
  return i._$AI(r), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const S = globalThis;
class M extends x {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var e;
    const t = super.createRenderRoot();
    return (e = this.renderOptions).renderBefore ?? (e.renderBefore = t.firstChild), t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Lt(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var t;
    super.connectedCallback(), (t = this._$Do) == null || t.setConnected(!0);
  }
  disconnectedCallback() {
    var t;
    super.disconnectedCallback(), (t = this._$Do) == null || t.setConnected(!1);
  }
  render() {
    return P;
  }
}
var ft;
M._$litElement$ = !0, M.finalized = !0, (ft = S.litElementHydrateSupport) == null || ft.call(S, { LitElement: M });
const J = S.litElementPolyfillSupport;
J == null || J({ LitElement: M });
(S.litElementVersions ?? (S.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Wt = { attribute: !0, type: String, converter: z, reflect: !1, hasChanged: K }, It = (r = Wt, t, e) => {
  const { kind: s, metadata: i } = e;
  let o = globalThis.litPropertyMetadata.get(i);
  if (o === void 0 && globalThis.litPropertyMetadata.set(i, o = /* @__PURE__ */ new Map()), s === "setter" && ((r = Object.create(r)).wrapped = !0), o.set(e.name, r), s === "accessor") {
    const { name: n } = e;
    return { set(h) {
      const a = t.get.call(this);
      t.set.call(this, h), this.requestUpdate(n, a, r, !0, h);
    }, init(h) {
      return h !== void 0 && this.C(n, void 0, r, h), h;
    } };
  }
  if (s === "setter") {
    const { name: n } = e;
    return function(h) {
      const a = this[n];
      t.call(this, h), this.requestUpdate(n, a, r, !0, h);
    };
  }
  throw Error("Unsupported decorator location: " + s);
};
function bt(r) {
  return (t, e) => typeof e == "object" ? It(r, t, e) : ((s, i, o) => {
    const n = i.hasOwnProperty(o);
    return i.constructor.createProperty(o, s), n ? Object.getOwnPropertyDescriptor(i, o) : void 0;
  })(r, t, e);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function w(r) {
  return bt({ ...r, state: !0, attribute: !1 });
}
var Bt = Object.defineProperty, m = (r, t, e, s) => {
  for (var i = void 0, o = r.length - 1, n; o >= 0; o--)
    (n = r[o]) && (i = n(t, e, i) || i);
  return i && Bt(t, e, i), i;
};
function W() {
  try {
    return globalThis.__HA_CALC_CARD_DEBUG__ === !0 ? !0 : typeof localStorage > "u" ? !1 : localStorage.getItem("ha_calc_card_debug") === "1";
  } catch {
    return !1;
  }
}
function d(...r) {
  W() && console.warn("[ha-calc-card]", ...r);
}
function A(r) {
  try {
    return JSON.stringify(r, (t, e) => typeof e == "bigint" ? String(e) : e, 2);
  } catch {
    return String(r);
  }
}
function G(r) {
  if (!r || typeof r != "object") return { message: String(r) };
  const t = r, e = {};
  for (const s of Object.keys(t))
    try {
      const i = t[s];
      typeof i == "object" && i !== null ? e[s] = JSON.parse(A(i)) : e[s] = i;
    } catch {
      e[s] = "[unreadable]";
    }
  return e;
}
function qt(r) {
  var s;
  if (!W()) return;
  const t = r;
  d("hass.callWS:", typeof t.callWS), d("hass.connection?.sendMessagePromise:", typeof ((s = t.connection) == null ? void 0 : s.sendMessagePromise));
  const e = t.callService;
  if (d("hass.callService:", typeof e), typeof e == "function")
    try {
      const i = Function.prototype.toString.call(e);
      d("hass.callService source (first 400 chars):", i.slice(0, 400));
    } catch {
      d("hass.callService: (toString failed)");
    }
}
async function pt(r, t, e, s) {
  var a;
  const i = {
    type: "call_service",
    domain: t,
    service: e,
    return_response: !0
  };
  s && Object.keys(s).length > 0 && (i.service_data = s), qt(r);
  const o = typeof r.callWS == "function" ? "callWS" : "sendMessagePromise";
  d(`outbound call_service (${t}.${e}) transport=`, o), d("outbound top-level keys:", Object.keys(i)), d("outbound JSON (exact object we pass to WS):", A(i)), i.target !== void 0 && d("WARNING: message.target is set (unexpected):", A(i.target));
  const n = ((a = r.callWS) == null ? void 0 : a.bind(r)) ?? ((c) => {
    var p;
    if (!((p = r.connection) != null && p.sendMessagePromise))
      throw new Error("Нет hass.callWS и connection.sendMessagePromise");
    return r.connection.sendMessagePromise(c);
  });
  let h;
  try {
    h = await n(i);
  } catch (c) {
    throw d("call_service rejected:", c), d("call_service error serialized:", A(G(c))), c;
  }
  return d("inbound success; raw top-level keys:", h && typeof h == "object" ? Object.keys(h) : h), d("inbound raw JSON:", A(h)), Vt(h);
}
function Vt(r) {
  if (!r || typeof r != "object") return r;
  const t = r;
  if ("response" in t && t.response && typeof t.response == "object")
    return t.response;
  if ("result" in t && t.result && typeof t.result == "object") {
    const e = t.result;
    return "response" in e && e.response && typeof e.response == "object" ? e.response : e;
  }
  return t;
}
function ut(r) {
  if (r && typeof r == "object") {
    const t = r;
    if (typeof t.message == "string") return t.message;
    const e = t.body;
    if (e && typeof e == "object" && typeof e.message == "string")
      return e.message;
    const s = t.error;
    if (s && typeof s == "object" && typeof s.message == "string")
      return s.message;
  }
  return String(r);
}
const X = class X extends M {
  constructor() {
    super(...arguments), this._ops = [], this._op = "add", this._a = "", this._b = "", this._busy = !1;
  }
  setConfig(t) {
  }
  getCardSize() {
    return 4;
  }
  willUpdate(t) {
    t.has("hass") && this.hass && this._ops.length === 0 && this._loadOperations();
  }
  async _loadOperations() {
    if (this.hass)
      try {
        const t = await pt(
          this.hass,
          "ha_calc",
          "get_operations"
        );
        this._ops = t.operations ?? [], this._ops.length && !this._ops.some((e) => e.id === this._op) && (this._op = this._ops[0].id);
      } catch (t) {
        W() && console.warn("[ha-calc-card] _loadOperations catch:", t, A(G(t))), this._error = ut(t);
      }
  }
  async _submit(t) {
    if (t.preventDefault(), !this.hass) return;
    this._busy = !0, this._error = void 0, this._result = void 0;
    const e = Number(this._a), s = Number(this._b);
    if (Number.isNaN(e) || Number.isNaN(s)) {
      this._busy = !1, this._error = "Некорректное число";
      return;
    }
    try {
      const i = await pt(this.hass, "ha_calc", "calculate", {
        a: e,
        b: s,
        operation: this._op
      });
      this._result = i.result;
    } catch (i) {
      W() && console.warn("[ha-calc-card] _submit catch:", i, A(G(i))), this._error = ut(i);
    } finally {
      this._busy = !1;
    }
  }
  render() {
    return ct`
      <ha-card>
        <div class="card-content">
          <form @submit=${this._submit}>
            <div class="row">
              <label>
                Операция
                <select
                  .value=${this._op}
                  @change=${(t) => {
      this._op = t.target.value;
    }}
                >
                  ${this._ops.map(
      (t) => ct`<option value=${t.id}>${t.label}</option>`
    )}
                </select>
              </label>
              <label>
                a
                <input
                  type="number"
                  step="any"
                  .value=${this._a}
                  @input=${(t) => {
      this._a = t.target.value;
    }}
                />
              </label>
              <label>
                b
                <input
                  type="number"
                  step="any"
                  .value=${this._b}
                  @input=${(t) => {
      this._b = t.target.value;
    }}
                />
              </label>
              <button type="submit" ?disabled=${this._busy || !this.hass}>Считать</button>
            </div>
          </form>
          <div class="out ${this._error ? "err" : "ok"}">
            ${this._error ?? (this._result !== void 0 ? String(this._result) : "")}
          </div>
        </div>
      </ha-card>
    `;
  }
};
X.styles = At`
    :host {
      display: block;
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: flex-end;
      margin-bottom: 12px;
    }
    label {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    input,
    select,
    button {
      font: inherit;
      color: var(--primary-text-color);
      background: var(--card-background-color, var(--ha-card-background));
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      padding: 8px 10px;
      min-width: 6rem;
    }
    button {
      cursor: pointer;
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
      border-color: transparent;
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .out {
      margin-top: 8px;
      min-height: 1.5em;
    }
    .err {
      color: var(--error-color, #db4437);
    }
    .ok {
      color: var(--primary-text-color);
    }
  `;
let f = X;
m([
  bt({ attribute: !1 })
], f.prototype, "hass");
m([
  w()
], f.prototype, "_ops");
m([
  w()
], f.prototype, "_op");
m([
  w()
], f.prototype, "_a");
m([
  w()
], f.prototype, "_b");
m([
  w()
], f.prototype, "_result");
m([
  w()
], f.prototype, "_error");
m([
  w()
], f.prototype, "_busy");
const dt = "ha-calc-card";
customElements.get(dt) || customElements.define(dt, f);
export {
  f as HaCalcCard
};
