# using official .NET 9 SDK image to build the project
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# copy project files and restore dependencies
COPY ./ ./
RUN dotnet restore

# build and publish the app
RUN dotnet publish -c Release -o /out

# use a smaller runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /out ./

# set the entry point
CMD ["dotnet", "ChatHaven.dll"]