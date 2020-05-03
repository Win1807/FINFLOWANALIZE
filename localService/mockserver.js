/*
 * Copyright (C) 2009-2019 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["sap/ui/core/util/MockServer"],function(M){"use strict";return{_sServiceUrl:"/sap/opu/odata/sap/FCLM_CASH_FLOW_ANALYZER_SRV/",_sMetadataAddress:"fin/cash/flow/analyzer/localService",_sModulePath:"fin/cash/flow/analyzer/localService/mockdata",_sAppModulePath:"fin/cash/flow/analyzer",init:function(){var u=jQuery.sap.getUriParameters(),m=new M({rootUri:this._sServiceUrl});var s=jQuery.sap.getModulePath(this._sMetadataAddress);var a=jQuery.sap.getModulePath(this._sModulePath);M.config({autoRespond:true,autoRespondAfter:(u.get("serverDelay")||1000)});m.simulate(s+"/metadata.xml",{sMockdataBaseUrl:a});var r=m.getRequests();m.setRequests(r);m.start();jQuery.sap.log.info("Running the app with mock data");}};});