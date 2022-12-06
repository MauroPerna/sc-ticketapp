// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.17;

enum TransferStatus {
    TRANSFERIBLE,
    NO_TRANSFERIBLE
}

enum TicketStatus {
    VALID,
    USED,
    EXPIRED
}

enum EventType {
    SPORTS,
    MUSIC,
    CINEMA
}

contract Ticket {
    bytes32 private id;
    string private eventName;
    string private eventDate;
    string private eventDescription;
    EventType private eventType;
    uint256 private price;
    TicketStatus private status;
    TransferStatus private transferStatus;
    address private owner;

    constructor(
        string memory _eventName,
        string memory _eventDate,
        string memory _eventDescription,
        EventType _eventType,
        uint256 _price,
        TicketStatus _status,
        TransferStatus _transferStatus,
        address _owner
    ) {
        id = generateId(_eventName, _eventDate, _price);
        eventName = _eventName;
        eventDate = _eventDate;
        eventDescription = _eventDescription;
        eventType = _eventType;
        price = _price;
        status = _status;
        transferStatus = _transferStatus;
        owner = _owner;
    }

    function getPrice() external view returns (uint256) {
        return price;
    }

    function getStatus() external view returns (TicketStatus) {
        return status;
    }

    function getTransferStatus() external view returns (TransferStatus) {
        return transferStatus;
    }

    function changePrice(uint256 _newPrice) external {
        price = _newPrice;
    }

    function changeTransferStatus(uint256 _status) external {
        transferStatus = TransferStatus(_status);
    }

    function changeStatus(TicketStatus _newStatus) external {
        status = _newStatus;
    }

    function changeOwner(address _newOwner) external {
        owner = _newOwner;
    }

    function generateId(
        string memory _eventName,
        string memory _eventDate,
        uint256 _price
    ) private view returns (bytes32 idTicket) {
        bytes32 hash = keccak256(
            abi.encodePacked(block.timestamp, _eventName, _eventDate, _price)
        );
        return hash;
    }

    function showInformation()
        public
        view
        returns (
            address _ticketAddress,
            bytes32 _idTicket,
            string memory _eventName,
            string memory _eventDate,
            uint256 _price,
            string memory _eventDescription,
            EventType _eventType,
            TicketStatus _status,
            TransferStatus _transferStatus,
            address _owner
        )
    {
        return (
            address(this),
            id,
            eventName,
            eventDate,
            price,
            eventDescription,
            eventType,
            status,
            transferStatus,
            owner
        );
    }
}
