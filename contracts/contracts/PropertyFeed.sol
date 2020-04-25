pragma solidity >=0.5.0 <0.7.0;

contract PropertyFeed {

    struct Property {
        string upi;
        string propertyAddress;
        string lat;
        string lng;
        string unit;
    }

    mapping (string => Property) properties;
    string[] public propertyUPIs;

    /*
     *
     */
    function setProperty(
        string memory _upi,
        string memory _propertyAddress,
        string memory _lat,
        string memory _lng,
        string memory _unit
    ) public {
        Property storage property = properties[_upi];

        property.upi = _upi;
        property.propertyAddress = _propertyAddress;
        property.lat = _lat;
        property.lng = _lng;
        property.unit = _unit;

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

    /*
     *
     */
    function getPropertyCoordinates(string memory _upi) view public returns (
        string memory,
        string memory,
        string memory
    ) {
        return (
            properties[_upi].lat,
            properties[_upi].lng,
            properties[_upi].unit
        );
    }
}
