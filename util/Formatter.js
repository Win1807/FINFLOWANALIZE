/*
 * Copyright (C) 2009-2019 SAP SE or an SAP affiliate company. All rights reserved.
 */
jQuery.sap.declare("fin.cash.flow.analyzer.util.Formatter");
jQuery.sap.require("sap.ui.core.format.NumberFormat");
jQuery.sap.require("sap.ui.core.format.DateFormat");
fin.cash.flow.analyzer.util.Formatter = {
	getI18n: function () {
		var u = sap.ui.resource("fin.cash.flow.analyzer.i18n", "i18n.properties");
		var o = jQuery.sap.resources({
			url: u
		});
		return o;
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
	formatAmount: function (a, c, s, d) {
		var u = Math.pow(10, s);
		a = parseFloat(a) / u;
		var C = sap.ui.core.format.NumberFormat.getCurrencyInstance({
			"decimals": d,
			"currencyCode": true
		});
		return C.format(a);
	}
};