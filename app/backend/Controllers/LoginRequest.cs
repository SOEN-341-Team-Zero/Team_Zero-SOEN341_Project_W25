public class LoginRequest
{
    public required string Username { get; set; }
    public required string Password { get; set; }
    public Boolean isAdmin {get;set;}
}