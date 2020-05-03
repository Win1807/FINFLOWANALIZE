/*
 * Copyright (C) 2009-2019 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["sap/ui/core/format/DateFormat", "sap/ui/core/format/NumberFormat"], function () {
	"use strict";
	return {
		convertDateTimeToABAPDateTime: function () {
			var t = this;
			var y = t.getFullYear();
			var m = t.getMonth() + 1;
			var d = t.getDate();
			var h = t.getHours();
			var a = t.getMinutes();
			var s = t.getSeconds();
			var b = t.getMilliseconds();
			var c = function (v) {
				return v > 9 ? ('' + v) : ('0' + v);
			};
			var e = function (v) {
				var r = '';
				if (v < 10) {
					r = '00' + v;
				} else if (v < 100) {
					r = '0' + v;
				} else {
					r = r + v;
				}
				return r;
			};
			return y + '-' + c(m) + '-' + c(d) + 'T' + c(h) + ':' + c(a) + ':' + c(s) + '.' + e(b) + 'Z';
		},
		getI18N: function () {
			var u = sap.ui.resource("fin.cash.flow.analyzer.i18n", "i18n.properties");
			var o = jQuery.sap.resources({
				url: u
			});
			return o;
		},
		getLocaleResourceModel: function () {
			return this.conversions.getI18N();
		},
		drillownVisible: function (c) {
			if (!c || c === "") {
				return false;
			}
			if (c === "*") {
				return false;
			}
			return true;
		},
		isNull: function (v) {
			if (v === undefined || v === "" || v === null) {
				return true;
			}
			return false;
		},
		formatUTCDateString: function (r) {
			var a = "";
			a = a + r.getUTCFullYear();
			var m = r.getUTCMonth();
			a = a + (m + 1 < 10 ? "0" + (m + 1) : (m + 1));
			var d = r.getUTCDate();
			a = a + (d < 10 ? "0" + d : d);
			var h = r.getUTCHours();
			a = a + (h < 10 ? "0" + h : h);
			var b = r.getUTCMinutes();
			a = a + (b < 10 ? "0" + b : b);
			var s = r.getUTCSeconds();
			a = a + (s < 10 ? "0" + s : s);
			return a;
		},
		switchUTCtoLocal: function (r) {
			var d = r.getUTCDate();
			var m = r.getUTCMonth();
			var y = r.getUTCFullYear();
			var n = new Date(y, m, d);
			return n;
		},
		switchLocaltoUTC: function (r) {
			var y = r.getFullYear();
			var m = r.getMonth();
			var d = r.getDate();
			var h = r.getHours();
			var a = r.getMinutes();
			var s = r.getSeconds();
			var n = new Date(Date.UTC(y, m, d, h, a, s));
			return n;
		},
		getValueDateDefault: function () {
			var t = new Date();
			return t.toJSON();
		},
		getHistoryDateTimeDefault: function () {
			var t = new Date();
			t.setHours(23);
			t.setMinutes(59);
			t.setSeconds(59);
			return t;
		},
		dateFormat: function (d) {
			if (d) {
				var l = sap.ui.getCore().getConfiguration().getLocale();
				var f = sap.ui.getCore().getConfiguration().getFormatSettings();
				var p = f.getDatePattern("short");
				var a = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern: p
				}, l);
				if (!(d instanceof Date)) {
					return "";
				}
				return a.format(d);
			}
			return "";
		},
		convertDateToABAPDate: function (d) {
			if (d instanceof Date) {
				return (d.getFullYear().toString()) + (d.getMonth().toString().length === 1 ? "0" + (d.getMonth() + 1).toString() : (d.getMonth() +
					1).toString()) + (d.getDate().toString().length === 1 ? "0" + d.getDate().toString() : d.getDate().toString());
			} else {
				return d;
			}
		},
		convertABAPDateToDate: function (d) {
			if (d) {
				return new Date(d.substr(0, 4), parseInt(d.substr(4, 2), 10) - 1, d.substr(6, 2));
			} else {
				return null;
			}
		},
		formatAmountWithBankAccountCurrency: function (a, c, s, v) {
			var b = "standard";
			if (s === "0") {
				b = "standard";
			} else if (s === "1") {
				b = "short";
			} else if (s === "2") {
				b = "long";
			}
			if (a === 0 || a === null || c === "") {
				if (!c) {
					return "";
				} else {
					if (v === "2FLOWS") {
						return "-";
					}
					var f = {};
					f.currencyCode = true;
					f.emptyString = 0;
					f.style = b;
					f.showMeasure = false;
					f.groupingEnabled = true;
					f.currencyContext = "standard";
					var d = sap.ui.core.format.NumberFormat.getCurrencyInstance(f);
					return ("0" + d.format(1, c).substr(1, 5) + " " + c);
				}
			} else {
				if (a && c) {
					f = {};
					f.currencyCode = true;
					f.emptyString = 0;
					f.style = b;
					f.showMeasure = false;
					f.groupingEnabled = true;
					f.currencyContext = "standard";
					d = sap.ui.core.format.NumberFormat.getCurrencyInstance(f);
					return (d.format(a, c) + " " + c);
				}
			}
		},
		formatAmountWithBankAccountCurrencyS: function (a, c, s, v) {
			var b = "standard";
			if (s === "0") {
				b = "standard";
			} else if (s === "1") {
				b = "short";
			} else if (s === "2") {
				b = "long";
			}
			if (a === 0 || a === null || c === "") {
				if (!c) {
					return "";
				} else {
					if (v === "2FLOWS") {
						return "-";
					}
					var f = {};
					f.currencyCode = true;
					f.emptyString = 0;
					f.style = b;
					f.showMeasure = false;
					f.groupingEnabled = true;
					f.currencyContext = "standard";
					var d = sap.ui.core.format.NumberFormat.getCurrencyInstance(f);
					return ("0" + d.format(1, c).substr(1, 5) + " " + c);
				}
			} else {
				if (a && c) {
					f = {};
					f.currencyCode = true;
					f.emptyString = 0;
					f.style = b;
					f.showMeasure = false;
					f.groupingEnabled = true;
					f.currencyContext = "standard";
					d = sap.ui.core.format.NumberFormat.getCurrencyInstance(f);
					return (d.format(a, c) + " " + c);
				}
			}
		},
		getHierarchyIcon: function (i, h) {
			if (i === "X") {
				if (h === "GLH") {
					return "sap-icon://account";
				}
				return "sap-icon://loan";
			} else {
				return "";
			}
		},
		convertViewType: function (v, d) {
			var s = v;
			if (v === "2FLOWS") {
				if (d === "+") {
					s = "sap-icon://arrow-left";
					this.setColor("green");
				} else if (d === "-") {
					s = "sap-icon://arrow-right";
					this.setColor("red");
				}
			} else if (v === "3END_BAL") {
				s = "sap-icon://monitor-payments";
				this.setColor("rgb(0, 124, 192)");
			} else if (v === "1BEG_BAL") {
				this.setColor("rgb(0, 124, 192)");
				s = "sap-icon://money-bills";
			}
			return s;
		},
		convertViewTypeTooltip: function (v, d) {
			var s = v;
			var o = this.conversions.getI18N();
			if (v === "2FLOWS") {
				if (d === "+") {
					s = o.getText("INFLOW");
				} else {
					s = o.getText("OUTFLOW");
				}
			} else if (v === "3END_BAL") {
				s = o.getText("ENDINGBAL");
			} else if (v === "1BEG_BAL") {
				s = o.getText("BEGINNINGBAL");
			}
			return s;
		},
		formatValueWithNotAssign: function (v) {
			var o = this.conversions.getI18N();
			if (v === "") {
				v = o.getText("NotAssign");
			}
			return v;
		},
		getWeekNum: function (D) {
			var y = D.getFullYear();
			var m = D.getMonth() + 1;
			var s = D.getDate();
			var a = new Date(y, parseInt(m, 10) - 1, s),
				b = new Date(y, 0, 1),
				d = Math.round((a.valueOf() - b.valueOf()) / 86400000);
			return Math.ceil((d + ((b.getDay() + 1) - 1)) / 7);
		},
		getMonth: function (m) {
			switch (m) {
			case 1:
				return "January";
			case 2:
				return "February";
			case 3:
				return "March";
			case 4:
				return "April";
			case 5:
				return "May";
			case 6:
				return "June";
			case 7:
				return "July";
			case 8:
				return "August";
			case 9:
				return "September";
			case 10:
				return "October";
			case 11:
				return "November";
			case 12:
				return "December";
			}
			return null;
		},
		getQuarter: function (m) {
			switch (m) {
			case 1:
				return "Quarter1";
			case 2:
				return "Quarter1";
			case 3:
				return "Quarter1";
			case 4:
				return "Quarter2";
			case 5:
				return "Quarter2";
			case 6:
				return "Quarter2";
			case 7:
				return "Quarter3";
			case 8:
				return "Quarter3";
			case 9:
				return "Quarter3";
			case 10:
				return "Quarter4";
			case 11:
				return "Quarter4";
			case 12:
				return "Quarter4";
			}
			return null;
		},
		convertUTCDateToBrowerDate: function (a) {
			var y = a.getUTCFullYear();
			var m = a.getUTCMonth();
			var d = a.getUTCDate();
			a = new Date(y, m, d);
			return a;
		},
		convertHierarchyColumnHeader: function (c) {
			var C = {};
			C.sTooltip = "";
			C.label = "";
			C.sTooltipDsply = "";
			C.labelDsply = "";
			if (c) {
				var s = c.split(";");
				if (s.length === 4) {
					var d = s[0];
					var a = s[2];
					var b = s[3];
					d = d.substr(1, 4) + "-" + d.substr(5, 2) + "-" + d.substr(7, 2);
					a = a.substr(1, 4) + "-" + a.substr(5, 2) + "-" + a.substr(7, 2);
					b = b.substr(1, 4) + "-" + b.substr(5, 2) + "-" + b.substr(7, 2);
					var e = new Date(d);
					e = this.convertUTCDateToBrowerDate(e);
					var f = new Date(a);
					f = this.convertUTCDateToBrowerDate(f);
					var g = new Date(b);
					g = this.convertUTCDateToBrowerDate(g);
					switch (s[0].substr(0, 1)) {
					case "D":
						C.label = this.dateFormat(e);
						C.sTooltip = this.dateFormat(f) + "~" + this.dateFormat(g);
						break;
					case "W":
						C.label = this.getI18N().getText("Week") + this.getWeekNum(e).toString() + ", " + e.getFullYear().toString();
						C.sTooltip = this.dateFormat(f) + "~" + this.dateFormat(g);
						break;
					case "Y":
						C.label = e.getFullYear().toString();
						C.sTooltip = this.dateFormat(f) + "~" + this.dateFormat(g);
						break;
					case "Q":
						C.label = this.getQuarter(e.getMonth() + 1).toString() + ", " + e.getFullYear().toString();
						C.sTooltip = this.dateFormat(f) + "~" + this.dateFormat(g);
						break;
					case "M":
						C.label = this.getMonth(e.getMonth() + 1).toString() + ", " + e.getFullYear().toString();
						C.sTooltip = this.dateFormat(f) + "~" + this.dateFormat(g);
						break;
					default:
					}
				}
				C.sTooltipDsply = C.sTooltip + this.getI18N().getText("DisplayCurrency");
				C.labelDsply = C.label;
			}
			return C;
		},
		getForecastCertaintyLevelList: function () {
			return ["SI_CIT", "TRM_D", "REC_N", "PAY_N", "TRM_O", "CMIDOC", "FICA", "SDSO", "MEMO", "MMPO", "MMPR", "MMSA", "SDSA", "PAYRQ",
				"PYORD", "FIP2P", "LEASE", "PARKED"
			];
		},
		getValidForecastCretaintyLevelList: function (s) {
			var r = [];
			var c = this.getForecastCertaintyLevelList();
			for (var i = 0; i < s.length; i++) {
				if (c.includes(s[i])) {
					r.push(new sap.ui.model.Filter("CertaintyLevel", 'EQ', s[i]));
				}
			}
			return r;
		},
		hasValidForecastCertaintyLevelSelected: function (s) {
			var c = this.getForecastCertaintyLevelList();
			for (var i = 0; i < s.length; i++) {
				if (c.includes(s[i])) {
					return true;
				}
			}
			return false;
		},
		hasActualCertaintyLevelSeleced: function (s) {
			return s.includes("ACTUAL");
		},
		hasIntraCertaintyLevelSelected: function (s) {
			return s.includes("INTRAM");
		}
	};
});