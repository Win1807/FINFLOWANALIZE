/*
 * Copyright (C) 2009-2019 SAP SE or an SAP affiliate company. All rights reserved.
 */
jQuery.sap.declare("fin.cash.flow.analyzer.view.fragment_ccfi.VendorCustomerContactLaunch");
jQuery.sap.require("sap.ui.base.Object");
jQuery.sap.require("sap.ca.ui.quickoverview.Quickoverview");
sap.ui.base.Object
		.extend(
				"fin.cash.flow.analyzer.view.fragment_ccfi.VendorCustomerContactLaunch",
				{
					// Public interface: constructor
					constructor : function(oConfig) {
						// create an explicit model - merge information from the
						// application in case an application model is provided

						var utils = sap.ca.ui.quickoverview.QuickviewUtils;

						//handle image
						var sImgUrl = oConfig.imgurl;
						if ( !sImgUrl )
							{
							 sImgUrl = "sap-icon://contacts";
							}							
						
						var oData = {
							imgurl : sImgUrl,								
							StreetHouseNumber : utils.getAttrValue(oConfig.StreetHouseNumber, oConfig.oModel),
							City : utils.getAttrValue(oConfig.City, oConfig.oModel),
							PostCode : utils.getAttrValue(oConfig.PostCode, oConfig.oModel),
							TimeZone : utils.getAttrValue(oConfig.TimeZone, oConfig.oModel),									
							Tel : utils.getAttrValue(oConfig.Tel, oConfig.oModel)
						};

						var oModel = new sap.ui.model.json.JSONModel(
								oData);
						
					//	var oModel = oConfig.oModel;

						var oQVConfig = {
							popoverHeight : "30rem",
							title : utils.getAttrValue(oConfig.title, oConfig.oModel),
							headerTitle : utils.getAttrValue(oConfig.Partner,oConfig.oModel),
						//	headerSubTitle : "SubTitle",
							headerImgURL : sImgUrl,
							subViewName : "fin.cash.flow.analyzer.view.fragment_ccfi.VendorCustomerContact",
							oModel : oModel,
							beforeExtNav : oConfig.beforeExtNav							
						};

						this.oQuickView = new sap.ca.ui.quickoverview.Quickoverview(
								oQVConfig);

					},

					// Public interface: openBy
					openBy : function(oSourceControl, sPlacement) {

						this.oQuickView.openBy(oSourceControl);

						return;
					}
				});