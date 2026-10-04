# BuyClose backend API

ASP.NET Core 8 API that orchestrates the local store-type predictor, Mapbox Search Box, and the local product scraper. All backend source and configuration are contained in this folder.

## Configuration

Set the Mapbox public access token using an environment variable; do not commit the token:

```bash
export Mapbox__AccessToken="your-mapbox-access-token"
```

The defaults for the two local services are `http://127.0.0.1:4567` and `http://127.0.0.1:4568`. They can be overridden with `Services__StoreTypeIdentifierBaseUrl` and `Services__ProductScraperBaseUrl`. Mapbox searches are biased to the user's longitude/latitude, limited to Ukraine and Ukrainian-language results by default, and filtered to 5,000 meters; the radius can be changed with `Mapbox__RadiusMeters`. The number of candidates (up to Mapbox's maximum of 10) is configurable with `Mapbox__Limit`. `Mapbox__WebsiteOverrides` maps POI names to store website URLs when Mapbox does not provide a `website` property.

## Run

From the `backend/BuyClose.Api` directory:

```bash
dotnet run
```

The API listens on the ASP.NET Core default address (typically `http://localhost:5000`). `GET /health` provides a health check.

## Search products

Send a `POST /api/products/search` request:

```json
{
  "title": "coffee",
  "location": {
    "lat": 50.4501,
    "lng": 30.5234
  }
}
```

The API queries the predictor (`GET /predict?title=...`), searches Mapbox Search Box (`GET /search/searchbox/v1/forward`) for nearby points of interest, and posts `{ "title": "...", "links": [{ "market": "...", "link": "..." }] }` to the scraper's `POST /search`. A POI's website is read from `properties.website` or `properties.metadata.website`; if absent, the configured website override is used. POIs without a website or a matching override are skipped. Results beyond the configured radius are also skipped. The API returns an array of products:

```json
[
  {
    "id": "5f9252a5-fb8c-4a69-b218-509482f48a3b",
    "title": "coffee",
    "price": 0.0,
    "description": "",
    "imgUrl": "",
    "market": "Example Market",
    "location": {
      "lag": 50.4501,
      "lng": 30.5234
    }
  }
]
```

The `lag` output property follows the requested response contract. The API allows browser requests from `http://127.0.0.1:4000` and `http://localhost:4000`; it returns the results to the frontend request rather than assuming an undocumented frontend callback endpoint.
