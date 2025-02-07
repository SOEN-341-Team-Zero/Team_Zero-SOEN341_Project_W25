public class AddToTeamRequest
{
    public required string team_name { get; set; }
    public required List<string> users_to_add {get; set;}
}