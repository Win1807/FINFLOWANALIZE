/*
 * Copyright (C) 2009-2019 SAP SE or an SAP affiliate company. All rights reserved.
 */
jQuery.sap.declare("fin.cash.flow.analyzer.helper.AppSettingsHelper");
jQuery.sap.require("sap.ui.comp.odata.MetadataAnalyser");
jQuery.sap.require("sap.ui.comp.providers.ValueHelpProvider");
jQuery.sap.require("sap.ui.comp.providers.ValueListProvider");
fin.cash.flow.analyzer.helper.AppSettingsHelper = function (m, p, P, o) {
	this.oModel = m;
	this.oParentView = p;
	this.oParentController = P;
	this.oPersonalizer = o;
	this.oDialog = null;
	this.aValueListProvider = [];
	this.aValueHelpProvider = [];
	this.oBusyIndicator = new sap.m.BusyDialog();
	this.handleWorkingdaysSelected = function () {
		if (sap.ui.getCore().byId("WorkingRadioBtn").getSelectedIndex() === 0) {
			sap.ui.getCore().byId("FactoryCalendarId").setEnabled(false);
			sap.ui.getCore().byId("PreviousFlag").setEnabled(false);
		} else {
			sap.ui.getCore().byId("FactoryCalendarId").setEnabled(true);
			sap.ui.getCore().byId("PreviousFlag").setEnabled(true);
		}
	};
	this.handleUsrDsplyCrcyValueHelp = function (e) {
		if (!this._UsrDsplyCrcyDialog) {
			this._UsrDsplyCrcyDialog = sap.ui.xmlfragment("fin.cash.flow.analyzer.view.fragment.UsrDsplyCrcyDialog", this);
			this._UsrDsplyCrcyDialog.setModel(this.oModel);
			this._UsrDsplyCrcyDialog.setModel(this.oDialog.getModel("i18n"), "i18n");
		}
		this._UsrDsplyCrcyDialog.setMultiSelect(false);
		this._UsrDsplyCrcyDialog.setRememberSelections(true);
		this._UsrDsplyCrcyDialog.getBinding("items").filter([]);
		jQuery.sap.syncStyleClass("sapUiSizeCompact", this.oParentView, this._UsrDsplyCrcyDialog);
		this._UsrDsplyCrcyDialog.open();
	};
	this.onHandleSearchForHDC = function (e) {
		var f = [];
		var v = e.getParameter("value");
		var F = new sap.ui.model.Filter("WAERS", sap.ui.model.FilterOperator.Contains, v);
		f.push(F);
		var b = e.getSource().getBinding("items");
		b.filter(f);
	};
	this.onHandleSearchForCAL = function (e) {
		var f = [];
		var v = e.getParameter("value");
		var F = new sap.ui.model.Filter("IDENT", sap.ui.model.FilterOperator.Contains, v);
		f.push(F);
		var b = e.getSource().getBinding("items");
		b.filter(f);
	};
	this.handleCalandarValueHelp = function (e) {
		if (!this._CADialog) {
			this._CADialog = sap.ui.xmlfragment("fin.cash.flow.analyzer.view.fragment.CADialog", this);
			this._CADialog.setModel(this.oModel);
			this._CADialog.setModel(this.oDialog.getModel("i18n"), "i18n");
		}
		this._CADialog.setMultiSelect(false);
		this._CADialog.setRememberSelections(true);
		this._CADialog.getBinding("items").filter([]);
		jQuery.sap.syncStyleClass("sapUiSizeCompact", this.oParentView, this._CADialog);
		this._CADialog.open();
	};
	this.onHandleCloseForUsrDCrcy = function (e) {
		var c = e.getParameter("selectedContexts")[0].getObject().WAERS;
		if (c) {
			sap.ui.getCore().byId("SettingDisplayCurrency").setValue(c);
		}
	};
	this.onHandleCloseForUsrCal = function (e) {
		var c = e.getParameter("selectedContexts")[0].getObject().IDENT;
		if (c) {
			sap.ui.getCore().byId("FactoryCalendarId").setValue(c);
		}
	};
	this.checkExpendLevel = function (e) {
		var r = new RegExp("^(0)$|^100$|^[1-9][0-9]?$");
		var l = e.getParameter("value");
		if (r.test(l) === false) {
			sap.ui.getCore().byId("SettingExpendLevel").setValueState("Error");
		} else {
			sap.ui.getCore().byId("SettingExpendLevel").setValueState("None");
		}
	};
};
fin.cash.flow.analyzer.helper.AppSettingsHelper.prototype.getSettingsDialog = function () {
	if (!this.oDialog) {
		this.oDialog = sap.ui.xmlfragment("fin.cash.flow.analyzer.view.fragment.AppSettingsDialog", this);
		this.oDialog.setModel(this.oModel);
		this.oParentView.addDependent(this.oDialog);
		(function () {
			this.DB_IsBankCurrency = sap.ui.getCore().byId("DB_IsBankCurrency");
			this.DefaultView = sap.ui.getCore().byId("DefaultView");
			this.SettingExpendLevel = sap.ui.getCore().byId("SettingExpendLevel");
			this.SettingDisplayCurrency = sap.ui.getCore().byId("SettingDisplayCurrency");
			this.Scaling = sap.ui.getCore().byId("Scaling");
			this.FactoryCalendarId = sap.ui.getCore().byId("FactoryCalendarId");
			this.PreviousFlag = sap.ui.getCore().byId("PreviousFlag");
			this.WorkingRadioBtn = sap.ui.getCore().byId("WorkingRadioBtn");
		}).call(this);
		this.oDialog.attachEvent('beforeOpen', $.proxy(this.onBeforeOpen, this));
	}
	$.sap.syncStyleClass("sapUiSizeCompact", this.oParentView, this.oDialog);
	$.sap.syncStyleClass("sapUiSizeCompact", this.oParentView, this.oBusyIndicator);
	return this.oDialog;
};
fin.cash.flow.analyzer.helper.AppSettingsHelper.prototype.asyncGetSettings = function (s, f, c) {
	if (this.oPersonalizer) {
		this.oBusyIndicator.open();
		this.oPersonalizer.getPersData().done(function (p) {
			$.sap.log.debug("Reading personalization data done.");
			if (s) {
				s.call(c || {}, p || {});
			}
		}).fail(function () {
			$.sap.log.error("Reading personalization data failed.");
			if (f) {
				f.call(c || {});
			}
		}).always($.proxy(function () {
			this.oBusyIndicator.close();
		}, this));
	} else {
		f.call(c || {});
	}
};
fin.cash.flow.analyzer.helper.AppSettingsHelper.prototype.onBeforeOpen = function (e) {
	this.asyncGetSettings(function (s) {
		if (s['Scaling']) {
			this.Scaling.setSelectedKey(s['Scaling']);
		} else {
			this.Scaling.setSelectedKey(0);
		}
		if (s['DefaultView']) {
			this.DefaultView.setSelectedIndex(parseInt(s['DefaultView']));
		} else {
			this.DefaultView.setSelectedIndex(0);
		}
		if (s['DB_IsBankCurrency']) {
			this.DB_IsBankCurrency.setSelectedIndex(parseInt(s['DB_IsBankCurrency']));
		} else {
			this.DB_IsBankCurrency.setSelectedIndex(0);
		}
		if (s['SettingDisplayCurrency']) {
			this.SettingDisplayCurrency.setValue(s['SettingDisplayCurrency']);
		} else {
			this.SettingDisplayCurrency.setValue("");
		}
		if (s['SettingExpendLevel']) {
			this.SettingExpendLevel.setValue(s['SettingExpendLevel']);
		} else {
			this.SettingExpendLevel.setValue("");
		}
		if (s['WorkingRadioBtn']) {
			this.WorkingRadioBtn.setSelectedIndex(parseInt(s['WorkingRadioBtn'], 10));
		} else {
			this.WorkingRadioBtn.setSelectedIndex(0);
		}
		this.handleWorkingdaysSelected();
		if (s['FactoryCalendarId']) {
			this.FactoryCalendarId.setValue(s['FactoryCalendarId']);
		} else {
			this.FactoryCalendarId.setValue("*");
		}
		if (s['PreviousFlag']) {
			if (s['PreviousFlag'] === '0') {
				this.PreviousFlag.setSelectedButton(sap.ui.getCore().byId("fin.cash.fa.main-np-button"));
			} else {
				this.PreviousFlag.setSelectedButton(sap.ui.getCore().byId("fin.cash.fa.main-pp-button"));
			}
		} else {
			this.PreviousFlag.setSelectedButton(this.PreviousFlag.getSelectedButton("fin.cash.fa.main-np"));
		}
	}, null, this);
};
fin.cash.flow.analyzer.helper.AppSettingsHelper.prototype.onOK = function () {
	$.sap.log.debug("OK Pressed");
	if (this.oPersonalizer) {
		var p = {};
		p['Scaling'] = this.Scaling.getSelectedKey();
		p['DefaultView'] = this.DefaultView.getSelectedIndex();
		p['DB_IsBankCurrency'] = this.DB_IsBankCurrency.getSelectedIndex();
		p['SettingExpendLevel'] = this.SettingExpendLevel.getValue();
		p['SettingDisplayCurrency'] = this.SettingDisplayCurrency.getValue();
		p['WorkingRadioBtn'] = this.WorkingRadioBtn.getSelectedIndex();
		p["FactoryCalendarId"] = (p['WorkingRadioBtn']) ? (this.FactoryCalendarId.getValue()) : "*";
		p["PreviousFlag"] = (this.PreviousFlag.getSelectedButton() === "fin.cash.fa.main-pp-button") ? "-1" : "0";
		this.rbIsBankCurrency = this.DB_IsBankCurrency.getSelectedIndex();
		var i;
		switch (p['DB_IsBankCurrency']) {
		case 0:
			i = "";
			break;
		case 1:
			i = "X";
			break;
		case 2:
			i = "L";
			break;
		}
		this.oParentView.getModel("Scaling").setData({
			scaling: p['Scaling'],
			expend: p['SettingExpendLevel'],
			displayCurrency: p['SettingDisplayCurrency'],
			isBankCurrency: i,
			workingRadioBtn: p['WorkingRadioBtn'],
			factoryCalendarId: p["FactoryCalendarId"],
			previousFlag: p["PreviousFlag"],
			viewType: p['DefaultView']
		}, false);
		this.oDialog.close();
		this.oPersonalizer.setPersData(p).done(function () {
			$.sap.log.debug("Saving personalization data done.");
		}).fail(function () {
			$.sap.log.error("Saving personalization data failed.");
		});
	}
};
fin.cash.flow.analyzer.helper.AppSettingsHelper.prototype.onCancel = function () {
	$.sap.log.debug("Cancel Pressed");
	this.oDialog.close();
};