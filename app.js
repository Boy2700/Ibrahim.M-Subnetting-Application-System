// app.js
function calculateSubnet() {
    const ipAddress = document.getElementById('ip-address').value;
    const cidr = parseInt(document.getElementById('subnet-mask').value);
    const classType = document.querySelector('input[name="class"]:checked').value;

    if (!isValidIP(ipAddress)) {
        alert('Please enter a valid IP address.');
        return;
    }

    const subnetDetails = getSubnetDetails(ipAddress, cidr, classType);
    displayResult(subnetDetails);
}

function isValidIP(ip) {
    const ipPattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipPattern.test(ip);
}

function getSubnetDetails(ip, cidr, classType) {
    const ipSegments = ip.split('.').map(Number);
    const subnetMask = getSubnetMask(cidr);
    const wildcardMask = getWildcardMask(subnetMask);
    const networkAddress = getNetworkAddress(ipSegments, subnetMask);
    const broadcastAddress = getBroadcastAddress(networkAddress, subnetMask);
    const hostRange = getUsableHostRange(networkAddress, broadcastAddress);
    const totalHosts = Math.pow(2, 32 - cidr);
    const usableHosts = totalHosts - 2;
    const ipClass = classType === 'any' ? getClass(ipSegments[0]) : classType.toUpperCase();
    const ipType = getIPType(ipSegments);
    const binaryID = ipSegments.map(segment => segment.toString(2).padStart(8, '0')).join('.');
    const integerID = ipSegments.reduce((acc, segment, index) => acc + segment * Math.pow(256, 3 - index), 0);
    const hexID = integerID.toString(16).toUpperCase();

    return {
        ip,
        subnetMask: subnetMask.join('.'),
        binarySubnetMask: subnetMask.map(segment => segment.toString(2).padStart(8, '0')).join('.'),
        wildcardMask: wildcardMask.join('.'),
        networkAddress: networkAddress.join('.'),
        broadcastAddress: broadcastAddress.join('.'),
        hostRange,
        totalHosts,
        usableHosts,
        cidr: '/' + cidr,
        ipClass,
        ipType,
        binaryID,
        integerID,
        hexID
    };
}

function getSubnetMask(cidr) {
    const mask = [];
    for (let i = 0; i < 4; i++) {
        if (cidr >= 8) {
            mask.push(255);
            cidr -= 8;
        } else {
            mask.push(256 - Math.pow(2, 8 - cidr));
            cidr = 0;
        }
    }
    return mask;
}

function getWildcardMask(subnetMask) {
    return subnetMask.map(segment => 255 - segment);
}

function getNetworkAddress(ipSegments, subnetMask) {
    return ipSegments.map((segment, index) => segment & subnetMask[index]);
}

function getBroadcastAddress(networkAddress, subnetMask) {
    return networkAddress.map((segment, index) => segment | (255 - subnetMask[index]));
}

function getUsableHostRange(networkAddress, broadcastAddress) {
    const start = [...networkAddress];
    start[3] += 1;
    const end = [...broadcastAddress];
    end[3] -= 1;
    return `${start.join('.')} - ${end.join('.')}`;
}

function getClass(firstSegment) {
    if (firstSegment <= 126) return 'A';
    if (firstSegment <= 191) return 'B';
    return 'C';
}

function getIPType(ipSegments) {
    if (
        (ipSegments[0] === 10) ||
        (ipSegments[0] === 172 && ipSegments[1] >= 16 && ipSegments[1] <= 31) ||
        (ipSegments[0] === 192 && ipSegments[1] === 168)
    ) {
        return 'Private';
    }
    return 'Public';
}

function displayResult(details) {
    const result = document.getElementById('result');
    result.innerHTML = `
        <div class="result-box">
            <h2>Subnetting Details</h2>
            <table>
                <tr><th>IP Address</th><td>${details.ip}</td></tr>
                <tr><th>Subnet Mask</th><td>${details.subnetMask}</td></tr>
                <tr><th>Binary Subnet Mask</th><td>${details.binarySubnetMask}</td></tr>
                <tr><th>Wildcard Mask</th><td>${details.wildcardMask}</td></tr>
                <tr><th>Network Address</th><td>${details.networkAddress}</td></tr>
                <tr><th>Broadcast Address</th><td>${details.broadcastAddress}</td></tr>
                <tr><th>Usable Host IP Range</th><td>${details.hostRange}</td></tr>
                <tr><th>Total Hosts</th><td>${details.totalHosts}</td></tr>
                <tr><th>Usable Hosts</th><td>${details.usableHosts}</td></tr>
                <tr><th>CIDR Notation</th><td>${details.cidr}</td></tr>
                <tr><th>IP Class</th><td>${details.ipClass}</td></tr>
                <tr><th>IP Type</th><td>${details.ipType}</td></tr>
                <tr><th>Binary ID</th><td>${details.binaryID}</td></tr>
                <tr><th>Integer ID</th><td>${details.integerID}</td></tr>
                <tr><th>Hex ID</th><td>${details.hexID}</td></tr>
            </table>
        </div>
    `;
}