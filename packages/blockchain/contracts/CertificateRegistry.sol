// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract CertificateRegistry is AccessControl {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    struct Certificate {
        string ipfsCid;   // IPFS CID of the PDF
        string studentId; // internal/university ID
        address issuer;   // issuer wallet address
        bool revoked;
    }

    // docHash (sha256 of PDF) => certificate
    mapping(bytes32 => Certificate) public certificates;

    event CertificateRegistered(
        bytes32 indexed docHash,
        string ipfsCid,
        string studentId,
        address indexed issuer
    );

    event CertificateRevoked(
        bytes32 indexed docHash,
        address indexed issuer
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function grantIssuer(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(ISSUER_ROLE, account);
    }

    function registerCertificate(
        bytes32 docHash,
        string calldata ipfsCid,
        string calldata studentId
    ) external onlyRole(ISSUER_ROLE) {
        require(docHash != bytes32(0), "Invalid hash");
        require(bytes(ipfsCid).length > 0, "Missing CID");
        require(certificates[docHash].issuer == address(0), "Already registered");
        certificates[docHash] = Certificate({
            ipfsCid: ipfsCid,
            studentId: studentId,
            issuer: msg.sender,
            revoked: false
        });

        emit CertificateRegistered(docHash, ipfsCid, studentId, msg.sender);
    }

    function revokeCertificate(bytes32 docHash) external onlyRole(ISSUER_ROLE) {
        require(certificates[docHash].issuer == msg.sender, "Not original issuer");
        require(!certificates[docHash].revoked, "Already revoked");
        certificates[docHash].revoked = true;
        emit CertificateRevoked(docHash, msg.sender);
    }

    function verifyCertificate(bytes32 docHash)
        external
        view
        returns (
            bool valid,
            string memory ipfsCid,
            string memory studentId,
            address issuer
        )
    {
        Certificate memory c = certificates[docHash];
        if (bytes(c.ipfsCid).length == 0) {
            return (false, "", "", address(0));
        }
        return (!c.revoked, c.ipfsCid, c.studentId, c.issuer);
    }
}
