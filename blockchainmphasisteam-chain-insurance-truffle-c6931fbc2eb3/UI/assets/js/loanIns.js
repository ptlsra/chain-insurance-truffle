$(document).ready(function(){

	 var tempLists=[];
	 var dataSets=[];
	 

        	
       $.get("http://api.open-notify.org/astros.json", function(response){
    	  // alert(JSON.stringify(response.people));
 			$.each(response.people, function(i, item) {
 				//alert(JSON.stringify(item));
 				//alert(JSON.stringify(response.message[0]));
 				
				//tempLists.push(i,item.requestId,item.requestBy,item.status,'<a  href=LoanRequestApproval?'+item.requestId+'> View Details',"");
 				
 				tempLists.push(i,item.name,item.craft,item.name,'<a  href=LoanRequestApproval?'+item.craft+'> View Details',"");
 				alert(dataSets);
				dataSets.push(tempLists);
				tempLists=[];
 				
				//alert(dataSet);		               
				 			        	
			});
				//$('#res').dataTable();

		//alert(dataSet);
		$('#pendingRequests').DataTable( {
			data: dataSets,
			columns: [
				 { title: "SNo" },
			    { title: "Loan Id" },
			    { title: "Loan Status" },
			    { title: "TimeStamp" },
			    {title: "Action "},
			    {title: "Description"}
			    
			    
			    
			    
			    

			  
			]
    		} );
        } );
        
        
        });