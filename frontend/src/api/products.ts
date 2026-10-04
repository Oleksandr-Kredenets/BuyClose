import { Coordinates, Product } from '../types';

const API_BASE_URL = 'http://localhost:5000';

interface BackendProduct {
  id: string;
  title: string;
  price: number;
  imgUrl: string;
  market: string;
  location: {
    lat: number;
    lng: number;
  };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const parseProducts = (value: unknown): BackendProduct[] => {
  if (!Array.isArray(value)) {
    throw new Error('The products API returned an invalid response.');
  }

  return value.map((item, index) => {
    if (
      !isRecord(item)
      || typeof item.id !== 'string'
      || typeof item.title !== 'string'
      || typeof item.price !== 'number'
      || !Number.isFinite(item.price)
      || typeof item.imgUrl !== 'string'
      || typeof item.market !== 'string'
      || !isRecord(item.location)
      || (
        typeof item.location.lat !== 'number'
        && typeof item.location.lag !== 'number'
      )
      || !Number.isFinite(item.location.lat ?? item.location.lag)
      || typeof item.location.lng !== 'number'
      || !Number.isFinite(item.location.lng)
    ) {
      throw new Error(`The products API returned an invalid product at index ${index}.`);
    }

    const latitude = item.location.lat ?? item.location.lag;
    if (typeof latitude !== 'number') {
      throw new Error(`The products API returned invalid coordinates at index ${index}.`);
    }

    return {
      id: item.id,
      title: item.title,
      price: item.price,
      imgUrl: item.imgUrl,
      market: item.market,
      location: {
        lat: latitude,
        lng: item.location.lng,
      },
    };
  });
};

const distanceInKm = (from: Coordinates, to: Coordinates): number => {
  const toRadians = (degrees: number) => degrees * Math.PI / 180;
  const latitudeDifference = toRadians(to.lat - from.lat);
  const longitudeDifference = toRadians(to.lng - from.lng);
  const haversine = Math.sin(latitudeDifference / 2) ** 2
    + Math.cos(toRadians(from.lat))
    * Math.cos(toRadians(to.lat))
    * Math.sin(longitudeDifference / 2) ** 2;
  const distance = 6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return Number(distance.toFixed(1));
};

export const searchProducts = async (
  title: string,
  userLocation: Coordinates,
  signal: AbortSignal,
): Promise<Product[]> => {
  const response = await fetch(`${API_BASE_URL}/api/products/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title,
      location: {
        lat: userLocation.lat,
        lng: userLocation.lng,
      },
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Product search failed (${response.status} ${response.statusText}).`);
  }

  const backendProducts = parseProducts(await response.json() as unknown);
  return backendProducts.map((product) => {
    const coordinates = {
      lat: product.location.lat,
      lng: product.location.lng,
    };

    return {
      id: product.id,
      name: product.title,
      price: product.price,
      storeName: product.market,
      image: product.imgUrl,
      distanceKm: distanceInKm(userLocation, coordinates),
      coordinates,
    };
  });
};
