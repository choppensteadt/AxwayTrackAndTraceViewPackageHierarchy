// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var epcURI = Alloy.Globals.currentSerialNumber;

getPackageHierarchy(epcURI);

function mnuScanAgainClicked() {
	var rememberMeFromProperties = Ti.App.Properties.getBool('remember'); 
	$.packagehierarchy.close();
}

function mnuLogoutClicked() {
	var rememberMeFromProperties = Ti.App.Properties.getBool('remember'); 
	Ti.App.fireEvent('cleanUpAfterLogoutEvent');
	$.packagehierarchy.close();
	Alloy.createController('login').getView().open();
}

function openChild(e) {
	var item = $.lsListSection.getItemAt(e.itemIndex);
	var epc = item.epc.text;
	
	getPackageHierarchy(epc);
	
	// item.epc.text = 'foo';  WORKED
	// item.epc.backgroundColor = 'pink';  WORKED
	// item.properties.backgroundColor = 'pink';  DID NOT WORK
	// item.properties.color = "pink";  DID NOT WORK
	// item.backgroundColor = 'pink';  DID NOT WORK
	// item.setBackgroundColor("#E9EAEA");  DID NOT WORK
	// Ti.API.info(JSON.stringify(item));
	// alert(JSON.stringify(item));
	// e.section.updateItemAt(e.itemIndex,item);
}

function openParent() {
	if(xmlParentEpc != null){
		getPackageHierarchy(xmlParentEpc);
	}
}

// Go back to previous level of package hierarchy when back button pressed
function backButtonPressed() {
	if(Alloy.Globals.parentURI != null){
		    Alloy.Globals.currentSerialNumber = Alloy.Globals.parentURI;
			var packagehierarchy = Alloy.createController('packagehierarchy').getView();
			packagehierarchy.open();		
	}
}

function getPackageHierarchy(epcURI) {

	$.activityIndicator.show();

	var url = "https://"+Alloy.Globals.hostIP+":8443/trackntraceserver/services/GetItemStatusService";
	
	var getPackageHierarchyRequest = 
	
	"<soapenv:Envelope xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/' xmlns:urn='urn:axway:tnt:status'>
   		<soapenv:Header>
			<tnt1:Credentials xmlns:tnt1='urn:axway:tnt:epcis'>
				<tnt1:user>"+Alloy.Globals.username+"</tnt1:user>
				<tnt1:password>"+Alloy.Globals.password+"</tnt1:password>
			</tnt1:Credentials>
		</soapenv:Header>
		<soapenv:Body>
			<urn:getItemStatusRequest>
				<urn:epc>"+epcURI+"</urn:epc>
				<urn:childrenLevels>1</urn:childrenLevels>
				<urn:summary>false</urn:summary>
			</urn:getItemStatusRequest>
		</soapenv:Body>
	</soapenv:Envelope>";
	
	var xhr = Ti.Network.createHTTPClient({
	    onload: function(e) {
			var xml = this.responseXML;
		    var rows = [];
			
			xmlCurrentPackageEpc = xml.documentElement.getElementsByTagName("getItemStatusResponse").item(0).getElementsByTagName("epc").item(0).textContent;
			getParentDetail(xmlCurrentPackageEpc,'US','85054');
			
			// Determine whether the scanned item has a parent, if so 
			// set var and icon for stepping up a level otherwise set var to null and hide icon
			if (xml.documentElement.getElementsByTagName("parent").item(0) != null){
				xmlParentEpc = xml.documentElement.getElementsByTagName("parent").item(0).getElementsByTagName("ns2:epc").item(0).textContent;
				$.imgUp.show();
			} else {
				xmlParentEpc = null;
				$.imgUp.hide();
			}
			
			Alloy.Globals.parentURI = xmlParentEpc; 
			
			$.activityIndicator.hide();
			
			// Determine whether the scanned item has children, if so put them in a ListView if not display ProductAuthentication for the row selected
			if (xml.documentElement.getElementsByTagName("children").item(0) != null){
				var xmlChildrenCount = xml.documentElement.getElementsByTagName("children").item(0).getElementsByTagName("ns2:count").item(0).textContent;
				var lblParent = xml.documentElement.getElementsByTagName("children").item(0).getElementsByTagName("ns2:count").item(0).textContent;

				$.lblChildCount.text = "Contains "+xmlChildrenCount+" children";
				
				for (var i=0; i < xmlChildrenCount; i++) {	
				
					var xmlChild = xml.documentElement.getElementsByTagName("ns2:child").item(i).childNodes;
				
					for (var i2=0; i2 < xmlChild.length; i2++){
						xmlPackageType = xml.documentElement.getElementsByTagName("ns2:child").item(i).getElementsByTagName("ns2:containerType").item(0).textContent;
						xmlEpc = xml.documentElement.getElementsByTagName("ns2:child").item(i).getElementsByTagName("ns2:epc").item(0).textContent;
					}
					
					rows.push({
						packageType:{text:xmlPackageType},
						epc:{text:xmlEpc},
						template:'packageHierarchyTemplate'
						});
				}
				$.lsListSection.setItems(rows);		
			} else {
				authenticateProduct(epcURI, 'US', '85054');
				$.lblChildCount.text = "Contains no children";
				rows = [];
				$.lsListSection.setItems(rows);
			}
	    },
	    onerror: function(e) {
			$.activityIndicator.hide();
			var xml = this.responseXML;
			
            alert(e.error);
	        return false;
	    },
	    timeout:5000  /* in milliseconds */
	});
	
	xhr.open("POST", url, false);
	xhr.setRequestHeader('Content-Type','text/xml');
	xhr.send(getPackageHierarchyRequest);
}

