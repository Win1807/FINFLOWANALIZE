/*
 * Copyright (C) 2009-2019 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["sap/ui/model/json/JSONModel", "fin/cash/flow/analyzer/model/formatter", "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator", "sap/ui/core/routing/History", "sap/ui/generic/app/navigation/service/SelectionVariant",
	"sap/ui/generic/app/navigation/service/NavigationHandler", "fin/cash/flow/analyzer/util/Conversions",
	"fin/cash/flow/analyzer/util/StringUtil", "sap/suite/ui/commons/util/DateUtils", "fin/cash/flow/analyzer/util/Formatter"
], function () {
	"use strict";
	return {
		onCalculateValueDate: function (s, t) {
			var T = "";
			switch (t.getView().getViewName()) {
			case "fin.cash.flow.analyzer.view.LiquidityItemHierarchy":
				T = t.getView().byId("idCyclePatternForLQ").getValue();
				break;
			case "fin.cash.flow.analyzer.view.BankAccountHierarchy":
				T = t.getView().byId("idCyclePatternForBA").getValue();
				break;
			default:
				T = t.getView().byId("idCyclePattern").getValue();
				break;
			}
			var e = t.oCurrSmartFilterBar.getFilterData(true).EndofPeriod;
			var c = t.getView().getModel("Scaling").getData().factoryCalendarId;
			if (e === "X" || c !== "*") {
				var f = t.getView().getModel("FieldMapping").oData;
				var v = new Date(f[f.length - 1].from);
				v = new Date(v.setDate(v.getDate() + 1));
			} else {
				var v = new Date(t.oCurrSmartFilterBar.getFilterData().KeyDate);
				var C = T.split('+');
				for (var i = 0; i < C.length; i++) {
					if (C[i][0] === 'Y') {
						var y = parseInt(C[i].substring(1, C[i].length));
						if (s === false) {
							v = new Date(v.setFullYear(v.getFullYear() - y));
						} else {
							v = new Date(v.setFullYear(v.getFullYear() + y));
						}
					} else if (C[i][0] === 'Q') {
						var m = parseInt(C[i].substring(1, C[i].length)) * 3;
						if (s === false) {
							v = new Date(v.setMonth(v.getMonth() - m));
						} else {
							v = new Date(v.setMonth(v.getMonth() + m));
						}
					} else if (C[i][0] === 'M') {
						var m = parseInt(C[i].substring(1, C[i].length));
						if (s === false) {
							v = new Date(v.setMonth(v.getMonth() - m));
						} else {
							v = new Date(v.setMonth(v.getMonth() + m));
						}
					} else if (C[i][0] === 'W') {
						var d = parseInt(C[i].substring(1, C[i].length)) * 7;
						if (s === false) {
							v = new Date(v.setDate(v.getDate() - d));
						} else {
							v = new Date(v.setDate(v.getDate() + d));
						}
					} else if (C[i][0] === 'D') {
						var d = parseInt(C[i].substring(1, C[i].length));
						if (s === false) {
							v = new Date(v.setDate(v.getDate() - d));
						} else {
							v = new Date(v.setDate(v.getDate() + d));
						}
					}
				}
			}
			this.onHanldeCycle(v, T, t);
		},
		onHanldeCycle: function (v, t, a) {
			switch (a.getView().getViewName()) {
			case "fin.cash.flow.analyzer.view.LiquidityItemHierarchy":
				var s = new sap.ui.generic.app.navigation.service.SelectionVariant(a.oCurrSmartFilterBar.getDataSuiteFormat());
				var V = v;
				s.removeSelectOption("KeyDate");
				s.removeSelectOption("CyclePattern");
				s.removeParameter("KeyDate");
				s.removeParameter("CyclePattern");
				s.addSelectOption("KeyDate", "I", "EQ", V.toJSON());
				s.addSelectOption("CyclePattern", "I", "EQ", t);
				if (s.getParameter("BankAccountGroup") === undefined) {
					s.addParameter("FromMainView", "X");
				}
				var f = JSON.parse(a.aDrilldownfilter);
				for (var i = 0; i < f.SelectOptions.length; i++) {
					if (f.SelectOptions[i].PropertyName === "SortOrder") {
						s.addSelectOption("SortOrder", "I", "EQ", f.SelectOptions[i].Ranges[0].Low + "%");
					}
				}
				var n = {
					oDrilldownfilter: s.toJSONString()
				};
				var r = true;
				var b = "LiquidityItemHierarchy";
				a.getRouter().navTo(b, {
					Params: JSON.stringify(n).toBase64URI()
				}, r);
				a.aDrilldownfilter = n.oDrilldownfilter;
				break;
			case "fin.cash.flow.analyzer.view.BankAccountHierarchy":
				var s = new sap.ui.generic.app.navigation.service.SelectionVariant(a.oCurrSmartFilterBar.getDataSuiteFormat());
				var V = v;
				s.removeSelectOption("KeyDate");
				s.removeSelectOption("CyclePattern");
				s.removeParameter("KeyDate");
				s.removeParameter("CyclePattern");
				s.addSelectOption("KeyDate", "I", "EQ", V.toJSON());
				s.addSelectOption("CyclePattern", "I", "EQ", t);
				var n = {
					oDrilldownfilter: s.toJSONString()
				};
				var r = true;
				var b = "BankAccountHierarchy";
				a.getRouter().navTo(b, {
					Params: JSON.stringify(n).toBase64URI()
				}, r);
				a.aDrilldownfilter = n.oDrilldownfilter;
				break;
			default:
				var s = new sap.ui.generic.app.navigation.service.SelectionVariant(a.oCurrSmartFilterBar.getDataSuiteFormat());
				var V = v;
				s.removeSelectOption("KeyDate");
				s.removeSelectOption("CyclePattern");
				s.removeParameter("KeyDate");
				s.removeParameter("CyclePattern");
				s.addSelectOption("KeyDate", "I", "EQ", V.toJSON());
				s.addSelectOption("CyclePattern", "I", "EQ", t);
				if (a.getView().getViewName() === "fin.cash.flow.analyzer.view.FlowContent") {
					a.variantjson = a.oCurrSmartTable.fetchVariant();
				}
				var n = {
					oDrilldownfilter: s.toJSONString()
				};
				var r = true;
				var b = "Worklist_D";
				a.getRouter().navTo(b, {
					Params: JSON.stringify(n).toBase64URI()
				}, r);
				if (a.getView().getViewName() === "fin.cash.flow.analyzer.view.Worklist_D") {
					a.aDrilldownfilter = n.oDrilldownfilter;
				}
				break;
			}
		}
	};
});