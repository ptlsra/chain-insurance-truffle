$(document).ready(function(){
	
	/* var bank=localStorage.getItem("banksName");
	 var bankId=localStorage.getItem("bank_id");
	 var ifsc=localStorage.getItem("bankCode");
	 var bankKey=localStorage.getItem("publicKey");
	 var location=localStorage.getItem("location");
	 
	 
	 
	 document.getElementById("bankName").innerHTML = bank;
	 document.getElementById("jumbotron_para").innerHTML = "Portfolio infromation for bank registered with id: "+bankId;
        //$("#main_footer").hide();
        document.getElementById("jumbotron_header").innerHTML = "Welcome To "+bank;
        $("#bankCode").val(ifsc);
        $("#bankid").val(bankId);
        $("#location").val(location);
        $("#bankKey").val(bankKey);
        $("#bankName2").val(bank);
        
        $("#bankCode").prop("readonly", true);
        $("#bankid").prop("readonly", true);
        $("#bankKey").prop("readonly", true);
        $("#location").prop("readonly", true);
        $("#bankName2").prop("readonly", true);
        
        */
	 var tempLists=[];
	 var dataSets=[];
	 
	
	var ipAddress=localStorage.getItem("ipAddress");
	var port=localStorage.getItem("port");
	//alert(ipAddress +port);
	  $.get("/getAllPortfolios", function(response){
		 
			$.each(response, function(i, item) {
				//alert(JSON.stringify(response.message[0]));
				
				//alert();
				
if(item.portfolioStatus=="pre_approval_pending"){
					
					tempLists.push(i,'<a title="'+ item.customerAddress+'"href=#?'+item.customerAddress+ '>'+item.customerAddress.substr(0, 20)+'...',item.loanId,"Pre approval Pending",'<a href=ViewDetail.html?listindex='+item.index+'> View');

				}


if(item.portfolioStatus=="pre_doc_uploading_pending"){
	
	tempLists.push(i,'<a title="'+ item.customerAddress+'"href=#?'+item.customerAddress+ '>'+item.customerAddress.substr(0, 20)+'...',item.loanId,"Document Upload Pending",'Please Wait');

}

if(item.portfolioStatus=="insurance_pending"){
	
	tempLists.push(i,'<a title="'+ item.customerAddress+'"href=#?'+item.customerAddress+ '>'+item.customerAddress.substr(0, 20)+'...',item.loanId,"Insurance Pending",'Please Wait');

}


if(item.portfolioStatus=="pre_doc_uploaded"){
	
	tempLists.push(i,'<a title="'+ item.customerAddress+'"href=#?'+item.customerAddress+ '>'+item.customerAddress.substr(0, 20)+'...',item.loanId,"Document Uploaded",'Please Wait');

}


				
				
				
		//		tempLists.push(i,'<a title="'+ item.hashId+'"href=single.html?'+item.hashId+ '>'+item.hashId.substr(0, 40)+'...',item.requestBy,item.status,'<a  href=LoanRequestApproval?'+item.requestId+'> View Details',"");

				dataSets.push(tempLists);
				tempLists=[];
				
				//alert(dataSet);		               
				 			        	
			});
				//$('#res').dataTable();

		//alert(dataSet);
		$('#portfoliotable').DataTable( {
			data: dataSets,
			columns: [
				 { title: "SNo" },
			    { title: "Customer Address" },
			    { title: "Loan ID" },
			    { title: "Current Status Of Request" },
			    {title :"View Details"}
			    
			    
			    
			    
			    

			  
			]
  		} );
      } );
	
        
        });
   
