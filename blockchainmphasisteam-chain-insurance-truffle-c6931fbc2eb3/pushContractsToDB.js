var fs = require('fs');
var mongoUrl = "mongodb://127.0.0.1:27017/";

var solidityFileList        = ["Mortgage.sol","MortgageInsurance.sol"];
var solidityJsonFileList    = ["Mortgage.json","MortgageInsurance.json"];
var contractNameList        = ["Mortgage","MortgageInsurance"];
var contractAddresses=[];

let rawdata = fs.readFileSync('./contractConfig.json');
let contractsData = JSON.parse(rawdata);
console.log(JSON.stringify(contractsData));

mortgageContractAddress = contractsData.mortgageContract;
mortgageInsuranceContractAddress = contractsData.mortgageInsuranceContract;


console.log("************* fetched contract address from config file ****************");


function pushContractToDB(solidityFileName, solidityJsonfileName, contractName, contractAddress, abi){
    var MongoClient = require('mongodb').MongoClient;
    var url = mongoUrl+"chainins_blockchaindb";
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        console.log("************ connected to mongodb client at localhost *************");
        console.log("************ storing record **********");
        let myobj = {contractAddress:contractAddress, contractName:contractName, abi:abi};
        var collectionName = "contracts";
        db.collection(collectionName).insertOne(myobj, function(err, res) {
            if (err) throw err;
            console.log("contract abi pushed to mongodb ....");
            //console.log(res);
            db.close();
        });
    });

}


var mortgageContractSource = fs.readFileSync("Mortgage.json");
var mortgageContract = JSON.parse(mortgageContractSource)["contracts"];
var mortgageabi = JSON.parse(mortgageContract["Mortgage.sol:Mortgage"].abi);

console.log("************** pushing Mortgage contract **********");
pushContractToDB(solidityFileList[0], solidityJsonFileList[0], contractNameList[0], mortgageContractAddress, mortgageabi);


setTimeout(function(){
        //Hospital.sol
        var mortgageInsuranceSource = fs.readFileSync("MortgageInsurance.json");
        var mortgageInsuranceContract = JSON.parse(mortgageInsuranceSource)["contracts"];
        var mortgageInsuranceabi = JSON.parse(mortgageInsuranceContract["MortgageInsurance.sol:MortgageInsurance"].abi);
        console.log("************** pushing MortgageInsurance contract **********");

        pushContractToDB(solidityFileList[1], solidityJsonFileList[1], contractNameList[1], mortgageInsuranceContractAddress, mortgageInsuranceabi);

},3000);
