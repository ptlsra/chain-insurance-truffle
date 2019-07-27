$(document).ready(function(){

	 var tempLists=[];
	 var tempLists2=[];
	 var dataSets=[];
	 var localArrayFor=[];
	// localStorage.setItem("insuranceAddress2", "0xdba9add1f92a57697b677f2ff8f2c671fb43b99b");
     /*
	 
     var ipAdd=localStorage.getItem("ipAdd");
     var port=localStorage.getItem("port");
   */
/*
	  var ipAdd=ipAddress();
	     var ipAddIpfs=ipfsIpAddress();
	     var port=portNo();
	     var insAdd=contract();
	     localStorage.setItem("ipAdd", ipAdd);
	     localStorage.setItem("ipAddIpfs", ipAddIpfs);
	     localStorage.setItem("port", port);*/
	    
     var flag="unset";
     var insAdd=localStorage.getItem("insAdd");
     
     var count2=0;
    
      $.get("/getCustomerQuoteRequest?insuranceAddress="+insAdd, function(response){
    	// alert(JSON.stringify(response.messag\));
    //	 setTimeout(function(){ 
    	 $.each(response.message, function(i, item) {
    		 
    		 
    		 
    		
    		 if(item.portfolioStatus=="Insurance_approved"){
    			 var n = item.quoteStatus.length; 
					var substr=item.quoteStatus.substr(19, n); 
					substr = substr.split('%').join('_');
    			 
    				 
    				 
    		            	if(item.approvedBy==insAdd){
    		            		count2++;
        						tempLists2.push("yes");
    			    			 tempLists.push(count2,item.loanId,item.name,'<a  href=ViewApprovedCustomerRequest.html?loanId='+item.loanId+'&walletAddress='+item.customerAddress+'&status=Policy_Issued&quote='+substr+'> Policy Issued','');
    			        		 dataSets.push(tempLists);
    			        		 tempLists=[];
    			       
    			    			 
        					}
    		            	else{
        						tempLists2.push("no");
        					/*	alert("yes");
        						alert(item.loanId);
        						alert(item.name);*/
        						//alert("yes");
        				/*	tempLists.push(i+1,item.loanId,item.name,'<a  href=ViewApprovedCustomerRequest.html?loanId='+item.loanId+'&walletAddress='+item.customerAddress+'> Proposal Rejected','');
        		        		dataSets.push(tempLists);
        		        		tempLists=[];
        		        		
        		        	//	alert(dataSets);*/
        					}
    		            	
    		            
    		        
    			
    		 }
    		 
    		 
 if(item.portfolioStatus=="Loan_Approved"){
	 var n = item.quoteStatus.length; 
		var substr=item.quoteStatus.substr(19, n); 
		substr = substr.split('%').join('_');
    			 
    		
    		            	if(item.approvedBy==insAdd){
    		            		count2++;
        						tempLists2.push("yes");
    			    			 tempLists.push(count2,item.loanId,item.name,'<a  href=ViewApprovedCustomerRequest.html?loanId='+item.loanId+'&walletAddress='+item.customerAddress+'&status=Loan_Approved&quote='+substr+'> Ready For Disbursal','');
    			        		 dataSets.push(tempLists);
    			        		 tempLists=[];
    			       
    			    			 
        					}
    		            	else{
        						tempLists2.push("no");
        					/*	alert("yes");
        						alert(item.loanId);
        						alert(item.name);*/
        						//alert("yes");
        				/*	tempLists.push(i+1,item.loanId,item.name,'<a  href=ViewApprovedCustomerRequest.html?loanId='+item.loanId+'&walletAddress='+item.customerAddress+'> Proposal Rejected','');
        		        		dataSets.push(tempLists);
        		        		tempLists=[];
        		        		
        		        	//	alert(dataSets);*/
        					}
    		            	
    		            
    		        
    			
    		 }
    		 
    		 
    	
    	 } );
				$('#pendingRequestTx').DataTable( {
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
    	//  }, 1000);
    	 
        });
        });
