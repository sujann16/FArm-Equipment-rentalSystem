"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCoordinatesForPincode = void 0;
// Mapping common pincode prefixes in India to coordinates for development testing
const pincodeCoordinates = {
    '560': [77.5946, 12.9716], // Bangalore (Karnataka)
    '570': [76.6394, 12.2958], // Mysore (Karnataka)
    '110': [77.2090, 28.6139], // Delhi
    '400': [72.8347, 18.9220], // Mumbai (Maharashtra)
    '500': [78.4867, 17.3850], // Hyderabad (Telangana)
    '600': [80.2707, 13.0827], // Chennai (Tamil Nadu)
    '700': [88.3639, 22.5726], // Kolkata (West Bengal)
    '380': [72.5714, 23.0225], // Ahmedabad (Gujarat)
    '302': [75.7873, 26.9124], // Jaipur (Rajasthan)
    '226': [80.9462, 26.8467] // Lucknow (Uttar Pradesh)
};
const getCoordinatesForPincode = async (pincode) => {
    const cleanPincode = pincode.replace(/\s/g, '');
    const prefix = cleanPincode.substring(0, 3);
    
    // Use a pseudo-random generator based on Math.sin to get deterministic high-variance values
    const pinNum = parseInt(cleanPincode, 10) || 560001;
    const sinLng = Math.sin(pinNum * 12.9898);
    const sinLat = Math.sin(pinNum * 78.233);
    
    // Math.sin returns a value in [-1, 1]
    const factorLng = sinLng - Math.floor(sinLng) - 0.5; // [-0.5, 0.5]
    const factorLat = sinLat - Math.floor(sinLat) - 0.5; // [-0.5, 0.5]
    
    let baseCoords;
    let maxOffset;
    
    if (pincodeCoordinates[prefix]) {
        baseCoords = pincodeCoordinates[prefix];
        maxOffset = 0.15; // up to 15km spread within city/region
    } else {
        baseCoords = [77.5946, 12.9716]; // default Bangalore
        maxOffset = 0.5;
    }
    
    const devLng = factorLng * maxOffset;
    const devLat = factorLat * maxOffset;
    
    return [
        Math.round((baseCoords[0] + devLng) * 10000) / 10000,
        Math.round((baseCoords[1] + devLat) * 10000) / 10000
    ];
};
exports.getCoordinatesForPincode = getCoordinatesForPincode;
