$.get("/getCoinBase", function(data, status){
	alert(JSON.stringify(data))
	insAdd = data.coinBase
	bankAddress = data.bankcoinBase
	//alert (insAdd)
		localStorage.setItem("insAdd",insAdd)
		localStorage.setItem("getBankAddress",bankAddress)
    });


// Set Insurance address here
//localStorage.setItem("insAdd", "0xb546f8ba268e1f140f2d8dee7e5879b21b538d1b");
//localStorage.setItem("getBankAddress","0x4802c1b6ab728e28d462005481d2472e523d886d")
