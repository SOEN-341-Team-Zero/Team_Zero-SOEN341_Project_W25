import * as signalR from "@microsoft/signalr";
import { HubConnectionBuilder, HubConnectionState } from "@microsoft/signalr";

export default class ChannelChatService {
    private static connection: signalR.HubConnection;

    public static startConnection = () => {
        this.connection = new HubConnectionBuilder()
            .withUrl("http://localhost:3001/chat")  
            .build();
    
        this.connection
            .start()
            .then(async () => {
                this.onMessageReceived((senderId, message, sentAt) => {
                    console.log(`Message received: ${message} from user ${senderId} at ${sentAt}`);
                });
            })
            .catch((err) => {
                console.error("Error connecting to SignalR Hub", err);
            });
    };

    public static async sendMessageToChannel(channelId: number, userId: number, message: string) {
        await this.connection.invoke("JoinChannel", channelId);
        if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
            await this.startConnection(); 
        }

        if (this.connection.state !== HubConnectionState.Connected) {
            return;
        }

        try {
            await this.connection.invoke("SendMessageToChannel", channelId, userId, message);
            console.log("Message sent successfully");
        } catch (error) {
            console.error("Send Message Error:", error);
        }
    }
    public static onMessageReceived = (callback: (senderId: number, username: string, message: string, sentAt: string) => void) => {
        if (!this.connection) return;
        this.connection.on("ReceiveMessage", (senderId: number, username: string, message: string, sentAt: string) => {
            callback(senderId, username, message, sentAt);
        });
    };
    

    public static async stopConnection() {
        if (this.connection && this.connection.state !== HubConnectionState.Disconnected) {
            try {
                await this.connection.stop();
            } catch (error) {
                console.error("Stop Connection Error:", error);
            }
        }
    }
}