function getParentDetail(EPCuri, country_code, postal_code) {
	
	Alloy.Globals.EPCuri = EPCuri;
	Alloy.Globals.CountryCode = country_code;
	Alloy.Globals.PostalCode = postal_code;
	
	var url = "https://"+Alloy.Globals.hostIP+":8443/trackntraceserver/services/ProductAuthentication";
			
	var productAuthRequest = 
		
	"<soapenv:Envelope xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/' xmlns:urn='urn:axway:tnt:epcis' xmlns:tnt='tnt:axway:authentication:xsd:1'>
		<soapenv:Header>
			<epcis:Credentials xmlns:epcis='urn:axway:tnt:epcis' >
				<epcis:user>"+Alloy.Globals.username+"</epcis:user>
				<epcis:password>"+Alloy.Globals.password+"</epcis:password>
			</epcis:Credentials>
		</soapenv:Header>
		<soapenv:Body>
			<tnt:authenticate>
				<tnt:EpcUri>"+EPCuri+"</tnt:EpcUri>
				<tnt:UserLocation>
					<tnt:country>"+country_code+"</tnt:country>
					<tnt:zipCode>"+postal_code+"</tnt:zipCode>
				</tnt:UserLocation>
			</tnt:authenticate>
		</soapenv:Body>
	</soapenv:Envelope>";

	var xhr = Ti.Network.createHTTPClient({
	    onload: function(e) {
	    	var xml = this.responseXML;
	    	var xmlParentContainer = xml.documentElement.getElementsByTagName("FormattedProductName").item(0).textContent;
		    
		    $.lblParent.text = xmlParentContainer;
		    $.lblParentDetail.text = xml.documentElement.getElementsByTagName("Status").item(0).textContent+"\n"+EPCuri;
			$.activityIndicator.hide();
		},
	    onerror: function(e) {
	    	$.activityIndicator.hide();    	
			alert(e.error);
	        return false;
	    },
	    timeout:5000
	});

	$.activityIndicator.show();
	
	xhr.open("POST", url);
	xhr.setRequestHeader('Content-Type','text/xml');
	xhr.send(productAuthRequest);
}

