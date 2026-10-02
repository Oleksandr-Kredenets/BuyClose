# BuyClose backend API

ASP.NET Core 8 API that orchestrates the local store-type predictor, Google Places, and the local product scraper. All backend source and configuration are contained in this folder.

## Configuration

Set the Google Places API key using an environment variable; do not commit the key:

```bash
export GooglePlaces__ApiKey="your-google-places-api-key"
```

The defaults for the two local services are `http://127.0.0.1:4567` and `http://127.0.0.1:4568`. They can be overridden with `Services__StoreTypeIdentifierBaseUrl` and `Services__ProductScraperBaseUrl`. The Places search radius defaults to 5,000 meters and can be changed with `GooglePlaces__RadiusMeters`.

## Run

From this `backend/App` directory:

```bash
dotnet run --project BuyClose.Api
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

The API queries the predictor (`GET /predict?title=...`), searches Google Places for nearby stores with websites, and posts `{ "title": "...", "links": [{ "market": "...", "link": "..." }] }` to the scraper's `POST /search`. It returns an array of products:

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
