pragma solidity >=0.5.0 <0.7.0;

contract PropertyFeed {

    struct Property {
        string upi;
        string propertyAddress;
    }

    mapping (string => Property) properties;
    string[] public propertyUPIs;

    /*
     *
     */
    function setProperty(string memory _upi, string memory _propertyAddress) public {
        Property storage property = properties[_upi];

        property.upi = _upi;
        property.propertyAddress = _propertyAddress;

        propertyUPIs.push(_upi) -1;
    }

    /*
     *
     */
    function countProperties() view public returns (uint) {
        return propertyUPIs.length;
    }

    /*
     *
     */
    function getPropertyAddress(string memory _upi) view public returns (string memory) {
        return properties[_upi].propertyAddress;
    }
}
