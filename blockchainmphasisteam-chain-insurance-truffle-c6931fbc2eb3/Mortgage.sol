pragma solidity^0.4.0;
contract Mortgage{
    
    struct Customer{
        address accountAddress;
        string  name;
        string  userName;
        string  emailId;
        string  mobileNumber;
        string  password;       // md5 hash of the original password
    }
    
    struct PortfolioMortgage{
        address accountAddress;
        uint    loanId;
        string  loanPurpose;
        string  loanType;
        string  interestType;
        string  loanTerm;
        string  purchasePrice;
        string  downPayment;
    
    }
    
    struct PortfolioProperty{
        address accountAddress;
        uint    loanId;
        string  propertyType;
        string  propertyAddress;
    }
    
    struct PortfolioEmployment{
        string  annualIncome;
        string  experience;
        string  position;
    }
    
    struct PortfolioStatus{
        uint        loanId;
        string      portfolioStatus;
        string      message;
        address     owner;
        address[]   sharedOwner;
    }
    
    struct Portfolios{
        address accountAddress;
        uint[]  loanId;
    }
    
    struct PortfolioDocuments{
        address ownerAddress;
        uint loanId;
        string ssnHash;
        string passportHash;
        string taxReturnsHash;
        string salaryDetailsHash;
    }
    
    struct RequestQuoteList{
        uint                            loanId;
        string                          status;
        address                         approvedBy;
        address[]                       insuranceAddress;
        //string[]    quotes;
        mapping(address     =>  string) quote;
    }
    
    struct RequestQuote{
        uint loanId;
        address insuranceCompany;
        string quote;
    }
    
    uint customerCount=0;
    uint portfolioCount=0;
    
    mapping(address     =>  Customer)           public customers;
    mapping(uint        =>  PortfolioMortgage)  public mortgages;
    mapping(uint        =>  PortfolioProperty)  public property;
    mapping(uint        =>  PortfolioStatus)    public statuses;
    mapping(address     =>  Portfolios)         public portfolios;
    mapping(uint        =>  PortfolioDocuments) public portfolioDocuments;
    mapping(uint        =>  RequestQuoteList)   public requestQuoteList;
    address[]                                   public wallets;
    
    event CustomerRegistration(address customerAddress, string userName, string description); // params (customerAddress, userName, description)
    event PortfolioCreation(address customerAddress, string userName, string description, uint loanId); // params(customerAddress, userName, description)
    event PortfolioUpdate(address customerAddress, string userName, string description, string status, uint loanId); // params(address, userName, description, status)
    event PreDocUpload(address customerAddress, string userName, string description, uint loanId); // params(address, userName, description)
    event PostDocUpload(address customerAddress, string userName, string description, uint loanId); //params(address, userName, description)
    event PortfoliosUpdate(string);
    event addOwner(address customerAddress,string userName,string description, uint loanId); //params(address, userName, description)
    
    /*
    function initCustomerInsurance(uint policyId, uint loanId)public{
        customerInsurance[loanId] = CustomerInsurance({policyId: policyId, loanId:loanId});
    }
   
    */
    
    function requestForQuote(uint loanId, address[] insuranceAddress)public{
        //string[] list;
        string quote;
        requestQuoteList[loanId] = RequestQuoteList({loanId:loanId, status: "requesting_quote", approvedBy:0, insuranceAddress:insuranceAddress});
        PortfoliosUpdate("Sanjeevs: Mortgage.requestForQuote called for insuranceAddresses");
    }
    
    function updateRequestQuote(uint loanId, address insuranceCompany, string status)public{
        uint length = requestQuoteList[loanId].insuranceAddress.length;
        
        for(uint index=0;index<length;index++){
            if(keccak256(requestQuoteList[loanId].insuranceAddress[index]) == keccak256(insuranceCompany)){
                requestQuoteList[loanId].status = status;
                requestQuoteList[loanId].approvedBy = insuranceCompany;
            }
        }
    }
    
    function giveQuote(uint loanId, string quote, address insuranceCompany)public{
        uint length = requestQuoteList[loanId].insuranceAddress.length;
        for(uint index=0;index<length;index++){
            if(keccak256(requestQuoteList[loanId].insuranceAddress[index]) == keccak256(insuranceCompany)){
                //requestQuoteList[loanId].quotes.push(quote);
                requestQuoteList[loanId].quote[insuranceCompany] = quote;
            }
        }
    }
    
    function getRequestQuote(uint loanId)constant public returns(uint, string, address, address[]){
        return(requestQuoteList[loanId].loanId,requestQuoteList[loanId].status, requestQuoteList[loanId].approvedBy, requestQuoteList[loanId].insuranceAddress);
    }
    
    function getRequestCompaniesLength(uint loanId)constant public returns(uint){
        return(requestQuoteList[loanId].insuranceAddress.length);
    }
    
    function getQuote(uint loanId, uint index) constant public returns(address, string){
        address insuranceAddress = requestQuoteList[loanId].insuranceAddress[index];
        return(requestQuoteList[loanId].insuranceAddress[index], requestQuoteList[loanId].quote[insuranceAddress]);
    }
    
    function enrollCustomer(address accountAddress, string name, string userName, string emailId, string mobileNumber, string password)public{
        customers[accountAddress] = Customer({accountAddress:accountAddress,name:name,userName:userName,emailId:emailId,mobileNumber:mobileNumber,password:password});
        wallets.push(accountAddress);
        CustomerRegistration(accountAddress,userName,"Customer account creation");
    }
    
    function getCustomer(address customerAddress)constant returns(address,string,string,string,string,string){
        return(customers[customerAddress].accountAddress,customers[customerAddress].name,customers[customerAddress].userName,customers[customerAddress].emailId,customers[customerAddress].mobileNumber,customers[customerAddress].password);
    }
    
    function createPortfolioMortgage(address bankAddress, address accountAddress, uint loanId, string loanPurpose, string loanType, string interestType, string loanTerm, string purchasePrice,string downPayment, string propertyType, string propertyAddress){
              portfolioDocuments[loanId] = PortfolioDocuments({ownerAddress:accountAddress, loanId:loanId, ssnHash:"",passportHash:"",taxReturnsHash:"",salaryDetailsHash:""});
              mortgages[loanId] = PortfolioMortgage({accountAddress:accountAddress, loanId:loanId, loanPurpose:loanPurpose, loanType:loanType, interestType:interestType, loanTerm:loanTerm, purchasePrice:purchasePrice, downPayment:downPayment});
              property[loanId] = PortfolioProperty({accountAddress:accountAddress, loanId: loanId, propertyType: propertyType, propertyAddress: propertyAddress});
              address[] owners;
              statuses[loanId] = PortfolioStatus({loanId:loanId, portfolioStatus:"initial_approval_pending", message:"processing", owner: accountAddress, sharedOwner: owners});
              statuses[loanId].sharedOwner.push(bankAddress);
              statuses[loanId].sharedOwner.push(accountAddress);
           
              if(portfolios[accountAddress].accountAddress != 0){
                  addPortfolioId(accountAddress, loanId);
                  PortfoliosUpdate("portfolio for account already created. loan id appended");
              }else{
                  uint[] id;
                  portfolios[accountAddress] = Portfolios({accountAddress: accountAddress, loanId: id});
                  portfolios[accountAddress].loanId.push(loanId);
              }
              PortfolioCreation(accountAddress, customers[accountAddress].userName,"Applied for loan", loanId);
    }
    
    function getPortfolioMortgage(uint loanId)constant public returns(uint, string, string, string, string, string, string){
              return(loanId, mortgages[loanId].loanPurpose, mortgages[loanId].loanType, mortgages[loanId].interestType, mortgages[loanId].loanTerm, mortgages[loanId].purchasePrice, mortgages[loanId].downPayment);
    }
    
    function getPortfolioProperty(uint loanId)constant public returns(uint, string, string, address){
              return(loanId, property[loanId].propertyType, property[loanId].propertyAddress, property[loanId].accountAddress);
    }
    
    function getPortfolioStatus(uint loanId)constant public returns(uint, string, string, address, address[]){
              return(statuses[loanId].loanId, statuses[loanId].portfolioStatus, statuses[loanId].message, statuses[loanId].owner, statuses[loanId].sharedOwner);
    }
    
    function getPortfolios(address accountAddress)constant public returns(address, uint[]){
              return(portfolios[accountAddress].accountAddress, portfolios[accountAddress].loanId);
    }
    
    // update portfolio
    
    function updatePortfolioStatus(address accountAddress, uint loanId, string status, string message){
        uint length = statuses[loanId].sharedOwner.length;
        
        for(uint index=0; index < length; index++){
            if(keccak256(statuses[loanId].sharedOwner[index]) == keccak256(accountAddress)){
                statuses[loanId].portfolioStatus    =   status;
                statuses[loanId].message            =   message;

                address customerAddress = statuses[loanId].owner;
                
                string userName = customers[customerAddress].userName;
                
                PortfolioUpdate(customerAddress,userName,"Portfolio_status_changed",status, loanId);
                break;
            }
        }

        //PortfolioUpdate(accountAddress,"portfolio status changed");
    }
    
    function addSharedOwner(address owner,uint loanId, address newOwnerAddress)public{
        uint length = statuses[loanId].sharedOwner.length;
        
        for(uint index=0; index<length; index++){
            if(keccak256(statuses[loanId].sharedOwner[index]) == keccak256(owner)){
                statuses[loanId].sharedOwner.push(newOwnerAddress);
                addOwner(owner, customers[owner].userName,"New_shared_owner_added", loanId);
                break;
            }
        }
    }
    
    function addPortfolioId(address accountAddress, uint loanId){
        portfolios[accountAddress].loanId.push(loanId);
    }
    
    function uploadPreDocuments(uint loanId, address ownerAddress, string ssnHash, string passportHash){
        // checking if he is the owner of the portfoli or not
        if(keccak256(statuses[loanId].owner) == keccak256(ownerAddress)){
            portfolioDocuments[loanId].ssnHash = ssnHash;
            portfolioDocuments[loanId].passportHash = passportHash;
            
            PreDocUpload(ownerAddress, customers[ownerAddress].userName, "Identity documents uploaded", loanId);
        }
    }
    
    function uploadPostDocuments(uint loanId, address ownerAddress, string taxReturnsHash, string salaryDetailsHash){
        if(keccak256(statuses[loanId].owner) == keccak256(ownerAddress)){
            portfolioDocuments[loanId].taxReturnsHash = taxReturnsHash;
            portfolioDocuments[loanId].salaryDetailsHash = salaryDetailsHash;
            
            PostDocUpload(ownerAddress, customers[ownerAddress].userName,"Income tax documents uploaded", loanId);
        }
    }
    
    function getUploadedDocuments(uint loanId)constant returns(uint, string, string, string, string){
        return(portfolioDocuments[loanId].loanId, portfolioDocuments[loanId].ssnHash, portfolioDocuments[loanId].passportHash, portfolioDocuments[loanId].taxReturnsHash, portfolioDocuments[loanId].salaryDetailsHash);
    }
    
    function getAllWallets()constant returns(address[]){
        return wallets;
    }
}
