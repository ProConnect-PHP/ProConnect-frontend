export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type LocationSuggestion = {
  id: string;
  label: string;
  placeName: string;
  coordinates: Coordinates;
  context?: string[];
};

export type SelectedLocation = {
  label: string;
  coordinates: Coordinates;
};

export type LocationRadiusKm = 5 | 10 | 20 | 50 | 100;

export type MapMarker = {
  id: string | number;
  coordinates: Coordinates;
  title: string;
  subtitle?: string | null;
};
