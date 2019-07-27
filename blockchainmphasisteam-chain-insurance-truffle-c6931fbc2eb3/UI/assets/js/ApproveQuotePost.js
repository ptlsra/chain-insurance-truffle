$('#button7').click(function () {
        //alert('clicked');

        var loanId = $("#loanIds").val();
	var policyId = $("#policyId").val();

        var bankAddress  = localStorage.getItem("getBankAddress");
	var premiumAmount = $("#premiumAmount").val();
	var rate = $("#rate").val();
	var quote="rate_of_interest_is_"+rate;

        var insAdd  = localStorage.getItem("insAdd");


        $.ajax({

                dataType: "json",
                contentType: 'application/json; charset=UTF-8',
                //url: "/giveQuoteToCustomer?loanId="+loanId+"&quote="+quote+"&insuranceAddress="+insAdd+"&premium="+premiumAmount,
		url:"/updatePolicyStatus?policyId="+policyId+"&insuranceAddress="+insAdd+"&status=quote_approved_ins",
                type: "POST",
                global: false,
                async: false,
                success: function (response) {

			


			$.ajax({

					dataType: "json",
					contentType: 'application/json; charset=UTF-8',
					url: "/updatePortfolioStatus?sharedOwnerAddress="+bankAddress+"&loanId="+loanId+"&status=insurance_quote_approved&message=accept_quote,
					type: "POST",
					global: false,
					async: false,
					success: function (response) {

				        document.getElementById("txWaiting").style.display = "none";
				        document.getElementById("txIdData").innerHTML = response.txId;
				        document.getElementById("txMessageForm").style.display = "block";
				        setTimeout(function () {
				                window.location.href = "AdminHome.html";
				        }, 2000);
			


					}
				});


                }
        });

});



 
