/*
 * Copyright (C) 2009-2019 SAP SE or an SAP affiliate company. All rights reserved.
 */
jQuery.sap.declare("fin.cash.flow.analyzer.util.StringUtil");
(function () {
	var w = function (v) {
		return {
			value: v,
			enumerable: false,
			writable: true,
			configurable: true
		};
	};
	if (!String.prototype.hasOwnProperty('endsWith')) {
		Object.defineProperty(String.prototype, 'endsWith', w(function (s) {
			return this.indexOf(s, this.length - s.length) !== -1;
		}));
	}
	var f = String.fromCharCode;
	var a = function (c) {
		var s, b;
		if (c.length < 2) {
			b = c.charCodeAt(0);
			s = b < 0x80 ? c : b < 0x800 ? (f(0xc0 | (b >>> 6)) + f(0x80 | (b & 0x3f))) : (f(0xd0 | ((b >>> 12) & 0x0f)) + f(0x80 | ((b >>> 6) &
				0x3f)) + f(0x80 | (b & 0x3f)));
		} else {
			b = (c.charCodeAt(0) - 0xD800) * 0x400 + (c.charCodeAt(1) - 0xDC00);
			s = (f(0xe0 | ((b >>> 18) & 0x03)) + f(0x80 | ((b >>> 12) & 0x3f)) + f(0x80 | ((b >>> 6) & 0x3f)) + f(0x80 | (b & 0x3f)));
		}
		return s;
	};
	var r = new RegExp(['[\uD800-\uDBFF][\uDC00-\uDFFF]', '[^\x00-\x7F]'].join('|'), 'g');
	var d = function (u) {
		return u.replace(r, a);
	};
	var e = function (c) {
		var s, b;
		switch (c.length) {
		case 4:
			b = ((0x03 & c.charCodeAt(0)) << 18) | ((0x3f & c.charCodeAt(1)) << 12) | ((0x3f & c.charCodeAt(2)) << 6) | (0x3f & c.charCodeAt(3));
			s = (f((b >>> 10) + 0xD800) + f((b & 0x3FF) + 0xDC00));
			break;
		case 3:
			b = ((0x0f & c.charCodeAt(0)) << 12) | ((0x3f & c.charCodeAt(1)) << 6) | (0x3f & c.charCodeAt(2));
			s = f(b);
			break;
		default:
			b = ((0x1f & c.charCodeAt(0)) << 6) | (0x3f & c.charCodeAt(1));
			s = f(b);
			break;
		}
		return s;
	};
	var g = new RegExp(['[\xE0-\xE3][\x80-\xBF]{3}', '[\xD0-\xDF][\x80-\xBF]{2}', '[\xC0-\xDF][\x80-\xBF]'].join('|'), 'g');
	var h = function (b) {
		return b.replace(g, e);
	};
	if (!String.prototype.hasOwnProperty('toBase64')) {
		Object.defineProperty(String.prototype, 'toBase64', w(function () {
			return btoa(d(this));
		}));
	}
	if (!String.prototype.hasOwnProperty('toBase64URI')) {
		Object.defineProperty(String.prototype, 'toBase64URI', w(function () {
			return this.toBase64().replace(/[+\/=]/g, function (m) {
				return m === '+' ? '-' : m === '/' ? '_' : '.';
			});
		}));
	}
	if (!String.hasOwnProperty('fromBase64')) {
		Object.defineProperty(String, 'fromBase64', w(function (s) {
			return h(atob(s));
		}));
	}
	if (!String.hasOwnProperty('fromBase64URI')) {
		Object.defineProperty(String, 'fromBase64URI', w(function (s) {
			return String.fromBase64(s.replace(/[-_\.]/g, function (m) {
				return m === '-' ? '+' : m === '_' ? '/' : '=';
			}));
		}));
	}
})();