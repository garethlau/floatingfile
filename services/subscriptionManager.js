const mongoose = require("mongoose");
const Space = mongoose.model("Space");

let spaces = {};

const EventTypes = {
	CONNECTION_ESTABLISHED: "CONNECTION_ESTABLISHED",
	FILES_UPDATED: "FILES_UPDATED",
	HISTORY_UPDATED: "HISTORY_UPDATED",
	SPACE_DELETED: "SPACE_DELETED",
};

async function addClient(code, client) {
	if (!spaces[code]) {
		spaces[code] = [];
	}

	try {
		const space = await Space.findOne({ code }).exec();
		space.users.push({
			id: client.id,
			username: client.username,
		});

		space.history.push({
			action: "JOIN",
			author: client.username,
			timestamp: Date.now(),
		});

		await space.save();
	} catch (error) {
		console.log(error);
	}

	spaces[code].push(client);
}

async function removeClient(code, client) {
	spaces[code] = spaces[code].filter((c) => c.id !== client.id);
	if (spaces[code].length === 0) {
		let newSpaces = Object.assign({}, spaces);
		delete newSpaces[code];
		spaces = newSpaces;
	}

	try {
		const space = await Space.findOne({ code }).exec();
		space.users = space.users.filter((user) => user.id !== client.id);
		space.history.push({ action: "LEAVE", author: client.username, timestamp: Date.now() });
		await space.save();
	} catch (error) {
		console.log(error);
	}
}

function sendDataToClients(code, data) {
	const clients = spaces[code];
	clients.forEach((client) => {
		client.res.write(`data: ${JSON.stringify(data)}\n\n`);
	});
}

function broadcast(code, type) {
	sendDataToClients(code, { type });
}

function sendToClient(client, data) {
	client.res.write(`data: ${JSON.stringify(data)}\n\n`);
}

module.exports = {
	broadcast,
	sendToClient,
	removeClient,
	addClient,
	EventTypes,
};
