import * as signalR from "@microsoft/signalr";
import { HubConnectionBuilder, HubConnectionState } from "@microsoft/signalr";
import { API_URL } from "../utils/FetchUtils";

export default class DMChatService {
  private static connection: signalR.HubConnection;
  private static currentDMId: number = -1;

  public static startConnection = (dmId: number) => {
    if (this.connection) {
      this.connection.invoke("LeaveDM", this.currentDMId);
    }

    this.connection = new HubConnectionBuilder()
      .withUrl(`${API_URL}/dm`, {
        accessTokenFactory: () => localStorage.getItem("jwt-token") || "",
      })
      .build();

    this.connection
      .start()
      .then(async () => {
        await this.connection.invoke("JoinDM", dmId);
        this.onMessageReceived((senderId, message, sentAt) => {
          console.log(
            `Message received: ${message} from user ${senderId} at ${sentAt}`,
          );
        });
      })
      .then(() => (this.currentDMId = dmId))
      .catch((err) => {
        console.error("Error connecting to SignalR Hub", err);
      });
  };

  public static async sendMessageToDM(dmId: number, message: string) {
    await this.connection.invoke("JoinDM", dmId);
    if (
      !this.connection ||
      this.connection.state !== HubConnectionState.Connected
    ) {
      await this.startConnection(dmId);
    }

    if (this.connection.state !== HubConnectionState.Connected) {
      return;
    }

    try {
      await this.connection.invoke("SendMessageToDM", dmId, message);
      console.log("Message sent successfully");
    } catch (error) {
      console.error("Send Message Error:", error);
    }
  }
  public static onMessageReceived = (
    callback: (
      senderId: number,
      username: string,
      message: string,
      sentAt: string,
    ) => void,
  ) => {
    if (!this.connection) return;
    this.connection.on(
      "ReceiveMessage",
      (senderId: number, username: string, message: string, sentAt: string) => {
        callback(senderId, username, message, sentAt);
      },
    );
  };

  public static async stopConnection() {
    if (
      this.connection &&
      this.connection.state !== HubConnectionState.Disconnected
    ) {
      try {
        await this.connection.stop();
      } catch (error) {
        console.error("Stop Connection Error:", error);
      }
    }
  }
}
