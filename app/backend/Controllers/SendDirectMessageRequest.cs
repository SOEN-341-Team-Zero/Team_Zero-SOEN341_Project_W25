public class SendDirectMessageRequest
{
    public required string Message { get; set; }
    public required int SenderId { get; set; }
    public required int ReceiverId {get;set;}
}
