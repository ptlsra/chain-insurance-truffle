
/**
 * 
 * Required libraries
 */
var fs = require("fs");
var Web3 = require('web3-quorum');
var cors = require('cors');
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
const express = require('express');
const app = express();
var log4js = require('log4js');
var logger = log4js.getLogger('app');
//logger.level = 'debug';
logger.level = 'info';

// express file upload library
const fileUpload = require('express-fileupload');
var bodyParser = require('body-parser');
// ipfs javascript http-client library
var ipfsAPI = require('ipfs-http-client');

logger.info("MortgageAPI_XYZAutomation");


// added on 6 feb 2019
 
var pathval=__dirname+ "/UI/";
console.log(pathval);
app.set('views',pathval);
app.use(express.static(pathval));






/**
 * app settings
 */
app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload());
app.options("*",cors());




let configRawData = fs.readFileSync('./config.json');
let configData = JSON.parse(configRawData);
logger.debug("initializing API ... config.json ---> "+JSON.stringify(configData));


var insuranceWalletPassword = configData.insuranceWalletPassword;

var ipfs = ipfsAPI(configData.ipfsAPI);




ipfsIpAddress=configData.ipfsIpAddress;
ipfsPort=configData.ipfsPort;

// get web3-quorum provider
var web3 = new Web3(new Web3.providers.HttpProvider(configData.web3Provider));

var insuranceAccountAddress = configData.insuranceWalletAddress;
var bankAddress = configData.bankWalletAddress;

web3.personal.unlockAccount(insuranceAccountAddress,insuranceWalletPassword);


//reading abi from file
var source = fs.readFileSync("Mortgage.json");
var contracts = JSON.parse(source)["contracts"];
var abi = JSON.parse(contracts["Mortgage.sol:Mortgage"].abi);


var insurance_source = fs.readFileSync("MortgageInsurance.json");
var insurance_contract = JSON.parse(insurance_source)["contracts"];
var insurance_abi = JSON.parse(insurance_contract["MortgageInsurance.sol:MortgageInsurance"].abi);


let rawdata = fs.readFileSync('./contractConfig.json');  
let contractsData = JSON.parse(rawdata);
console.log(JSON.stringify(contractsData));

var contractAddress             = contractsData.mortgageContract;
var insuranceContractAddress    = contractsData.mortgageInsuranceContract;




// get deployed contract abi from contract address;
const deployedContract = web3.eth.contract(abi).at(String(contractAddress));
const insuranceContractDeplyed = web3.eth.contract(insurance_abi).at(String(insuranceContractAddress));


console.log("prinitng contracts ");
console.log(contractAddress);
console.log(insuranceContractAddress);

var insuranceTxnDBUrL = "mongodb://localhost:27017/chain_insurance_txns";
var mortgageTxnDBUrl = "mongodb://localhost:27017/chain_mortgage_txns";
var mortgageDBUrl = "mongodb://localhost:27017/chain_mortgage"
var mortgageAutoDBUrl = "mongodb://localhost:27017/chain_mortgage_auto";
var mortgageQuotesDBUrl = "mongodb://localhost:27017/chain_mortgage_quotes";

//mongoDB database objects
var insuranceTxnDB;
var mortgageTxnDB;
var mortgageDB;
var mortgageAutoDB;
var mortgageQuoteDB;

var appPort=configData.appPort;



var customerList = [
    "adamJones@gmail.com",
    "adamSmith@gmail.com",
    "ameliaVanderton@gmail.com",
    "bobDylan@gmail.com",
    "catherineJones@gmail.com",
    "catherineStark@gmail.com",
    "cedricWatts@gmail.com",
    "emmaJenkins@gmail.com",
    "finnLawrence@gmail.com",
    "johnClegaine@gmail.com",
    "johnConner@gmail.com",
    "jupiterJones@gmail.com",
    "lilaParrish@gmail.com",
    "louiseLane@gmail.com",
    "mariaReynolds@gmail.com",
    "mattWatson@gmail.com",
    "michaelGeorge@gmail.com",
    "michaelJohnson@gmail.com",
    "naomiKay@gmail.com",
    "ravenBedford@gmail.com",
    "samJones@gmail.com",
    "samuelJackson@gmail.com",
    "sharonSmith@gmail.com",
    "tanyamcCarthy@gmail.com"
];



var globalMessagArray={
    "loanId":"",
    "message":""
}



/**
 * Pay Premium  Event.
 * @event
 */
var payPremiumEvent;
payPremiumEvent = insuranceContractDeplyed.PayPremium({}, { fromBlock: 'latest', toBlock: 'latest' });
//console.log(portfolioUpdateEvent);
payPremiumEvent.watch(function (error, result) {
    logger.info("payPremiumEvent");
    logger.debug(result);
    var args = result.args;
    try {
        logger.debug("storing transaction to DB");
        storeTransaction(args.userName, result.transactionHash, args.description, args.customerAddress, args.loanId.toNumber());
        logger.debug("transaction sent to db");
    } catch (e) {
        logger.error("Error in payPremiumEvent : " + e);
    }
});





// events for insurance Companies
/**
 * Give Quote  Event.
 * @event
 */
