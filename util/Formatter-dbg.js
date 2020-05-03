/*
 * Copyright (C) 2009-2019 SAP SE or an SAP affiliate company. All rights reserved.
 */
jQuery.sap.declare("fin.cash.flow.analyzer.util.Formatter");
jQuery.sap.require("sap.ui.core.format.NumberFormat");
jQuery.sap.require("sap.ui.core.format.DateFormat");
fin.cash.flow.analyzer.util.Formatter = {
	getI18n: function() {
		var sUrl = sap.ui.resource("fin.cash.flow.analyzer.i18n", "i18n.properties");
		var oi18n = jQuery.sap.resources({
			url: sUrl
		});
		return oi18n;
	},

	convertViewType: function(sViewType, sDirection) {

		var sStr = sViewType;

		if (sViewType === "2FLOWS") {
			if (sDirection === "+") {
				sStr = "sap-icon://arrow-left";
				this.setColor("green");
			} else if (sDirection === "-") {
				sStr = "sap-icon://arrow-right";
				this.setColor("red");
			}

		} else if (sViewType === "3END_BAL") {
			sStr = "sap-icon://monitor-payments";
			this.setColor("rgb(0, 124, 192)");
		} else if (sViewType === "1BEG_BAL") {
			this.setColor("rgb(0, 124, 192)");
			sStr = "sap-icon://money-bills";
		}

		return sStr;
	},
	formatAmount: function(amount, currency, scaling, decimals) {
			var unit = Math.pow(10, scaling);
			amount = parseFloat(amount) / unit;
			var oCurrencyFormat = sap.ui.core.format.NumberFormat.getCurrencyInstance({
				"decimals": decimals,
				"currencyCode": true
			});
			return oCurrencyFormat.format(amount);
		}
};