var args = $.args;
var scanditsdk = require("com.mirasense.scanditsdk");

$.activityIndicator.hide();

function mnuLogoutClicked() {
   	var rememberMeFromProperties = Ti.App.Properties.getBool('remember'); 
	Ti.App.fireEvent('cleanUpAfterLogoutEvent');
	$.home.close();
}

function openScanWindow(event) {
	//Alloy.Globals.currentSerialNumber = 'urn:epc:id:sgtin:0614141.232201.100CS00001';
	//var packagehierarchy = Alloy.createController('packagehierarchy').getView();
	//packagehierarchy.open();
	
	var destination = event.source.toDestination;
	openScannerIfPermission(destination);
}

var openScannerIfPermission = function(destination) {
    if (Ti.Media.hasCameraPermissions()) {
        openScanner(destination);
    } else {
        Ti.Media.requestCameraPermissions(function(e) {
            if (e.success) {
                openScanner(destination);
            } else {
                alert('No permission to access camera.');
            }
        });
    }
};

function openScanner(destination) {

// Sets up the scanner and starts it in a new window.
scanditsdk.appKey = "2waQEjM72/bJIDLKZAnQXW2A9qcT75k/9KakZWO1Rss";
scanditsdk.cameraFacingPreference = 0;
	
    // Only after setting the app key instantiate the Scandit SDK Barcode Picker view
    var picker = scanditsdk.createView({
        width:"100%",
        height:"100%"
    });
    
    // Before calling any other functions on the picker you have to call init()
    picker.init();
   
    // Create a window to add the picker to and display it. 
    var window = Titanium.UI.createWindow({  
            backgroundColor: '#E9EAEA',
            title: '',
            navBarHidden: true,
    });
    
    // Set callback functions for when scanning succeeds and for when the 
    // scanning is canceled. This callback is called on the scan engine's
    // thread to allow you to synchronously call stopScanning or
    // pauseScanning. Any UI specific calls from within this function 
    // have to be issued through setTimeout to switch to the UI thread
    // first.
    
    picker.setSuccessCallback(function(scanReturn) {
        picker.stopScanning();
        
        setTimeout(function() {
            window.close();
            window.remove(picker);
        
        	//$.activityIndicator.show();
            
            Alloy.Globals.currentSerialNumber = scanReturn.barcode;
			var packagehierarchy = Alloy.createController('packagehierarchy').getView();
			packagehierarchy.open();

			//{activityEnterAnimation: Ti.Android.R.anim.slide_in_left}

        }, 1);
    });
    
    picker.setCancelCallback(function(e) {
        picker.stopScanning();
        window.close();
        window.remove(picker);
    });
    
    window.add(picker);
    
    window.addEventListener('open', function(e) {
        picker.startScanning();     // startScanning() has to be called after the window is opened. 
    });
    
    window.open();
};