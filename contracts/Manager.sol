// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Ticket.sol";

contract Manager is Ownable {
    uint256 private commissionPercentage = 5;

    mapping(Ticket => address) TicketsToOwners;
    mapping(address => Ticket[]) ticketsPerUser;
    Ticket[] private TicketList;

    event FundsReceived(uint256 amount);
    event commissionCharged(uint256 feeCharged, uint256 contractBalance);

    modifier isOwner(Ticket ticket) {
        require(
            TicketsToOwners[ticket] == msg.sender,
            "You are not the owner of the ticket"
        );
        _;
    }

    receive() external payable {
        emit FundsReceived(msg.value);
    }

    fallback() external payable {
        emit FundsReceived(msg.value);
    }

    constructor() {}

    // Funciones de uso privado del contrato Manager

    function getTotalTickets() private view returns (uint256 totalTickets) {
        return TicketList.length;
    }

    function getTotalAmountForTickets() private view returns (uint256) {
        uint256 amount = 0;
        for (uint256 i = 0; i < TicketList.length; i++) {
            amount += Ticket(TicketList[i]).getPrice();
        }
        return amount;
    }

    function changeTicketOwnership(
        Ticket ticket,
        address _newOwner,
        address _oldOwner
    ) private {
        // Encontramos la posicion del ticket en el array del mapping ticketsPerUser.
        uint256 ticketPositionInArray = 0;
        for (uint256 i = 0; i < ticketsPerUser[_oldOwner].length; i++) {
            if (ticketsPerUser[_oldOwner][i] == ticket) {
                ticketPositionInArray = i;
            }
        }

        ticketsPerUser[_oldOwner][ticketPositionInArray] = ticketsPerUser[
            _oldOwner
        ][ticketsPerUser[_oldOwner].length - 1];
        ticketsPerUser[_oldOwner].pop();
        ticketsPerUser[_newOwner].push(ticket);
    }

    /*
        Función para “tokenizar” un ticket. 
        Esto significa crear un nuevo Ticket con los datos correspondientes.
    */

    function createTicket(
        string memory _eventName,
        string memory _eventDate,
        string memory _eventDescription,
        EventType _eventType,
        uint256 _price,
        TicketStatus _status,
        TransferStatus _transferStatus,
        address _owner
    ) public {
        Ticket ticket = new Ticket(
            _eventName,
            _eventDate,
            _eventDescription,
            _eventType,
            _price,
            _status,
            _transferStatus,
            _owner
        );
        TicketsToOwners[ticket] = _owner;
        TicketList.push(ticket);
        // en transfer ticket hay que modificar para hacer este cambio de
        // propiedad en el mapping ticketsPerUser.
        ticketsPerUser[_owner].push(ticket);
    }

    /*
        Función para ver todos los tickets que contiene la plataforma,
        sin importar quien sea el dueño.
    */
    function showAllTickets(uint256 _ticketIndex)
        public
        view
        returns (
            address ticketAddress,
            bytes32 idTicket,
            string memory eventName,
            string memory eventDate,
            uint256 price,
            string memory eventDescription,
            EventType eventType,
            TicketStatus status,
            address owner
        )
    {
        return Ticket(TicketList[_ticketIndex]).showInformation();
    }

    /*
        Función para ver todos los tickets que contiene la plataforma a partir
        de su address.
    */

    function showTicketsByAddress(address _ticketAddress)
        public
        view
        returns (
            address ticketAddress,
            bytes32 idTicket,
            string memory eventName,
            string memory eventDate,
            uint256 price,
            string memory eventDescription,
            EventType eventType,
            TicketStatus status,
            address owner
        )
    {
        return Ticket(_ticketAddress).showInformation();
    }

    /*
        Función para ver los tickets que están asignados a un dueño particular (address).
    */

    function showTicketsPerUser(address _owner)
        public
        view
        returns (Ticket[] memory userTickets)
    {
        uint256 length = ticketsPerUser[_owner].length;
        Ticket[] memory tickets = new Ticket[](length);

        for (uint256 i = 0; i < length; i++) {
            tickets[i] = ticketsPerUser[_owner][i];
        }

        return tickets;
    }

    /*
        Función para permitir la transferencia de un ticket según su estado,
        es decir, que si un Ticket tiene un estado Transferible, puede cambiar de dueño. 
        Permitiendo que el nuevo dueño envíe ethers a través de la plataforma y 
        que el dueño anterior reciba esos ethers.
    */

    function transferTicket(Ticket ticket, address _newOwner) public payable {
        require(
            ticket.getTransferStatus() == TransferStatus.TRANSFERIBLE,
            "This ticket cannot be transferred"
        );
        require(
            ticket.getStatus() == TicketStatus.VALID,
            "This ticket is not valid for transfer"
        );
        require(
            msg.value >= ticket.getPrice(),
            "Insufficient amount to make the purchase"
        );
        require(
            msg.sender == _newOwner,
            "Only the new owner can perform this action."
        );
        address oldOwner = TicketsToOwners[ticket];
        (bool success, ) = oldOwner.call{value: msg.value}("");
        require(success == true, "Transaction failed!");
        TicketsToOwners[ticket] = _newOwner;
        Ticket(ticket).changeOwner(_newOwner);
        changeTicketOwnership(ticket, _newOwner, oldOwner);
    }

    /*
        Función para permitir que el dueño de un ticket pueda cambiar el precio del mismo,
        pero en ese caso el contrato Manager cobra un 5% de comisión y queda en su balance.
    */
    
    function changeTicketPrice(Ticket ticket, uint256 _newPrice)
        public
        payable
        isOwner(ticket)
    {
        uint256 managerFee = (_newPrice * commissionPercentage) / 100;
        require(msg.value >= managerFee, "The amount transfer is insufficient");
        Ticket(ticket).changePrice(_newPrice);
        emit commissionCharged(msg.value, address(this).balance);
    }

    /*
        Función para cambiar el status de transferencia del ticket
    */

    function changeTransferStatus(Ticket _ticket, uint256 _newStatus)
        public
        isOwner(_ticket)
    {
        _ticket.changeTransferStatus(_newStatus);
    }

    /*
        Función para retornar la cantidad de tickets que tiene la plataforma, 
        el precio promedio de los tickets y el balance del contrato Manager. 
    */

    function showStatistics()
        public
        view
        returns (
            uint256 totalTickets,
            uint256 averagePriceForTicket,
            uint256 contractBalance
        )
    {
        uint256 a = getTotalTickets();
        uint256 b = getTotalAmountForTickets() / getTotalTickets();
        uint256 c = address(this).balance;
        return (a, b, c);
    }

    /*
        Función para eliminar el ticket de la lista. 
    */

    function deleteTicket(uint256 _ticketPositionInArray) public onlyOwner{
        for (uint256 i = _ticketPositionInArray; i < TicketList.length; i++) {
            TicketList[_ticketPositionInArray] = TicketList[
                _ticketPositionInArray + 1
            ];
        }

        delete TicketsToOwners[Ticket(TicketList[TicketList.length - 1])];
        TicketList.pop();
    }
}