var giveQuoteEvent;
giveQuoteEvent = insuranceContractDeplyed.GiveQuote({}, { fromBlock: 'latest', toBlock: 'latest' });
giveQuoteEvent.watch(function (error, result) {
    logger.info("giveQuoteEvent");
    logger.debug(result);
    var args = result.args;
    try {
        logger.debug("storing transaction to DB");
        storeTransactionForInsurance(args.insuranceAddress, result.transactionHash, args.insuranceAddress, args.description, args.loanId.toNumber());
        logger.debug("transaction sent to db");
    } catch (e) {
        logger.error("Error in payPremiumEvent : " + e);
    }
});


/**
 * Premium Payment  Event.
 * @event
 */
var premiumEvent;
premiumEvent = insuranceContractDeplyed.InsurancePremium({}, { fromBlock: 'latest', toBlock: 'latest' });
premiumEvent.watch(function (error, result) {
    logger.info("payPremiumEvent");
    logger.debug(result);
    var args = result.args;
    try {
        logger.debug("storing transaction to db");
        storeTransactionForInsurance(args.insuranceAddress, result.transactionHash, args.insuranceAddress, args.description, args.loanId.toNumber());
        logger.debug("transaction sent to db");
    } catch (e) {
        logger.error("Error in payPremiumEvent");
    }
});


// ******************************** events end here ****************************




// ****************************** API starts here ******************************
console.log("connected to web3 providers");
/**
 * nodeInfo.
 * @function
 */
app.get('/nodeInfo', function(request, response) {

    console.log("*************************** get node information ****************************");
    var nodeInfo = web3.quorum.nodeInfo;
    //console.log(web3.quorum.nodeInfo);
    
    web3.quorum.getNodeInfo(function(error, result){
        console.log(error, result);
    });
    //console.log(web3.);
    var jsonResponse = {
        "blockMakerAccount":nodeInfo.blockMakerAccount,
        "blockmakestrategy":nodeInfo.blockmakestrategy,
        "canCreateBlocks":nodeInfo.canCreateBlocks,
        "canVote":nodeInfo.canVote,
        "voteAccount":nodeInfo.voteAccount
    }
    
    response.setHeader('Content-Type', 'application/json');
    response.send(jsonResponse);
})

/*

* Health check API
*/
app.get('/checkHealthStatus', function(req, res){
   logger.info("checkHealthStatus");

   res.send({
       message:"Health check"
   });
});


// ****************************** API to get portfolio of customer by loanId and wallet address *******************

/**
 * Get Portfolio Details.
 * @function getPortfolio
 * @param {number} loanId - loan id.
 * @param {string} walletAddress - wallet Address of the customer.
 */

app.get('/getPortfolio', function(request,response){
        var loanId          = request.query.loanId;
        var walletAddress   = request.query.walletAddress; 

        logger.info("getPortfolio");
        console.log("fetching portfolio from contract");

        var portfolioMortgageList = (deployedContract['getPortfolioMortgage'](loanId,{from: String(walletAddress), gas: 4000000}))
        var portfolioPropertyList = (deployedContract['getPortfolioProperty'](loanId,{from: String(walletAddress), gas: 4000000}))

        var portfolio = {
            "loanId":           portfolioMortgageList[0],
            "loanPurpose":      portfolioMortgageList[1],
            "loanType":         portfolioMortgageList[2],
            "interestType":     portfolioMortgageList[3],
            "loanTerm":         portfolioMortgageList[4],
            "purchasePrice":    portfolioMortgageList[5],
            "downPayment":      portfolioMortgageList[6],
            "propertyType":     portfolioPropertyList[1],
            "propertyAddress":  portfolioPropertyList[2]  
        }

        console.log(" printing portfolio "+JSON.stringify(portfolio));

        return response.send({message:portfolio});
});



//************************************** API to get Portfolio Status by loanId ***************************************

/**
 * Get Portfolio Status.
 * @function getPortfolioStatus
 * @param {number} loanId - loan id.
 */
app.get('/getPortfolioStatus', function(request,response){
    var loanId          = request.query.loanId;
    //var walletAddress   = request.query.walletAddress;
    console.log("--------------------   Get Portfolio Status----------------------------");
    console.log("fetching portfolioStatus from contract");

    var status = (deployedContract['getPortfolioStatus'](loanId));

    var portfolioStatus = {
       "loanId":status[0],
       "portfolioStatus":status[1],
       "message":status[2],
       "owner":status[3],
       "sharedOwners":status[4]
    }

    console.log(" printing portfolio Status"+JSON.stringify(portfolioStatus));

    return response.send({message:portfolioStatus});
});

//********************************* API to  get Portfolios by customer Address ***************************

/**
 * Get All Portfolios (applied loans for a customer).
 * @function getAllPortfolios 
 * @param {string} walletAddress - wallet Address of the customer.
 */

app.get('/getAllPortfolios', function(request,response){
    var walletAddress          = request.query.walletAddress;
    //var walletAddress   = request.query.walletAddress;
    console.log("-----------------------  API Get all portfolios ----------------------------------");
    console.log("fetching portfolioStatus from contract");

    console.log("wallet address is : "+walletAddress);
    var customerPortfolios = (deployedContract['getPortfolios'](walletAddress));


    var jsonResponse = [];
    var length = customerPortfolios[1].length;

    for(var index = 0; index < length ; index++){
        var portfolio = (deployedContract['getPortfolioStatus'](customerPortfolios[1][index]));
        var portfolioStatus = {
            "loanId":portfolio[0],
            "portfolioStatus":portfolio[1],
            "message":portfolio[2],
            "owner":portfolio[3],
            "sharedOwners":portfolio[4]
         }
        jsonResponse.push(portfolioStatus);
    }
    console.log(" printing portfolio Status"+JSON.stringify(jsonResponse));
    return response.send(jsonResponse.reverse());
});


