var fs = require("fs");
var Web3 = require('web3-quorum');

var web3 = new Web3(new Web3.providers.HttpProvider(configData.web3Provider));

let configRawData = fs.readFileSync('./config.json');  
let configData = JSON.parse(configRawData);

var insuranceAccountAddress = configData.insuranceWalletAddress;
var insuranceCompanyName = configData.insuranceCompanyName;
var insuranceWalletPassword = configData.insuranceWalletPassword;

console.log("insurance company wallet address : ", insuranceAccountAddress);
console.log("Insurance company name : ", insuranceCompanyName);


function registerInsuranceCompany() {
    logger.debug("companyName : " + companyName);
    web3.personal.unlockAccount(insuranceAccountAddress, insuranceWalletPassword);
    try {
        var txId = (insuranceContractDeplyed['createInsuranceCompany'](companyName, insuranceAccountAddress, { from: String(insuranceAccountAddress), gas: 4000000 }));
        logger.debug("insurance commpany registered, transactionID : " + txId);
    } catch (e) {
        logger.error("Error : " + e);
    }
}

registerInsuranceCompany();