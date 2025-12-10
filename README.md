# migration
dotnet ef migrations add <name> -o <directorty like "Data/Migrations">

# update db or craete if not exist (do it after you create the migration file)
dotnet ef database update  

# drop db
 dotnet ef database drop   

# watch dotnet
dotnet watch run

# see if any changes have been made
 dotnet ef migrations has-pending-model-changes 

# downloads and installs all the NuGet packages (dependencies) listed in your .csproj file
dotnet restore 

# publish .net code
dotnet publish -c Release -o ./bin/Publish