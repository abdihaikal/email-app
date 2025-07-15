# ---- Base Stage ----
# Define a consistent Node.js version for all stages to prevent discrepancies.
FROM node:20-alpine AS base

# Set a non-root user for improved security.
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

# Set the working directory for the application.
WORKDIR /usr/src/app

# ---- Dependencies Stage ----
# This stage handles dependency installation separately to optimize caching.
FROM base AS dependencies

# Copy package.json and package-lock.json first to leverage Docker's layer caching.
# This step only invalidates if package files change.
COPY package*.json ./

# Install all dependencies (including devDependencies for building).
# Using `npm ci` ensures a clean install based on package-lock.json.
RUN npm ci

# ---- Build Stage ----
# This stage compiles the TypeScript code into JavaScript.
FROM dependencies AS build

# Copy the rest of the application's source code.
COPY . .

# Run the build script defined in your package.json.
RUN npm run build

# ---- Production Stage ----
# This stage creates the final, lean image for production.
FROM base AS production

# Copy package files again (only for production dependencies).
COPY package*.json ./

# Install only production dependencies.
# This keeps the final image as small as possible.
RUN npm ci --omit=dev

# Copy the compiled application code from the 'build' stage.
# Ensure 'dist' contains your compiled JavaScript files.
COPY --from=build /usr/src/app/dist ./dist

# Expose the port your application listens on.
EXPOSE 3000

# The command to start your NestJS application.
# Assuming your main compiled entry file is `dist/main.js`.
CMD [ "node", "dist/main.js" ]