/**
 *  API TO FETCH COINBASE ADDRESS
 */
app.get('/getCoinBase',function(request,response){
    // var password = request.query.password;
     //if(password == "mortgagepoc"){
       //  console.log("calling registerCustomerForAutomation() function ");
 
       coinBase = web3.eth.accounts[0]
       console.log(coinBase)
       
       var web3_new = new Web3(new Web3.providers.HttpProvider("http://localhost:22002"));
       bankcoinBase = web3_new.eth.accounts[0]
       

       return response.send({"coinBase":coinBase,"bankcoinBase":bankcoinBase});
  });
      



// added on feb 6 2019
app.get('/ipfs', function (req, res) {
    logger.info("ipfs");
    var fileHash = req.query.fileHash;

    try {
        //create and ipfs url and return
        logger.debug("fileHash : " + fileHash);

        /*
        ipfs.files.cat(fileHash, function (err, file) {
            if (err) throw err;
            res.send(file);
        });
        */
        res.send({
            ipfsUrl: "http://" + ipfsIpAddress + ":"+ipfsPort+"/ipfs/" + fileHash
        });
    } catch (e) {
        logger.error("ERROR : " + e);
    }
});




//********************************* API to change portfolio status *************************/

// update portfolio status 
// not : only shared owner can change the portfolio status
/**
 * Update portfolio.
 * @function updatePortfolioStatus
 * @param {number} loanId - loan id.
 * @param {string} sharedOwnerAddress - wallet Address of the sharedOwner.
 * @param {string} status - status of the loan.
 * @param {string} message - message to be sent.
 */
app.post('/updatePortfolioStatus', function (request, response) {
    logger.info("updatePortfolioStatus");
    var sharedOwnerAddress = request.query.sharedOwnerAddress;
    var loanId = request.query.loanId;
    var status = request.query.status;
    var message = request.query.message;

    logger.debug("sharedOwnerAddress : " + sharedOwnerAddress);
    logger.debug("loanId : " + loanId);
    logger.debug("status : " + status);
    logger.debug("message : " + message);
    try {
        var transactionId = (deployedContract['updatePortfolioStatus'](sharedOwnerAddress, loanId, status, message, { from: String(insuranceAccountAddress), gas: 4000000 }));
        logger.debug("portfolio update transaction " + JSON.stringify(transactionId));
        return response.send({ message: transactionId });
    } catch (e) {
        logger.error("Error in updatePortfolioStatus : " + e);
    }
});

// ******************************** API to add shared owner *********************************** 



/**
 * Add Shared Owner.
 * @function addSharedOwner
 * @param {number} loanId - loan id.
 * @param {string} newOwnerAddress - wallet address of the newOwner.
 * @param {string} ownerAddress - wallet address of the owner i.e customer.
 */
app.post('/addSharedOwner',function(request,response){
    logger.info("addSharedOwner");
    var owner           =   request.query.owner;
    var loanId          =   request.query.loanId;
    var newOwnerAddress =   request.query.newOwnerAddress;

    try{
        var transactionId = (deployedContract['addSharedOwner'](owner, loanId, newOwnerAddress,{from: String(owner), gas: 4000000}));
        console.log("printing transaction id "+transactionId);
        return response.send({message:transactionId});
    }catch(e){
        logger.error("Error in addSharedOwner : "+e);
    }

});

//********************************** API to get all dcuments by loanId ******************************

/**
 * Get Documents By Loan Id.
 * @function getDocumentHashByLoanId
 * @param {number} loanId - loan id.
 */

app.get('/getDocumentHashByLoanId', function (request, response) {

    logger.info("getDocumentHashByLoanId");
    var loanId = request.query.loanId;

    var customerDocList = (deployedContract['getUploadedDocuments'](loanId));
    logger.debug("printing customer document list" + customerDocList);

    var jsonResponse = {
        "loanId": customerDocList[0],
        "ssnHash": customerDocList[1],
        "passportHash": customerDocList[2],
        "taxReturnsHash": customerDocList[3],
        "salaryDetailsHash": customerDocList[4]
    }

    return response.send({ message: jsonResponse });

});

//************************************* API to get all wallets *****************************/

/**
 * Get All Wallets in the chain.
 * @function getAllwallets
 */

app.get('/getAllwallets', function (request, response) {
    logger.info("getAllWallets");
    var wallets = (deployedContract['getAllWallets']());
    logger.debug("list of wallets are " + wallets);
    var jsonResponse = [];
    logger.debug("Length of wallet list is :" + wallets.length);

    for (var index = 0; index < wallets.length; index++) {
        var customerObject = (deployedContract['getCustomer'](wallets[index]));
        var message;
        message = {
            "wallet": customerObject[0],
            "name": customerObject[1],
            "userName": customerObject[2]
        }

        jsonResponse.push(message);
    }
    return response.send(jsonResponse.reverse());

});





















// -------------------------------------------- insurance company API'S -------------------------------------



// ****************************** API to create insurance company ******************************


/**
 * Create Insurance Company.
 * @function createInsuranceCompany
 * @param {number} loanId - loan id.
 */

