const Logger = require("../services/logger");
const logger = new Logger(require("path").basename(__filename));
const constants = require("../constants");
const socketActions = constants.SOCKET_ACTIONS;
const mongoose = require("mongoose");
const Space = mongoose.model("Space");

module.exports = (app, io) => {
	io.sockets.on("connection", (socket) => {
		logger.log(`New connection: ${socket.id}`);
		let id = "";

		socket.on("FROM_CLIENT", (action) => {
			let isValid = true;
			if (typeof action === "string") {
				try {
					let json = JSON.parse(action);
					action = json;
				} catch (err) {
					logger.warn("Unsupported action object.");
					isValid = false;
					return;
				}
			}
			if (!isValid) return;
			const { type, payload, code } = action;
			switch (type) {
				case socketActions.FILES_UPDATED:
					socket.broadcast.to(id).emit("FROM_SERVER", {
						type: socketActions.FILES_UPDATED,
					});
					break;
				case socketActions.NEW_CONNECTION:
					break;
				case socketActions.CLOSE:
					socket.in(id).emit("FROM_SERVER", {
						type: socketActions.CLOSE,
					});
					break;
				case socketActions.TIMEOUT:
					break;
				case socketActions.FILE_REMOVED:
					socket.broadcast.to(id).emit("FROM_SERVER", {
						type: socketActions.FILES_UPDATED,
					});
					break;
				case socketActions.FILE_UPLOADED:
					break;
				case socketActions.FILE_DOWNLOADED:
					break;
				case socketActions.FILES_EXPIRED:
					break;
				case socketActions.OPTIONS_UPDATED:
					socket.broadcast.to(id).emit("FROM_SERVER", {
						type: socketActions.OPTIONS_UPDATED,
						payload: action.payload,
					});
					break;
				case socketActions.CURRENT_CONNECTIONS:
					break;
				case socketActions.JOIN_SPACE:
					id = code;
					socket.join(code, async () => {
						let space = await Space.findOne({ code }).exec();
						space.users.push({
							socketId: socket.id,
							username: payload,
						});
						space.history.push({
							action: "JOIN",
							author: payload,
							timestamp: Date.now(),
						});
						await space.save();

						io.in(code).emit("FROM_SERVER", {
							type: "HISTORY_UPDATED",
							code,
						});

						io.in(code).emit("FROM_SERVER", {
							type: "CONNECTIONS_UPDATED",
							code,
						});
						io.in(code).emit("FROM_SERVER", {
							type: "SPACE_UPDATED",
							code,
						});
						// logger.log(io.sockets.adapter.rooms[id].sockets);
						// console.log(io.sockets.adapter.rooms[action.payload].sockets);
						// socket.broadcast.to(code).emit("FROM_SERVER", {
						// 	type: socketActions.NEW_CONNECTION,
						// });
						// Send everyone in the room the list of connection
						// io.in(code).emit("FROM_SERVER", {
						// 	type: socketActions.CURRENT_CONNECTIONS,
						// 	payload: {
						// 		connections: io.sockets.adapter.rooms[id].sockets,
						// 		newConnection: socket.id,
						// 	},
						// });
					});
					break;
				case socketActions.LEAVE_SPACE:
					// Manually trigger leave space event for react router url changes
					handleDisconnect(socket, io, code);
					// socket.leave(code, async () => {

					// 	Send user disconnected
					// 	socket.broadcast.to(id).emit("FROM_SERVER", {
					// 		type: socketActions.LEAVE_SPACE,
					// 	});
					// 	Send everyone the room the list of connections
					// 	io.in(id).emit("FROM_SERVER", {
					// 		type: socketActions.CURRENT_CONNECTIONS,
					// 		payload: {
					// 			connections: io.sockets.adapter.rooms[id] ? io.sockets.adapter.rooms[id].sockets : {},
					// 			newConnection: null,
					// 		},
					// 	});
					// });
					break;
				default:
					logger.warn("Socket action type not handled");
			}
		});

		socket.on("disconnect", () => {
			logger.log(`Disconnected: ${socket.id} ID: ${id}`);
			handleDisconnect(socket, io, id);
			// socket.leave(id, () => {
			// 	// Send user disconnected
			// 	socket.broadcast.to(id).emit("FROM_SERVER", {
			// 		type: socketActions.LEAVE_SPACE,
			// 	});
			// 	// Send everyone the updated list of connections
			// 	io.in(id).emit("FROM_SERVER", {
			// 		type: socketActions.CURRENT_CONNECTIONS,
			// 		payload: {
			// 			connections: io.sockets.adapter.rooms[id] ? io.sockets.adapter.rooms[id].sockets : {},
			// 			newConnection: null,
			// 		},
			// 	});
			// });
		});
	});
};

function handleDisconnect(socket, io, code) {
	socket.leave(code, async () => {
		let space = await Space.findOne({ code }).exec();
		if (!space) {
			return;
		}
		let { users } = space;
		let username = "";

		space.users = users.filter((user) => user.socketId !== socket.id);
		space.users = users.filter((user) => {
			if (user.socketId === socket.id) {
				username = user.username;
				return false;
			} else {
				return true;
			}
		});

		space.history.push({
			action: "LEAVE",
			author: username,
			timestamp: Date.now(),
		});

		await space.save();

		io.in(code).emit("FROM_SERVER", {
			type: "HISTORY_UPDATED",
			code,
		});

		io.in(code).emit("FROM_SERVER", {
			type: "CONNECTIONS_UPDATED",
			code,
		});
	});
}
