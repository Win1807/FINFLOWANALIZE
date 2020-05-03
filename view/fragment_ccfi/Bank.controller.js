/*
 * Copyright (C) 2009-2019 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.controller("fin.cash.flow.analyzer.view.fragment_ccfi.Bank",{onTapPhone:function(e){sap.m.URLHelper.triggerTel(e.getSource().getText());},onTapEmail:function(e){var s="";sap.m.URLHelper.triggerEmail(e.getSource().getText(),s);}});