app.post('/createInsuranceCompany', function (request, response) {
    logger.info("createInsuranceCompany");
    var companyName = request.query.companyName;
    logger.debug("companyName : " + companyName);
    web3.personal.unlockAccount(insuranceAccountAddress, insuranceWalletPassword);
    let promiseA = new Promise((resolve, reject) => {
        let wait = setTimeout(() => {
            try {
                var jsonResponse = (insuranceContractDeplyed['createInsuranceCompany'](companyName, insuranceAccountAddress, { from: String(insuranceAccountAddress), gas: 4000000 }));
                logger.debug("transactionID : " + jsonResponse);
                var message = {
                    "walletAddress": insuranceAccountAddress,
                    "companyName": companyName,
                    "tx_id": jsonResponse
                }
                response.setHeader('Content-Type', 'application/json');
                response.send(message);
            } catch (e) {
                logger.error("Error in createInsuranceCompany : " + e);
            }
        }, 7000)
    });
});

// ********************************** API to get list of insurance company in the chain ************************

/**
 * Get Insurance Companies.
 * @function getInsuranceCompanies
 */
app.get('/getInsuranceCompanies', function (request, response) {
    logger.info("getInsuranceCompanies");
    var length = (insuranceContractDeplyed['getInsuranceCompanyListLength']());
    logger.debug("length of the list is : " + length);
    // fetching all companies 
    var companyList = [];
    for (var index = 0; index < length; index++) {
        var company = (insuranceContractDeplyed['getInsuranceCompany'](index));
        var companyObject = {
            "accountAddress": company[0],
            "companyName": company[1]
        }
        companyList.push(companyObject);
    }
    return response.send(companyList);
})

// ***************************** API For requesting  quote ( for customer) *******************************
/**
 * Request For Quote.
 * @function requestForQuote
 * @param {number} loanId - loan id.
 * @param {string} customerAddress - wallet address of customer.
 */
app.post('/requestForQuote', function (request, response) {

    logger.info("requestForQuote");
    var loanId = request.body.loanId;
    var customerAddress = request.body.customerAddress;
    logger.debug("loanId : " + loanId);
    logger.debug("customerAddress");

    insuranceList = [];
    insuranceList = request.body.insuranceAddresses;
    web3.personal.unlockAccount(customerAddress, "");

    // get userName
    var result = (deployedContract['getCustomer'](customerAddress));

    var userName = result[2];
    try {
        var transactionId = (insuranceContractDeplyed['requestForQuote'](loanId, insuranceList, contractAddress, userName, customerAddress, { from: String(customerAddress), gas: 4000000 }));

        console.log("printing transactionId : " + transactionId);

        response.send({ "tx_id": transactionId });
    } catch (e) {
        logger.error("Error in requestForQuote");
    }
});


// ********************* API for getting list of request quotes from customer ( for insurance company) *********************


/**
 * Get Quote Details of customer (Note : The quote should be first given by customer).
 * @function getCustomerQuoteRequest
 * @param {string} insuranceAddress - wallet address of insuranceCompany.
 */

app.get('/getCustomerQuoteRequest',function(request, response){
    logger.info("getCustomerQuoteRequest");
    mortgageQuoteDB.collection("quotes").find().toArray(function(err, result) {
        if (err) throw err;
        logger.debug(result);
        return response.send({"message":result.reverse()});
      });
});








// ******************************* API to get portfolio information ******************************

/**
 * Get Customer Portfolio Information For Insurance.
 * @function getCustomerPortfolioInfo
 * @param {number} loanId - loan id.
 */


app.get('/getCustomerPortfolioInfo', function (request, response) {
    logger.info("getCustomerPortfolioInfo");
    var loanId = request.query.loanId;
    var walletAddress = request.query.walletAddress;


    var portfolioMortgageList = (deployedContract['getPortfolioMortgage'](loanId, { from: String(walletAddress), gas: 4000000 }))
    var portfolioPropertyList = (deployedContract['getPortfolioProperty'](loanId, { from: String(walletAddress), gas: 4000000 }))

    var customerDocList = (deployedContract['getUploadedDocuments'](loanId));
    console.log("printing customer document list" + customerDocList);

    var portfolio = {
        "loanId": portfolioMortgageList[0],
        "loanPurpose": portfolioMortgageList[1],
        "loanType": portfolioMortgageList[2],
        "interestType": portfolioMortgageList[3],
        "loanTerm": portfolioMortgageList[4],
        "purchasePrice": portfolioMortgageList[5],
        "downPayment": portfolioMortgageList[6],
        "propertyType": portfolioPropertyList[1],
        "propertyAddress": portfolioPropertyList[2],
        "loanId": customerDocList[0],
        "ssnHash": customerDocList[1],
        "passportHash": customerDocList[2],
        "taxReturnsHash": customerDocList[3],
        "salaryDetailsHash": customerDocList[4]
    }

    logger.debug(" printing portfolio " + JSON.stringify(portfolio));

    return response.send({ message: portfolio });

});

// ****************************** API To give quote to customer (for insurance company) *************************

app.post('/giveQuoteToCustomer', function (request, response) {
    logger.info("giveQuoteToCustomer");
    var loanId = request.query.loanId;
    var quote = request.query.quote;
    var insuranceAddress = request.query.insuranceAddress;
    var premium = request.query.premium;

    logger.debug("loanId : " + loanId);
    logger.info("quote : " + quote);
    logger.debug("insuranceAddress : " + insuranceAddress);
    logger.debug("premium : " + premium);
    try {
        web3.personal.unlockAccount(insuranceAddress, insuranceWalletPassword);
        var transactionId = insuranceContractDeplyed['giveQuoteToCustomer'](loanId, quote, insuranceAddress, contractAddress, premium, { from: String(insuranceAddress), gas: 4000000 });

        console.log("printing transactionId : " + transactionId);

        return response.send({ message: transactionId });
    } catch (e) {
        logger.error("Error in giveQuoteToCustomer : " + e);
    }
});



