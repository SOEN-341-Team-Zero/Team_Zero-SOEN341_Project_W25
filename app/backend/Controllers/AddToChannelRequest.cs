public class AddToChannelRequest
{
    public required int team_id { get; set; }
    public required int channel_id { get; set; }
    public required List<string> users_to_add {get; set;}
    public required List<string> users_to_delete {get; set;}
}