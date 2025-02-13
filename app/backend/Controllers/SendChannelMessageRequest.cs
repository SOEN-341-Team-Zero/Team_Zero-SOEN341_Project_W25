public class SendChannelMessageRequest
{
    public required string Message { get; set; }
    public required string SenderId { get; set; }
    public required int ChannelId {get;set;}
}