// ************************** API to get  premium details given by insurance for a loanid ***********************

app.get('/getPremiumAmount', function (request, response) {
    logger.info("getPremiumAmount");
    var loanId = request.query.loanId;
    var insuranceAddress = request.query.insuranceAddress;
    logger.debug("loanId : " + loanId);
    logger.debug("insuranceAddress : " + insuranceAddress);

    var premiumDetails = insuranceContractDeplyed['getCustomerPremium'](loanId, insuranceAddress);
    var jsonResponse = {
        "loanId": loanId,
        "premiumAmount": premiumDetails[1]
    }
    return response.send({ jsonResponse });

});


//******************************** API to get quote by loanId and insuranceAddress */
app.get('/getQuote', function (request, response) {
    logger.info("getQuote");
    var loanId = request.query.loanId;
    var insuranceAddress = request.query.insuranceAddress;
    logger.debug("loanId : " + loanId);
    logger.debug("insuranceAddress : " + insuranceAddress);
    var length = (deployedContract['getRequestCompaniesLength'](loanId));
    logger.debug("length of insuranceCompanies list : " + length);
    // loop and get quotes of all insurance companies
    var jsonResponse = [];
    for (var index = 0; index < length; index++) {

        var jsonObject = (deployedContract['getQuote'](loanId, index));

        var quote_message;
        if (jsonObject[1] == "") {
            quote_message = "pending";
        } else {
            quote_message = jsonObject[1];
        }
        var quote = {
            "companyAddress": jsonObject[0],
            "quote": quote_message
        }

        jsonResponse.push(quote);
    }

    for (var index = 0; index < jsonResponse.length; index++) {
        var object = jsonResponse[index];

        if (insuranceAddress == object.companyAddress) {
            var quoteObject = {
                "quote": object.quote
            }
            return response.send({ quoteObject });

        }
    }
});


//********************************** API to get quotes by loanId ****************************************

app.get('/getQuotes',function(request, response){
    logger.info("getQuotes");
    var loanId  = request.query.loanId;
    var length  = (deployedContract['getRequestCompaniesLength'](loanId));
    logger.debug("length of insuranceCompanies list : "+length);
    // loop and get quotes of all insurance companies
    var jsonResponse = [];
    for(var index=0;index<length;index++){

        var jsonObject =  (deployedContract['getQuote'](loanId,index));

        var quote_message;
        if(jsonObject[1] == ""){
            quote_message="pending";
        }else{
            quote_message = jsonObject[1];
        }
        var quote = {
            "companyAddress":jsonObject[0],
            "quote"         :quote_message
        }

        jsonResponse.push(quote);
    }
    logger.debug("quoteList : "+JSON.stringify(jsonResponse));
    return response.send({jsonResponse});
})


//******************************** API to pay premium by quote (for customer) **************************

app.post('/payPremium', function (request, response) {
    logger.info("payPremium");
    var loanId = request.query.loanId;
    var premiumAmount = request.query.premiumAmount;
    var insuranceAddress = request.query.insuranceAddress;
    var customerAddress = request.query.customerAddress;
    var userName = request.query.userName;

    logger.debug("printing loanId " + loanId);
    logger.debug("printing premium amount " + premiumAmount);
    logger.debug("insuranceAddress" + insuranceAddress);
    logger.debug("customerAddress is : " + customerAddress);

    web3.personal.unlockAccount(insuranceAddress, insuranceWalletPassword);
    logger.debug("paying premium");

    //read sample policy file and upload ot to ipfs

    fs.readFile('Insurance.pdf', function (err, data) {
        if (err) throw err;
        //console.log(data);
        var policyHash = "";
        const files = [
            {
                path: "policyDocument",
                content: data
            }
        ]

        var fileHash = [];
        try {
            ipfs.files.add(files, (err, filesAdded) => {
                console.log(filesAdded);
                var transactionId = insuranceContractDeplyed['payPremium'](loanId, premiumAmount, insuranceAddress, contractAddress, userName, customerAddress, filesAdded[0].hash, { from: String(insuranceAddress), gas: 4000000 });
                var updateRequestQuoteTx = deployedContract['updateRequestQuote'](loanId, insuranceAddress, "approved", { from: String(insuranceAddress), gas: 4000000 });
                var addOwnerTx = deployedContract['addSharedOwner'](customerAddress, loanId, insuranceAddress, { from: String(insuranceAddress), gas: 4000000 });
                var updatePortfolioTx = deployedContract['updatePortfolioStatus'](customerAddress, loanId, "Insurance_approved", "ready_to_disburse", { from: String(insuranceAddress), gas: 4000000 });

                console.log("paying premium");
                return response.send({ message: transactionId });
            });
        } catch (e) {
            logger.error("Error in payPremium : " + e);
        }
    });
});


// ********************* API to get customer policyDetails ****************************

