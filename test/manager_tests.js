const { tickets : {
	ticket1, 
	ticket2, 
	ticket3, 
	nonTransferableTicket,
	nonValidTicket
} } = require("./helpers/constants");
const { shouldFail, createTickets } = require("./helpers/utils");
const Manager = artifacts.require("Manager");

contract("Manager", (accounts) => {
	let managerInstance;
	const [alice, bob, charlie, daniel, ellen, forest] = accounts;
	beforeEach(async function () {
		managerInstance = await Manager.new();
		await managerInstance.createTicket(
			"prueba",
			"17/07/2023",
			"asdasdasd",
			1,
			1000000,
			0,
			0,
			{from: forest},
		);

	});

	// TESTs OF CREATETICKET FUNCTION

	context("createTicket Function", async () => {
		it("Should create a new ticket", async function () {
			let owner = bob;

			await managerInstance.createTicket(
				"prueba",
				"17/07/2023",
				"asdasdasd",
				1,
				1000000,
				0,
				0,
				{from: owner},
				
			);
			const array = await managerInstance.showTicketsPerUser(bob);

			assert.equal(array.length, 1, "Bob don't have tickets");
		});

		it("Should fail when passing parameters wrong", async () => {
			let owner = bob;
			await shouldFail(async() => {
				try{
					await managerInstance.createTicket(/* no parameters */)
					return false;
				} catch(e) {
					return true;
				}
			}, 'The function should not run');
		});
	})
	
	// TESTs OF SHOWALLTICKETS FUNCTION
	
	context("showAllTickets Function", async function () {
		it("If you pass a position the function return a ticket of TicketList", async() => {
			try {
				const ticket = await managerInstance.showAllTickets(0);
				assert(true);
			} catch (error) {
				assert(false, error);
			}
		})


		it("If you pass an incorrect position the function should fail", async() => {
			await shouldFail(async() => {
				try{
					await managerInstance.showAllTickets(1)
					return false;
				} catch(e) {
					return true;
				}
			}, 'The function should not run');
		})

		it("If nothing is passed to it, the function should fail", async() => {
			await shouldFail(async() => {
				try{
					await managerInstance.showAllTickets(/* no parameters */)
					return false;
				} catch(e) {
					return true;
				}
			}, 'The function should not run');
		})
	})

	// TESTs OF SHOWTICKETSBYADDRESS FUNCTION

	context("showTicketsByAddress Function", async function () {
		it("If you pass an address of ticket the function return the ticket info", async() => {
			try {
				const res = await managerInstance.showAllTickets(0);
				const ticket = await managerInstance.showTicketsByAddress(res.ticketAddress)
				assert(true);
			} catch (error) {
				assert(false), error;
			}
		})


		it("If you pass an incorrect address, the function should fail", async() => {
			const randomAddress = ellen;
			await shouldFail(async() => {
				try{
					const ticket = await managerInstance.showTicketsByAddress(randomAddress)
					return false;
				} catch(e) {
					return true;
				}
			}, 'The function should not run');
		})

		it("If nothing is passed to it, the function should fail", async() => {
			await shouldFail(async() => {
				try{
					const ticket = await managerInstance.showTicketsByAddress()
					return false;
				} catch(e) {
					return true;
				}
			}, 'The function should not run');
		})
	})

	// TESTs OF SHOWTICKETSPERUSER FUNCTION

	context("showTicketsPerUser Function", async function () {
		it("If you pass an user address the function return an array with the user's tickets", async() => {
			let owner = bob;
			await managerInstance.createTicket(
					"prueba",
					"17/07/2023",
					"asdasdasd",
					1,
					1000000,
					0,
					0,
					{from: owner},
			);
			const array = await managerInstance.showTicketsPerUser(bob);
			assert.isArray(array, 'no sé')
		})


		it("If you pass an incorrect user address the function return an empty array", async() => {
			const randomAddress = ellen;
			const array = await managerInstance.showTicketsPerUser(randomAddress);
			assert.equal(array.length, 0, "This address should not have tickets");
		})

		it("If nothing is passed to it, the function should fail", async() => {
			await shouldFail(async() => {
				try{
					const array = await managerInstance.showTicketsPerUser();
					return false;
				} catch(e) {
					return true;
				}
			}, 'The function should not run');
		})

	})

		// TESTs OF TRANSFERTICKET FUNCTION

	context("transferTicket Function", async function () {
		//TODO: ver la clase 13 y ver como usar web3.js para hacer transacciones.
		it("Should transfer the ticket from old owner to new owner", async() => {
			// Set up
			await createTickets(ticket1, bob, async(a, b, c, d, e, f, g, h) => {
				await managerInstance.createTicket(a, b, c, d, e, f, g, h);
			});
			await createTickets(ticket2, bob, async(a, b, c, d, e, f, g, h) => {
				await managerInstance.createTicket(a, b, c, d, e, f, g, h);
			});
			await createTickets(ticket3, bob, async(a, b, c, d, e, f, g, h) => {
				await managerInstance.createTicket(a, b, c, d, e, f, g, h);
			});
			// Actions
			try {
				const ticketsArrayBefore = await managerInstance.showTicketsPerUser(bob)
				await managerInstance.transferTicket(ticketsArrayBefore[0], charlie, {from: charlie, to: bob, value: 1000000000})
				const ticketsArrayAfter = await managerInstance.showTicketsPerUser(bob)
				const ticketsArrayCharlie = await managerInstance.showTicketsPerUser(charlie)
				// expect(ticketsArrayAfter.length).to.equal(2)
				// expect(ticketsArrayCharlie.length).to.equal(1)
				assert.equal(ticketsArrayAfter.length, 2, "Bob don't have tickets");
				assert.equal(ticketsArrayCharlie.length, 1, "Alice don't have tickets");
			} catch (error) {
				assert(false, error);
			}
		})

		it("Should fail when the transfer status of ticket is not transferable", async() => {
			// Set up
			await createTickets(nonTransferableTicket, bob, async(a, b, c, d, e, f, g, h) => {
				await managerInstance.createTicket(a, b, c, d, e, f, g, h);
			});
			// Actions
			await shouldFail(async() => {
				try{
					const ticketsArrayBefore = await managerInstance.showTicketsPerUser(bob);
					await managerInstance.transferTicket(ticketsArrayBefore[0], charlie, {from: charlie, to: bob, value: 1000000000})
					return false;
				} catch(e) {
					return true;
				}
			}, 'The function should not run');
		})

		it("Should fail when the status of ticket is not valid", async() => {
			// Set up
			await createTickets(nonValidTicket, bob, async(a, b, c, d, e, f, g, h) => {
				await managerInstance.createTicket(a, b, c, d, e, f, g, h);
			});
			// Actions
			await shouldFail(async() => {
				try{
					const ticketsArrayBefore = await managerInstance.showTicketsPerUser(bob);
					await managerInstance.transferTicket(ticketsArrayBefore[0], charlie, {from: charlie, to: bob, value: 1000000000})
					return false;
				} catch(e) {
					return true;
				}
			}, 'The function should not run');
		})

		it("Should fail when the amount of ETH transferred is less than the ticket price", async() => {
			// Set up
			await createTickets(ticket1, bob, async(a, b, c, d, e, f, g, h) => {
				await managerInstance.createTicket(a, b, c, d, e, f, g, h);
			});
			// Actions
			await shouldFail(async() => {
				try{
					const ticketsArrayBefore = await managerInstance.showTicketsPerUser(bob);
					await managerInstance.transferTicket(ticketsArrayBefore[0], charlie, {from: charlie, to: bob, value: 10000})
					return false;
				} catch(e) {
					return true;
				}
			}, 'The function should not run');
		})

		it("Should fail when the msg.sender is different from the newOwner", async() => {
			// Set up
			await createTickets(ticket1, bob, async(a, b, c, d, e, f, g, h) => {
				await managerInstance.createTicket(a, b, c, d, e, f, g, h);
			});
			// Actions
			await shouldFail(async() => {
				try{
					const ticketsArrayBefore = await managerInstance.showTicketsPerUser(bob);
					await managerInstance.transferTicket(ticketsArrayBefore[0], charlie, {from: daniel, to: bob, value: 1000000000})
					return false;
				} catch(e) {
					return true;
				}
			}, 'The function should not run');
		})


		it("Should fail when the new owner is the old owner", async() => {
			// Set up
			await createTickets(ticket1, bob, async(a, b, c, d, e, f, g, h) => {
				await managerInstance.createTicket(a, b, c, d, e, f, g, h);
			});
			// Actions
			await shouldFail(async() => {
				try{
					const ticketsArrayBefore = await managerInstance.showTicketsPerUser(bob);
					await managerInstance.transferTicket(ticketsArrayBefore[0], bob, {from: bob, to: bob, value: 1000000000})
					return false;
				} catch(e) {
					return true;
				}
			}, 'The function should not run');
		})

	})

	// TESTs OF CHANGETICKETPRICE FUNCTION
	context("changeTicketPrice Function", async function () {

		it("Should change the ticket price", async() => {

			// Set up
			await createTickets(ticket1, bob, async(a, b, c, d, e, f, g, h) => {
				await managerInstance.createTicket(a, b, c, d, e, f, g, h);
			});

			// Actions
			try {
				const ticketsArrayBefore = await managerInstance.showTicketsPerUser(bob)
				const ticketBefore = await managerInstance.showTicketsByAddress(ticketsArrayBefore[0])
				await managerInstance.changeTicketPrice(ticketsArrayBefore[0], 2000000000, {from: bob, value: 100000000})
				const ticketAfter = await managerInstance.showTicketsByAddress(ticketsArrayBefore[0])
				assert.equal(ticketAfter.price.toNumber(), 2000000000, "Bob don't have tickets");
			} catch (error) {
				assert(false, error);
			}
		})


		it("Should collect a 5% fee on the new price and deposit it in the Manager contract", async() => {

			// Set up
			await createTickets(ticket1, bob, async(a, b, c, d, e, f, g, h) => {
				await managerInstance.createTicket(a, b, c, d, e, f, g, h);
			});

			// Actions
			try {
				const balanceBefore = await managerInstance.showStatistics()
				assert.equal(balanceBefore.contractBalance.toNumber(), 0, "The balance must be 0");
				const ticketsArray = await managerInstance.showTicketsPerUser(bob)
				await managerInstance.changeTicketPrice(ticketsArray[0], 2000000000, {from: bob, value: 100000000})
				const balanceAfter = await managerInstance.showStatistics()
				assert.equal(balanceAfter.contractBalance.toNumber(), 100000000, "The balance must be 100000000");
			} catch (error) {
				assert(false, error);
			}
		})


		it("Should fail when the msg.sender is not the ticket owner", async() => {

			// Set up
			await createTickets(ticket1, bob, async(a, b, c, d, e, f, g, h) => {
				await managerInstance.createTicket(a, b, c, d, e, f, g, h);
			});

			// Actions
			await shouldFail(async() => {
				try{
					const ticketsArrayBefore = await managerInstance.showTicketsPerUser(bob)
					await managerInstance.changeTicketPrice(ticketsArrayBefore[0], 2000000000, {from: daniel, value: 100000000})
					return false;
				} catch(e) {
					return true;
				}
			}, 'The function should not run');
		})


		it("Should fail when the msg.value is minor that the 5% of newPrice", async() => {

			// Set up
			await createTickets(ticket1, bob, async(a, b, c, d, e, f, g, h) => {
				await managerInstance.createTicket(a, b, c, d, e, f, g, h);
			});

			// Actions
			await shouldFail(async() => {
				try{
					const ticketsArrayBefore = await managerInstance.showTicketsPerUser(bob)
					await managerInstance.changeTicketPrice(ticketsArrayBefore[0], 2000000000, {from: bob, value: 10000000})
					return false;
				} catch(e) {
					return true;
				}
			}, 'The function should not run');
		})
	})


	// TESTs OF CHANGETRANSFERSTATUS FUNCTION
	context("changeTransferStatus Function", async function () {

		it("Should change the ticket transfer status", async() => {

			// Set up
			await createTickets(ticket1, bob, async(a, b, c, d, e, f, g, h) => {
				await managerInstance.createTicket(a, b, c, d, e, f, g, h);
			});

			// Actions
			try {
				const ticketsArrayBefore = await managerInstance.showTicketsPerUser(bob)
				const ticketBefore = await managerInstance.showTicketsByAddress(ticketsArrayBefore[0])
				assert.equal(ticketBefore.transferStatus.toNumber(), 0, "The ticket status is transferible (0)");
				await managerInstance.changeTransferStatus(ticketsArrayBefore[0], 1, {from: bob})
				const ticketAfter = await managerInstance.showTicketsByAddress(ticketsArrayBefore[0])
				assert.equal(ticketAfter.transferStatus.toNumber(), 1, "The ticket status is non transferible (1)");
			} catch (error) {
				assert(false, error);
			}
		})


		it("Should fail when the msg.sender is not the ticket owner", async() => {

			// Set up
			await createTickets(ticket1, bob, async(a, b, c, d, e, f, g, h) => {
				await managerInstance.createTicket(a, b, c, d, e, f, g, h);
			});

			// Actions
			await shouldFail(async() => {
				try{
					const ticketsArrayBefore = await managerInstance.showTicketsPerUser(bob)
					await managerInstance.changeTransferStatus(ticketsArrayBefore[0], 1, {from: daniel})
					return false;
				} catch(e) {
					return true;
				}
			}, 'The function should not run');
		})
	})



	// TESTs OF DELETETICKET FUNCTION
	context("deleteTicket Function", async function () {
		it("Should delete ticket", async() => {

			// Set up
			await createTickets(ticket1, bob, async(a, b, c, d, e, f, g, h) => {
				await managerInstance.createTicket(a, b, c, d, e, f, g, h);
			});

			await createTickets(ticket2, bob, async(a, b, c, d, e, f, g, h) => {
				await managerInstance.createTicket(a, b, c, d, e, f, g, h);
			});

			await createTickets(ticket3, bob, async(a, b, c, d, e, f, g, h) => {
				await managerInstance.createTicket(a, b, c, d, e, f, g, h);
			});

			// Actions
			try {
				const statisticsBefore = await managerInstance.showStatistics();
				assert.equal(statisticsBefore.totalTickets.toNumber(), 4, "Something went wrong");
				const ticketsArrayBefore = await managerInstance.showTicketsPerUser(bob)
				assert.equal(ticketsArrayBefore.length, 3, "Bob don't have tickets");
				await managerInstance.deleteTicket(1, {from: alice});
				const ticketsArrayAfter = await managerInstance.showTicketsPerUser(bob)
				assert.equal(ticketsArrayAfter.length, 2, "Bob don't have tickets");
				const statisticsAfter = await managerInstance.showStatistics();
				assert.equal(statisticsAfter.totalTickets.toNumber(), 3, "Something went wrong")
			} catch (error) {
				assert(false, error);
			}
		})


		it("Should fail if the caller not is the owner of contract Manager", async() => {

			// Set up
			await createTickets(ticket1, bob, async(a, b, c, d, e, f, g, h) => {
				await managerInstance.createTicket(a, b, c, d, e, f, g, h);
			});

			// Actions
			await shouldFail(async() => {
				try{
					await managerInstance.deleteTicket(1, {from: daniel});
					return false;
				} catch(e) {
					return true;
				}
			}, 'The function should not run');
		})
	})
});
