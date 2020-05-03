/*
 * Copyright (C) 2009-2019 SAP SE or an SAP affiliate company. All rights reserved.
 */
jQuery.sap.declare("fin.cash.flow.analyzer.util.ErrorHandler");
jQuery.sap.require("sap.m.MessageBox");
fin.cash.flow.analyzer.util.ErrorHandler = {
	initODateErrorHandler: function (c) {
		this._oComponent = c;
		this._oDataModel = c.getModel();
		this._oResourceBundle = c.getModel("i18n").getResourceBundle();
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
					r = JSON.parse(e.getParameter("response").responseText);
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
			if (p.success === true) {
				return;
			} else {
				if (p.errorobject) {
					if ('abort' === p.errorobject.statusText || p.errorobject.responseText === '') {
						return;
					}
					r = JSON.parse(p.errorobject.responseText);
					if (r && r.error && r.error.innererror && r.error.innererror.errordetails && r.error.innererror.errordetails[0] && r.error.innererror
						.errordetails[0].message) {
						m = "(" + p.errorobject.message + " " + p.errorobject.statusCode + " " + p.errorobject.statusText + ")\r\n" + r.error.innererror.errordetails[
							0].message;
					}
					this.showMessage(m, "requestCompleted");
				}
			}
		}, this);
	},
	showMessage: function (m, e) {
		var M, s;
		switch (e) {
		case "requestCompleted":
			{
				s = this._oResourceBundle.getText("ODATA_REQUEST_COMPLETED_TITLE");M = this._oResourceBundle.getText("ODATA_REQUEST_COMPLETED");
				break;
			}
		case "requestFailed":
			{
				s = this._oResourceBundle.getText("ODATA_REQUEST_FAILED_TITLE");M = this._oResourceBundle.getText("ODATA_REQUEST_FAILED");
				break;
			}
		case "metadataFailed":
			{
				s = this._oResourceBundle.getText("ODATA_METADATA_FAILED_TITLE");M = this._oResourceBundle.getText("ODATA_METADATA_FAILED");
				break;
			}
		}
		sap.m.MessageBox.show(M, {
			icon: sap.m.MessageBox.Icon.ERROR,
			title: s,
			details: m,
			styleClass: "sapUiSizeCompact",
			actions: [sap.m.MessageBox.Action.CLOSE]
		});
	}
};