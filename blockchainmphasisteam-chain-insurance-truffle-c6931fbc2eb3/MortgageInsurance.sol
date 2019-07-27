pragma solidity ^0.4.0;
import "./Mortgage.sol";

contract MortgageInsurance{
    
    struct CustomerRequest{
        uint                        loanId;
        address[]                   insuranceCompany;
        
    }
    
    struct InsuranceRequest{
        uint[]      loanIds;
        address     insuranceCompany;
    }
    
    struct InsuranceCompany{
        string  companyName;
        address companyAddress;
    }
    
    struct CustomerPolicy{
        uint            policyId;
        uint            loanId;
        uint            premiumPaid;
        string          premiumStatus;
        address         insuranceCompanyAddress;
        string          policyProvider;
        string          policyDocument;
    }
    
    struct CustomerPremium{
        uint                            loanId;
        mapping(address     => string)  premium;
    }
    
    //mapping
    
    mapping(uint            =>          InsuranceCompany)           public insuranceCompany;
    mapping(address         =>          InsuranceRequest)           public insuranceRequests;
    mapping(uint            =>          CustomerRequest)            public customerRequests;
    mapping(uint            =>          CustomerPolicy)             public customerPolicies;
    mapping(uint            =>          CustomerPremium)            public customerPremium;
    //events
    
    event InsuranceCompanyCreation(string companyName, address companyAddress);
    event InsurancePolicyCreation(string message);
    
    event PayPremium(address customerAddress, string userName, string description, uint loanId);
    event RequestQuote(address customerAddress, string username, string description, uint loanId);
    event GiveQuote(address insuranceAddress, string description, uint loanId);
    event InsurancePremium(address insuranceAddress, string description, uint loanId);
    
    uint policyId = 1000;
    uint public insuranceCount=0;
    // functions for insurance companies
    
    function createInsuranceCompany(string companyName, address companyAddress)public{
        insuranceCompany[insuranceCount] = InsuranceCompany({companyName:companyName, companyAddress:companyAddress});
        
        uint[] loanList;
        
        insuranceRequests[companyAddress] = InsuranceRequest({loanIds: loanList, insuranceCompany: companyAddress});
        InsuranceCompanyCreation(companyName, companyAddress);
        insuranceCount = insuranceCount + 1;
    }
    
    function getInsuranceCompany(uint index)constant public returns(address, string){
        //return (insuranceCompany[insuranceAddress].accountAddress, insuranceCompany[insuranceAddress].companyName);
        return(insuranceCompany[index].companyAddress, insuranceCompany[index].companyName);
    }

    function getInsuranceCompanyListLength()constant public returns(uint){
        return insuranceCount;
    }
    
    function createCustomerPolicy(uint loanId, uint policyId, string status)public {
        //customerPolicies[policyId] = CustomerPolicy({policyId: policyId, loanId: loanId, premiumPaid: 0, premiumStatus: status});
        InsurancePolicyCreation("Insurance policy created for customer  : ");
    }
    
    function giveQuoteToCustomer(uint loanId, string quote, address insuranceCompany, address mortgageAddress, string premium){
       Mortgage mortgage = Mortgage(mortgageAddress);
       mortgage.giveQuote(loanId, quote, insuranceCompany);
       customerPremium[loanId] = CustomerPremium({loanId:loanId});
       customerPremium[loanId].premium[insuranceCompany]=premium;
       GiveQuote(insuranceCompany, "giving quote to customer", loanId);
       //giveQuote(uint loanId, string quote, address insuranceCompany)
    }
    
    function getCustomerPremium(uint loanId, address insuranceAddress)constant public returns(uint, string){
        return(customerPremium[loanId].loanId, customerPremium[loanId].premium[insuranceAddress]);
    }
    
    // functions for mortgage contract
    function requestForQuote(uint loanId, address[] insuranceAddresses, address mortgageAddress, string userName, address customerAddress)public{
        customerRequests[loanId] = CustomerRequest({loanId: loanId, insuranceCompany: insuranceAddresses});
        
        customerPolicies[loanId]   = CustomerPolicy({loanId:loanId, policyId: 0, premiumPaid: 0, premiumStatus: "not_paid",insuranceCompanyAddress:0,policyProvider:"",policyDocument:""});

        uint length = insuranceAddresses.length;
        
        for(uint index=0;index<length;index++){
            address ins_address = insuranceAddresses[index];
            insuranceRequests[ins_address].loanIds.push(loanId);
        }
        RequestQuote(customerAddress, userName, "requesting for quote",loanId);
        Mortgage mortgage = Mortgage(mortgageAddress);
        mortgage.requestForQuote(loanId, insuranceAddresses);
    }
    
    // getter methods for insurance companies
    
    function getCustomerRequest(address insuranceAddress)constant public returns(uint[]){
        return (insuranceRequests[insuranceAddress].loanIds);
    }
    
    function getCustomerRequestList(uint loanId)constant public returns(address[]){
        return (customerRequests[loanId].insuranceCompany);
    }
    
    function payPremium(uint loanId,uint premiumAmount, address insuranceCompany, address mortgageAddress, string userName, address customerAddress, string policyDocument){
       policyId                                     =           policyId + 1;
       customerPolicies[loanId].premiumPaid         =           premiumAmount;
       customerPolicies[loanId].premiumStatus       =           "Paid";
       customerPolicies[loanId].policyId            =           policyId;
       customerPolicies[loanId].policyDocument      =           policyDocument;
       
       InsurancePremium(insuranceCompany, "premium amount paid ", loanId);
       PayPremium(customerAddress, userName, "Premium paid to insurance company",loanId);

    }

    function getCustomerInsurance(uint loanId)constant public returns(uint, uint, string, string){
        return (customerPolicies[loanId].policyId, customerPolicies[loanId].premiumPaid, customerPolicies[loanId].premiumStatus, customerPolicies[loanId].policyDocument);
    }
}
