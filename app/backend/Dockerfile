FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["ChatHaven.csproj", "./"]
RUN dotnet restore "./ChatHaven.csproj"
COPY . .
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
RUN chmod +x ChatHaven.dll  # Ensure the DLL has execute permissions
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "ChatHaven.dll"]