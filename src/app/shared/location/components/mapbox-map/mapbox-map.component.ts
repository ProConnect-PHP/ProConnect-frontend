import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { MAPBOX_CONFIG } from '../../../../core/config/mapbox.config';
import { Coordinates, MapMarker } from '../../models/location.models';
import { clampToUruguay } from '../../utils/coordinates.util';
import { fromLngLat, toLngLat, uruguayBounds } from '../../utils/mapbox.util';
import type { Map as MapboxGlMap, Marker as MapboxGlMarker } from 'mapbox-gl';

@Component({
  selector: 'app-mapbox-map',
  templateUrl: './mapbox-map.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapboxMapComponent implements AfterViewInit, OnDestroy {
  private readonly config = inject(MAPBOX_CONFIG);
  private readonly mapContainer = viewChild.required<ElementRef<HTMLElement>>('mapContainer');

  readonly center = input<Coordinates | null>(null);
  readonly zoom = input<number | null>(null);
  readonly markers = input<MapMarker[]>([]);
  readonly selectable = input(false);
  readonly selectedPoint = input<Coordinates | null>(null);
  readonly disabled = input(false);
  readonly heightClass = input('h-72 sm:h-80');

  readonly markerClicked = output<MapMarker>();
  readonly mapClicked = output<Coordinates>();

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly mapReady = signal(false);

  private mapboxgl: typeof import('mapbox-gl').default | null = null;
  private map: MapboxGlMap | null = null;
  private markerInstances = new Map<string, MapboxGlMarker>();
  private selectedMarker: MapboxGlMarker | null = null;
  private readonly resizeListener = () => this.resizeMap();

  constructor() {
    effect(() => {
      if (!this.mapReady()) return;
      const center = this.center() ?? this.config.defaultCenter;
      const zoom = this.zoom() ?? this.config.defaultZoom;
      this.map?.flyTo({
        center: toLngLat(clampToUruguay(center)),
        zoom,
        essential: false,
      });
      this.resizeMap();
    });

    effect(() => {
      if (!this.mapReady()) return;
      this.syncMarkers(this.markers());
      this.resizeMap();
    });

    effect(() => {
      if (!this.mapReady()) return;
      this.syncSelectedMarker(this.selectedPoint());
      this.resizeMap();
    });
  }

  async ngAfterViewInit(): Promise<void> {
    if (typeof window === 'undefined') {
      this.loading.set(false);
      return;
    }

    if (this.isTokenMissing()) {
      this.errorMessage.set('Configura el token de Mapbox en environment.');
      this.loading.set(false);
      return;
    }

    try {
      const mapboxModule = await import('mapbox-gl');
      this.mapboxgl = mapboxModule.default;
      this.mapboxgl.accessToken = this.config.accessToken;

      const center = clampToUruguay(this.center() ?? this.config.defaultCenter);

      this.map = new this.mapboxgl.Map({
        container: this.mapContainer().nativeElement,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: toLngLat(center),
        zoom: this.zoom() ?? this.config.defaultZoom,
        maxBounds: uruguayBounds,
        attributionControl: true,
      });

      this.map.addControl(new this.mapboxgl.NavigationControl(), 'top-right');
      window.addEventListener('resize', this.resizeListener);

      this.map.on('load', () => {
        this.loading.set(false);
        this.mapReady.set(true);
        this.resizeMap();
      });

      this.map.on('error', () => {
        this.errorMessage.set('No pudimos cargar el mapa.');
        this.loading.set(false);
      });

      this.map.on('click', (event) => {
        if (!this.selectable() || this.disabled()) return;
        this.mapClicked.emit(clampToUruguay(fromLngLat(event.lngLat)));
      });
    } catch {
      this.errorMessage.set('No pudimos cargar el mapa.');
      this.loading.set(false);
    }
  }

  ngOnDestroy(): void {
    this.markerInstances.forEach((marker) => marker.remove());
    this.markerInstances.clear();
    this.selectedMarker?.remove();
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.resizeListener);
    }
    this.map?.remove();
  }

  private syncMarkers(markers: MapMarker[]): void {
    if (!this.map || !this.mapboxgl) return;

    const markerKeys = new Set(markers.map((marker) => String(marker.id)));

    this.markerInstances.forEach((marker, key) => {
      if (!markerKeys.has(key)) {
        marker.remove();
        this.markerInstances.delete(key);
      }
    });

    for (const marker of markers) {
      const key = String(marker.id);
      const existingMarker = this.markerInstances.get(key);

      if (existingMarker) {
        existingMarker.setLngLat(toLngLat(marker.coordinates));
        continue;
      }

      const element = this.createMarkerElement(marker.title, false);
      element.addEventListener('click', (event) => {
        event.stopPropagation();
        this.markerClicked.emit(marker);
      });

      const mapboxMarker = new this.mapboxgl.Marker({ element })
        .setLngLat(toLngLat(marker.coordinates))
        .addTo(this.map);

      this.markerInstances.set(key, mapboxMarker);
    }
  }

  private syncSelectedMarker(coordinates: Coordinates | null): void {
    if (!this.map || !this.mapboxgl) return;

    if (!coordinates) {
      this.selectedMarker?.remove();
      this.selectedMarker = null;
      return;
    }

    const draggable = this.selectable() && !this.disabled();
    const safeCoordinates = clampToUruguay(coordinates);

    if (!this.selectedMarker) {
      const element = this.createMarkerElement('Ubicacion seleccionada', true);
      this.selectedMarker = new this.mapboxgl.Marker({ element, draggable })
        .setLngLat(toLngLat(safeCoordinates))
        .addTo(this.map);

      this.selectedMarker.on('dragend', () => {
        if (!this.selectedMarker) return;
        this.mapClicked.emit(clampToUruguay(fromLngLat(this.selectedMarker.getLngLat())));
      });
      return;
    }

    this.selectedMarker.setLngLat(toLngLat(safeCoordinates));
    this.selectedMarker.setDraggable(draggable);
  }

  private createMarkerElement(label: string, selected: boolean): HTMLButtonElement {
    const element = document.createElement('button');
    element.type = 'button';
    element.setAttribute('aria-label', label);
    element.className = selected
      ? 'grid size-9 place-items-center rounded-full border-2 border-white bg-emerald-500 text-xs font-black text-white shadow-lg shadow-emerald-900/20 focus:outline focus:outline-2 focus:outline-indigo-600'
      : 'grid size-8 place-items-center rounded-full border-2 border-white bg-indigo-600 text-xs font-black text-white shadow-lg shadow-indigo-900/20 focus:outline focus:outline-2 focus:outline-indigo-600';
    element.textContent = selected ? 'P' : 'S';
    return element;
  }

  private isTokenMissing(): boolean {
    return (
      !this.config.accessToken ||
      this.config.accessToken === 'REEMPLAZAR_CON_TOKEN_PUBLICO_MAPBOX' ||
      this.config.accessToken === 'REEMPLAZAR_EN_DEPLOY'
    );
  }

  private resizeMap(): void {
    setTimeout(() => this.map?.resize(), 0);
  }
}
