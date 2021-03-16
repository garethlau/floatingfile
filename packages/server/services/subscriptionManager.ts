import { Response } from "express";
import { SpaceDocument, Events } from "@floatingfile/types";
import Honeybadger from "@honeybadger-io/js";

export enum EventTypes {
  CONNECTION_ESTABLISHED = "CONNECTION_ESTABLISHED",
  FILES_UPDATED = "FILES_UPDATED",
  HISTORY_UPDATED = "HISTORY_UPDATED",
  USERS_UPDATED = "USERS_UPDATED",
  SPACE_DELETED = "SPACE_DELETED",
}

const mongoose = require("mongoose");
const Space = mongoose.model("Space");

interface Client {
  id: string;
  username: string;
  res: Response;
}

let spaces: Record<string, Array<Client>> = {};

export async function addClient(code: string, client: Client) {
  if (!spaces[code]) {
    spaces[code] = [];
  }

  try {
    const space: SpaceDocument = await Space.findOne({ code }).exec();
    space.users.push({
      id: client.id,
      username: client.username,
    });

    await space.save();
    spaces[code].push(client);
    broadcast(code, EventTypes.USERS_UPDATED);
  } catch (error) {
    Honeybadger.notify(error);
  }
}

export async function removeClient(code: string, client: Client) {
  spaces[code] = spaces[code].filter((c) => c.id !== client.id);
  if (spaces[code].length === 0) {
    let newSpaces = Object.assign({}, spaces);
    delete newSpaces[code];
    spaces = newSpaces;
  }

  try {
    const space: SpaceDocument = await Space.findOne({ code }).exec();
    if (!space) {
      return;
    }
    space.users = space.users.filter((user) => user.id !== client.id);
    broadcast(code, EventTypes.USERS_UPDATED);
    await space.save();
  } catch (error) {
    Honeybadger.notify(error);
  }
}

export function sendDataToClients(code: string, data: any) {
  try {
    const clients = spaces[code];
    if (!clients) return;
    clients.forEach((client) => {
      client.res.write(`data: ${JSON.stringify(data)}\n\n`);
    });
  } catch (error) {
    Honeybadger.notify(error);
  }
}

export function broadcast(code: string, type: EventTypes) {
  sendDataToClients(code, { type });
}

export function sendToClient(client: Client, data: any) {
  client.res.write(`data: ${JSON.stringify(data)}\n\n`);
}
