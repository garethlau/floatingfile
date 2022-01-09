import { Response } from "express";
import prisma from "../lib/prisma";
import honeybadger from "../lib/honeybadger";

interface Connection {
  id: string;
  username: string;
  res: Response;
}

export enum NotificationTypes {
  CONNECTION_ESTABLISHED = "CONNECTION_ESTABLISHED",
  SPACE_UPDATED = "SPACE_UPDATED",
  SPACE_DESTROYED = "SPACE_DESTROYED",
}

let connections: Connection[] = [];

export async function addClient(code: string, connection: Connection) {
  try {
    await prisma.client.create({
      data: {
        username: connection.username,
        id: connection.id,
        connectedTo: code,
      },
    });

    connections.push(connection);
    notifyAll(code, NotificationTypes.SPACE_UPDATED);
  } catch (error) {
    honeybadger.notify(error);
  }
}

export async function removeClient(code: string, connection: Connection) {
  try {
    // Remove the client connection
    connections = connections.filter(({ id }) => id !== connection.id);

    await prisma.client.delete({
      where: {
        id: connection.id,
      },
    });
    notifyAll(code, NotificationTypes.SPACE_UPDATED);
  } catch (error) {
    honeybadger.notify(error);
  }
}

export async function notifyAll(code: string, type: NotificationTypes) {
  await sendDataToClients(code, { type });
}

export async function sendDataToClients(code: string, data: any) {
  try {
    const clients = await prisma.client.findMany({
      where: {
        connectedTo: code,
      },
    });

    clients.forEach(({ id }) => {
      sendToClient(id, data);
    });
  } catch (error) {
    honeybadger.notify(error);
  }
}

export function sendToClient(clientId: string, data: any) {
  const connection = connections.find((conn) => conn.id == clientId);
  if (connection) {
    connection.res.write(`data: ${JSON.stringify(data)}\n\n`);
  }
}
