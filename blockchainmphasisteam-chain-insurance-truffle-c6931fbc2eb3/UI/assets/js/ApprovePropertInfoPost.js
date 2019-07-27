$('#button3').click(function () {
        //alert('clicked');

        var loanId = $("#loanIds").val();
	var policyId = $("#policyId").val();
	var insAdd  = localStorage.getItem("insAdd");
        var bankAddress  = localStorage.getItem("getBankAddress")
	


        $.ajax({

                dataType: "json",
                contentType: 'application/json; charset=UTF-8',
                url: "/updatePortfolioStatus?sharedOwnerAddress="+bankAddress+"&loanId="+loanId+"&status=ins_completed&message=approval_completed",
                type: "POST",
                global: false,
                async: false,
                success: function (response) {
                        //alert(result);

					
                        $.ajax({

                                        dataType: "json",
                                        contentType: 'application/json; charset=UTF-8',
                                        url: "/updatePolicyStatus?policyId="+policyId+"&insuranceAddress="+insAdd+"&status=ins_completed",
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

                        





