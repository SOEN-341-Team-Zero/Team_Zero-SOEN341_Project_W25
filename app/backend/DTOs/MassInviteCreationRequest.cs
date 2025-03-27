public class MassInviteCreationRequest
{
    public required int team_id { get; set; }
    public required int channel_id { get; set; }
    public required int requester_id { get; set; }
    public required string requester_name { get; set; }
    public required string channel_name { get; set; }
    public required string team_name { get; set; }
    public required List<string> users_to_invite { get; set; }
}