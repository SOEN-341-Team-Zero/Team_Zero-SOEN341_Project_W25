import * as signalR from "@microsoft/signalr";
import { HubConnectionBuilder, HubConnectionState } from "@microsoft/signalr";
import { API_URL } from "../utils/FetchUtils";
import { IUserModel } from "../models/models";

interface ReplyInfo {
  replyToId: number;
  replyToUsername: string;
  replyToMessage: string;
}

export default class ChannelChatService {
  private static connection: signalR.HubConnection;
  private static currentChannelId: number = -1;

  public static startConnection = (channelId: number) => {
    if (this.connection) {
      this.connection.invoke("LeaveChannel", this.currentChannelId);
    }

    this.connection = new HubConnectionBuilder()
      .withUrl(`${API_URL}/chat`)
      .build();

    this.connection
      .start()
      .then(async () => {
        await this.connection.invoke("JoinChannel", channelId);
        this.onMessageReceived((senderId, username, message, sentAt, replyToId, replyToUsername, replyToMessage) => {});
      })
      .then(() => (this.currentChannelId = channelId))
      .catch((err) => {
        console.error("Error connecting to SignalR Hub", err);
      });
  };

  public static async sendMessageToChannel(
    channelId: number,
    userId: number,
    message: string,
    replyInfo: ReplyInfo | null = null,
  ) {
    await this.connection.invoke("JoinChannel", channelId);
    if (
      !this.connection ||
      this.connection.state !== HubConnectionState.Connected
    ) {
      await this.startConnection(channelId);
    }

    if (this.connection.state !== HubConnectionState.Connected) {
      return;
    }

    try {
      await this.connection.invoke(
        "SendMessageToChannel",
        channelId,
        userId,
        message,
        replyInfo?.replyToId,
        replyInfo?.replyToUsername,
        replyInfo?.replyToMessage,
      );
    } catch (error) {console.error("Send Message Error:", error);}
  }

  public static async updateChannelReactions(channelId: number, senderId: number, sentAt: string, reactions: string[], reactionUsers: number[]) {
    await this.connection.invoke("JoinChannel", channelId);
    if (
      !this.connection ||
      this.connection.state !== HubConnectionState.Connected
    ) await this.startConnection(channelId);

    if (this.connection.state !== HubConnectionState.Connected) return;
    try {
      await this.connection.invoke(
        "UpdateChannelReactions",
        channelId,
        senderId,
        sentAt,
        reactions,
        reactionUsers
      );
    } catch(error) {console.error("Update Reactions Error:", error);}
  }
  
  public static onMessageReceived = (
    callback: (
      senderId: number,
      username: string,
      message: string,
      sentAt: string,
      channelId: number,
      replyToId?: number,
      replyToUsername?: string,
      replyToMessage?: string,
      reactions?: string[],
      reactionUsers?: IUserModel[],
    ) => void,
  ) => {
    if (!this.connection) return;
    this.connection.on(
      "ReceiveMessage",
      (
        userId,            
        username,
        message,
        sentAt,
        channelId,         
        replyToId,
        replyToUsername,
        replyToMessage,
        reactions,
        reactionUsers,
      ) => {
        callback(userId, username, message, sentAt, channelId, replyToId, replyToUsername, replyToMessage, reactions, reactionUsers);
      }
    );
  };

  public static onUpdatedMessage = (
    callback: (
      senderId: number,
      sentAt: string,
      reactions: string[],
      reactionUsers: IUserModel[]
    ) => void,
  ) => {
    if (!this.connection) return;
    this.connection.on(
      "UpdatedMessage",
      (
        senderId,
        sentAt,      
        reactions,
        reactionUsers: number[]
      ) => {
        callback(senderId, sentAt, reactions, reactionUsers.map(i => ({user_id: i, username: "", activity: "Offline", isAdmin: false})));
      }
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