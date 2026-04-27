/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const D = globalThis, K = D.ShadowRoot && (D.ShadyCSS === void 0 || D.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, J = Symbol(), Y = /* @__PURE__ */ new WeakMap();
let pt = class {
  constructor(t, e, s) {
    if (this._$cssResult$ = !0, s !== J) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (K && t === void 0) {
      const s = e !== void 0 && e.length === 1;
      s && (t = Y.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), s && Y.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const gt = (n) => new pt(typeof n == "string" ? n : n + "", void 0, J), yt = (n, ...t) => {
  const e = n.length === 1 ? n[0] : t.reduce((s, i, r) => s + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + n[r + 1], n[0]);
  return new pt(e, n, J);
}, vt = (n, t) => {
  if (K) n.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const s = document.createElement("style"), i = D.litNonce;
    i !== void 0 && s.setAttribute("nonce", i), s.textContent = e.cssText, n.appendChild(s);
  }
}, tt = K ? (n) => n : (n) => n instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const s of t.cssRules) e += s.cssText;
  return gt(e);
})(n) : n;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: At, defineProperty: xt, getOwnPropertyDescriptor: wt, getOwnPropertyNames: Et, getOwnPropertySymbols: St, getPrototypeOf: Nt } = Object, v = globalThis, et = v.trustedTypes, Rt = et ? et.emptyScript : "", W = v.reactiveElementPolyfillSupport, M = (n, t) => n, L = { toAttribute(n, t) {
  switch (t) {
    case Boolean:
      n = n ? Rt : null;
      break;
    case Object:
    case Array:
      n = n == null ? n : JSON.stringify(n);
  }
  return n;
}, fromAttribute(n, t) {
  let e = n;
  switch (t) {
    case Boolean:
      e = n !== null;
      break;
    case Number:
      e = n === null ? null : Number(n);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(n);
      } catch {
        e = null;
      }
  }
  return e;
} }, Z = (n, t) => !At(n, t), st = { attribute: !0, type: String, converter: L, reflect: !1, useDefault: !1, hasChanged: Z };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), v.litPropertyMetadata ?? (v.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let N = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = st) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const s = Symbol(), i = this.getPropertyDescriptor(t, s, e);
      i !== void 0 && xt(this.prototype, t, i);
    }
  }
  static getPropertyDescriptor(t, e, s) {
    const { get: i, set: r } = wt(this.prototype, t) ?? { get() {
      return this[e];
    }, set(a) {
      this[e] = a;
    } };
    return { get: i, set(a) {
      const l = i == null ? void 0 : i.call(this);
      r == null || r.call(this, a), this.requestUpdate(t, l, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? st;
  }
  static _$Ei() {
    if (this.hasOwnProperty(M("elementProperties"))) return;
    const t = Nt(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(M("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(M("properties"))) {
      const e = this.properties, s = [...Et(e), ...St(e)];
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
    return vt(t, this.constructor.elementStyles), t;
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
    var r;
    const s = this.constructor.elementProperties.get(t), i = this.constructor._$Eu(t, s);
    if (i !== void 0 && s.reflect === !0) {
      const a = (((r = s.converter) == null ? void 0 : r.toAttribute) !== void 0 ? s.converter : L).toAttribute(e, s.type);
      this._$Em = t, a == null ? this.removeAttribute(i) : this.setAttribute(i, a), this._$Em = null;
    }
  }
  _$AK(t, e) {
    var r, a;
    const s = this.constructor, i = s._$Eh.get(t);
    if (i !== void 0 && this._$Em !== i) {
      const l = s.getPropertyOptions(i), o = typeof l.converter == "function" ? { fromAttribute: l.converter } : ((r = l.converter) == null ? void 0 : r.fromAttribute) !== void 0 ? l.converter : L;
      this._$Em = i;
      const c = o.fromAttribute(e, l.type);
      this[i] = c ?? ((a = this._$Ej) == null ? void 0 : a.get(i)) ?? c, this._$Em = null;
    }
  }
  requestUpdate(t, e, s, i = !1, r) {
    var a;
    if (t !== void 0) {
      const l = this.constructor;
      if (i === !1 && (r = this[t]), s ?? (s = l.getPropertyOptions(t)), !((s.hasChanged ?? Z)(r, e) || s.useDefault && s.reflect && r === ((a = this._$Ej) == null ? void 0 : a.get(t)) && !this.hasAttribute(l._$Eu(t, s)))) return;
      this.C(t, e, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: s, reflect: i, wrapped: r }, a) {
    s && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t) && (this._$Ej.set(t, a ?? e ?? this[t]), r !== !0 || a !== void 0) || (this._$AL.has(t) || (this.hasUpdated || s || (e = void 0), this._$AL.set(t, e)), i === !0 && this._$Em !== t && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t));
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
        for (const [r, a] of this._$Ep) this[r] = a;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [r, a] of i) {
        const { wrapped: l } = a, o = this[r];
        l !== !0 || this._$AL.has(r) || o === void 0 || this.C(r, void 0, a, o);
      }
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), (s = this._$EO) == null || s.forEach((i) => {
        var r;
        return (r = i.hostUpdate) == null ? void 0 : r.call(i);
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
N.elementStyles = [], N.shadowRootOptions = { mode: "open" }, N[M("elementProperties")] = /* @__PURE__ */ new Map(), N[M("finalized")] = /* @__PURE__ */ new Map(), W == null || W({ ReactiveElement: N }), (v.reactiveElementVersions ?? (v.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const O = globalThis, it = (n) => n, q = O.trustedTypes, rt = q ? q.createPolicy("lit-html", { createHTML: (n) => n }) : void 0, _t = "$lit$", y = `lit$${Math.random().toFixed(9).slice(2)}$`, ft = "?" + y, Ct = `<${ft}>`, S = document, T = () => S.createComment(""), H = (n) => n === null || typeof n != "object" && typeof n != "function", Q = Array.isArray, Pt = (n) => Q(n) || typeof (n == null ? void 0 : n[Symbol.iterator]) == "function", F = `[ 	
\f\r]`, P = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, nt = /-->/g, at = />/g, A = RegExp(`>|${F}(?:([^\\s"'>=/]+)(${F}*=${F}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), ot = /'/g, lt = /"/g, mt = /^(?:script|style|textarea|title)$/i, kt = (n) => (t, ...e) => ({ _$litType$: n, strings: t, values: e }), p = kt(1), R = Symbol.for("lit-noChange"), u = Symbol.for("lit-nothing"), ct = /* @__PURE__ */ new WeakMap(), w = S.createTreeWalker(S, 129);
function $t(n, t) {
  if (!Q(n) || !n.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return rt !== void 0 ? rt.createHTML(t) : t;
}
const Mt = (n, t) => {
  const e = n.length - 1, s = [];
  let i, r = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", a = P;
  for (let l = 0; l < e; l++) {
    const o = n[l];
    let c, _, h = -1, b = 0;
    for (; b < o.length && (a.lastIndex = b, _ = a.exec(o), _ !== null); ) b = a.lastIndex, a === P ? _[1] === "!--" ? a = nt : _[1] !== void 0 ? a = at : _[2] !== void 0 ? (mt.test(_[2]) && (i = RegExp("</" + _[2], "g")), a = A) : _[3] !== void 0 && (a = A) : a === A ? _[0] === ">" ? (a = i ?? P, h = -1) : _[1] === void 0 ? h = -2 : (h = a.lastIndex - _[2].length, c = _[1], a = _[3] === void 0 ? A : _[3] === '"' ? lt : ot) : a === lt || a === ot ? a = A : a === nt || a === at ? a = P : (a = A, i = void 0);
    const g = a === A && n[l + 1].startsWith("/>") ? " " : "";
    r += a === P ? o + Ct : h >= 0 ? (s.push(c), o.slice(0, h) + _t + o.slice(h) + y + g) : o + y + (h === -2 ? l : g);
  }
  return [$t(n, r + (n[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), s];
};
class I {
  constructor({ strings: t, _$litType$: e }, s) {
    let i;
    this.parts = [];
    let r = 0, a = 0;
    const l = t.length - 1, o = this.parts, [c, _] = Mt(t, e);
    if (this.el = I.createElement(c, s), w.currentNode = this.el.content, e === 2 || e === 3) {
      const h = this.el.content.firstChild;
      h.replaceWith(...h.childNodes);
    }
    for (; (i = w.nextNode()) !== null && o.length < l; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const h of i.getAttributeNames()) if (h.endsWith(_t)) {
          const b = _[a++], g = i.getAttribute(h).split(y), z = /([.?@])?(.*)/.exec(b);
          o.push({ type: 1, index: r, name: z[2], strings: g, ctor: z[1] === "." ? Ut : z[1] === "?" ? Tt : z[1] === "@" ? Ht : B }), i.removeAttribute(h);
        } else h.startsWith(y) && (o.push({ type: 6, index: r }), i.removeAttribute(h));
        if (mt.test(i.tagName)) {
          const h = i.textContent.split(y), b = h.length - 1;
          if (b > 0) {
            i.textContent = q ? q.emptyScript : "";
            for (let g = 0; g < b; g++) i.append(h[g], T()), w.nextNode(), o.push({ type: 2, index: ++r });
            i.append(h[b], T());
          }
        }
      } else if (i.nodeType === 8) if (i.data === ft) o.push({ type: 2, index: r });
      else {
        let h = -1;
        for (; (h = i.data.indexOf(y, h + 1)) !== -1; ) o.push({ type: 7, index: r }), h += y.length - 1;
      }
      r++;
    }
  }
  static createElement(t, e) {
    const s = S.createElement("template");
    return s.innerHTML = t, s;
  }
}
function C(n, t, e = n, s) {
  var a, l;
  if (t === R) return t;
  let i = s !== void 0 ? (a = e._$Co) == null ? void 0 : a[s] : e._$Cl;
  const r = H(t) ? void 0 : t._$litDirective$;
  return (i == null ? void 0 : i.constructor) !== r && ((l = i == null ? void 0 : i._$AO) == null || l.call(i, !1), r === void 0 ? i = void 0 : (i = new r(n), i._$AT(n, e, s)), s !== void 0 ? (e._$Co ?? (e._$Co = []))[s] = i : e._$Cl = i), i !== void 0 && (t = C(n, i._$AS(n, t.values), i, s)), t;
}
class Ot {
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
    const { el: { content: e }, parts: s } = this._$AD, i = ((t == null ? void 0 : t.creationScope) ?? S).importNode(e, !0);
    w.currentNode = i;
    let r = w.nextNode(), a = 0, l = 0, o = s[0];
    for (; o !== void 0; ) {
      if (a === o.index) {
        let c;
        o.type === 2 ? c = new j(r, r.nextSibling, this, t) : o.type === 1 ? c = new o.ctor(r, o.name, o.strings, this, t) : o.type === 6 && (c = new It(r, this, t)), this._$AV.push(c), o = s[++l];
      }
      a !== (o == null ? void 0 : o.index) && (r = w.nextNode(), a++);
    }
    return w.currentNode = S, i;
  }
  p(t) {
    let e = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(t, s, e), e += s.strings.length - 2) : s._$AI(t[e])), e++;
  }
}
class j {
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
    t = C(this, t, e), H(t) ? t === u || t == null || t === "" ? (this._$AH !== u && this._$AR(), this._$AH = u) : t !== this._$AH && t !== R && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Pt(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== u && H(this._$AH) ? this._$AA.nextSibling.data = t : this.T(S.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    var r;
    const { values: e, _$litType$: s } = t, i = typeof s == "number" ? this._$AC(t) : (s.el === void 0 && (s.el = I.createElement($t(s.h, s.h[0]), this.options)), s);
    if (((r = this._$AH) == null ? void 0 : r._$AD) === i) this._$AH.p(e);
    else {
      const a = new Ot(i, this), l = a.u(this.options);
      a.p(e), this.T(l), this._$AH = a;
    }
  }
  _$AC(t) {
    let e = ct.get(t.strings);
    return e === void 0 && ct.set(t.strings, e = new I(t)), e;
  }
  k(t) {
    Q(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let s, i = 0;
    for (const r of t) i === e.length ? e.push(s = new j(this.O(T()), this.O(T()), this, this.options)) : s = e[i], s._$AI(r), i++;
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
class B {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, s, i, r) {
    this.type = 1, this._$AH = u, this._$AN = void 0, this.element = t, this.name = e, this._$AM = i, this.options = r, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = u;
  }
  _$AI(t, e = this, s, i) {
    const r = this.strings;
    let a = !1;
    if (r === void 0) t = C(this, t, e, 0), a = !H(t) || t !== this._$AH && t !== R, a && (this._$AH = t);
    else {
      const l = t;
      let o, c;
      for (t = r[0], o = 0; o < r.length - 1; o++) c = C(this, l[s + o], e, o), c === R && (c = this._$AH[o]), a || (a = !H(c) || c !== this._$AH[o]), c === u ? t = u : t !== u && (t += (c ?? "") + r[o + 1]), this._$AH[o] = c;
    }
    a && !i && this.j(t);
  }
  j(t) {
    t === u ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class Ut extends B {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === u ? void 0 : t;
  }
}
class Tt extends B {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== u);
  }
}
class Ht extends B {
  constructor(t, e, s, i, r) {
    super(t, e, s, i, r), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = C(this, t, e, 0) ?? u) === R) return;
    const s = this._$AH, i = t === u && s !== u || t.capture !== s.capture || t.once !== s.once || t.passive !== s.passive, r = t !== u && (s === u || i);
    i && this.element.removeEventListener(this.name, this, s), r && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    var e;
    typeof this._$AH == "function" ? this._$AH.call(((e = this.options) == null ? void 0 : e.host) ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class It {
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
const V = O.litHtmlPolyfillSupport;
V == null || V(I, j), (O.litHtmlVersions ?? (O.litHtmlVersions = [])).push("3.3.2");
const jt = (n, t, e) => {
  const s = (e == null ? void 0 : e.renderBefore) ?? t;
  let i = s._$litPart$;
  if (i === void 0) {
    const r = (e == null ? void 0 : e.renderBefore) ?? null;
    s._$litPart$ = i = new j(t.insertBefore(T(), r), r, void 0, e ?? {});
  }
  return i._$AI(n), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const E = globalThis;
class U extends N {
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
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = jt(e, this.renderRoot, this.renderOptions);
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
    return R;
  }
}
var ut;
U._$litElement$ = !0, U.finalized = !0, (ut = E.litElementHydrateSupport) == null || ut.call(E, { LitElement: U });
const G = E.litElementPolyfillSupport;
G == null || G({ LitElement: U });
(E.litElementVersions ?? (E.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const zt = { attribute: !0, type: String, converter: L, reflect: !1, hasChanged: Z }, Dt = (n = zt, t, e) => {
  const { kind: s, metadata: i } = e;
  let r = globalThis.litPropertyMetadata.get(i);
  if (r === void 0 && globalThis.litPropertyMetadata.set(i, r = /* @__PURE__ */ new Map()), s === "setter" && ((n = Object.create(n)).wrapped = !0), r.set(e.name, n), s === "accessor") {
    const { name: a } = e;
    return { set(l) {
      const o = t.get.call(this);
      t.set.call(this, l), this.requestUpdate(a, o, n, !0, l);
    }, init(l) {
      return l !== void 0 && this.C(a, void 0, n, l), l;
    } };
  }
  if (s === "setter") {
    const { name: a } = e;
    return function(l) {
      const o = this[a];
      t.call(this, l), this.requestUpdate(a, o, n, !0, l);
    };
  }
  throw Error("Unsupported decorator location: " + s);
};
function bt(n) {
  return (t, e) => typeof e == "object" ? Dt(n, t, e) : ((s, i, r) => {
    const a = i.hasOwnProperty(r);
    return i.constructor.createProperty(r, s), a ? Object.getOwnPropertyDescriptor(i, r) : void 0;
  })(n, t, e);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function m(n) {
  return bt({ ...n, state: !0, attribute: !1 });
}
var Lt = Object.defineProperty, f = (n, t, e, s) => {
  for (var i = void 0, r = n.length - 1, a; r >= 0; r--)
    (a = n[r]) && (i = a(t, e, i) || i);
  return i && Lt(t, e, i), i;
};
function qt() {
  try {
    return globalThis.__HA_3D_PRINT_CALC_CARD_DEBUG__ === !0 ? !0 : typeof localStorage > "u" ? !1 : localStorage.getItem("ha_3d_print_calc_card_debug") === "1";
  } catch {
    return !1;
  }
}
function ht(...n) {
  qt() && console.warn("[ha-3d-print-calc-card]", ...n);
}
function Bt(n) {
  try {
    return JSON.stringify(n, (t, e) => typeof e == "bigint" ? String(e) : e, 2);
  } catch {
    return String(n);
  }
}
async function x(n, t, e, s) {
  var l;
  const i = {
    type: "call_service",
    domain: t,
    service: e,
    return_response: !0
  };
  s && Object.keys(s).length > 0 && (i.service_data = s);
  const a = await (((l = n.callWS) == null ? void 0 : l.bind(n)) ?? ((o) => {
    var c;
    if (!((c = n.connection) != null && c.sendMessagePromise))
      throw new Error("Нет hass.callWS и connection.sendMessagePromise");
    return n.connection.sendMessagePromise(o);
  }))(i);
  return Wt(a);
}
function Wt(n) {
  if (!n || typeof n != "object") return n;
  const t = n;
  if ("response" in t && t.response && typeof t.response == "object")
    return t.response;
  if ("result" in t && t.result && typeof t.result == "object") {
    const e = t.result;
    return "response" in e && e.response && typeof e.response == "object" ? e.response : e;
  }
  return t;
}
function k(n) {
  if (n && typeof n == "object") {
    const t = n;
    if (typeof t.message == "string") return t.message;
    const e = t.body;
    if (e && typeof e == "object" && typeof e.message == "string")
      return e.message;
    const s = t.error;
    if (s && typeof s == "object" && typeof s.message == "string")
      return s.message;
  }
  return String(n);
}
function $(n) {
  return `${n.toFixed(2)} ₽`;
}
const X = class X extends U {
  constructor() {
    super(...arguments), this._tab = "calc", this._filaments = [], this._additionals = [], this._settings = { material_factor: 1.1, hourly_rate: 0 }, this._busy = !1, this._filamentId = "", this._priceKgManual = "", this._massG = "", this._printHours = "", this._modelsOnTable = "1", this._calcExtraRows = [{ id: "", qty: "0" }], this._settingsMaterial = "", this._settingsHourly = "";
  }
  setConfig(t) {
  }
  getCardSize() {
    return 6;
  }
  willUpdate(t) {
    t.has("hass") && this.hass && (t.get("hass") || this._loadAll());
  }
  async _loadAll() {
    if (this.hass) {
      this._error = void 0;
      try {
        const [t, e, s] = await Promise.all([
          x(this.hass, "ha_calc", "get_filaments"),
          x(this.hass, "ha_calc", "get_additionals"),
          x(this.hass, "ha_calc", "get_settings")
        ]);
        this._filaments = t.filaments ?? [], this._additionals = e.additionals ?? [];
        const i = s.settings ?? { material_factor: 1.1, hourly_rate: 0 };
        this._settings = i, this._settingsMaterial = String(i.material_factor), this._settingsHourly = String(i.hourly_rate);
      } catch (t) {
        ht("load error", t), this._error = k(t);
      }
    }
  }
  _newId() {
    return crypto.randomUUID();
  }
  async _saveSettings() {
    if (!this.hass) return;
    const t = Number(this._settingsMaterial), e = Number(this._settingsHourly);
    if (Number.isNaN(t) || Number.isNaN(e)) {
      this._error = "Некорректное число в настройках";
      return;
    }
    this._busy = !0, this._error = void 0;
    try {
      const s = await x(this.hass, "ha_calc", "set_settings", {
        material_factor: t,
        hourly_rate: e
      });
      s.settings && (this._settings = s.settings);
    } catch (s) {
      this._error = k(s);
    } finally {
      this._busy = !1;
    }
  }
  async _saveFilaments() {
    if (this.hass) {
      this._busy = !0, this._error = void 0;
      try {
        const t = this._filaments.map((s) => ({
          id: s.id,
          name: s.name,
          manufacturer: s.manufacturer ?? "",
          price: Number(s.price)
        }));
        for (const s of t)
          if (!s.id || Number.isNaN(s.price) || s.price < 0)
            throw new Error("Проверьте строки филаментов (id, цена ≥ 0)");
        const e = await x(this.hass, "ha_calc", "set_filaments", {
          filaments: t
        });
        this._filaments = e.filaments ?? t;
      } catch (t) {
        this._error = k(t);
      } finally {
        this._busy = !1;
      }
    }
  }
  async _saveAdditionals() {
    if (this.hass) {
      this._busy = !0, this._error = void 0;
      try {
        const t = this._additionals.map((s) => ({
          id: s.id,
          name: s.name,
          price: Number(s.price)
        }));
        for (const s of t)
          if (!s.id || Number.isNaN(s.price) || s.price < 0)
            throw new Error("Проверьте доп. материалы (id, цена ≥ 0)");
        const e = await x(
          this.hass,
          "ha_calc",
          "set_additionals",
          { additionals: t }
        );
        this._additionals = e.additionals ?? t;
      } catch (t) {
        this._error = k(t);
      } finally {
        this._busy = !1;
      }
    }
  }
  _addFilamentRow() {
    this._filaments = [
      ...this._filaments,
      { id: this._newId(), name: "", manufacturer: "", price: 0 }
    ];
  }
  _addAdditionalRow() {
    this._additionals = [...this._additionals, { id: this._newId(), name: "", price: 0 }];
  }
  async _runCalc() {
    if (!this.hass) return;
    this._busy = !0, this._error = void 0, this._calcResult = void 0;
    const t = Number(this._massG), e = Number(this._printHours), s = Number(this._modelsOnTable);
    if (Number.isNaN(t) || Number.isNaN(e) || Number.isNaN(s)) {
      this._error = "Некорректное число", this._busy = !1;
      return;
    }
    if (s < 1 || !Number.isInteger(s)) {
      this._error = "Моделей на столе — целое ≥ 1", this._busy = !1;
      return;
    }
    const i = {
      mass_g: t,
      print_hours: e,
      models_on_table: s,
      additional_lines: this._calcExtraRows.filter((r) => r.id && Number(r.qty) > 0).map((r) => ({ id: r.id, qty: Number(r.qty) }))
    };
    if (this._filamentId)
      i.filament_id = this._filamentId;
    else {
      const r = Number(this._priceKgManual);
      if (Number.isNaN(r)) {
        this._error = "Укажите филамент или цену ₽/кг", this._busy = !1;
        return;
      }
      i.price_kg = r;
    }
    try {
      const r = await x(this.hass, "ha_calc", "calculate", i);
      this._calcResult = r;
    } catch (r) {
      ht("calculate", r, Bt(r)), this._error = k(r);
    } finally {
      this._busy = !1;
    }
  }
  _renderTabs() {
    const t = (e, s) => p`
      <button
        type="button"
        class=${this._tab === e ? "active" : ""}
        @click=${() => {
      this._tab = e;
    }}
      >
        ${s}
      </button>
    `;
    return p`<div class="tabs">${t("calc", "Расчёт")} ${t("filaments", "Филаменты")} ${t("additionals", "Дополнительно")}
      ${t("settings", "Настройки")}</div>`;
  }
  _renderCalc() {
    return p`
      <div class="grid">
        <label>
          Филамент
          <select
            .value=${this._filamentId}
            @change=${(t) => {
      this._filamentId = t.target.value;
    }}
          >
            <option value="">— цена вручную —</option>
            ${this._filaments.map((t) => p`<option value=${t.id}>${t.name} (${t.price} ₽/кг)</option>`)}
          </select>
        </label>
        ${this._filamentId ? p`<span></span>` : p`<label>
              Цена, ₽/кг
              <input
                type="number"
                step="any"
                min="0"
                .value=${this._priceKgManual}
                @input=${(t) => {
      this._priceKgManual = t.target.value;
    }}
              />
            </label>`}
        <label>
          Масса стола, г
          <input
            type="number"
            step="any"
            min="0"
            .value=${this._massG}
            @input=${(t) => {
      this._massG = t.target.value;
    }}
          />
        </label>
        <label>
          Печать стола, ч
          <input
            type="number"
            step="any"
            min="0"
            .value=${this._printHours}
            @input=${(t) => {
      this._printHours = t.target.value;
    }}
          />
        </label>
        <label>
          Моделей на столе
          <input
            type="number"
            step="1"
            min="1"
            .value=${this._modelsOnTable}
            @input=${(t) => {
      this._modelsOnTable = t.target.value;
    }}
          />
        </label>
      </div>
      <div class="small">Доп. материалы на одну модель (из справочника):</div>
      <div class="row-list">
        ${this._calcExtraRows.map(
      (t, e) => p`
            <div class="line">
              <label>
                Позиция
                <select
                  .value=${t.id}
                  @change=${(s) => {
        const i = s.target.value, r = [...this._calcExtraRows];
        r[e] = { ...r[e], id: i }, this._calcExtraRows = r;
      }}
                >
                  <option value="">—</option>
                  ${this._additionals.map((s) => p`<option value=${s.id}>${s.name} (${s.price} ₽)</option>`)}
                </select>
              </label>
              <label>
                Кол-во
                <input
                  type="number"
                  step="any"
                  min="0"
                  .value=${t.qty}
                  @input=${(s) => {
        const i = s.target.value, r = [...this._calcExtraRows];
        r[e] = { ...r[e], qty: i }, this._calcExtraRows = r;
      }}
                />
              </label>
              <button
                type="button"
                class="ghost"
                @click=${() => {
        this._calcExtraRows = this._calcExtraRows.filter((s, i) => i !== e), this._calcExtraRows.length === 0 && (this._calcExtraRows = [{ id: "", qty: "0" }]);
      }}
              >
                ✕
              </button>
            </div>
          `
    )}
        <button
          type="button"
          class="ghost"
          @click=${() => {
      this._calcExtraRows = [...this._calcExtraRows, { id: "", qty: "0" }];
    }}
        >
          + строка
        </button>
      </div>
      <button type="button" class="action" ?disabled=${this._busy || !this.hass} @click=${() => void this._runCalc()}>
        Считать
      </button>
      ${this._calcResult ? p`
            <div class="result">
              <h4>Штука</h4>
              ${this._marginTable(this._calcResult.per_piece)}
              <h4>Весь стол</h4>
              ${this._marginTable(this._calcResult.table_total)}
              <p class="small">
                Стол: пластик ${$(this._calcResult.breakdown.plastic_table)} · допы
                ${$(this._calcResult.breakdown.additionals_table)} · машина
                ${$(this._calcResult.breakdown.machine_table)}
              </p>
              <p class="small">
                На шт.: пластик ${$(this._calcResult.breakdown.plastic_per_piece)} · допы
                ${$(this._calcResult.breakdown.additionals_per_piece)} · машина
                ${$(this._calcResult.breakdown.machine_per_piece)}
              </p>
            </div>
          ` : null}
    `;
  }
  _marginTable(t) {
    return p`
      <table>
        <tr>
          <td>Себестоимость</td>
          <td>${$(t.landed)}</td>
        </tr>
        <tr>
          <td>Цена при марже 60%</td>
          <td>${$(t.price_margin_60)}</td>
        </tr>
        <tr>
          <td>Цена при марже 75%</td>
          <td>${$(t.price_margin_75)}</td>
        </tr>
        <tr>
          <td>Цена при марже 80%</td>
          <td>${$(t.price_margin_80)}</td>
        </tr>
      </table>
    `;
  }
  _renderFilaments() {
    return p`
      <p class="small">Полная замена списка при сохранении.</p>
      ${this._filaments.map(
      (t, e) => p`
          <div class="filament-row">
            <label>
              Название
              <input
                .value=${t.name}
                @input=${(s) => {
        const i = s.target.value, r = [...this._filaments];
        r[e] = { ...r[e], name: i }, this._filaments = r;
      }}
              />
            </label>
            <label>
              Производитель
              <input
                .value=${t.manufacturer ?? ""}
                @input=${(s) => {
        const i = s.target.value, r = [...this._filaments];
        r[e] = { ...r[e], manufacturer: i }, this._filaments = r;
      }}
              />
            </label>
            <label>
              ₽/кг
              <input
                type="number"
                step="any"
                min="0"
                .value=${String(t.price)}
                @input=${(s) => {
        const i = Number(s.target.value), r = [...this._filaments];
        r[e] = { ...r[e], price: i }, this._filaments = r;
      }}
              />
            </label>
            <button
              type="button"
              class="ghost"
              @click=${() => {
        this._filaments = this._filaments.filter((s, i) => i !== e);
      }}
            >
              ✕
            </button>
          </div>
        `
    )}
      <button type="button" class="ghost" @click=${() => this._addFilamentRow()}>+ филамент</button>
      <div style="margin-top:12px">
        <button type="button" class="action" ?disabled=${this._busy || !this.hass} @click=${() => void this._saveFilaments()}>
          Сохранить филаменты
        </button>
      </div>
    `;
  }
  _renderAdditionals() {
    return p`
      <p class="small">Доп. позиции (цена за единицу). Полная замена при сохранении.</p>
      ${this._additionals.map(
      (t, e) => p`
          <div class="additional-row">
            <label>
              Название
              <input
                .value=${t.name}
                @input=${(s) => {
        const i = s.target.value, r = [...this._additionals];
        r[e] = { ...r[e], name: i }, this._additionals = r;
      }}
              />
            </label>
            <label>
              ₽/ед.
              <input
                type="number"
                step="any"
                min="0"
                .value=${String(t.price)}
                @input=${(s) => {
        const i = Number(s.target.value), r = [...this._additionals];
        r[e] = { ...r[e], price: i }, this._additionals = r;
      }}
              />
            </label>
            <span class="small">id: ${t.id.slice(0, 8)}…</span>
            <button
              type="button"
              class="ghost"
              @click=${() => {
        this._additionals = this._additionals.filter((s, i) => i !== e);
      }}
            >
              ✕
            </button>
          </div>
        `
    )}
      <button type="button" class="ghost" @click=${() => this._addAdditionalRow()}>+ позиция</button>
      <div style="margin-top:12px">
        <button
          type="button"
          class="action"
          ?disabled=${this._busy || !this.hass}
          @click=${() => void this._saveAdditionals()}
        >
          Сохранить доп. материалы
        </button>
      </div>
    `;
  }
  _renderSettings() {
    return p`
      <div class="grid">
        <label>
          Коэффициент материала
          <input
            type="number"
            step="any"
            min="0.01"
            .value=${this._settingsMaterial}
            @input=${(t) => {
      this._settingsMaterial = t.target.value;
    }}
          />
        </label>
        <label>
          Ставка машины, ₽/ч
          <input
            type="number"
            step="any"
            min="0"
            .value=${this._settingsHourly}
            @input=${(t) => {
      this._settingsHourly = t.target.value;
    }}
          />
        </label>
      </div>
      <button type="button" class="action" ?disabled=${this._busy || !this.hass} @click=${() => void this._saveSettings()}>
        Сохранить настройки
      </button>
    `;
  }
  render() {
    return p`
      <ha-card>
        <div class="card-content">
          ${this._renderTabs()}
          ${this._error ? p`<div class="err">${this._error}</div>` : null}
          ${this._tab === "calc" ? this._renderCalc() : null}
          ${this._tab === "filaments" ? this._renderFilaments() : null}
          ${this._tab === "additionals" ? this._renderAdditionals() : null}
          ${this._tab === "settings" ? this._renderSettings() : null}
        </div>
      </ha-card>
    `;
  }
};
X.styles = yt`
    :host {
      display: block;
    }
    .tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;
      border-bottom: 1px solid var(--divider-color);
      padding-bottom: 8px;
    }
    .tabs button {
      font: inherit;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 4px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color, var(--ha-card-background));
      color: var(--primary-text-color);
    }
    .tabs button.active {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
      border-color: transparent;
    }
    .grid {
      display: grid;
      gap: 10px;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      align-items: end;
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
    button.action {
      font: inherit;
      color: var(--primary-text-color);
      background: var(--card-background-color, var(--ha-card-background));
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      padding: 8px 10px;
    }
    button.action {
      cursor: pointer;
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
      border-color: transparent;
    }
    button.action:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    button.ghost {
      font: inherit;
      cursor: pointer;
      padding: 6px 10px;
      border-radius: 4px;
      border: 1px dashed var(--divider-color);
      background: transparent;
      color: var(--primary-text-color);
    }
    .err {
      color: var(--error-color, #db4437);
      margin: 8px 0;
    }
    .result {
      margin-top: 12px;
      padding: 12px;
      border-radius: 8px;
      background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.04);
    }
    .result h4 {
      margin: 0 0 8px 0;
      font-size: 14px;
    }
    .result table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    .result td {
      padding: 4px 8px 4px 0;
    }
    .row-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 12px;
    }
    .row-list .line {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: flex-end;
    }
    .filament-row,
    .additional-row {
      display: grid;
      grid-template-columns: 1fr 1fr 100px 36px;
      gap: 8px;
      align-items: end;
      margin-bottom: 8px;
    }
    @media (max-width: 600px) {
      .filament-row,
      .additional-row {
        grid-template-columns: 1fr;
      }
    }
    .small {
      font-size: 11px;
      color: var(--secondary-text-color);
    }
  `;
let d = X;
f([
  bt({ attribute: !1 })
], d.prototype, "hass");
f([
  m()
], d.prototype, "_tab");
f([
  m()
], d.prototype, "_filaments");
f([
  m()
], d.prototype, "_additionals");
f([
  m()
], d.prototype, "_settings");
f([
  m()
], d.prototype, "_busy");
f([
  m()
], d.prototype, "_error");
f([
  m()
], d.prototype, "_calcResult");
f([
  m()
], d.prototype, "_filamentId");
f([
  m()
], d.prototype, "_priceKgManual");
f([
  m()
], d.prototype, "_massG");
f([
  m()
], d.prototype, "_printHours");
f([
  m()
], d.prototype, "_modelsOnTable");
f([
  m()
], d.prototype, "_calcExtraRows");
f([
  m()
], d.prototype, "_settingsMaterial");
f([
  m()
], d.prototype, "_settingsHourly");
const dt = "ha-3d-print-calc-card";
customElements.get(dt) || customElements.define(dt, d);
export {
  d as Ha3dPrintCalcCard
};
