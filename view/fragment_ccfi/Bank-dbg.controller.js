/*
 * Copyright (C) 2009-2019 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.controller("fin.cash.flow.analyzer.view.fragment_ccfi.Bank", {
	
	onTapPhone: function(oEvent) {
		sap.m.URLHelper.triggerTel(oEvent.getSource().getText());
	},
	
	onTapEmail: function(oEvent) {
		var sSubject = "";
		sap.m.URLHelper.triggerEmail(oEvent.getSource().getText(), sSubject);
	}
});