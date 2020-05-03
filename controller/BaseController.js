/*
 * Copyright (C) 2009-2019 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["sap/ui/core/mvc/Controller"], function (C) {
	"use strict";
	return C.extend("fin.cash.flow.analyzer.controller.BaseController", {
		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		getModel: function (n) {
			return this.getView().getModel(n);
		},
		setModel: function (m, n) {
			return this.getView().setModel(m, n);
		},
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},
		onShareEmailPress: function () {
			if (this.storeCurrentAppState) {
				this.storeCurrentAppState();
			}
			sap.m.URLHelper.triggerEmail(null, this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("appDescription"),
				document.URL);
		},
		onShareInJamPress: function () {
			var s = sap.ui.getCore().createComponent({
				name: "sap.collaboration.components.fiori.sharing.dialog",
				settings: {
					object: {
						id: new URI().toString(),
						share: this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("appDescription")
					}
				}
			});
			s.open();
		},
		guid: function () {
			return "xxx";
		},
		daysDiff: function (s, a) {
			var f = new Date(s);
			var t = new Date(a);
			return Math.round((f - t) / (1000 * 60 * 60 * 24));
		},
		showMessageBoxForODataError: function (e, d) {
			var r = e.request;
			var R = JSON.parse(e.response.body);
			var o = this.oApplicationFacade.getResourceBundle();
			var u = null,
				m = null,
				t = null,
				s = null,
				n = null,
				D = null;
			if (r) {
				u = r.requestUri;
			}
			if (R && R.error) {
				if (R.error.message) {
					m = R.error.message.value;
				}
				if (R.error.innererror) {
					t = R.error.innererror.timestamp;
					if (R.error.innererror.Error_Resolution) {
						s = R.error.innererror.Error_Resolution.SAP_Transaction;
						n = R.error.innererror.Error_Resolution.SAP_Note;
					}
				}
			}
			if (u && t && s && n) {
				var f = o.getText('ODATA_ERROR_MSG_DETAIL');
				D = $.sap.formatMessage(f, [u, t, s, n]);
			}
			if (m && D) {
				this.showErrorMessage(m, D);
			} else {
				this.showErrorMessage(d);
			}
		}
	});
});