app.get('/getCustomerPolicy', function (request, response) {
    logger.info("getCustomerPolicy");
    var loanId = request.query.loanId;
    logger.debug("loanId : " + loanId);
    var policyDetails = insuranceContractDeplyed['getCustomerInsurance'](loanId);
    logger.debug("policyDetails : " + policyDetails);
    var jsonResponse = {
        "policyId": policyDetails[0],
        "premiumPaid": policyDetails[1],
        "premiumStatus": policyDetails[2],
        "policyDocument": policyDetails[3]
    }

    return response.send(jsonResponse);
});

//API for getting quote status of a customer loan
app.get('/getQuoteStatus', function (request, response) {
    logger.info("getQuoteStatus");
    var loanId = request.query.loanId;
    var quoteStatus = deployedContract['getRequestQuote'](loanId);
    logger.debug("loanId : " + loanId);
    logger.debug("quoteStatus : " + quoteStatus);

    var jsonResponse = {
        "loanId": quoteStatus[0],
        "status": quoteStatus[1],
        "approvedBy": quoteStatus[2],
        "appliedInsurance": quoteStatus[3]
    }
    return response.send(jsonResponse);
});











/***
 * Automated script which 
 * 
 */
function autoQuoteProvider() {
    logger.info("autoQuoteProvider");
    try {
        var loanIds = (insuranceContractDeplyed['getCustomerRequest'](insuranceAccountAddress));
        logger.debug("printing loanIds : " + loanIds);
        for (var index = 0; index < loanIds.length; index++) {
            var loanId = loanIds[index];
            var quoteStatus = deployedContract['getRequestQuote'](parseInt(loanIds[index]));
            logger.debug("printing quote status for loanId : " + loanIds[index]);
            logger.debug(quoteStatus);
            if (quoteStatus[1] == "requesting_quote") {
                console.log("*********** checking for  loanId " + loanIds[index]);
                var portfolioObject = (deployedContract['getPortfolioProperty'](loanIds[index]));
                var customerObject = (deployedContract['getCustomer'](portfolioObject[3]));
                var userName = customerObject[2];
                for (var index2 = 0; index2 < customerList.length; index2++) {
                    if (userName == customerList[index2]) {
                        var requestQuoteData = deployedContract['getRequestQuote'](loanId);
                        var insuranceList = requestQuoteData[3];
                        //check whether insurance company address is present or not. If yes dont execute following commands
                        var found = 0;
                        var rLength = deployedContract['getRequestCompaniesLength'](loanId);

                        for (var index3 = 0; index3 < rLength; index3++) {
                            var quoteObject = deployedContract['getQuote'](loanId, index3);
                            if (quoteObject[1] == "rate_of_interest_is_3") {
                                found = 1;
                                break;
                            }
                        }
                        if (found == 0) {
                            logger.debug("insurance address : " + insuranceList[index3]);
                            logger.debug("company going to give quote to customer");
                            logger.debug("userName matched with autoDB List");
                            portfolioStatusObject = deployedContract['getPortfolioStatus'](loanId);
                            let portfolioStatus = portfolioStatusObject[2];
                            logger.debug("portfolio status for loanId " + loanId + " is : " + portfolioStatus);
                            logger.debug("Giving insurance quote to loanId : " + loanId + " with userName : " + userName);
                            logger.debug("***************** portfolioStatus is :" + portfolioStatus + "  **************");
                            logger.debug("******** userName found automating process for loanId " + loanId + "************");
                            web3.personal.unlockAccount(insuranceAccountAddress, "");
                            var giveQuoteTxId = insuranceContractDeplyed['giveQuoteToCustomer'](loanId, "rate_of_interest_is_3", insuranceAccountAddress, contractAddress, "80", { from: String(insuranceAccountAddress), gas: 4000000 });
                            logger.debug("Giving quote to customer with  transactionId : " + giveQuoteTxId);
                            logger.debug("******* updating portfolio status ***********");
                            var updatePortfolioStatusTxId = (deployedContract['updatePortfolioStatus'](bankAddress, loanId, "insurance_quote_approved", "accept_quote", { from: String(insuranceAccountAddress), gas: 4000000 }));
                            logger.debug("portfolio update transaction " + JSON.stringify(updatePortfolioStatusTxId));
                        } else {
                            logger.debug("insurance already gave quote to customer with loanId : " + loanId);
                        }
                    }
                }
            } else {
                logger.debug("quote status for loanId : " + loanId + " is not requesting_quote");
            }
        }
    } catch (e) {
        logger.error("Error in autoQuoteProvider : " + e);
    }
}


 setInterval(function(){
        logger.info("calling auto quote provider ");
        autoQuoteProvider();
 },7000);



 app.post('/registerForAutomation',function(request,response){
    var password = request.query.password;
    if(password == "mortgagepoc"){
        console.log("calling registerCustomerForAutomation() function ");
        registerCustomerForAutomation();
        response.send("Automation method called");
    }else{
        console.log("invalid password");
        response.send("Error invalid password");
    }
});

/**
 * 
 * Register customers for automation
 */
