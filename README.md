# Aquid
Aquid stands for Air Quality & UV Index Dashboard.

This project was created over 72 hours as part of a skill simulation. I wanted to spend some time at the outset to create reusable scaffolding for future projects, so it also acts as a bit of a template for future projects.

# Tech
## Stack
|    Category     | Technology |
|-----------------|-----------------|
| Frontend        | Vue 3 (Composition API), Vuetify 4, Pinia, TanStack Query, Tailwind, `openapi-fetch` |
| Backend         | ASP.NET Core + OpenAPI|
| Error reporting | Self-hosted sentry instance (backend and frontend)|
| Hosting         | Self-hosted, bare metal, custom Nginx config|
| Air Quality API | OpenAQ (https://openaq.org)|
| UV Index API    | OpenUV (https://www.openuv.io)|
| Mapping library | Mapbox GL (https://mapbox.com)|

## Developing
Local development should be fairly uninvolved. Here are some hard requirements:
- Node.js v24+.
  - Check with `node --version`
- pnpm.
  - Check with `pnpm --version`
  - Install using `npm install -g pnpm@latest-11`
- .NET 10
  - See installations here: [installation instructions](https://learn.microsoft.com/en-us/dotnet/core/install/)

There are two example.env files containing fields for *required* keys, which are loaded automatically. Before developing, **copy both files to .env in their respective directories and populate them**.
- `aquid.web/example.env` -> `aquid.web/.env` (frontend)
- `Aquid.Application/example.env` -> `Aquid.Application/.env` (backend)


These are required unless otherwise marked.
Backend:
- `PORT`: The port to listen to http requests on. Suggested: `5196`, as the frontend expects this by default.
- `SENTRY_DSN` (optional): Ingest for sentry error handling
- `OPEN_AQ_API_URL`: Base route of the OpenAQ API
- `OPEN_AQ_API_KEY`: Your OpenAQ key
- `OPEN_UV_API_URL`: Base route of the OpenUV API
- `OPEN_UV_API_KEY`: Your OpenUV key

Frontend:
- `VITE_API_BASE_URL`: The base url of the backend
- `VITE_SENTRY_DSN` (optional): Ingest for sentry error handling
- `VITE_MAPBOX_BASE_URL`: Base route of the Mapbox API.
- `VITE_MAPBOX_ACCESS_TOKEN`: Your Mapbox key. Note that this key does not require any private scopes.

### Backend development
The backend is used to proxy the OpenAQ and OpenUV APIs with custom caching and diagnostics mixed in. There is no particular setup needed to run the backend. All backend logic is located inside `./Aquid.Application`, with models and base classes in `./Aquid.Core`.

To run, use `dotnet run --project Aquid.Application/Aquid.Application.csproj`

Note that there is an extra build artifact in development builds. This is the OpenAPI schema, location in `Aquid.Application/artifacts/Aquid.Application.json`.

#### Building
To build, use `dotnet publish ./Aquid.Application/Aquid.Application.csproj -c Release -o ./publish`. This will generate a binary at `./publish/Aquid.Application`.

If you've installed .NET to a user directory, you may need to set the `DOTNET_ROOT` variable to the folder containing the `dotnet` binary.

You must either populate the environment or supply a .env file into `publish` (or wherever you put your build target).

Example: `cp Aquid.Application/.env publish/.env`

### Frontend development
All frontend code is located inside `aquid.web`. To run the dev server:
- `cd aquid.web`
- `pnpm install`
- `pnpm dev`.

If you have made any backend changes, make sure to build the backend first, and run `pnpm generate:openapi-types` to generate types.

When developing locally, the frontend expects the backend to be running on port `5196`. This can be configured in the `vite.config.mts`.

To build, simply run `pnpm build`. This will generate build files in `./dist`.

# Features
There are 4 different elements: map, search, selection, and debug. I was inspired by the layout of google maps to make this work for both desktop and mobile (though, debug is only useful on screens above ~600px).

## Map
The map covers the whole screen and populates the currently visible area with blue pins representing the locations of air quality sensors.

The last selected air quality location, and last clicked map location, are both synced to a Pinia store, with the currently selected map region and zoom level being also synced to local storage and the URL bar.


## Search
The search bar is a simple autocomplete component that fetches search results directly from the Mapbox API. Clicking on a result takes you to that location, at a generally-reasonable zoom level.

## Selection
When you select an air quality location or otherwise empty map location, different information will appear in the bottom of the screen.

For empty locations, UV data will be fetched and metrics like the maximum index will be displayed.

For air quality locations, air quality data will be fetched instead, and you will be able to check any metric provided by a location.

## Debug
There is also a separate debugging UI present in the final build, which will be visible when the `debug` query is set to `true` in the URL.

# Incomplete
This project has been a balancing act between making things work quickly, API exploration, and designing for maintainability. This means sacrifices were made to balance all 3.

This project came with some functional requirements that could not be met due to time constraints.

## Chart
A historical overview chart for air quality measurements was not implemented. The empty space in the selection panel for air-quality locations was reserved for this chart.

## Misc.
Planned improvements that remain unfinished:
- Localization: The map supports localization as a user preference, but most UI text remains English.
- OpenAPI + TanStack Query: The openapi-fetch integration required more TypeScript work than available. There is a lot of type-casting and try/catch statements in the query layer to address this, which makes it repetitive and reduces clarity.
- Error handling: Error responses are not standardized in the OpenAPI schema and are not robustly handled in the backend; the frontend also lacks rendered error states. Implementing consistent API error shapes would be the first step to improve this.
- Caching: Current caching is naive. A more efficient approach could cache bounding-box responses and only request data for areas not already retrieved, reducing overlapping requests.
- Design polish: The UI is quite minimal. I'd like to revisit and consider a cohesive design language throughout the app, but this was not a focus I could dedicate to given the constraints.
- Accessibility: Keyboard navigation and on-screen buttons would have improved accessibility, but neither were implemented.

