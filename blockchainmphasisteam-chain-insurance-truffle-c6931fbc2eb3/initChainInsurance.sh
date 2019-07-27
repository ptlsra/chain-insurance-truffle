#!/bin/bash
ipAddress=$SYSTEM_IP
node getContractConfig.js $ipAddress
echo "ContractConfig.js updated"


node updateConfig $ipAddress 5001 $ipAddress 27017 5050 $ipAddress 24002 
 
echo "config.js updated"

echo "starting syncQuotes.js with forever"
#node chainInsuranceAPI.js 


#nohup node syncQuotes.js  > syncQuotes.log &


forever start syncQuotes.js


echo "starting chainInsuranceAPI.js with forever"

node chainInsuranceAPI.js

#nohup node chainInsuranceAPI.js  > chainInsuranceAPI.log &


#node chainInsuranceAPI.js

