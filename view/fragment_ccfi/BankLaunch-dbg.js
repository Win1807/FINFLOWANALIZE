/*
 * Copyright (C) 2009-2019 SAP SE or an SAP affiliate company. All rights reserved.
 */
jQuery.sap.declare("fin.cash.flow.analyzer.view.fragment_ccfi.BankLaunch");  
jQuery.sap.require("sap.ui.base.Object");
jQuery.sap.require("sap.ca.ui.quickoverview.Quickoverview");

sap.ui.base.Object
		.extend(
				"fin.cash.flow.analyzer.view.fragment_ccfi.BankLaunch",
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
							 sImgUrl = "sap-icon://insurance-house";
							}							
						
						var oData = {
							imgurl : sImgUrl,								
							BankCountry : utils.getAttrValue(oConfig.BankCountry,
									oConfig.oModel),
						      Currency : utils.getAttrValue(
									oConfig.Currency, oConfig.oModel),
									Description : utils.getAttrValue(
											oConfig.Description, oConfig.oModel),									
									BankName : utils.getAttrValue(
									oConfig.BankName, oConfig.oModel),
									CashPool : utils.getAttrValue(oConfig.CashPool,
									oConfig.oModel),
									InternalContact : utils.getAttrValue(oConfig.InternalContact,
											oConfig.oModel),									
									InternalPhone : utils.getAttrValue(oConfig.InternalPhone,
									oConfig.oModel),
									InternalEmail : utils.getAttrValue(oConfig.InternalEmail,
									oConfig.oModel),
									ExternalContact : utils.getAttrValue(oConfig.ExternalContact,
											oConfig.oModel),											
									ExternalPhone : utils.getAttrValue(oConfig.ExternalPhone, oConfig.oModel),
									ExternalEmail : utils.getAttrValue(oConfig.ExternalEmail, oConfig.oModel)
						};

						var oModel = new sap.ui.model.json.JSONModel(
								oData);
						
					//	var oModel = oConfig.oModel;

						var oQVConfig = {
							popoverHeight : "45rem",
							title : utils.getAttrValue(oConfig.title,
										oConfig.oModel),
							headerTitle : utils.getAttrValue(oConfig.Description,
									oConfig.oModel),
							headerSubTitle : utils.getAttrValue(
									oConfig.BankName, oConfig.oModel),
							headerImgURL : sImgUrl,
							subViewName : "fin.cash.flow.analyzer.view.fragment_ccfi.Bank",
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