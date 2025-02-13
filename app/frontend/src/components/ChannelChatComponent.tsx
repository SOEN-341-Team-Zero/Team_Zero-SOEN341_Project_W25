import { useEffect, useState } from "react";
import ChannelChatService from "./ChannelChatService";

const ChannelChatComponent = ({ channelId, userId, userName }: { channelId: number; userId: number; userName: string }) => {
    const [messages, setMessages] = useState<{ senderId: number; username: string; message: string; sentAt: string }[]>([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const startConnection = async () => {
            await ChannelChatService.startConnection();
        };

        startConnection();

        const messageHandler = (senderId: number, username: string, message: string, sentAt: string) => {
            console.log("Message received:", { senderId, username, message, sentAt });
            setMessages(prevMessages => [...prevMessages, { senderId, username, message, sentAt }]);
        };
        
        ChannelChatService.onMessageReceived(messageHandler);
    }, [channelId]);

    const sendMessage = () => {
        if (message.trim() !== "") { // non null
            ChannelChatService.sendMessageToChannel(channelId, userId, message);
            setMessage("");
        }
    };

    return (
        <div>
            <div> {/* placeholder styling */}
            {messages.map((msg, index) => (
                <div key={index} style={{ marginBottom: '10px', textAlign: msg.senderId === userId ? 'right' : 'left' }}> 
                    <div>
                        <strong>{msg.senderId === userId ? userName : msg.username}:</strong>
                    </div>
                    <div style={{ display: 'inline-block', padding: '8px', borderRadius: '10px', maxWidth: '60%' }}>
                        <span>{msg.message}</span>
                    </div>
                </div>
            ))}


            </div>
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)} // again placeholder feel free to change this
                placeholder="Enter a message" 
                
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
};

export default ChannelChatComponent;
