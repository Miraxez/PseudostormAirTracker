function getAllFlightsWithinDateRange(url, type) {
	$.ajax({
	  type: 'GET',
	  url: url,
	  success: function(data){
	  	switch(type) {
		  case 'getFlights': 
		  	dateTable = data;
		    entryInTheTableFlying(data);
		  break;

		  case 'getPoints': 
		    setCoordinates(data.path);
		  break;
		}
	    
	  },
	  error: function(xhr) {
	  	let error = setErrorDate('#date-error-1', 3);
	  }
	});
}
