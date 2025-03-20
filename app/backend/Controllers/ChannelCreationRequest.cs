public class ChannelCreationRequest
{
    public required string channel_name { get; set; }
    public required int team_id { get; set; }

    public required bool is_public { get; set; }
}