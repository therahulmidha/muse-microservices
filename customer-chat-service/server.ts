import { WebSocket, WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 3005 }, () => {
  console.log("WS Server listening on 3005");
});

const customerSocketsMap = new Map<string, WebSocket>();
const executiveSocketsMap = new Map<string, WebSocket>();
const customerWaitingQueue: {
  userId: string;
  from: string;
  type: string;
  text: string;
}[] = [];
const executiveAvailability = new Map<string, boolean>();
const assignedExecutiveToCustomer = new Map<string, string>();

const findAvailableExecutive = (): string | undefined => {
  for (const [userId, available] of executiveAvailability) {
    if (available) {
      return userId;
    }
  }
  return undefined;
};

wss.on("connection", (ws: WebSocket) => {
  ws.on("message", (rawData: Buffer) => {
    console.log(rawData.toString());
    const payload = JSON.parse(rawData.toString());
    const { userId, from, type, text } = payload;
    switch (type) {
      case "ONLINE":
        {
          if (from === "cust") {
            customerSocketsMap.set(userId, ws);
            customerWaitingQueue.push(payload);
          } else {
            executiveSocketsMap.set(userId, ws);
            if (customerWaitingQueue.length) {
              const customerPayload = customerWaitingQueue.shift();
              customerPayload?.userId &&
                assignedExecutiveToCustomer.set(
                  customerPayload?.userId,
                  userId
                );
              ws.send(JSON.stringify(customerPayload));
              executiveAvailability.set(userId, false);
            } else {
              executiveAvailability.set(userId, true);
            }
          }
        }
        break;
      case "OFFLINE":
        if (from === "cust") {
        } else {
        }
        break;
      case "CLOSE":
        if (from === "cust") {
        } else {
        }
        break;
      case "CHAT":
        if (from === "cust") {
          let executiveUserId = assignedExecutiveToCustomer.get(userId);
          if (!executiveUserId) {
            executiveUserId = findAvailableExecutive();
            executiveUserId &&
              assignedExecutiveToCustomer.set(userId, executiveUserId);
          }
          if (executiveUserId) {
            const executiveWs = executiveSocketsMap.get(executiveUserId);
            executiveWs?.send(rawData.toString());
          } else {
            const customerWaiting = customerWaitingQueue.find(
              (customer) => customer.userId === userId
            );
            if (customerWaiting) {
              customerWaiting.text += text;
            } else {
              customerWaitingQueue.push(payload);
            }
          }
        } else {
          let assignedCustomerId;
          for (const [cId, eId] of assignedExecutiveToCustomer.entries()) {
            if (eId === userId) {
              assignedCustomerId = cId;
            }
          }
          if (assignedCustomerId) {
            const customerSocket = customerSocketsMap.get(assignedCustomerId);
            customerSocket?.send(rawData.toString());
          } else {
          }
        }
        break;
    }
  });

  ws.on("close", () => {
    console.log("client closed the connection");
    for (let [userId, socket] of customerSocketsMap.entries()) {
      if (socket === ws) customerSocketsMap.delete(userId);
    }
    for (let [userId, socket] of executiveSocketsMap.entries()) {
      if (socket === ws) {
        executiveSocketsMap.delete(userId);
        executiveAvailability.delete(userId);
      }
    }
  });
});
