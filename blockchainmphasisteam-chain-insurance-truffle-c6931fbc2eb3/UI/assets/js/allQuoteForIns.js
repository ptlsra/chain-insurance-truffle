$(document).ready(function(){

	 var tempLists=[];
	 var dataSets=[];
	// var contractAddress=contract();
	// localStorage.setItem("insuranceAddress1", "0xa259dad2de6c8f6a76ff2d6f2eaee96bd75480fa");
	// localStorage.setItem("insuranceAddress1", contractAddress);
     var insAdd=localStorage.getItem("insAdd");
     //var ipAdd="54.213.80.210";
     //var ipAdd="52.53.254.144";
   //  var port="5000";
   //  var ipAdd="172.21.80.81";
    // var port="5005";
     //var ipAddIpfs="54.213.12.204"; //bank
  //   var ipAddIpfs="52.52.172.203"; //bank
    // var ipAddIpfs="172.21.80.81";
     
/*

     var ipAdd=ipAddress();
     var ipAddIpfs=ipfsIpAddress();
     var port=portNo();
     localStorage.setItem("ipAdd", ipAdd);
     localStorage.setItem("ipAddIpfs", ipAddIpfs);
     localStorage.setItem("port", port);
     
     */

     
     $.get("/getCustomerQuoteRequest?insuranceAddress="+insAdd, function(response){

    	 $.each(response.message, function(i, item) {
    		 
    		 if(item.portfolioStatus=="insurance_approval_pending"){
    			 tempLists.push(i+1,item.loanId,item.name,'Approve Customer Request','<a  href=ViewCustomerRequest.html?loanId='+item.loanId+'&walletAddress='+item.customerAddress+'> View and Approve');
        		  dataSets.push(tempLists);
    			  tempLists=[];
	 				}
    		 
    		 if(item.portfolioStatus=="insurance_quote_approved"){
    			 
    			 if(item.quoteStatus=="pending"){
    				 tempLists.push(i+1,item.loanId,item.name,'Approve Customer Request','<a  href=ViewCustomerRequest.html?loanId='+item.loanId+'&walletAddress='+item.customerAddress+'> View and Approve');
           		  dataSets.push(tempLists);
       			  tempLists=[]; 
    				 
    			 }
    			 else{
    					var n = item.quoteStatus.length; 
 						var substr=item.quoteStatus.substr(19, n); 
 						substr = substr.split('%').join('_');
    				 
    				 tempLists.push(i+1,item.loanId,item.name,'<a  href=ViewApprovedCustomerRequest.html?loanId='+item.loanId+'&walletAddress='+item.customerAddress+'&status=Pending_Customer_Approval&quote='+substr+'> Pending Customer Approval','');
           		  dataSets.push(tempLists);
       			  tempLists=[];
    			 }
    			
	 				}

 if(item.portfolioStatus=="Insurance_approved"){
		var n = item.quoteStatus.length; 
		var substr=item.quoteStatus.substr(19, n); 
		substr = substr.split('%').join('_');
    			 
    
    				 
    				 
    		            	if(item.approvedBy==insAdd){
    			    			 tempLists.push(i+1,item.loanId,item.name,'<a  href=ViewApprovedCustomerRequest.html?loanId='+item.loanId+'&walletAddress='+item.customerAddress+'&status=Policy_Issued&quote='+substr+'> Policy Issued','');
    			        		 dataSets.push(tempLists);
    			        		 tempLists=[];
    			       
    			    			 
        					}
    		            	else{
        					/*	alert("yes");
        						alert(item.loanId);
        						alert(item.name);*/
        						//alert("yes");
        					tempLists.push(i+1,item.loanId,item.name,'<a  href=ViewApprovedCustomerRequest.html?loanId='+item.loanId+'&walletAddress='+item.customerAddress+'&status=Policy_Rejected&quote='+substr+'> Proposal Rejected','');
        		        		dataSets.push(tempLists);
        		        		tempLists=[];
        		        		
        		        	//	alert(dataSets);
        					}
    		            	
    		            
    		    
    			
    		 }
 
 
 
 
 if(item.portfolioStatus=="Loan_Approved"){
		var n = item.quoteStatus.length; 
		var substr=item.quoteStatus.substr(19, n); 
		substr = substr.split('%').join('_');
 			 
 			 
 				 
 				
 		            	if(item.approvedBy==insAdd){
 			    			 tempLists.push(i+1,item.loanId,item.name,'<a  href=ViewApprovedCustomerRequest.html?loanId='+item.loanId+'&walletAddress='+item.customerAddress+'&status=Policy_Issued&quote='+substr+'> Policy Issued','');
 			        		 dataSets.push(tempLists);
 			        		 tempLists=[];
 			       
 			    			 
     					}
 		            	else{
     					/*	alert("yes");
     						alert(item.loanId);
     						alert(item.name);*/
     						//alert("yes");
     					tempLists.push(i+1,item.loanId,item.name,'<a  href=ViewApprovedCustomerRequest.html?loanId='+item.loanId+'&walletAddress='+item.customerAddress+'&status=Policy_Rejected&quote='+substr+'> Proposal Rejected','');
     		        		dataSets.push(tempLists);
     		        		tempLists=[];
     		        		
     		        	//	alert(dataSets);
     					}
 		            	
 		            
 		        
 			
 		 }
    		 
    		
    	 } );
				$('#pendingRequest3').DataTable( {
					data: dataSets,
					 //paging: false,
					  //  searching: false,
					columns: [
						 { title: "SNo" },
						 { title: "Loan Id" },
					    { title: "Name" },
					    {title :"Status"},
					    {title :"Action "}
					    
					    
					    

					  
					]
		    		} );
    	 
        } );
        
        
        });
