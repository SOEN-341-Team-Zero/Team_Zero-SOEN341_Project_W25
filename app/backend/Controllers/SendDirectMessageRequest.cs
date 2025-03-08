public class SendDirectMessageRequest
{
    public required string Message { get; set; }

    public required int receiver_id { get; set; }
    public required int dm_id { get; set; }
}
