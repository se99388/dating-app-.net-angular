# Stage 1: Build Angular app
FROM node:22-alpine AS angular-build

WORKDIR /client

# Copy package files
COPY client/package*.json ./

# Install dependencies
RUN npm install

# Install Angular CLI
RUN npm install -g @angular/cli@20

# Copy Angular source code
COPY client/ ./

# Build Angular app (outputs directly to ../API/wwwroot based on angular.json)
RUN ng build --configuration production

# Stage 2: Build .NET app
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS dotnet-build

WORKDIR /app

# Copy csproj and restore
COPY API/*.csproj ./
RUN dotnet restore

# Copy API source
COPY API/ ./

# Copy built Angular files from the build stage
# Angular outputs to /client/../API/wwwroot which is /API/wwwroot
COPY --from=angular-build /API/wwwroot ./wwwroot

# Build the API
RUN dotnet build -c Release

# Install dotnet-ef for migrations
RUN dotnet tool install --global dotnet-ef --version 9.0.0
ENV PATH="${PATH}:/root/.dotnet/tools"

# Expose port
EXPOSE 5000

# Run the application (ignore launchSettings.json to use environment variables)
CMD ["dotnet", "run", "--no-build", "--no-launch-profile", "-c", "Release"]
