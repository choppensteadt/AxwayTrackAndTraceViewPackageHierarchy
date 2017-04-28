var args = $.args;
var scanditsdk = require("com.mirasense.scanditsdk");

$.activityIndicator.hide();

function mnuLogoutClicked() {
   	var rememberMeFromProperties = Ti.App.Properties.getBool('remember'); 
	Ti.App.fireEvent('cleanUpAfterLogoutEvent');
	$.home.close();
}

function openScanWindow(event) {
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

// The developer must obtain the scandit SDK and an API Key from www.scandit.com 
// Paste the API Key into the codeline just below between the quotes
// The scandit version should be 5.0.1 and the libraries must be copied into the modules/android/com.mirasense.scanditsdk directory

scanditsdk.appKey = "PASTE API KEY HERE";
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