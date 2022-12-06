const tickets = {
    ticket1: {
        eventName: "ticket1", 
        eventDate: "17/07/2023",
        eventDescription: "prueba 1",
        eventType: 1,
        price: 1000000000,
        status: 0,
        transferStatus: 0,
    },
    ticket2: {
        eventName: "ticket2", 
        eventDate: "17/07/2024",
        eventDescription: "prueba 2",
        eventType: 1,
        price: 1000000000,
        status: 0,
        transferStatus: 0,
    },
    ticket3: {
        eventName: "ticket3", 
        eventDate: "17/07/2025",
        eventDescription: "prueba 3",
        eventType: 1,
        price: 1000000000,
        status: 0,
        transferStatus: 0,
    },
    nonTransferableTicket: {
        eventName: "ticket4", 
        eventDate: "17/07/2026",
        eventDescription: "prueba 4",
        eventType: 1,
        price: 1000000000,
        status: 0,
        transferStatus: 1,
    },
    nonValidTicket: {
        eventName: "ticket4", 
        eventDate: "17/07/2026",
        eventDescription: "prueba 4",
        eventType: 1,
        price: 1000000000,
        status: 2,
        transferStatus: 0,
    }
}

module.exports = {
    tickets,
}







