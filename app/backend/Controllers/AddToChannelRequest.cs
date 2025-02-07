public class AddToChannelRequest
{
    public required string team_name { get; set; }
    public required string channel_name { get; set; }
    public required List<string> users_to_add {get; set;}
}