/**
 * Test script for location encoding/decoding in encodeCompact/decodeCompact
 */

// Minimal implementation of encodeCompact with location support
function encodeCompact(data) {
    const serializeLocation = (location) => {
        if (!location) return '';
        const parts = [];
        if (location.coords && typeof location.coords.lat === 'number' && typeof location.coords.lng === 'number') {
            parts.push(`${location.coords.lat},${location.coords.lng}`);
        }
        if (location.label && location.label.trim()) {
            parts.push(location.label.trim());
        }
        return parts.join(';');
    };

    const compact = [
        data.name || '',
        data.title || '',
        data.department || '',
        data.email || '',
        data.phone || '',
        data.mobile || '',
        data.avatar || '',
        (data.greetings || []).join(','),
        data.socialNote || '',
        data.organization || '',
        data.address || '',
        serializeLocation(data.location)
    ].join('|');

    return btoa(encodeURIComponent(compact))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

// Minimal implementation of decodeCompact
function decodeCompact(encoded) {
    try {
        const padding = '='.repeat((4 - encoded.length % 4) % 4);
        const compact = decodeURIComponent(atob(
            encoded.replace(/-/g, '+').replace(/_/g, '/') + padding
        ));

        const parts = compact.split('|');

        const parseLocation = (locationStr) => {
            if (!locationStr || !locationStr.trim()) return null;
            try {
                const parts = locationStr.split(';');
                const location = {};
                if (parts[0] && parts[0].includes(',')) {
                    const [lat, lng] = parts[0].split(',').map(s => parseFloat(s.trim()));
                    if (!isNaN(lat) && !isNaN(lng)) {
                        location.coords = { lat, lng };
                    }
                    if (parts[1]) {
                        location.label = parts[1].trim();
                    }
                } else {
                    location.label = locationStr.trim();
                }
                return Object.keys(location).length > 0 ? location : null;
            } catch (error) {
                return null;
            }
        };

        return {
            name: parts[0] || '',
            title: parts[1] || '',
            department: parts[2] || '',
            email: parts[3] || '',
            phone: parts[4] || '',
            mobile: parts[5] || '',
            avatar: parts[6] || '',
            greetings: parts[7] ? parts[7].split(',') : [],
            socialNote: parts[8] || '',
            organization: parts[9] || '',
            address: parts[10] || '',
            location: parseLocation(parts[11])
        };
    } catch (error) {
        return null;
    }
}

// Test cases
const testCases = [
    {
        name: 'Test 1: coords and label',
        data: {
            name: 'John Doe',
            title: 'Engineer',
            department: 'IT',
            email: 'john@example.com',
            phone: '123-456-7890',
            mobile: '098-765-4321',
            avatar: '',
            greetings: ['Hello'],
            socialNote: '',
            organization: 'Tech Corp',
            address: '123 Main St',
            location: {
                coords: { lat: 25.0478, lng: 121.5318 },
                label: 'Taipei Office'
            }
        }
    },
    {
        name: 'Test 2: only coords',
        data: {
            name: 'Jane Smith',
            title: 'Manager',
            department: 'HR',
            email: 'jane@example.com',
            phone: '',
            mobile: '',
            avatar: '',
            greetings: [],
            socialNote: '',
            organization: '',
            address: '',
            location: {
                coords: { lat: 24.1477, lng: 120.6736 }
            }
        }
    },
    {
        name: 'Test 3: only label',
        data: {
            name: 'Bob Johnson',
            title: 'Director',
            department: 'Sales',
            email: 'bob@example.com',
            phone: '',
            mobile: '',
            avatar: '',
            greetings: [],
            socialNote: '',
            organization: '',
            address: '',
            location: {
                label: 'Remote Office'
            }
        }
    },
    {
        name: 'Test 4: no location',
        data: {
            name: 'Alice Brown',
            title: 'Analyst',
            department: 'Finance',
            email: 'alice@example.com',
            phone: '',
            mobile: '',
            avatar: '',
            greetings: [],
            socialNote: '',
            organization: '',
            address: '',
            location: null
        }
    }
];

let allPassed = true;

testCases.forEach(testCase => {
    console.log('\n' + testCase.name);
    console.log('='.repeat(50));

    try {
        const encoded = encodeCompact(testCase.data);
        console.log('Encoded:', encoded.substring(0, 50) + '...');

        const decoded = decodeCompact(encoded);

        const originalLocation = testCase.data.location;
        const decodedLocation = decoded.location;

        console.log('Original location:', JSON.stringify(originalLocation));
        console.log('Decoded location:', JSON.stringify(decodedLocation));

        let locationMatches = false;

        if (originalLocation === null && decodedLocation === null) {
            locationMatches = true;
        } else if (originalLocation && decodedLocation) {
            const coordsMatch = (!originalLocation.coords && !decodedLocation.coords) ||
                (originalLocation.coords && decodedLocation.coords &&
                    originalLocation.coords.lat === decodedLocation.coords.lat &&
                    originalLocation.coords.lng === decodedLocation.coords.lng);

            const labelMatch = (!originalLocation.label && !decodedLocation.label) ||
                (originalLocation.label === decodedLocation.label);

            locationMatches = coordsMatch && labelMatch;
        }

        if (locationMatches) {
            console.log('✅ PASS: Location encoding/decoding successful');
        } else {
            console.log('❌ FAIL: Location mismatch');
            allPassed = false;
        }
    } catch (error) {
        console.log('❌ FAIL: Error - ' + error.message);
        allPassed = false;
    }
});

console.log('\n' + '='.repeat(50));
console.log(allPassed ? '✅ All tests passed!' : '❌ Some tests failed');
process.exit(allPassed ? 0 : 1);
