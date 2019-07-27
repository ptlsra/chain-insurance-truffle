$(document).ready(function(){

	 var tempLists=[];
	 var dataSets=[];
	 //localStorage.setItem("insuranceAddress1", "0x145cbdf9150d3df5ed9f1314bec978800949b7a5");
   
	 /*
	 var insAdd=localStorage.getItem("insuranceAddress1");
    // var ipAdd="172.21.80.81";
    // var port="5000";
     var ipAdd=localStorage.getItem("ipAdd");
     var port=localStorage.getItem("port");
     
     */
	 
	 var ipAdd=ipAddress();
		var insAdd=contract();
	     var ipAddIpfs=ipfsIpAddress();
	     var port=portNo();
	     localStorage.setItem("ipAdd", ipAdd);
	     localStorage.setItem("ipAddIpfs", ipAddIpfs);
	     localStorage.setItem("port", port);
	     localStorage.setItem("insuranceAddress1", insAdd);
     
     $.get("/getTransactionsForInsurance?insuranceAddress="+insAdd, function(response){
    	 $.each(response, function(i, item) {
    	//	 alert (JSON.stringify(item));
    		 var timeValue=item.dateTime.toString();
    		 var unixtimestamp = timeValue.slice(0,-9);
    			
			//	 var unixtimestamp = item.dateTime;

				 // Months array
				 var months_arr = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

				 // Convert timestamp to milliseconds
				 var date = new Date(unixtimestamp*1000);

				 // Year
				 var year = date.getFullYear();

				 // Month
				 var month = months_arr[date.getMonth()];

				 // Day
				 var day = date.getDate();

				 // Hours
				 var hours = date.getHours();

				 // Minutes
				 var minutes = "0" + date.getMinutes();

				 // Seconds
				 var seconds = "0" + date.getSeconds();

				 // Display date time in MM-dd-yyyy h:m:s format
				 var convdataTime = month+'-'+day+'-'+year+' '+hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
				 
				// document.getElementById('datetime').innerHTML = convdataTime;
				var desc=item.description;
				 var replacedDesc = desc.split('_').join(' ');
				
				
				tempLists.push(i+1,'<a title="'+ item.transactionId+'"href=#?'+item.transactionId+ '>'+item.transactionId.substr(0, 20)+'....',convdataTime,item.customerName,replacedDesc);
				
			dataSets.push(tempLists);
			tempLists=[];
				
			//alert(dataSet);		               
			 			        	
		});
			//$('#res').dataTable();

	//alert(dataSet);
	$('#pendingRequestTx').DataTable( {
		data: dataSets,
		columns: [
			 { title: "SNo" },
		    { title: "Transcation Id" },
		    {title: "TimeStamp "},
		    {title:"Customer"},
		    {title: "Description"}
		    
		    
		    
		    
		    

		  
		]
		} );
    } );
    
    
    });
