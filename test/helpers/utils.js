async function shouldFail(callback, error) {
    const assignment = await callback();
    assignment ? assert(assignment) : assert(assignment, error);
}

async function createTickets(ticket, owner, callback) {
    const {
		eventName,
		eventDate,
		eventDescription,
		eventType,
		price,
		status,
		transferStatus
	} = ticket
    try {
        await callback(
            eventName,
            eventDate,
            eventDescription,
            eventType,
            price,
            status,
            transferStatus,
            {from: owner}
        )
    } catch (error) {
        throw error;
    }
}

module.exports = {
    shouldFail,
    createTickets
}