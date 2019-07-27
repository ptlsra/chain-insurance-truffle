
$('#button7').click(function () {


        var loanId = $("#loanIds").val();
	var policyId = $("#policyId").val();

        var bankAddress  = localStorage.getItem("getBankAddress");
	var premiumAmount = $("#premiumAmount").val();
	var rate = $("#rate").val();
	var quote="rate_of_interest_is_"+rate;
	quote = quote.replace(/%/g, "");


        var insAdd  = localStorage.getItem("insAdd");



	$("#waitingModal").modal();
        $.ajax({

                dataType: "json",
                contentType: 'application/json; charset=UTF-8',
                url: "/giveQuoteToCustomer?loanId="+loanId+"&quote="+quote+"&insuranceAddress="+insAdd+"&premium="+premiumAmount,
                type: "POST",
                global: false,
                async: false,
                success: function (result) {

			


			$.ajax({

					dataType: "json",
					contentType: 'application/json; charset=UTF-8',
					url: "/updatePortfolioStatus?sharedOwnerAddress="+bankAddress+"&loanId="+loanId+"&status=insurance_quote_approved&message=accept_quote",
					type: "POST",
					global: false,
					async: false,
					success: function (response) {

				       document.getElementById("txId").innerHTML = response.message;
                       			 $('#waitingModal').modal('hide');
                       			 $("#successModal").modal();
                       
				        setTimeout(function () {
				                window.location.href = "AdminHome.html";
				        }, 2000);
			


					}
				});


                }
        });

});



 