function registerCustomerForAutomation(){
    var customerList = [
        "adamJones@gmail.com",
        "adamSmith@gmail.com",
        "ameliaVanderton@gmail.com",
        "bobDylan@gmail.com",
        "catherineJones@gmail.com",
        "catherineStark@gmail.com",
        "cedricWatts@gmail.com",
        "emmaJenkins@gmail.com",
        "finnLawrence@gmail.com",
        "johnClegaine@gmail.com",
        "johnConner@gmail.com",
        "jupiterJones@gmail.com",
        "lilaParrish@gmail.com",
        "louiseLane@gmail.com",
        "mariaReynolds@gmail.com",
        "mattWatson@gmail.com",
        "michaelGeorge@gmail.com",
        "michaelJohnson@gmail.com",
        "naomiKay@gmail.com",
        "ravenBedford@gmail.com",
        "samJones@gmail.com",
        "samuelJackson@gmail.com",
        "sharonSmith@gmail.com",
        "tanyamcCarthy@gmail.com"
    ];

    for(let index= 0 ; index < customerList.length; index++){
        //push userName into mongodb database
        var collectionName = customerList[index];
        var myObj = {userName:customerList[index]};
        mortgageAutoDB.collection(collectionName).insertOne(myObj, function(err, res) {
            if (err) throw err;
            console.log("customer record inserted  -----> "+customerList[index]);
        });
    }
}























































// ********************************* MongoDB API for storing and retrieving transactions **************************************

function storeTransactionForInsurance(collectionName, tx_id, insuranceAddress, description, loanId) {
    logger.info("storeTransactionForInsurance");
    var date_time;

    // get blocktimestamp by fetching blockdata
    logger.debug("printing tx_id" + tx_id);
    logger.debug("fetching transaction data  ");
    logger.debug("printing loanId " + loanId);
    var transactionData = web3.eth.getTransaction(tx_id);

    logger.debug(transactionData);

    logger.debug("fetching block data  ");
    var blockNumber = transactionData.blockNumber;

    var blockData = web3.eth.getBlock(blockNumber);
    logger.debug("fetching block timestamp  ");
    date_time = blockData.timestamp;

    logger.debug("printing block timestamp   " + date_time);

    var portfolioStatus = (deployedContract['getPortfolioStatus'](loanId));
    var accountAddress = portfolioStatus[3];

    // get name of the customer
    var customerName;

    logger.debug("printing account address : " + accountAddress);

    var result = (deployedContract['getCustomer'](accountAddress, { from: String(accountAddress), gas: 4000000 }));
    logger.debug("printing customer details : " + result);
    customerName = result[1];

    logger.debug("printing customerName : " + customerName);

    let promiseA = new Promise((resolve, reject) => {
        let wait = setTimeout(() => {

            logger.debug("************ connected to mongodb client at localhost *************");
            logger.debug("********** storing record **********");
            var myobj = { transactionId: tx_id, dateTime: date_time, description: description, customerName: customerName, loanId: loanId };

            //var collectionName = user_name+"txns";
            insuranceTxnDB.collection(collectionName).insertOne(myobj, function (err, res) {
                if (err) throw err;
                logger.debug("Transaction record inserted ....");
            });
        });
    }, 3000);
}


app.get('/getTransactionsForInsurance',function(request, response){
    logger.info("getTransactionsForInsurance");
     var collectionName = request.query.insuranceAddress;
        insuranceTxnDB.collection(collectionName).find({}).toArray(function(err, result) {
            if (err) throw err;
            console.log(result);
            return response.send(result.reverse());
        });
});


function storeTransaction(user_name,  tx_id, description, accountAddress, loanId){
    // storing transaction record for a customer into mongodb 
    // collection is by user_name i.e it can be any emailId( but it is unique)
    console.log("***************** store transactions to database *******************");

    var date_time;

    // get blocktimestamp by fetching blockdata
    console.log("printing tx_id"+tx_id);
    console.log("fetching transaction data  ");
    var transactionData = web3.eth.getTransaction(tx_id);

    console.log(transactionData);

    console.log("fetching block data  ");
    var blockNumber = transactionData.blockNumber;

    var blockData   =    web3.eth.getBlock(blockNumber);
    console.log("fetching block timestamp  ");
    date_time = blockData.timestamp;

    console.log("printing block timestamp   "+date_time);

    // get name of the customer
    var customerName;

    console.log("printing account address : "+accountAddress);

    var result = (deployedContract['getCustomer'](accountAddress,{from: String(accountAddress), gas: 4000000}));
    console.log("printing customer details : "+result);
    customerName = result[1];

    console.log("printing customerName : "+customerName);

        let promiseA = new Promise((resolve, reject) => {
            let wait = setTimeout(() => {
              
                    console.log("************ connected to mongodb client at localhost *************");
                    console.log("********** storing record **********");
                    var myobj = { transactionId: tx_id, dateTime: date_time, description: description, customerName: customerName, loanId: loanId};
              
                      var collectionName = user_name+"txns";
                      mortgageTxnDB.collection(collectionName).insertOne(myobj, function(err, res) {
                          if (err) throw err;
                          console.log("Transaction record inserted ....");
                      });
                });
        }, 3000)
}

// **************************** API for reading transactions from mongoDB ***************************

app.get('/getAllTransactions',function(request, response){
    console.log("************************ fetching all transactions from database **************************");

        var jsonResponse = [];
        
        mortgageTxnDB.listCollections().toArray(function(err, result) {
          if (err) throw err;
          console.log(result);
          //db.close();
          for(var index=0; index<result.length; index++){
            
              var collectionsName = result[index].name;
              //console.log("printing collections name"+collectionsName);
              mortgageTxnDB.collection(collectionsName).find({}).toArray(function(err, record) {
                    if (err) throw err;
                    //console.log("printing record"+JSON.stringify(record));
                    jsonResponse.push(record.reverse());
                    //console.log(JSON.stringify(jsonResponse));
                    //console.log(index);
                });
            }

            let promiseA = new Promise((resolve, reject) => {
                let wait = setTimeout(() => {
                
                response.setHeader('Content-Type', 'application/json');
                response.send(jsonResponse);
                }, 3000)
            })
        });
});




