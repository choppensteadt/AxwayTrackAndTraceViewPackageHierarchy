var args = $.args;
$.swcDemoMode.value = false;

// Disable the physical back button on the login screen
function loginBackButtonPressed() {
  // do nothing	
}

// Determine whether to remember host IP and username  
var rememberMeFromProperties = Ti.App.Properties.getBool('remember', false);

// This event is fired when the 'logout' menu item is clicked on other screens.  It resets the login page.
Ti.App.addEventListener('cleanUpAfterLogoutEvent', function()
{
	if(($.swcKeepMeSignedIn.value == true)){
		Alloy.Globals.password = null;
		$.txtPassword.value = null;
		$.txtPassword.focus();
		$.swcDemoMode.value = false;
	} else {
		Alloy.Globals.hostIP = null;
		Alloy.Globals.username = null;
		Alloy.Globals.password = null;
		$.txtUserName.value = null;
		$.txtPassword.value = null;
		$.swcDemoMode.value = false;
		$.txtHostIP.focus();
	}
});

// Called when remember me switch is changed to update properties
function swcKeepMeSignedInChecked(){
	if ($.swcKeepMeSignedIn.value == true){
		Ti.App.Properties.setBool('remember', true);
	} else {
		Ti.App.Properties.setBool('remember', false);
	}
}

// Saves the arguments hostURL and username as properties
function saveLoginInformationToProperties(username, hostIP){
	Ti.App.Properties.setString('hostIP', hostIP);
	Ti.App.Properties.setString('username', username);
}

// Read whether 'remember me' is checked from properties, if so default host IP address and username then set switch to true
if(rememberMeFromProperties == true){
	var hostFromProperties = Ti.App.Properties.getString('hostIP');
	var usernameFromProperties = Ti.App.Properties.getString('username');
	$.txtHostIP.value = hostFromProperties;
	$.txtUserName.value = usernameFromProperties;
	$.swcKeepMeSignedIn.value = true;
	$.txtPassword.value = null;	
	$.txtPassword.focus();
} else {
	Ti.App.Properties.setBool('remember', false);
	$.txtPassword.value = null;
	$.txtHostIP.focus();
}

// Set arguments and pass them to login() function
function btnLoginClicked() {

	$.activityIndicator.show();

	if ($.swcDemoMode.value == false) {
	   	var hostIP = $.txtHostIP.value;
	   	var username = $.txtUserName.value;
		var password = $.txtPassword.value;
	
		if($.swcKeepMeSignedIn.value == true){
			saveLoginInformationToProperties(username, hostIP);
		}
			
		if (Ti.Geolocation.locationServicesEnabled) {
			
			Titanium.Geolocation.purpose = 'Get Current Location';
			Titanium.Geolocation.getCurrentPosition(function(f) {
				
				if (f.error) {
					$.activityIndicator.hide();
		            alert('Error: ' + f.error);
		        } else {
		            var latitude = f.coords.latitude;
		            var longitude = f.coords.longitude;
		            
		            Ti.Geolocation.reverseGeocoder(latitude, longitude, function(g) {
		            	if (g.error) {
		            		$.activityIndicator.hide();
		            		Ti.API.error('Error: ' + g.error);
		        		} else {
		        			var places = g.places[0]
		        			login(hostIP, username, password, places.country_code, places.postalCode);
		        		}
					});
				}
			});
		} else {
			$.activityIndicator.hide();
			alert('Please enable location services');
		}
	} else if ($.swcDemoMode.value == true) {
		Alloy.Globals.demoMode = true;		
		var hostIP = '208.67.130.151';
		var username = 'demo';
		var password = 'demo';
		var country_code = 'US';
		var postalCode = '85255';
		
		login(hostIP, username, password, country_code, postalCode);
	} 
}

function login(hostIP, username, password, country_code, postal_code) {

	var url = "https://"+hostIP+":8443/trackntraceserver/services/ProductAuthentication";
	
	var productAuthRequest = 
		"<soapenv:Envelope xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/' xmlns:urn='urn:axway:tnt:epcis' xmlns:tnt='tnt:axway:authentication:xsd:1'>
			<soapenv:Header>
				<epcis:Credentials xmlns:epcis='urn:axway:tnt:epcis' >
					<epcis:user>"+username+"</epcis:user>
					<epcis:password>"+password+"</epcis:password>
				</epcis:Credentials>
			</soapenv:Header>
			<soapenv:Body>
				<tnt:authenticate>
					<tnt:EpcUri>123456789</tnt:EpcUri>
					<tnt:UserLocation>
						<tnt:country>"+country_code+"</tnt:country>
						<tnt:zipCode>"+postal_code+"</tnt:zipCode>
					</tnt:UserLocation>
				</tnt:authenticate>
			</soapenv:Body>
		</soapenv:Envelope>";
	
	var xhr = Ti.Network.createHTTPClient({
	    onload: function(e) {
	
			Alloy.Globals.hostIP = hostIP;
			Alloy.Globals.username = username;
			Alloy.Globals.password = password;

			var home = Alloy.createController('home', args).getView();
			$.activityIndicator.hide();
			home.open();
	    },
	    onerror: function(e) {
			Alloy.Globals.hostIP = null;
			Alloy.Globals.username = null;
			Alloy.Globals.password = null;
			$.activityIndicator.hide();
            alert("Login invalid");
	        return false;
	    },
	    timeout:5000  /* in milliseconds */
	});
	
	xhr.open("POST", url, false);
	xhr.setRequestHeader('Content-Type','text/xml');
	xhr.send(productAuthRequest);
}