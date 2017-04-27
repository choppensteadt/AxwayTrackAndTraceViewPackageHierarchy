var args = $.args;
$.activityIndicator.hide();

function mnuScanAgainClicked() {
	var rememberMeFromProperties = Ti.App.Properties.getBool('remember'); 
	$.authentication.close();
}
function mnuLogoutClicked() {
	var rememberMeFromProperties = Ti.App.Properties.getBool('remember'); 
	Ti.App.fireEvent('cleanUpAfterLogoutEvent');
	$.authentication.close();
	Alloy.createController('login').getView().open();
}

// Go back to previous level of package hierarchy
function backButtonPressed() {
	if(Alloy.Globals.parentURI != null){
		    Alloy.Globals.currentSerialNumber = Alloy.Globals.parentURI;
			var packagehierarchy = Alloy.createController('packagehierarchy').getView();
			packagehierarchy.open();		
	}
}

switch (Alloy.Globals.PAR) {
	case 'valid': 		        			
		$.imgStatus.image = '/images/authenticated.png';
		$.lblStatus.text = 'Product Authenticated';
		$.lblStatus2.text = Alloy.Globals.xmlFormattedProductName+" "+Alloy.Globals.xmlColor+" "+Alloy.Globals.xmlDosageForm;
		$.lblEPCuri.text = Alloy.Globals.EPCuri;
		$.lblMessage.text = Alloy.Globals.xmlMessageText;
		$.lblDetails.text = Alloy.Globals.xmlDetailedText;
		$.lblNdc.text = Alloy.Globals.xmlNDC;
		$.lblManufacturer.text = Alloy.Globals.xmlManufacturer;
		$.lblUsageDirection.text = Alloy.Globals.xmlUsageDirection;
		//alert(Alloy.Globals.xmlFirstImage);
		//$.imgFirstImage.image = Ti.Utils.base64decode(Alloy.Globals.xmlFirstImage);
		break;
		
	case 'invalid':
		$.imgStatus.image = '/images/notauthentic.png';
		$.lblStatus.text = 'Product Invalid';
		$.lblStatus2.text = Alloy.Globals.xmlFormattedProductName;			
		$.lblEPCuri.text = Alloy.Globals.EPCuri;
		$.lblMessage.text = Alloy.Globals.xmlMessageText;
		$.lblDetails.text = Alloy.Globals.xmlDetailedText;
		$.lblNdc.text = Alloy.Globals.xmlNDC;
		$.lblManufacturer.text = Alloy.Globals.xmlManufacturer;
		$.lblUsageDirection.text = Alloy.Globals.xmlUsageDirection;
		//$.imgFirstImage.image = Ti.Utils.base64decode(Alloy.Globals.xmlFirstImage);
		break;
		
	case 'unknown':
		$.imgStatus.image = '/images/notsureauthenticated.png';
		$.lblStatus.text = 'Product Unknown';
		$.lblStatus2.text = Alloy.Globals.xmlFormattedProductName;			
		$.lblEPCuri.text = Alloy.Globals.EPCuri;
		$.lblMessage.text = Alloy.Globals.xmlMessageText;
		$.lblDetails.text = Alloy.Globals.xmlDetailedText;
		$.lblNdc.text = '';
		$.lblManufacturer.text = '';
		$.lblUsageDirection.text = '';
		break;
		
	default:
		alert('Undefined status, please rescan again');
		Alloy.Globals.xmlStatus = null;
		Alloy.Globals.xmlFormattedProductName = null;
		Alloy.Globals.xmlMessageText = null;
		Alloy.Globals.xmlDetailedText = null;
		break;
}