app.get('/getAllCustomerLoans',function(request, response){
    console.log("************************ fetching all customer loans from database **************************");

            var jsonResponse = [];
            
            
            mortgageDB.listCollections().toArray(function(err, result) {
              if (err) throw err;
              console.log(result);
              //db.close();
              for(var index=0; index<result.length; index++){
                
                  var collectionsName = result[index].name;
                  //console.log("printing collections name"+collectionsName);
                  mortgageDB.collection(collectionsName).find({}).toArray(function(err, record) {
                        if (err) throw err;
                        console.log("printing record"+JSON.stringify(record));
                        var walletAddress = record[0].accountAddress;
                       
                        console.log("printing wallet address : "+walletAddress);

                        var customerPortfolios = (deployedContract['getPortfolios'](walletAddress));
                        var length = customerPortfolios[1].length;
                        var customerObject = (deployedContract['getCustomer'](walletAddress,{from: String(walletAddress), gas: 4000000}));

                        var ownerName = customerObject[1];
                        for(var index = 0; index < length ; index++){
                            var portfolio = (deployedContract['getPortfolioStatus'](customerPortfolios[1][index]));
                            
                            var portfolioStatus = {
                                "loanId":portfolio[0],
                                "portfolioStatus":portfolio[1],
                                "message":portfolio[2],
                                "owner":portfolio[3],
                                "ownerName":ownerName,
                                "sharedOwners":portfolio[4]
                             }
                            jsonResponse.push(portfolioStatus);
                        }
                    });
                }
    
                let promiseA = new Promise((resolve, reject) => {
                    let wait = setTimeout(() => {
                    
                    response.setHeader('Content-Type', 'application/json');
                    response.send(jsonResponse.reverse());
                    }, 5000)
                })
            });
});


// ************** API to get All customer transactions by loanId  ********************
app.get('/getCustomerTransactionsByLoanId',function(request,response){
        console.log("******************** get transactions for customer ****************");
        var userName = request.query.userName;
        var loanId   = parseInt(request.query.loanId);
        console.log("userName is "+userName);
        console.log("loan id is "+loanId);

        var collectionsName = userName+"txns"
        console.log("printing collections name "+collectionsName);
          var query = {loanId:loanId};
          mortgageTxnDB.collection(collectionsName).find({loanId:loanId}).toArray(function(err, result) {
            if (err) throw err;
            console.log(result);
            return response.send(result.reverse());
          });
    });

// ************************* API to get all customer transactions **************************

app.get('/getCustomerTransactions',function(request,response){

    console.log("******************** get transactions for customer ****************");

    var userName = request.query.userName;

    var collectionsName = userName+"txns"
    mortgageTxnDB.collection(collectionsName).find({}).toArray(function(err, result) {
        if (err) throw err;
        console.log(result);
        return response.send(result.reverse());
    });
});


app.post('/setMessage',function(request,response){
    var loanId = request.query.loanId;
    var message = request.query.message;

    console.log("*********************** set message ************************");

    if(loanId == "initial"){
        globalMessagArray.loanId = "";
        globalMessagArray.message = message;

        console.log(" loan id is initial");
    }else{
        console.log("*************** hitting setMessage **************");
        globalMessagArray.loanId = loanId;
        globalMessagArray.message = message;
        console.log("loan id is not initital");
    }
    return response.send({globalMessagArray});
})

app.get('/getMessage',function(request,response){
    console.log("********** hitting get message *************");
    console.log(globalMessagArray);
    return response.send({globalMessagArray});
    
});





//********************* quorum transactions api  *******************************************/


app.get('/getTransactionDetails',function(request, repsonse){
    var tx_id = request.query.tx_id;

    var jsonResponse = web3.eth.getTransaction(tx_id);
    return response.send(jsonResponse);
});



app.get('getTransactionReceipt', function(request, response){
    var tx_id  = request.query.tx_id;

    var jsonResponse = web3.eth.getTransactionReceipt(tx_id);
    return response.send(jsonResponse);
});

// *******************  server configurations **********************************

app.use('/', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.send("{message: API service for mortgage app on ethereum");
})


MongoClient.connect(insuranceTxnDBUrL, function(err, insuranceTxnDBTemp) {
    insuranceTxnDB = insuranceTxnDBTemp;
    MongoClient.connect(mortgageTxnDBUrl, function(err, mortgageTxnDBTemp) {
        mortgageTxnDB = mortgageTxnDBTemp;
        MongoClient.connect(mortgageDBUrl, function(err, mortgageDBTemp) {
            mortgageDB = mortgageDBTemp;
            MongoClient.connect(mortgageAutoDBUrl, function(err, mortgageAutoDBTemp) {
                mortgageAutoDB = mortgageAutoDBTemp;
		MongoClient.connect(mortgageQuotesDBUrl, function(err, mortgageQuoteDBTemp) {
                    mortgageQuoteDB = mortgageQuoteDBTemp;
                // ************** app runs at 0.0.0.0  *****************************
                //all ok start the app
                app.listen(appPort, '0.0.0.0',function () {
                    console.log("Application  listening on port "+appPort+". ");
                })
		});
            });
        });
    });
});
