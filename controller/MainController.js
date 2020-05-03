/*
 * Copyright (C) 2009-2019 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["fin/cash/flow/analyzer/controller/BaseController", "sap/ui/model/json/JSONModel", "fin/cash/flow/analyzer/model/formatter",
	"sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/ui/core/routing/History",
	"sap/ui/generic/app/navigation/service/SelectionVariant", "sap/ui/generic/app/navigation/service/NavigationHandler",
	"fin/cash/flow/analyzer/util/Conversions", "fin/cash/flow/analyzer/util/StringUtil", "sap/suite/ui/commons/util/DateUtils",
	"fin/cash/flow/analyzer/helper/AppSettingsHelper", "sap/m/Button", "sap/m/MessageBox", "fin/cash/flow/analyzer/util/Formatter",
	"fin/cash/flow/analyzer/controller/CycleController", "fin/cash/flow/analyzer/controller/ExternalNavigationController",
	"fin/cash/flow/analyzer/util/ErrorHandler"
], function (B, J, f, F, a, H, S, N, C, c, D, A, d, M, e, g, E, h) {
	"use strict";
	return B.extend("fin.cash.flow.analyzer.controller.MainController", {
		conversions: C,
		util: null,
		cController: g,
		oCurrSmartFilterBar: null,
		oPersonalization: null,
		bIsInitizedCall: false,
		bIsInitial: false,
		oCurrTable: null,
		oCurrSmartTable: null,
		formatter: f,
		oNavigationHandler: null,
		odrilldowncol: null,
		aDrilldownfilter: [],
		oCycleData: null,
		sTableTitle: null,
		cashgroupCol: null,
		oSelectVariants: null,
		rbIsBankCurrency: "",
		_DrillDownPopOver: null,
		_LQSDialog: null,
		_BASDialog: null,
		_CPSDialog: null,
		_CASDialog: null,
		sLQHierarchyName: null,
		sBAHierarchyName: null,
		oTileType: null,
		extHookAssignExtTableColumnsForMainView: null,
		onInit: function () {
			this.oNav = E;
			this.oNavigationHandler = new N(this);
			this.util = C;
			this.cycleController = g;
			this.oCurrentDate = new Date();
			this.oWnerComponent = this.getOwnerComponent();
			this.oi18nModel = this.oWnerComponent.getModel("i18n");
			this.oResourceBundle = this.oi18nModel.getResourceBundle();
			this.oDataModel = this.oWnerComponent.getModel();
			this.oDataModel.setDefaultCountMode(sap.ui.model.odata.CountMode.None);
			this.setModel(this.oDataModel);
			this.oView = this.getView();
			this.oView.setModel(this.oDataModel);
			this.oCurrTable = this.byId('idFlowItemTable');
			this.oCurrSmartFilterBar = this.byId('idsmartFilterBarItem');
			this.oCurrSmartTable = this.byId('idFlowItemSmartTable');
			this.oAnalyticalTable = this.byId('idFlowItemTable');
			if (sap.ui.Device.system.desktop) {
				this.oCurrSmartFilterBar.addStyleClass("sapUiSizeCompact");
				this.oAnalyticalTable.addStyleClass("sapUiSizeCondensed");
			}
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			this.aGroupedCol_cashgroup = [];
			this.CashgroupTermGrouped = false;
			this.oTileType = "";
			this.bIsSaveAsTile = false;
			this.oErrorHandler = h;
			this.oErrorHandler.initODateErrorHandler(this.oWnerComponent);
			var t = this;
			var s = this.getView().byId("shareTile");
			s.setAppData({
				title: this.oResourceBundle.getText("appDescription"),
				customUrl: function () {
					t.storeCurrentAppState();
					return document.URL;
				}
			});
			s.setBeforePressHandler(function () {
				var k = t.generateCustomUrl();
				s.setAppData({
					title: t.oResourceBundle.getText("appDescription"),
					customUrl: k
				});
			});
			var b = new sap.m.Button({
				sId: "buttonSetting",
				mSettings: {
					text: this.oResourceBundle.getText("SETTINGS"),
					textDirection: this.oResourceBundle.getText("SETTINGS")
				}
			});
			var T = this.oResourceBundle.getText("SETTINGS");
			b.attachPress($.proxy(this.onAppSettingsPressed, this));
			b._sTooltip = T;
			b.setTooltip(b._sTooltip);
			b._sTextInActionSheet = T;
			b._sTextInBar = T;
			b.setText(T);
			b._sTypeInActionSheet = sap.m.ButtonType.Default;
			var i = [];
			i.push(b);
			sap.ushell.services.AppConfiguration.addApplicationSettingsButtons(i);
			this.oPersonalization = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService("Personalization");
			if (this.oPersonalization) {
				var p = {
					container: "fin.cash.flow.analyzer" + ((sap.ushell && sap.ushell.Container && sap.ushell.Container.getUser().getId()) || {}),
					item: "favorites"
				};
				this.oPersonalizer = this.oPersonalization.getPersonalizer(p);
			}
			this.oAppSettingsHelper = new A(this.getModel(), this.getView(), this, this.oPersonalizer);
			var o = null;
			var j = null;
			if (this.extHookAssignExtTableColumnsForMainView) {
				this.extHookAssignExtTableColumnsForMainView(o, j);
			}
			if (this.extHookonDataReceived) {
				this.extHookonDataReceived(this.model);
			}
			if (this.extHookOnInit) {
				this.extHookOnInit();
			}
		},
		generateCustomUrl: function () {
			this.storeCurrentAppState();
			return document.URL;
		},
		getUserSetting: function () {
			var t = this;
			t.oAppSettingsHelper.asyncGetSettings(function (s) {
				var b = (s.Scaling) ? (s.Scaling) : 0;
				var i;
				if (s.DB_IsBankCurrency !== undefined && s.DB_IsBankCurrency !== null) {
					switch (s.DB_IsBankCurrency) {
					case 0:
						i = "";
						this.rbIsBankCurrency = "0";
						break;
					case 1:
						i = "X";
						this.rbIsBankCurrency = "1";
						break;
					case 2:
						i = "L";
						this.rbIsBankCurrency = "2";
						break;
					}
				} else {
					i = "";
					this.rbIsBankCurrency = "0";
				}
				var j = (s.FactoryCalendarId && s.WorkingRadioBtn && s.WorkingRadioBtn === 1) ? (s.FactoryCalendarId) : "*";
				var p = (s.PreviousFlag && s.WorkingRadioBtn && s.WorkingRadioBtn === 1) ? (s.PreviousFlag) : "0";
				var k = (s.SettingExpendLevel) ? (s.SettingExpendLevel) : 3;
				var l = (s.SettingDisplayCurrency) ? (s.SettingDisplayCurrency) : "";
				var v = (s.DefaultView) ? (s.DefaultView) : 0;
				var o = new J({
					scaling: b,
					expend: k,
					displayCurrency: l,
					isBankCurrency: i,
					factoryCalendarId: j,
					previousFlag: p,
					viewType: v
				});
				this.getView().setModel(o, "Scaling");
				this.oCurrSmartTable.rebindTable(true);
			}, function () {
				var s = new J({
					scaling: 0,
					expend: 3,
					viewType: 0
				});
				this.getView().setModel(s, "Scaling");
				this.oCurrSmartTable.rebindTable(true);
			}, this);
		},
		onAppSettingsPressed: function () {
			var s = this.oAppSettingsHelper.getSettingsDialog();
			if (s) {
				s.open();
				var t = this.getView().getModel("i18n");
				s.setModel(t, "i18n");
			}
		},
		onInitSmartFilterBar: function () {
			this.initAppState(true, null);
		},
		onExpandForMainView: function (o) {
			var G = this.oCurrTable._aGroupedColumns.length;
			this.oCurrTable.setNumberOfExpandedLevels(G);
			this.oCurrSmartTable.rebindTable(true);
		},
		onCollapseForBankAccountView: function () {
			this.oCurrTable.setNumberOfExpandedLevels(0);
			this.oCurrTable.collapseAll();
		},
		initAppState: function (i, b) {
			var p = this.oNavigationHandler.parseNavigation();
			var t = this;
			var s = null;
			p.done(function (l, u, m) {
				s = new sap.ui.generic.app.navigation.service.SelectionVariant(l.selectionVariant);
				var v = s.getValue("KeyDate");
				var q = s.getValue("CyclePattern");
				var r = s.getValue("HistoricalTimeStamp");
				var w = s.getValue("ReleaseFlag");
				var x = s.getValue("DateIndicator");
				switch (m) {
				case sap.ui.generic.app.navigation.service.NavType.initial:
					{
						t.handleCrossNav(l, u);
						break;
					}
				case sap.ui.generic.app.navigation.service.NavType.iAppState:
					{
						if (t.util.isNull(v)) {
							s.addSelectOption("KeyDate", "I", "EQ", t.util.getValueDateDefault());
						}
						if (t.util.isNull(q)) {
							s.addSelectOption("CyclePattern", "I", "EQ", "D7");
						}
						t.oCurrSmartFilterBar.getControlByKey("CyclePattern").setValue(s.getValue("CyclePattern")[0].Low);
						if (t.util.isNull(r)) {
							s.addSelectOption("HistoricalTimeStamp", "I", "EQ", t.util.getHistoryDateTimeDefault().toJSON());
						}
						var y = r[0].Low;
						if (t.getView() && t.getView().byId('idHistoricalTimeStamp') && y !== '') {
							t.getView().byId('idHistoricalTimeStamp').setDateValue(new Date(Date.parse(y)));
						}
						if (t.util.isNull(w)) {
							s.addSelectOption("ReleaseFlag", "I", "EQ", "0");
						}
						if (t.util.isNull(x)) {
							s.addSelectOption("DateIndicator", "I", "EQ", "1");
							t.oCurrSmartFilterBar.getControlByKey("DateIndicator").setSelectedKey("1");
						} else {
							t.oCurrSmartFilterBar.getControlByKey("DateIndicator").setSelectedKey(x[0].Low);
						}
						l.selectionVariant = s.toJSONString();t.getView().byId('idsmartFilterBarItem').setDataSuiteFormat(l.selectionVariant);t.getView()
						.byId('idFlowItemSmartTable').rebindTable(true);
						break;
					}
				case sap.ui.generic.app.navigation.service.NavType.xAppState:
					{
						t.handleCrossNav(l, u);
						break;
					}
				case sap.ui.generic.app.navigation.service.NavType.URLParams:
					{
						t.handleCrossNav(l, u);
						break;
					}
				}
			});
			p.fail(function (l) {
				l.setUIText({
					oi18n: t.oResourceBundle,
					sTextKey: "INBOUND_NAV_ERROR"
				});
				l.showMessageBox();
			});
			if (this.getView().getViewName() === "fin.cash.flow.analyzer.view.Worklist_D" && !this.bIsSaveAsTile) {
				var o = new sap.ui.generic.app.navigation.service.SelectionVariant(this.aDrilldownfilter);
				var k = o.getPropertyNames();
				for (var j = 0; j < k.length; j++) {
					if (k[j].endsWith('Text')) {
						var n = k[j].replace(new RegExp('Text$'), '');
						if (o.getParameter(k[j])) {
							var P = o.getParameter(k[j]).split("::");
							o.addParameter(n, P[0]);
							o.removeParameter(k[j]);
							this.oCurrSmartFilterBar.addFieldToAdvancedArea(n);
						}
					} else {
						this.oCurrSmartFilterBar.addFieldToAdvancedArea(k[j]);
					}
				}
				this.oCurrSmartFilterBar.clearVariantSelection();
				this.oCurrSmartFilterBar.clear();
				this.oCurrSmartFilterBar.setDataSuiteFormat(o.toJSONString(), true);
				this.oCurrSmartTable.rebindTable(true);
			}
		},
		defaultVariantManagement: function (t) {},
		handleInitialNav: function (o, u, t) {},
		onCycleHandle: function (b) {
			var s = new sap.ui.generic.app.navigation.service.SelectionVariant(this.aDrilldownfilter);
			var o = s.getPropertyNames();
			for (var j = 0; j < o.length; j++) {
				if (o[j].endsWith('Text')) {
					var n = o[j].replace(new RegExp('Text$'), '');
					if (s.getParameter(o[j])) {
						var p = s.getParameter(o[j]).split("::");
						s.addParameter(n, p[0]);
						s.removeParameter(o[j]);
						this.oCurrSmartFilterBar.addFieldToAdvancedArea(n);
					}
				} else {
					this.oCurrSmartFilterBar.addFieldToAdvancedArea(o[j]);
				}
				if (o[j] === "CyclePattern") {
					var i = s.getValue("CyclePattern");
					b.setValue(i[0].Low);
				}
			}
			this.oCurrSmartFilterBar.clearVariantSelection();
			this.oCurrSmartFilterBar.clear();
			this.oCurrSmartFilterBar.setDataSuiteFormat(s.toJSONString(), true);
			this.oCurrentDate = this.oCurrSmartFilterBar.getFilterData().KeyDate;
		},
		onInitizedFilterBar: function () {
			this.getUserSetting();
		},
		onHandleAfterVariantLoad: function (o) {
			if (this.getView().getViewName() !== "fin.cash.flow.analyzer.view.Worklist_D") {
				var s = new Date();
				var t = "D7";
				var b = this.util.getHistoryDateTimeDefault();
				var i = "1";
				var j = this.util.dateFormat(s);
				this.oCurrSmartFilterBar.getControlByKey("KeyDate").setValue(j);
				switch (this.oCurrSmartFilterBar.getCurrentVariantId()) {
				case "id_1479185620511_138_filterBar":
				case "id_1479185731149_216_filterBar":
				case "":
					this.oCurrSmartFilterBar.getControlByKey("CyclePattern").setValue(t);
					this.oCurrSmartFilterBar.getControlByKey("DateIndicator").setSelectedKey(i);
					this.oCurrSmartFilterBar.getControlByKey("HistoricalTimeStamp").setDateValue(b);
					break;
				case "id_1479785449033_63_filterBar":
					var T = new Date();
					var m = new Date();
					T.setDate(1);
					t = "D31";
					T = this.util.dateFormat(T);
					m = this.util.dateFormat(m);
					this.oCurrSmartFilterBar.getControlByKey("ActualDate").setValue(m);
					this.oCurrSmartFilterBar.getControlByKey("KeyDate").setValue(T);
					this.oCurrSmartFilterBar.getControlByKey("CyclePattern").setValue(t);
					this.oCurrSmartFilterBar.getControlByKey("DateIndicator").setSelectedKey(i);
					this.oCurrSmartFilterBar.getControlByKey("HistoricalTimeStamp").setDateValue(b);
					break;
				default:
					var k = this.oCurrSmartFilterBar.getFilterData();
					var l = k["_CUSTOM"];
					this.oCurrSmartFilterBar.getControlByKey("CyclePattern").setValue(l.CyclePattern);
					this.oCurrSmartFilterBar.getControlByKey("DateIndicator").setSelectedKey(l.DateIndicator);
					if (l.HistoricalTimeStamp) {
						this.oCurrSmartFilterBar.getControlByKey("HistoricalTimeStamp").setDateValue(new Date(Date.parse(l.HistoricalTimeStamp)));
					} else {
						this.oCurrSmartFilterBar.getControlByKey("HistoricalTimeStamp").setDateValue(b);
					}
					break;
				}
			} else {
				var n = this.util.dateFormat(this.oCurrentDate);
				this.oCurrSmartFilterBar.getControlByKey("KeyDate").setValue(n);
			}
		},
		onHandleBeforeVariantSave: function (o) {
			var b = this.getView().byId("idCyclePattern").getValue();
			var i = this.getView().byId("idHistoricalTimeStamp").getDateValue();
			var j = this.getView().byId("idDateIndicator").getSelectedKey();
			if (b !== "") {
				this.oCurrSmartFilterBar.setFilterData({
					_CUSTOM: {
						CyclePattern: b,
						HistoricalTimeStamp: i,
						DateIndicator: j
					}
				});
			}
		},
		handleAfterVariantSaveTable: function (o) {
			var s = this.oCurrSmartTable.fetchVariant();
			s = s.group.groupItems;
			for (var i = s.length - 1; i >= 0; i--) {
				if ((s[i].columnKey === "LiquidityItem" || s[i].columnKey === "PlanningLevel" || s[i].columnKey === "CashPlanningGroup") && (
						parseInt((this.getView().getModel("Scaling").getData().viewType) ? this.getView().getModel("Scaling").getData().viewType : 0, 10) +
						1) === 1) {
					sap.m.MessageBox.alert(this.oResourceBundle.getText("GROUP_ERROR"));
					break;
				}
			}
		},
		handleAfterVariantInitialiseTable: function (o) {},
		onSearch: function (o) {},
		onNavBack: function () {
			var p = H.getInstance().getPreviousHash(),
				o = sap.ushell.Container.getService("CrossApplicationNavigation");
			if (p !== undefined || !o.isInitialNavigation()) {
				history.go(-1);
			} else {
				o.toExternal({
					target: {
						shellHash: "#Shell-home"
					}
				});
			}
		},
		onHandleSearchForLQH: function (o) {
			var b = [];
			var v = o.getParameter("value");
			var i = new sap.ui.model.Filter("HierarchyName", sap.ui.model.FilterOperator.Contains, v);
			b.push(i);
			var j = o.getSource().getBinding("items");
			j.filter(b);
		},
		onHandleSearchForBAH: function (o) {
			var b = [];
			var v = o.getParameter("value");
			var i = new sap.ui.model.Filter("HierarchyName", sap.ui.model.FilterOperator.Contains, v);
			b.push(i);
			var j = o.getSource().getBinding("items");
			j.filter(b);
		},
		onHandleSearchForCP: function (o) {
			var b = [];
			var v = o.getParameter("value");
			var i = new sap.ui.model.Filter("CashPoolName", sap.ui.model.FilterOperator.Contains, v);
			b.push(i);
			var j = o.getSource().getBinding("items");
			j.filter(b);
		},
		onHandleCloseForLQH: function (o) {
			var b = o.getParameter("selectedContexts");
			if (b.length) {
				this.oWnerComponent.sLQHiername = b.map(function (i) {
					return i.getObject().HierarchyName;
				}).join(", ");
			}
			o.getSource().getBinding("items").filter([]);
			if (this.oWnerComponent.sLQHiername !== null) {
				this.getView().byId("fin.cash.fa.liquidity-item-hierarchy-id").setValue(this.oWnerComponent.sLQHiername);
			}
		},
		onHandleCloseForBAH: function (o) {
			var b = o.getParameter("selectedContexts");
			if (b.length) {
				this.oWnerComponent.sBAHiername = b.map(function (i) {
					return i.getObject().HierarchyName;
				}).join(", ");
			}
			o.getSource().getBinding("items").filter([]);
			if (this.oWnerComponent.sBAHiername !== null) {
				this.getView().byId("fin.cash.fa.bank-account-hierarchy-id").setValue(this.oWnerComponent.sBAHiername);
			}
		},
		onHandleCloseForCP: function (o) {
			var b = o.getParameter("selectedContexts");
			if (b.length) {
				this.oWnerComponent.sCPName = b.map(function (i) {
					return i.getObject().CashPoolName;
				}).join(", ");
			}
			o.getSource().getBinding("items").filter([]);
			if (this.oWnerComponent.sCPName !== null) {
				this.getView().byId("fin.cash.fa.cash-pool-id").setValue(this.oWnerComponent.sCPName);
			}
		},
		onInterNavigationPressed: function (o) {
			if (!this._DrillDownPopover) {
				this._DrillDownPopover = sap.ui.xmlfragment(this.getView().getId(), "fin.cash.flow.analyzer.view.fragment.NaviDetailPopOver", this);
				this.getView().addDependent(this._DrillDownPopover);
			}
			this._DrillDownPopover.open();
			if (!this.existDisplayCurrency()) {
				if (this.getView().byId("fin.cash.fa.lhh-nvg").getSelected() === true) {
					this.getView().byId("fin.cash.fa.lih-displaycurrency").setEnabled(true);
				} else {
					this.getView().byId("fin.cash.fa.lih-displaycurrency").setEnabled(false);
				}
			} else {
				this.getView().byId("fin.cash.fa.lih-displaycurrency").setEnabled(false);
				this.getView().byId("fin.cash.fa.lih-displaycurrency").setValue(this.existDisplayCurrency());
			}
		},
		handleLQValueHelp: function (o) {
			if (!this._LQSDialog) {
				this._LQSDialog = sap.ui.xmlfragment(this.getView().getId(), "fin.cash.flow.analyzer.view.fragment.LQDialog", this);
				this.getView().addDependent(this._LQSDialog);
				this._LQSDialog.setModel(this.oDataModel);
				var t = this.getView().getModel("i18n");
				this._LQSDialog.setModel(t, "i18n");
			}
			this._LQSDialog.setMultiSelect(false);
			this._LQSDialog.setRememberSelections(true);
			this._LQSDialog.getBinding("items").filter([]);
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._LQSDialog);
			this._LQSDialog.open();
		},
		handleBAValueHelp: function (o) {
			if (!this._BASDialog) {
				this._BASDialog = sap.ui.xmlfragment(this.getView().getId(), "fin.cash.flow.analyzer.view.fragment.BADialog", this);
				this.getView().addDependent(this._BASDialog);
				this._BASDialog.setModel(this.oDataModel);
				var t = this.getView().getModel("i18n");
				this._BASDialog.setModel(t, "i18n");
			}
			this._BASDialog.setMultiSelect(false);
			this._BASDialog.setRememberSelections(true);
			this._BASDialog.getBinding("items").filter([]);
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._BASDialog);
			this._BASDialog.open();
		},
		handleCPValueHelp: function (o) {
			if (!this._CPSDialog) {
				this._CPSDialog = sap.ui.xmlfragment(this.getView().getId(), "fin.cash.flow.analyzer.view.fragment.CPDialog", this);
				this.getView().addDependent(this._CPSDialog);
				this._CPSDialog.setModel(this.oDataModel);
				var t = this.getView().getModel("i18n");
				this._CPSDialog.setModel(t, "i18n");
			}
			this._CPSDialog.setMultiSelect(false);
			this._CPSDialog.setRememberSelections(true);
			this._CPSDialog.getBinding("items").filter([]);
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._CPSDialog);
			this._CPSDialog.open();
		},
		handleCalendarValueHelp: function (o) {
			if (!this._CASDialog) {
				this._CASDialog = sap.ui.xmlfragment(this.getView().getId(), "fin.cash.flow.analyzer.view.fragment.CADialog", this);
				this.getView().addDependent(this._CASDialog);
				this._CASDialog.setModel(this.oDataModel);
				var t = this.getView().getModel("i18n");
				this._CASDialog.setModel(t, "i18n");
			}
			this._CASDialog.setMultiSelect(false);
			this._CASDialog.setRememberSelections(true);
			this._CASDialog.getBinding("items").filter([]);
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._CASDialog);
			this._CASDialog.open();
		},
		handleDsplyCrcyValueHelp: function (o) {
			if (!this._HDsplyCrcyDialog) {
				this._HDsplyCrcyDialog = sap.ui.xmlfragment(this.getView().getId(), "fin.cash.flow.analyzer.view.fragment.HDsplyCrcyDialog", this);
				this.getView().addDependent(this._HDsplyCrcyDialog);
				this._HDsplyCrcyDialog.setModel(this.oDataModel);
				var t = this.getView().getModel("i18n");
				this._HDsplyCrcyDialog.setModel(t, "i18n");
			}
			this._HDsplyCrcyDialog.setMultiSelect(false);
			this._HDsplyCrcyDialog.setRememberSelections(true);
			this._HDsplyCrcyDialog.getBinding("items").filter([]);
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._HDsplyCrcyDialog);
			this._HDsplyCrcyDialog.open();
		},
		existDisplayCurrency: function () {
			var b = this.oCurrSmartFilterBar.getFilters()[0];
			if (b._bMultiFilter === false) {
				if (b.sPath === "DisplayCurrency") {
					return b.oValue1;
				}
			} else {
				var j = b.aFilters;
				for (var i = 0; i < j.length; i++) {
					if (j[i].sPath === "DisplayCurrency") {
						return j[i].oValue1;
					}
				}
			}
			if (this.getView().getModel("Scaling")) {
				if (!this.getView().getModel("Scaling").getData().displayCurrency) {
					return false;
				} else {
					return this.getView().getModel("Scaling").getData().displayCurrency;
				}
			} else {
				return false;
			}
		},
		handleIntrNavigation: function (o) {
			var s = null;
			var n = {};
			if (this.getView().byId("fin.cash.fa.lhh-nvg").getSelected() === true) {
				s = new S(this.oCurrSmartFilterBar.getDataSuiteFormat());
				if (this.oWnerComponent.sLQHiername === null) {
					sap.m.MessageBox.show(this.oResourceBundle.getText("NVGERROR"), {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: this.oResourceBundle.getText("NVGERRORTITLE"),
						actions: [sap.m.MessageBox.Action.OK]
					});
					return;
				} else {
					s.addSelectOption("LiquidityHierarchyName", "I", "EQ", this.oWnerComponent.sLQHiername, null);
					s.addParameter("ViewType", "2");
					s.addParameter("CyclePattern", this.getView().byId("idCyclePattern").getValue());
					s.addParameter("DateIndicator", this.getView().byId("idDateIndicator").getSelectedKey());
					if (this.getView().byId("idHistoricalTimeStamp") && this.getView().byId("idHistoricalTimeStamp").getDateValue() && this.getView()
						.byId("idHistoricalTimeStamp").getDateValue() !== "") {
						s.addParameter("HistoricalTimeStamp", this.getView().byId("idHistoricalTimeStamp").getDateValue().toJSON());
					} else {}
					if (!this.existDisplayCurrency()) {
						if (!this.getView().byId("fin.cash.fa.lih-displaycurrency").getValue()) {
							sap.m.MessageBox.show(this.oResourceBundle.getText("NVGERROR"), {
								icon: sap.m.MessageBox.Icon.ERROR,
								title: this.oResourceBundle.getText("NVGERRORTITLE"),
								actions: [sap.m.MessageBox.Action.OK]
							});
							return;
						} else {
							s.addParameter("DisplayCurrency", this.getView().byId("fin.cash.fa.lih-displaycurrency").getValue());
						}
					} else {
						s.addParameter("DisplayCurrency", this.getView().byId("fin.cash.fa.lih-displaycurrency").getValue());
					}
					s.addParameter("FromMainView", "X");
					n = {
						oDrilldownfilter: s.toJSONString()
					};
					this.getRouter().navTo("LiquidityItemHierarchy", {
						Params: JSON.stringify(n).toBase64URI()
					});
				}
				return;
			} else if (this.getView().byId("fin.cash.fa.bah-nvg").getSelected() === true) {
				s = new S(this.oCurrSmartFilterBar.getDataSuiteFormat());
				this.oWnerComponent.sBAHiername = this.getView().byId("fin.cash.fa.bank-account-hierarchy-id").getValue();
				if (this.oWnerComponent.sBAHiername === null || this.oWnerComponent.sBAHiername === "" || this.oWnerComponent.sBAHiername ===
					undefined) {
					sap.m.MessageBox.show(this.oResourceBundle.getText("NVGERROR"), {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: this.oResourceBundle.getText("NVGERRORTITLE"),
						actions: [sap.m.MessageBox.Action.OK]
					});
					return;
				} else {
					s.addSelectOption("BankAccountGroup", "I", "EQ", this.oWnerComponent.sBAHiername, null);
					s.addParameter("ViewType", "2");
					s.addParameter("CyclePattern", this.getView().byId("idCyclePattern").getValue());
					s.addParameter("DateIndicator", this.getView().byId("idDateIndicator").getSelectedKey());
					if (this.getView() && this.getView().byId("idHistoricalTimeStamp") && this.getView().byId("idHistoricalTimeStamp").getDateValue() &&
						this.getView().byId("idHistoricalTimeStamp").getDateValue() !== '') {
						s.addParameter("HistoricalTimeStamp", this.getView().byId("idHistoricalTimeStamp").getDateValue().toJSON());
					} else {}
					if (this.rbIsBankCurrency === "1") {
						s.removeParameter("BankAccountCurrency");
					}
					n = {
						oDrilldownfilter: s.toJSONString()
					};
					this.getRouter().navTo("BankAccountHierarchy", {
						Params: JSON.stringify(n).toBase64URI()
					});
				}
				return;
			} else if (this.getView().byId("fin.cash.fa.cp-nvg").getSelected() === true) {
				s = new S();
				var b = new S(this.oCurrSmartFilterBar.getDataSuiteFormat());
				this.oWnerComponent.sCPName = this.getView().byId("fin.cash.fa.cash-pool-id").getValue();
				if (this.oWnerComponent.sCPName === null || this.oWnerComponent.sCPName === "" || this.oWnerComponent.sCPName === undefined) {
					sap.m.MessageBox.show(this.oResourceBundle.getText("NVGERROR"), {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: this.oResourceBundle.getText("NVGERRORTITLE"),
						actions: [sap.m.MessageBox.Action.OK]
					});
					return;
				} else {
					s.addParameter("HierarchyName", this.oWnerComponent.sCPName);
					var v = b.getValue("KeyDate");
					s.addParameter("ValueDate", v[0].Low);
					if (this.getView() && this.getView().byId("idExRateType")) {
						s.addParameter("ExchangeRateType", this.getView().byId("idExRateType").getValue());
					}
					if (!this.existDisplayCurrency()) {
						if (!this.getView().byId("fin.cash.fa.cp-displaycurrency").getValue()) {
							sap.m.MessageBox.show(this.oResourceBundle.getText("NVGERROR"), {
								icon: sap.m.MessageBox.Icon.ERROR,
								title: this.oResourceBundle.getText("NVGERRORTITLE"),
								actions: [sap.m.MessageBox.Action.OK]
							});
							return;
						} else {
							s.addParameter("DisplayCurrency", this.getView().byId("fin.cash.fa.cp-displaycurrency").getValue());
						}
					} else {
						s.addParameter("DisplayCurrency", this.getView().byId("fin.cash.fa.cp-displaycurrency").getValue());
					}
					n = {
						oDrilldownfilter: s.toJSONString()
					};
					this.getRouter().navTo("CashConcentrationSim", {
						Params: JSON.stringify(n).toBase64URI()
					});
				}
				return;
			} else {
				sap.m.MessageBox.show(this.oResourceBundle.getText("DONOTSELECTHIERARCHY"), {
					icon: sap.m.MessageBox.Icon.ERROR,
					title: this.oResourceBundle.getText("HIERERRORTITLE"),
					actions: [sap.m.MessageBox.Action.OK]
				});
			}
		},
		getDefaultSnapshotTime: function () {
			var b = new Date();
			b.setHours(23, 59, 59, 999);
			return new Date(b.getTime() - b.getTimezoneOffset() * 60000);
		},
		_cancelSubmit: function (b) {
			if (this._DrillDownPopover) {
				this._DrillDownPopover.close();
			}
		},
		handleSelect: function (b) {
			var r = b.getSource();
			var i = r.getId().split("--")[2];
			if (i === "fin.cash.fa.lhh-nvg") {
				this.getView().byId("fin.cash.fa.bah-nvg").setActiveHandling(false);
				this.getView().byId("fin.cash.fa.bank-account-hierarchy-id").setEnabled(false);
				this.getView().byId("fin.cash.fa.liquidity-item-hierarchy-id").setEnabled(true);
				this.getView().byId("fin.cash.fa.lih-displaycurrency").setEnabled(true);
				this.getView().byId("fin.cash.fa.cash-pool-id").setEnabled(false);
				this.getView().byId("fin.cash.fa.cp-displaycurrency").setEnabled(false);
				if (this.oWnerComponent.sLQHiername !== null) {
					this.getView().byId("fin.cash.fa.liquidity-item-hierarchy-id").setValue(this.oWnerComponent.sLQHiername);
				}
				if (this.existDisplayCurrency()) {
					this.getView().byId("fin.cash.fa.lih-displaycurrency").setValue(this.existDisplayCurrency());
				} else {
					this.getView().byId("fin.cash.fa.lih-displaycurrency").setEnabled(true);
				}
			}
			if (i === "fin.cash.fa.bah-nvg") {
				this.getView().byId("fin.cash.fa.lhh-nvg").setActiveHandling(false);
				this.getView().byId("fin.cash.fa.bank-account-hierarchy-id").setEnabled(true);
				this.getView().byId("fin.cash.fa.liquidity-item-hierarchy-id").setEnabled(false);
				this.getView().byId("fin.cash.fa.lih-displaycurrency").setEnabled(false);
				this.getView().byId("fin.cash.fa.cash-pool-id").setEnabled(false);
				this.getView().byId("fin.cash.fa.cp-displaycurrency").setEnabled(false);
				if (this.oWnerComponent.sBAHiername !== null) {
					this.getView().byId("fin.cash.fa.bank-account-hierarchy-id").setValue(this.oWnerComponent.sBAHiername);
				}
			}
			if (i === "fin.cash.fa.cp-nvg") {
				this.getView().byId("fin.cash.fa.lhh-nvg").setActiveHandling(false);
				this.getView().byId("fin.cash.fa.bank-account-hierarchy-id").setEnabled(false);
				this.getView().byId("fin.cash.fa.liquidity-item-hierarchy-id").setEnabled(false);
				this.getView().byId("fin.cash.fa.lih-displaycurrency").setEnabled(false);
				this.getView().byId("fin.cash.fa.cash-pool-id").setEnabled(true);
				this.getView().byId("fin.cash.fa.cp-displaycurrency").setEnabled(true);
				if (this.oWnerComponent.sCPName !== null) {
					this.getView().byId("fin.cash.fa.cash-pool-id").setValue(this.oWnerComponent.sCPName);
				}
			}
		},
		onDataRecevied: function (o) {},
		headerFormatter: function (v) {
			if (v === null || v === undefined || v === "") {
				var u = sap.ui.resource("fin.cash.flow.analyzer.i18n", "i18n.properties");
				var o = jQuery.sap.resources({
					url: u
				});
				return o.getText("NotAssign");
			} else {
				return v;
			}
		},
		setEmptyGroupValue: function () {
			this.getView().byId("ACBankAccount").setGroupHeaderFormatter(this.headerFormatter);
		},
		expressBasicCashMsg: function () {},
		onHandleBeforeRebindTable: function (o) {
			this.setEmptyGroupValue();
			this.oSmartFilterBar = this.getView().byId("idsmartFilterBarItem");
			var j = this.oCurrSmartFilterBar.getFilters()[0];
			var k = 0;
			var l = 0;
			if (j) {
				if (j._bMultiFilter === false) {
					if (j.sPath === "DisplayCurrency") {
						k = 10;
					}
				} else {
					var m = j.aFilters;
					for (var i = 0; i < m.length; i++) {
						if (m[i].sPath === "DisplayCurrency") {
							k = 10;
						}
						if (m[i].sPath === "ExRateType") {
							l = 10;
						}
					}
				}
				if (k === 10) {
					this.byId("exRateTypeFilter").setVisibleInAdvancedArea(true);
					j = this.oCurrSmartFilterBar.getFilters()[0];
					if (j._bMultiFilter === true) {
						m = j.aFilters;
						for (i = 0; i < m.length; i++) {
							if (m[i].sPath === "ExRateType") {
								l = 30;
							}
						}
					}
					if (l !== 30) {
						sap.m.MessageBox.show(this.oResourceBundle.getText("ExRTVldt"), {
							icon: sap.m.MessageBox.Icon.ERROR,
							title: this.oResourceBundle.getText("ExRTVldt"),
							actions: [sap.m.MessageBox.Action.OK]
						});
						return;
					}
				}
				var n = this.oCurrSmartFilterBar.getFilterData(true).KeyDate;
				this.refillDaysColumn(n);
				this.loadCycle();
				var b = o.getParameter("bindingParams");
				b.parameters.provideGrandTotals = false;
				var p = this.getView().byId("idCyclePattern").getValue();
				var q = new sap.ui.model.Filter("CyclePattern", sap.ui.model.FilterOperator.EQ, p);
				b.filters.push(q);
				if (this.getView().getModel("Scaling")) {
					q = new sap.ui.model.Filter("ViewType", sap.ui.model.FilterOperator.EQ, parseInt(this.getView().getModel("Scaling").getData().viewType,
						10) + 1);
				}
				b.filters.push(q);
				if (b.parameters.select) {
					this.byId("ACBankAccountName").setInResult(false);
					this.byId("ACCompanyCodeName").setInResult(false);
					var s = b.parameters.select.split(",");
					for (i = 0; i < s.length; i++) {
						if (s[i] === "CompanyCode") {
							this.byId("ACCompanyCodeName").setInResult(true);
						}
						if (s[i] === "BankAccount") {
							this.byId("ACBankAccountName").setInResult(true);
						}
					}
				}
				var r = new sap.ui.generic.app.navigation.service.SelectionVariant(this.oSmartFilterBar.getDataSuiteFormat());
				var t = r.getParameter("ReleaseFlag");
				if (t !== undefined) {
					if (parseInt(t, 10) === 0) {
						var u = new sap.ui.model.Filter("ReleaseStatus", 'EQ', "");
						b.filters.push(u);
					}
				}
				var v = "";
				var w = new sap.ui.model.Filter("ReconcliationStatus", "EQ", "0");
				if (b.filters[0].aFilters) {
					var L = b.filters[0].aFilters.length;
					for (i = 0; i < L; i++) {
						j = b.filters[0].aFilters[i].aFilters;
						if (j) {
							if (j[0].sPath === "ReconcliationStatus") {
								j.push(w);
								v = "X";
							}
						}
					}
				}
				if (v === "") {
					b.filters.push(w);
				}
				var x = this.getView().byId("idHistoricalTimeStamp").getDateValue();
				if (x === undefined || x === "" || x === null) {
					x = this.util.formatUTCDateString(new Date());
				} else {
					x = this.util.formatUTCDateString(x);
				}
				q = new sap.ui.model.Filter("HistoricalTimeStamp", sap.ui.model.FilterOperator.EQ, x);
				b.filters.push(q);
				if (this.getView().getModel("Scaling")) {
					q = new sap.ui.model.Filter("ISBANKCURRENCY", sap.ui.model.FilterOperator.EQ, this.getView().getModel("Scaling").getData().isBankCurrency);
					b.filters.push(q);
					q = new sap.ui.model.Filter("Calendar", sap.ui.model.FilterOperator.EQ, (this.getView().getModel("Scaling").getData().factoryCalendarId) ?
						(this.getView().getModel("Scaling").getData().factoryCalendarId) : "*");
					b.filters.push(q);
					q = new sap.ui.model.Filter("PreviousFlag", sap.ui.model.FilterOperator.EQ, (this.getView().getModel("Scaling").getData().previousFlag) ?
						(this.getView().getModel("Scaling").getData().previousFlag) : "0");
					b.filters.push(q);
				} else {
					q = new sap.ui.model.Filter("ISBANKCURRENCY", sap.ui.model.FilterOperator.EQ, "");
					b.filters.push(q);
					q = new sap.ui.model.Filter("Calendar", sap.ui.model.FilterOperator.EQ, "*");
					b.filters.push(q);
					q = new sap.ui.model.Filter("PreviousFlag", sap.ui.model.FilterOperator.EQ, "0");
					b.filters.push(q);
				}
				var y = this.getView().byId("idDateIndicator").getSelectedKey();
				if (this.util.isNull(y)) {
					b.filters.push(new sap.ui.model.Filter("DateIndicator", "EQ", "1"));
				} else {
					var z = new sap.ui.model.Filter("DateIndicator", 'EQ', y);
					b.filters.push(z);
				}
				if (!this.getView().byId("ViewTypeExt").getVisible()) {
					this.getView().byId("Direction").setInResult(false);
				} else {
					this.getView().byId("Direction").setInResult(true);
				}
				if (!this.getView().byId("ACBank").getVisible()) {
					this.getView().byId("ACBankCountry").setInResult(false);
				} else {
					this.getView().byId("ACBankCountry").setInResult(true);
				}
				if (!this.getView().byId("ACBankAccount").getVisible()) {
					this.getView().byId("ACAccId").setInResult(false);
				} else {
					this.getView().byId("ACAccId").setInResult(true);
				}
				var G = this.oCurrSmartFilterBar.getFilterData(true).EndofPeriod;
				var I;
				if (this.getView().getModel("Scaling")) {
					I = this.getView().getModel("Scaling").getData().factoryCalendarId;
				}
				if (G || I !== "*") {
					this.getView().byId("btnPreviousCycle").setEnabled(false);
				} else {
					this.getView().byId("btnPreviousCycle").setEnabled(true);
				}
			}
		},
		refillDaysColumn: function (o) {
			var b = o;
			if (!b) {
				b = this.util.convertABAPDateToDate("20160111");
			}
			var v = this.getView().byId("idCyclePattern").getValue();
			if (v === "" && this.bIsSaveAsTile) {
				v = "D7";
			}
			if (v) {
				var k = v.split("+");
			}
			var l = 0;
			var p = "CYCLE" + "0" + JSON.stringify(l);
			this.setVisible(p, true);
			l = l + 1;
			for (var i = 0; i < k.length; i++) {
				switch (k[i].substr(0, 1)) {
				case 'D':
					var m = parseInt(k[i].substr(1), 10);
					for (var j = 0; j < m; j++) {
						if (l <= 9) {
							p = "CYCLE" + "0" + JSON.stringify(l);
						} else {
							p = "CYCLE" + JSON.stringify(l);
						}
						this.setVisible(p, true);
						l = l + 1;
					}
					break;
				case 'W':
					m = parseInt(k[i].substr(1), 10);
					for (j = 0; j < m; j++) {
						if (l <= 9) {
							p = "CYCLE" + "0" + JSON.stringify(l);
						} else {
							p = "CYCLE" + JSON.stringify(l);
						}
						this.setVisible(p, true);
						l = l + 1;
					}
					break;
				case 'Y':
					m = parseInt(k[i].substr(1), 10);
					for (j = 0; j < m; j++) {
						if (l <= 9) {
							p = "CYCLE" + "0" + JSON.stringify(l);
						} else {
							p = "CYCLE" + JSON.stringify(l);
						}
						this.setVisible(p, true);
						l = l + 1;
					}
					break;
				case 'Q':
					m = parseInt(k[i].substr(1), 10);
					for (j = 0; j < m; j++) {
						if (l <= 9) {
							p = "CYCLE" + "0" + JSON.stringify(l);
						} else {
							p = "CYCLE" + JSON.stringify(l);
						}
						this.setVisible(p, true);
						l = l + 1;
					}
					break;
				case 'M':
					m = parseInt(k[i].substr(1), 10);
					for (j = 0; j < m; j++) {
						if (l <= 9) {
							p = "CYCLE" + "0" + JSON.stringify(l);
						} else {
							p = "CYCLE" + JSON.stringify(l);
						}
						this.setVisible(p, true);
						l = l + 1;
					}
					break;
				default:
				}
			}
			if (l <= 9) {
				p = "CYCLE" + "0" + JSON.stringify(l);
			} else {
				p = "CYCLE" + JSON.stringify(l);
			}
			this.setVisible(p, true);
			l = l + 1;
			for (j = l; j < 33; j++) {
				if (j <= 9) {
					p = "CYCLE" + "0" + JSON.stringify(j);
				} else {
					p = "CYCLE" + JSON.stringify(j);
				}
				this.setVisible(p, false);
			}
		},
		checkDisplayCurrencyHasBeenSelected: function () {
			var b = false;
			var j = this.oCurrSmartFilterBar.getFilters()[0];
			if (j._bMultiFilter === false) {
				if (j.sPath === "DisplayCurrency") {
					return true;
				} else {
					return false;
				}
			} else {
				var k = j.aFilters;
				for (var i = 0; i < k.length; i++) {
					if (k[i].sPath === "DisplayCurrency") {
						return true;
					}
				}
			}
			return b;
		},
		setVisible: function (p, i) {
			if (i === true) {
				if (this.checkDisplayCurrencyHasBeenSelected()) {
					this.byId("D" + p).setVisible(true);
					this.byId("B" + p).setVisible(true);
				} else {
					this.byId("D" + p).setVisible(false);
					this.byId("B" + p).setVisible(true);
				}
			} else {
				this.byId("D" + p).setVisible(false);
				this.byId("B" + p).setVisible(false);
			}
		},
		isNull: function (v) {
			if (v === undefined || v === "" || v === null) {
				return true;
			}
			return false;
		},
		loadCycle: function () {
			var p = "/FCLM_CFBA_CYCLE_VIEWSet";
			var s = this.getView().byId("idCyclePattern").getValue();
			var k = this.oCurrSmartFilterBar.getFilterData(true).KeyDate;
			var b = [];
			var o = null;
			var t = this.util.switchLocaltoUTC(k);
			if (k) {
				o = new sap.ui.model.Filter("KeyDate", "EQ", t);
			} else {
				o = new sap.ui.model.Filter("KeyDate", "EQ", "datetime'2014-04-11T00:00:00'");
			}
			b.push(o);
			if (s) {
				o = new sap.ui.model.Filter("CyclePattern", "EQ", s);
			} else {
				o = new sap.ui.model.Filter("CyclePattern", "EQ", "D7");
			}
			b.push(o);
			o = new sap.ui.model.Filter("EndofPeriod", "EQ", (this.oCurrSmartFilterBar.getFilterData(true).EndofPeriod) ? (this.oCurrSmartFilterBar
				.getFilterData(true).EndofPeriod) : "");
			b.push(o);
			if (this.getView().getModel("Scaling")) {
				o = new sap.ui.model.Filter("Calendar", "EQ", (this.getView().getModel("Scaling").getData().factoryCalendarId) ? this.getView().getModel(
					"Scaling").getData().factoryCalendarId : "*");
				b.push(o);
				o = new sap.ui.model.Filter("PreviousFlag", "EQ", (this.getView().getModel("Scaling").getData().previousFlag) ? this.getView().getModel(
					"Scaling").getData().previousFlag : "0");
				b.push(o);
			} else {
				o = new sap.ui.model.Filter("Calendar", "EQ", "*");
				b.push(o);
				o = new sap.ui.model.Filter("PreviousFlag", "EQ", "0");
				b.push(o);
			}
			var m = this.oDataModel;
			if (m) {
				m.read(p, {
					async: false,
					groupid: "1",
					filters: b,
					success: $.proxy(this.handleCycleDataReady, this),
					error: $.proxy(this.handleCycleDataFailed, this)
				});
			}
		},
		handleCycleDataReady: function (o) {
			this.oCycleData = {
				"results": []
			};
			for (var i = 0; i < o["results"].length; i++) {
				var b = {
					REP_CYCLE_KEY: o["results"][i].CycleKey,
					CYCLE_TYPE: o["results"][i].CycleType,
					REP_DATE_F: this.util.switchUTCtoLocal(o["results"][i].DisplayDateFrom),
					REP_DATE_T: this.util.switchUTCtoLocal(o["results"][i].DisplayDateTo),
					REP_DATE_ACTUAL_F: this.util.switchUTCtoLocal(o["results"][i].DateFrom),
					REP_DATE_ACTUAL_T: this.util.switchUTCtoLocal(o["results"][i].DateTo)
				};
				this.oCycleData["results"].push(b);
			}
			this.fillAmountlabel();
		},
		handleCycleDataFailed: function (b) {},
		fillAmountlabel: function () {
			var o = [];
			for (var i = 0; i < this.oCycleData["results"].length; i++) {
				var p = this.oCycleData["results"][i];
				var s = "";
				var t = "";
				var b = "";
				var k = {
					field: "",
					from: "",
					to: ""
				};
				switch (p.CYCLE_TYPE) {
				case 'D':
					s = this.util.dateFormat(p.REP_DATE_F);
					t = this.util.dateFormat(p.REP_DATE_ACTUAL_F) + "~" + this.util.dateFormat(p.REP_DATE_ACTUAL_T);
					break;
				case 'M':
					s = this.util.getMonth(p.REP_DATE_F.getMonth() + 1).toString() + ", " + p.REP_DATE_F.getFullYear().toString();
					t = this.util.dateFormat(p.REP_DATE_ACTUAL_F) + "~" + this.util.dateFormat(p.REP_DATE_ACTUAL_T);
					break;
				case 'W':
					s = this.oResourceBundle.getText("Week") + this.util.getWeekNum(p.REP_DATE_F).toString() + ", " + p.REP_DATE_F.getFullYear().toString();
					t = this.util.dateFormat(p.REP_DATE_ACTUAL_F) + "~" + this.util.dateFormat(p.REP_DATE_ACTUAL_T);
					break;
				case 'Q':
					s = this.util.getQuarter(p.REP_DATE_F.getMonth() + 1).toString() + ", " + p.REP_DATE_F.getFullYear().toString();
					t = this.util.dateFormat(p.REP_DATE_ACTUAL_F) + "~" + this.util.dateFormat(p.REP_DATE_ACTUAL_T);
					break;
				case 'Y':
					s = p.REP_DATE_F.getFullYear().toString();
					t = this.util.dateFormat(p.REP_DATE_ACTUAL_F) + "~" + this.util.dateFormat(p.REP_DATE_ACTUAL_T);
					break;
				case 'A':
					s = this.oResourceBundle.getText("FUTURE");
					t = this.util.dateFormat(p.REP_DATE_ACTUAL_F) + "~" + this.util.dateFormat(p.REP_DATE_ACTUAL_T);
					break;
				case 'B':
					s = this.oResourceBundle.getText("OVERDUE");
					t = this.util.dateFormat(p.REP_DATE_ACTUAL_F) + "~" + this.util.dateFormat(p.REP_DATE_ACTUAL_T);
					k.field = "OverDue";
					break;
				}
				if (k.field !== "OverDue") {
					k.field = p.REP_CYCLE_KEY;
					var l = k.field.split("CYCLE")[1];
					var m = parseInt(l, 10);
					if (m >= 0) {
						k.field = "Data" + m.toString();
					} else {
						k.field = "OverDue";
					}
				}
				k.from = p.REP_DATE_ACTUAL_F;
				k.to = p.REP_DATE_ACTUAL_T;
				o.push(k);
				var n = new sap.m.Label({
					text: s,
					textAlign: "Center"
				});
				n.setTooltip(t);
				if (b !== "") {
					n.addStyleClass(b);
				}
				if (!this.checkDisplayCurrencyHasBeenSelected()) {
					this.byId("D" + p.REP_CYCLE_KEY).removeAllMultiLabels();
					this.byId("D" + p.REP_CYCLE_KEY).insertMultiLabel(n, 1);
					this.byId("B" + p.REP_CYCLE_KEY).removeAllMultiLabels();
					this.byId("B" + p.REP_CYCLE_KEY).insertMultiLabel(n, 1);
				} else {
					var q = new sap.m.Label({
						text: s,
						textAlign: "Center"
					});
					q.setTooltip(this.oResourceBundle.getText(t + "DisplayCurrency"));
					if (b !== "") {
						q.addStyleClass(b);
					}
					this.byId("D" + p.REP_CYCLE_KEY).removeAllMultiLabels();
					this.byId("D" + p.REP_CYCLE_KEY).insertMultiLabel(q, 1);
					this.byId("DL" + p.REP_CYCLE_KEY).setText(s);
					this.byId("B" + p.REP_CYCLE_KEY).removeAllMultiLabels();
					this.byId("B" + p.REP_CYCLE_KEY).insertMultiLabel(n, 1);
					this.byId("BL" + p.REP_CYCLE_KEY).setText(s);
				}
			}
			var r = new J(o);
			this.getView().setModel(r, "FieldMapping");
			if (this.oCycleData["results"].length > 0) {
				for (var j = this.oCycleData["results"].length; j < 33; j++) {
					if (this.oCurrSmartFilterBar.getFilterData(true).DisplayCurrency) {
						if (j <= 9) {
							var I = "DCYCLE" + "0" + JSON.stringify(j);
						} else {
							I = "DCYCLE" + JSON.stringify(j);
						}
						this.byId(I).setVisible(false);
						this.byId("DL" + p.REP_CYCLE_KEY).setText(this.oResourceBundle.getText("Amount"));
					} else {
						if (j <= 9) {
							I = "BCYCLE" + "0" + JSON.stringify(j);
						} else {
							I = "BCYCLE" + JSON.stringify(j);
						}
						this.byId(I).setVisible(false);
						this.byId("BL" + p.REP_CYCLE_KEY).setText(this.oResourceBundle.getText("Amount"));
					}
				}
			}
		},
		handlePopOverOpens: function (o) {
			this.oNav.onBeforePopoverOpens(o, this);
		},
		onNavTargetsObtained: function (o) {
			this.oNav.onTargetObtained(o, this);
		},
		onTargetObtained: function (o) {
			this.oNav.onTargetObtained(o, this);
		},
		handlePopOverOpensBACC: function (o) {
			this.oNav.onBeforePopoverOpensBACC(o, this);
		},
		onNavTargetsObtainedBACC: function (o) {
			this.oNav.onTargetObtainedBACC(o, this);
		},
		onTargetObtainedBACC: function (o) {
			this.oNav.onTargetObtainedBACC(o, this);
		},
		handlePopOverOpensBANK: function (o) {
			this.oNav.onBeforePopoverOpensBANK(o, this);
		},
		onNavTargetsObtainedBANK: function (o) {
			this.oNav.onTargetObtainedBANK(o, this);
		},
		onTargetObtainedBANK: function (o) {
			this.oNav.onTargetObtainedBANK(o, this);
		},
		onHandleCloseForHDC: function (o) {
			var b = o.getParameter("selectedContexts");
			var m = this.oResourceBundle.getText("MSGDC");
			if (this.getView().byId("fin.cash.fa.lhh-nvg").getSelected() === true) {
				if (b.length) {
					this.oWnerComponent.sLQHDSPCRCY = b.map(function (i) {
						return i.getObject().WAERS;
					}).join(", ");
					sap.m.MessageToast.show(m + this.oWnerComponent.sLQHDSPCRCY);
				}
				o.getSource().getBinding("items").filter([]);
				if (this.oWnerComponent.sLQHDSPCRCY !== null) {
					this.getView().byId("fin.cash.fa.lih-displaycurrency").setValue(this.oWnerComponent.sLQHDSPCRCY);
				}
			}
			if (this.getView().byId("fin.cash.fa.bah-nvg").getSelected() === true) {
				if (b.length) {
					this.oWnerComponent.sBAHDSPCRCY = b.map(function (i) {
						return i.getObject().WAERS;
					}).join(", ");
					sap.m.MessageToast.show(m + this.oWnerComponent.sBAHDSPCRCY);
				}
				o.getSource().getBinding("items").filter([]);
				if (this.oWnerComponent.sBAHDSPCRCY !== null) {
					this.getView().byId("fin.cash.fa.bah-displaycurrency").setValue(this.oWnerComponent.sBAHDSPCRCY);
				}
			}
			if (this.getView().byId("fin.cash.fa.cp-nvg").getSelected() === true) {
				if (b.length) {
					this.oWnerComponent.sCPDSPCRCY = b.map(function (i) {
						return i.getObject().WAERS;
					}).join(", ");
					sap.m.MessageToast.show(m + this.oWnerComponent.sCPDSPCRCY);
				}
				o.getSource().getBinding("items").filter([]);
				if (this.oWnerComponent.sCPDSPCRCY !== null) {
					this.getView().byId("fin.cash.fa.cp-displaycurrency").setValue(this.oWnerComponent.sCPDSPCRCY);
				}
			}
		},
		onPopoverLinkPressed: function (o) {
			this.oNav.onPopoverLinkPressed(o, this);
		},
		saveAppState: function () {
			this.oInnerAppData = {
				selectionVariant: this.oCurrSmartFilterBar.getDataSuiteFormat(),
				tableVariantId: this.oCurrSmartTable.getCurrentVariantId()
			};
			this.oStoreInnerAppStatePromise = this.oNavigationHandler.storeInnerAppState(this.oInnerAppData);
			this.oStoreInnerAppStatePromise.done(function () {});
			this.oStoreInnerAppStatePromise.fail(function (o) {
				var b = this.getView().getModel("i18n").getResourceBundle();
				o.setUIText({
					oi18n: b,
					sTextKey: "STORE_ERROR"
				});
				o.showMessageBox();
			});
		},
		validateCyclePattern: function (o) {
			var b = this.getView().byId("idCyclePattern");
			var s = b.getValue().toUpperCase();
			this.getView().byId("idCyclePattern").setValue(s);
			var l = 0;
			var r = new RegExp("^([D,W,M,Q,Y]([1-9]|([1-2][0-9])|(3[0-1])))$");
			var j = [];
			b.setValueState("None");
			if (s) {
				var k = s.split("+");
				for (var i = 0; i < k.length; i++) {
					if (r.test(k[i]) === false) {
						b.setValueState("Error");
						return;
					}
					l = l + (parseInt(k[i].substr(1, 2), 10));
				}
			}
			if (l > 31) {
				b.setValueState("Error");
			}
		},
		storeCurrentAppState: function () {
			var o = this.oNavigationHandler.storeInnerAppState(this.getCurrentAppState());
			var t = this;
			o.fail(function (b) {
				t.arOwnerFilters(b);
			});
		},
		getCurrentAppState: function () {
			var s = new S(this.oSmartFilterBar.getDataSuiteFormat());
			s.removeParameter("CyclePattern");
			s.addSelectOption("CyclePattern", "I", "EQ", this.getView().byId("idCyclePattern").getValue());
			s.removeParameter("HistoricalTimeStamp");
			var b = this.getView().byId("idHistoricalTimeStamp").getDateValue();
			s.addSelectOption("HistoricalTimeStamp", "I", "EQ", b.toJSON());
			s.removeParameter("DateIndicator");
			s.addSelectOption("DateIndicator", "I", "EQ", this.getView().byId("idDateIndicator").getSelectedKey());
			return {
				selectionVariant: s.toJSONString()
			};
		},
		getCustomAppStateData: function () {
			var b = {
				CyclePattern: this.oCurrSmartFilterBar.getControlByKey("CyclePattern").getValue()
			};
			return b;
		},
		prefetchDone: function (o) {},
		onSettingForBankAccountView: function (o) {
			if (!this._oPopover) {
				this._oPopover = sap.ui.xmlfragment(this.getView().getId(), "fin.cash.flow.analyzer.view.fragment.DisplaySelectionPopover", this);
				this.getView().addDependent(this._oPopover);
				var b = function (j) {
					var k = 0;
					k = (this.getView().getModel("Scaling").getData().viewType) ? (this.getView().getModel("Scaling").getData().viewType) : 0;
					var r = this.getView().byId("rbg-viewType");
					r.setSelectedIndex(parseInt(k, 10));
					if (k === 0) {
						this._oPopover.setInitialFocus("rb-cdisplay");
					} else if (k === 1) {
						this._oPopover.setInitialFocus("rb-ddisplay");
					}
				};
				this._oPopover.attachBeforeOpen($.proxy(b, this));
			}
			var i = o.getSource();
			jQuery.sap.delayedCall(0, this, function () {
				this._oPopover.openBy(i);
			});
		},
		onPopOK: function (o) {
			this._oPopover.close();
			var m = this.getView().getModel("Scaling").getData();
			m.viewType = this.getView().byId("rbg-viewType").getSelectedIndex();
			var j = new J(m);
			this.getView().setModel(j, "Scaling");
			this.oCurrSmartTable.rebindTable(true);
		},
		onPopCancel: function (o) {
			this._oPopover.close();
		},
		onBeforeRendering: function () {
			var s = "sapUiSizeCozy",
				b = "sapUiSizeCompact",
				i = "sapUiSizeCondensed";
			if (jQuery(document.body).hasClass(b) || this.getOwnerComponent().getContentDensityClass() === b) {
				this.oCurrSmartTable.addStyleClass(i);
			} else if (jQuery(document.body).hasClass(s) || this.getOwnerComponent().getContentDensityClass() === s) {
				this.oCurrSmartTable.addStyleClass(s);
			}
		},
		onOK: function (o) {
			this.oCurrSmartTable.rebindTable(true);
		},
		onCancel: function (o) {
			this.oCurrSmartTable.rebindTable(false);
		},
		onHandleSearchForHDC: function (o) {
			var b = [];
			var v = o.getParameter("value");
			var i = new sap.ui.model.Filter("WAERS", sap.ui.model.FilterOperator.Contains, v);
			b.push(i);
			var j = o.getSource().getBinding("items");
			j.filter(b);
		},
		onHandleSearchForCAL: function (o) {
			var b = [];
			var v = o.getParameter("value");
			var i = new sap.ui.model.Filter("IDENT", sap.ui.model.FilterOperator.Contains, v);
			b.push(i);
			var j = o.getSource().getBinding("items");
			j.filter(b);
		},
		onNextCycle: function () {
			this.onCalculateValueDate(true);
		},
		onPreviousCycle: function () {
			this.onCalculateValueDate(false);
		},
		onCalculateValueDate: function (s) {
			var t = this.getView().byId("idCyclePattern").getValue();
			var b = this.getView().byId("idHistoricalTimeStamp").getDateValue();
			var j = this.oCurrSmartFilterBar.getFilterData(true).EndofPeriod;
			var k = this.getView().getModel("Scaling").getData().factoryCalendarId;
			if (j === "X" || k !== "*") {
				var o = this.getView().getModel("FieldMapping").oData;
				var v = new Date(o[o.length - 1].from);
			} else {
				v = new Date(this.oCurrSmartFilterBar.getFilterData().KeyDate);
				var l = t.split('+');
				for (var i = 0; i < l.length; i++) {
					if (l[i][0] === 'Y') {
						var y = parseInt(l[i].substring(1, l[i].length, 10), 10);
						if (s === false) {
							v = new Date(v.setFullYear(v.getFullYear() - y));
						} else {
							v = new Date(v.setFullYear(v.getFullYear() + y));
						}
					} else if (l[i][0] === 'Q') {
						var m = parseInt(l[i].substring(1, l[i].length), 10) * 3;
						if (s === false) {
							v = new Date(v.setMonth(v.getMonth() - m));
						} else {
							v = new Date(v.setMonth(v.getMonth() + m));
						}
					} else if (l[i][0] === 'M') {
						m = parseInt(l[i].substring(1, l[i].length), 10);
						if (s === false) {
							v = new Date(v.setMonth(v.getMonth() - m));
						} else {
							v = new Date(v.setMonth(v.getMonth() + m));
						}
					} else if (l[i][0] === 'W') {
						var n = parseInt(l[i].substring(1, l[i].length), 10) * 7;
						if (s === false) {
							v = new Date(v.setDate(v.getDate() - n));
						} else {
							v = new Date(v.setDate(v.getDate() + n));
						}
					} else if (l[i][0] === 'D') {
						n = parseInt(l[i].substring(1, l[i].length), 10);
						if (s === false) {
							v = new Date(v.setDate(v.getDate() - n));
						} else {
							v = new Date(v.setDate(v.getDate() + n));
						}
					}
				}
			}
			this.onHanldeCycle(v, t, b);
		},
		onHanldeCycle: function (v, t, s) {
			var o = new sap.ui.generic.app.navigation.service.SelectionVariant(this.oCurrSmartFilterBar.getDataSuiteFormat());
			if (v) {
				v.toJSON = this.util.convertDateTimeToABAPDateTime;
			}
			var V = v;
			o.removeSelectOption("KeyDate");
			o.removeSelectOption("CyclePattern");
			o.removeSelectOption("HistoricalTimeStamp");
			o.removeParameter("KeyDate");
			o.removeParameter("CyclePattern");
			o.removeParameter("HistoricalTimeStamp");
			o.addSelectOption("KeyDate", "I", "EQ", V.toJSON());
			o.addSelectOption("CyclePattern", "I", "EQ", t);
			var T;
			if (this.util.isNull(s)) {
				T = this.util.getHistoryDateTimeDefault();
			} else {
				T = s;
			}
			o.addSelectOption("HistoricalTimeStamp", "I", "EQ", T.toJSON());
			this.oCurrSmartFilterBar.setDataSuiteFormat(o.toJSONString(), true);
			this.oCurrSmartTable.rebindTable(true);
		},
		handleCrossNav: function (o, u) {
			var s = this.util.getValueDateDefault();
			var t = "D7";
			var b = this.util.getHistoryDateTimeDefault();
			if (this.getView().getViewName() === "fin.cash.flow.analyzer.view.Worklist_D") {
				this.onCycleHandle(this.getView().byId("idCyclePattern"));
				this.oSelectVariants = new sap.ui.generic.app.navigation.service.SelectionVariant(o.selectionVariant);
				this.setVisibleforFilter(this.oSelectVariants);
			} else {
				if (o.bNavSelVarHasDefaultsOnly === false) {
					this.oSelectVariants = new sap.ui.generic.app.navigation.service.SelectionVariant(o.selectionVariant);
					this.oSelectVariants.addSelectOption("KeyDate", "I", "EQ", s);
					this.oSelectVariants.addSelectOption("CyclePattern", "I", "EQ", t);
					this.oSelectVariants.addSelectOption("ReleaseFlag", "I", "EQ", "0");
					this.getView().byId("idCyclePattern").setValue(t);
					this.oSelectVariants.addSelectOption("HistoricalTimeStamp", "I", "EQ", b.toJSON());
					this.getView().byId("idHistoricalTimeStamp").setDateValue(b);
					this.oSelectVariants.addSelectOption("ReconcliationStatus", "I", "EQ", "3");
					this.oSelectVariants.addSelectOption("ReconcliationStatus", "I", "EQ", "4");
					this.oSelectVariants.addSelectOption("DateIndicator", "I", "EQ", "1");
					if (this.oSelectVariants.getSelectOption("P_DisplayCurrency")) {
						this.oSelectVariants.renameSelectOption("P_DisplayCurrency", "DisplayCurrency");
					}
					if (this.oSelectVariants.getSelectOption("P_ExchangeRateType")) {
						this.oSelectVariants.renameSelectOption("P_ExchangeRateType", "ExRateType");
					}
					if (this.oSelectVariants.getSelectOption("Currency")) {
						this.oSelectVariants.renameSelectOption("Currency", "BankAccountCurrency");
					}
					if (this.oSelectVariants.getSelectOption("BankHeadquarter")) {
						this.oSelectVariants.renameSelectOption("BankHeadquarter", "BankGroup");
					}
					if (this.oSelectVariants.getSelectOption("AccountingDocumentType")) {
						this.oSelectVariants.renameSelectOption("AccountingDocumentType", "FiDocumentType");
					}
					this.oCurrSmartFilterBar.setDataSuiteFormat(this.oSelectVariants.toJSONString(), true);
					this.setVisibleforFilter(this.oSelectVariants);
				}
				if ((o.bNavSelVarHasDefaultsOnly === true || o.bNavSelVarHasDefaultsOnly === undefined) && this.oCurrSmartFilterBar.getCurrentVariantId() !==
					"") {}
				if ((o.bNavSelVarHasDefaultsOnly === true || o.bNavSelVarHasDefaultsOnly === undefined) && this.oCurrSmartFilterBar.getCurrentVariantId() ===
					"") {
					this.oSelectVariants = new sap.ui.generic.app.navigation.service.SelectionVariant(o.selectionVariant);
					this.oSelectVariants.addSelectOption("KeyDate", "I", "EQ", s);
					this.oSelectVariants.addSelectOption("CyclePattern", "I", "EQ", t);
					this.getView().byId("idCyclePattern").setValue(t);
					this.oSelectVariants.addSelectOption("ReleaseFlag", "I", "EQ", "0");
					this.oSelectVariants.addSelectOption("HistoricalTimeStamp", "I", "EQ", b.toJSON());
					this.getView().byId("idHistoricalTimeStamp").setDateValue(b);
					this.oSelectVariants.addSelectOption("ReconcliationStatus", "I", "EQ", "3");
					this.oSelectVariants.addSelectOption("ReconcliationStatus", "I", "EQ", "4");
					this.oSelectVariants.addSelectOption("DateIndicator", "I", "EQ", "1");
					if (this.oSelectVariants.getSelectOption("DisplayCurrency")) {
						this.oSelectVariants.addSelectOption("ExRateType", "I", "EQ", "M");
					}
					if (this.oSelectVariants.getSelectOption("Currency")) {
						this.oSelectVariants.renameSelectOption("Currency", "BankAccountCurrency");
					}
					if (this.oSelectVariants.getSelectOption("BankHeadquarter")) {
						this.oSelectVariants.renameSelectOption("BankHeadquarter", "BankGroup");
					}
					if (this.oSelectVariants.getSelectOption("AccountingDocumentType")) {
						this.oSelectVariants.renameSelectOption("AccountingDocumentType", "FiDocumentType");
					}
					this.oCurrSmartFilterBar.setDataSuiteFormat(this.oSelectVariants.toJSONString(), true);
					this.setVisibleforFilter(this.oSelectVariants);
				}
			}
		},
		setVisibleforFilter: function (s) {
			if (s.getSelectOption("Bank")) {
				this.byId("FBBank").setVisibleInAdvancedArea(true);
			}
			if (s.getSelectOption("BankCountry")) {
				this.byId("FBBankCountry").setVisibleInAdvancedArea(true);
			}
			if (s.getSelectOption("DisplayCurrency")) {
				this.byId("FBDisplayCurrency").setVisibleInAdvancedArea(true);
			}
			if (s.getSelectOption("BankGroup")) {
				this.byId("FBBankGroup").setVisibleInAdvancedArea(true);
			}
			if (s.getSelectOption("CertaintyLevel")) {
				this.byId("FBCertaintyLevel").setVisibleInAdvancedArea(true);
			}
		},
		getForecastCertaintyLevelList: function () {
			return ["SI_CIT", "TRM_D", "REC_N", "PAY_N", "TRM_O", "CMIDOC", "FICA", "SDSO", "MEMO", "MMPO", "MMPR", "MMSA", "SDSA", "PAYRQ",
				"PYORD", "FIP2P", "LEASE", "PARKED"
			];
		},
		hasValidForecastCertaintyLevelSelected: function (s) {
			var b = this.getForecastCertaintyLevelList();
			for (var i = 0; i < s.length; i++) {
				if (b.includes(s[i])) {
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
		},
		onHandleBeforeExport: function (o) {
			var w = o.getParameters().exportSettings.workbook;
			var j = 0,
				i = 0,
				k = 0;
			for (j = 0; j < w.columns.length; j++) {
				var b = w.columns[j].property;
				if (b.includes("Data")) {
					for (i = k; i < this.oCurrSmartTable.getTable().getColumns().length; i++) {
						var p = this.oCurrSmartTable.getTable().getColumns()[i].getLeadingProperty();
						if (w.columns[j].property === p) {
							k = i;
							break;
						}
					}
					w.columns[j].label = this.oCurrSmartTable.getTable().getColumns()[i].getMultiLabels()[0].getText();
				}
			}
			o.getParameters().exportSettings.workbook = w;
		}
	});
});