function authenticateProduct(EPCuri, country_code, postal_code) {
	
	Alloy.Globals.EPCuri = EPCuri;
	Alloy.Globals.CountryCode = country_code;
	Alloy.Globals.PostalCode = postal_code;
	
	var url = "https://"+Alloy.Globals.hostIP+":8443/trackntraceserver/services/ProductAuthentication";
			
	var productAuthRequest = 
		
	"<soapenv:Envelope xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/' xmlns:urn='urn:axway:tnt:epcis' xmlns:tnt='tnt:axway:authentication:xsd:1'>
		<soapenv:Header>
			<epcis:Credentials xmlns:epcis='urn:axway:tnt:epcis' >
				<epcis:user>"+Alloy.Globals.username+"</epcis:user>
				<epcis:password>"+Alloy.Globals.password+"</epcis:password>
			</epcis:Credentials>
		</soapenv:Header>
		<soapenv:Body>
			<tnt:authenticate>
				<tnt:EpcUri>"+EPCuri+"</tnt:EpcUri>
				<tnt:UserLocation>
					<tnt:country>"+country_code+"</tnt:country>
					<tnt:zipCode>"+postal_code+"</tnt:zipCode>
				</tnt:UserLocation>
			</tnt:authenticate>
		</soapenv:Body>
	</soapenv:Envelope>";

	var xhr = Ti.Network.createHTTPClient({
	    onload: function(e) {

	    	var xml = this.responseXML;
		    var xmlStatus = xml.documentElement.getElementsByTagName("Status").item(0).textContent;
		    var xmlMessageText = xml.documentElement.getElementsByTagName("MessageText").item(0).textContent;
		    var xmlDetailedText = xml.documentElement.getElementsByTagName("DetailedText").item(0).textContent;
		    var xmlAttributes = xml.documentElement.getElementsByTagName("Attribute");
		    var xmlNDC = null;
		    var xmlFirstImage = null;
		    var xmlColor = null;
		    var xmlContainerSize = null;
		    var xmlDescription = null;
		    var xmlDosageForm = null;
		    var xmlDrugName = null;
		    var xmlManufacturer = null;
		    var xmlPackageType = null;
		    var xmlPhysicalType = null;
		    var xmlStrength = null;
		    var xmlUsageDirection = null;
		    
		    // Loop through the returned attributes looking for the first picture		    
		    for (var i=0; i < xmlAttributes.length; i++) {
		    	if (xmlAttributes.item(i).hasChildNodes()) {
		    		for (var i2=0; i2 < xmlAttributes.item(i).childNodes.length; i2++){
		    			if (xmlAttributes.item(i).childNodes.item(0).textContent == 'NDC'){
		    				xmlNDC = xmlAttributes.item(i).childNodes.item(1).textContent;
		    			};
		    			if (xmlAttributes.item(i).childNodes.item(0).textContent == 'axway:epcis:picture:epcclass:productInformation:value:1'){
		    				xmlFirstImage = xmlAttributes.item(i).childNodes.item(1).textContent;
		    			};
		    			if (xmlAttributes.item(i).childNodes.item(0).textContent == 'color'){
		    				xmlColor = xmlAttributes.item(i).childNodes.item(1).textContent;
		    			};
		    			if (xmlAttributes.item(i).childNodes.item(0).textContent == 'containerSize'){
		    				xmlContainerSize = xmlAttributes.item(i).childNodes.item(1).textContent;
		    			};
		    			if (xmlAttributes.item(i).childNodes.item(0).textContent == 'description'){
		    				xmlDescription = xmlAttributes.item(i).childNodes.item(1).textContent;
		    			};
		    			if (xmlAttributes.item(i).childNodes.item(0).textContent == 'dosageForm'){
		    				xmlDosageForm = xmlAttributes.item(i).childNodes.item(1).textContent;
		    			};
		    			if (xmlAttributes.item(i).childNodes.item(0).textContent == 'drugName'){
		    				xmlDrugName = xmlAttributes.item(i).childNodes.item(1).textContent;
		    			};
		    			if (xmlAttributes.item(i).childNodes.item(0).textContent == 'manufacturer'){
		    				xmlManufacturer = xmlAttributes.item(i).childNodes.item(1).textContent;
		    			};		    			
		    			if (xmlAttributes.item(i).childNodes.item(0).textContent == 'packageType'){
		    				xmlPackageType = xmlAttributes.item(i).childNodes.item(1).textContent;
		    			};
		    			if (xmlAttributes.item(i).childNodes.item(0).textContent == 'physicalType'){
		    				xmlPhysicalType = xmlAttributes.item(i).childNodes.item(1).textContent;
		    			};
		    			if (xmlAttributes.item(i).childNodes.item(0).textContent == 'strength'){
		    				xmlStrength = xmlAttributes.item(i).childNodes.item(1).textContent;
		    			};
		    			if (xmlAttributes.item(i).childNodes.item(0).textContent == 'usageDirection'){
		    				xmlUsageDirection = xmlAttributes.item(i).childNodes.item(1).textContent;
		    			};
		    		}
		    	}
		    }
	    	
	    	Alloy.Globals.PAR = "null";  // This is intentionally a string
	    	Alloy.Globals.xmlStatus = null;
			Alloy.Globals.xmlFormattedProductName = null;
			Alloy.Globals.xmlMessageText = null;
			Alloy.Globals.xmlDetailedText = null;
			Alloy.Globals.xmlNDC = xmlNDC;
			Alloy.Globals.xmlFirstImage = xmlFirstImage;
			Alloy.Globals.xmlColor = xmlColor;
			Alloy.Globals.xmlContainerSize = xmlContainerSize;
			Alloy.Globals.xmlDescription = xmlDescription;
			Alloy.Globals.xmlDosageForm = xmlDosageForm;
			Alloy.Globals.xmlDrugName = xmlDrugName;
			Alloy.Globals.xmlManufacturer = xmlManufacturer;
			Alloy.Globals.xmlPackageType = xmlPackageType;
			Alloy.Globals.xmlPhysicalType = xmlPhysicalType;
			Alloy.Globals.xmlStrength = xmlStrength;
			Alloy.Globals.xmlUsageDirection = xmlUsageDirection;

			switch (xmlStatus) {
				case 'Product is authentic': 		        			
					Alloy.Globals.PAR = "valid";
					Alloy.Globals.xmlStatus = xmlStatus;
					Alloy.Globals.xmlFormattedProductName = xml.documentElement.getElementsByTagName("FormattedProductName").item(0).textContent;
					Alloy.Globals.xmlMessageText = xmlMessageText;
					Alloy.Globals.xmlDetailedText = xmlDetailedText;
    				break;
    				
				case 'Product found but not in valid state':
					Alloy.Globals.PAR = "invalid";
					Alloy.Globals.xmlStatus = xmlStatus;
					Alloy.Globals.xmlFormattedProductName = xml.documentElement.getElementsByTagName("FormattedProductName").item(0).textContent;
					Alloy.Globals.xmlMessageText = xmlMessageText;
					Alloy.Globals.xmlDetailedText = xmlDetailedText;
    				break;
    				
				case 'Product is unknown':
					Alloy.Globals.PAR = "unknown";
					Alloy.Globals.xmlStatus = xmlStatus;
					Alloy.Globals.xmlFormattedProductName = 'Product Unknown';
					Alloy.Globals.xmlMessageText = xmlMessageText;
					Alloy.Globals.xmlDetailedText = xmlDetailedText;
    				break;
    				
    			default:
    				alert('Product Status is undefined');
    				Alloy.Globals.xmlStatus = null;
					Alloy.Globals.xmlFormattedProductName = null;
					Alloy.Globals.xmlMessageText = null;
					Alloy.Globals.xmlDetailedText = null;
    				break;
			}
		
			var auth = Alloy.createController('authentication', args).getView();
			
			$.activityIndicator.hide();
			
			auth.open();
		},
	    onerror: function(e) {
	    	$.activityIndicator.hide();    	
			alert(e.error);
	        return false;
	    },
	    timeout:5000
	});

	$.activityIndicator.show();
	
	xhr.open("POST", url);
	xhr.setRequestHeader('Content-Type','text/xml');
	xhr.send(productAuthRequest);
}