/*
 * Copyright (C) 2009-2019 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["sap/ui/base/Object", "sap/m/MessageBox"], function (U, M) {
	"use strict";
	return U.extend("fin.cash.flow.analyzer.controller.ErrorHandler", {
		initODateErrorHandler: function (c) {
			this._oComponent = c.getComponent();
			this._oDataModel = c.getView().getModel();
			this._oResourceBundle = c.getView().getModel("i18n").getResourceBundle();
			this._bMessageOpen = false;
			this._oController = c;
			this._oDataModel.attachEvent("metadataFailed", function (e) {
				var p = e.getParameters();
				var m = p.statusCode + " (" + p.statusText + ")\r\n" + p.message + "\r\n" + p.responseText + "\r\n";
				this.showMessage(m, "metadataFailed");
			}, this);
			this._oDataModel.attachEvent("requestFailed", function (e) {
				var p = e.getParameters();
				var m, r;
				if (jQuery.isEmptyObject(p.response)) {
					return;
				} else {
					if (p.response.statusCode !== 404 || (p.response.statusCode === 404 && p.response.responseText.indexOf("Cannot POST") === 0)) {
						r = jQuery.parseJSON(e.getParameter("responseText"));
						if (r && r.error && r.error.innererror && r.error.innererror.errordetails && r.error.innererror.errordetails[0] && r.error.innererror
							.errordetails[0].message) {
							m = p.response.statusCode + " (" + p.response.statusText + ")\r\n" + r.error.innererror.errordetails[0].message;
						} else {
							m = p.response.statusCode + " (" + p.response.statusText + ")\r\n" + p.response.message + "\r\n" + p.response.responseText +
								"\r\n";
						}
						this.showMessage(m, "requestFailed");
					}
				}
			}, this);
			this._oDataModel.attachEvent("requestCompleted", function (e) {
				var p = e.getParameters();
				var m, r;
				if ('abort' === p.errorobject.statusText || p.errorobject.responseText === '') {
					return;
				}
				if (p.success === true) {
					return;
				} else {
					if (p.errorobject) {
						r = jQuery.parseJSON(p.errorobject.responseText);
						if (r && r.error && r.error.innererror && r.error.innererror.errordetails && r.error.innererror.errordetails[0] && r.error.innererror
							.errordetails[0].message) {
							m = "(" + p.errorobject.message + " " + p.errorobject.statusCode + " " + p.errorobject.statusText + ")\r\n" + r.error.innererror
								.errordetails[0].message;
						}
						this.showMessage(m, "requestCompleted");
					}
				}
			}, this);
		},
		showMessage: function (m, e) {
			var s, a;
			switch (e) {
			case "requestCompleted":
				{
					a = this._oResourceBundle.getText("ODATA_REQUEST_COMPLETED_TITLE");s = this._oResourceBundle.getText("ODATA_REQUEST_COMPLETED");
					break;
				}
			case "requestFailed":
				{
					a = this._oResourceBundle.getText("ODATA_REQUEST_FAILED_TITLE");s = this._oResourceBundle.getText("ODATA_REQUEST_FAILED");
					break;
				}
			case "metadataFailed":
				{
					a = this._oResourceBundle.getText("ODATA_METADATA_FAILED_TITLE");s = this._oResourceBundle.getText("ODATA_METADATA_FAILED");
					break;
				}
			}
			sap.m.MessageBox.show(s, {
				icon: sap.m.MessageBox.Icon.ERROR,
				title: a,
				details: m,
				styleClass: "sapUiSizeCompact",
				actions: [sap.m.MessageBox.Action.CLOSE]
			});
		}
	});
});