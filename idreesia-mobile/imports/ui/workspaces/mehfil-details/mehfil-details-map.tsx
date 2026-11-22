import React, { useEffect, useMemo } from 'react';
import { Button } from 'antd-mobile';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';

// Roughly the centre of Pakistan, used when no pin has been set.
const DEFAULT_CENTER: [number, number] = [30.3753, 69.3451];
const DEFAULT_ZOOM = 5;
const PIN_ZOOM = 15;

// A CSS-drawn pin, so no marker image files need to be bundled.
const pinIcon = L.divIcon({
  className: 'mehfil-details-map-pin',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

// Leaflet only re-measures on window resize, so a container that changes size
// (a Popup sliding in, layout settling) leaves part of the map unrendered.
const ResizeWatcher = () => {
  const map = useMap();
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
};

/** Moves the map onto the pin whenever the focus token changes. */
const PinFocuser = ({
  latitude,
  longitude,
  focusToken,
}: {
  latitude?: number | null;
  longitude?: number | null;
  focusToken?: number;
}) => {
  const map = useMap();
  useEffect(() => {
    if (focusToken && latitude != null && longitude != null) map.setView([latitude, longitude], PIN_ZOOM);
    // Only a new token should move the map, not every pin drag.
  }, [focusToken]);
  return null;
};

const ClickHandler = ({ onPick }: { onPick(latitude: number, longitude: number): void }) => {
  useMapEvents({ click: event => onPick(event.latlng.lat, event.latlng.lng) });
  return null;
};

interface Props {
  latitude?: number | null;
  longitude?: number | null;
  /** Change it to move the map onto the current pin. */
  focusToken?: number;
  /** Omit to show the map read-only. */
  onChange?(latitude: number | null, longitude: number | null): void;
}

/** An OpenStreetMap with the mehfil's pin; tap the map or drag the pin to move it. */
export const MehfilDetailsMap = ({ latitude, longitude, focusToken, onChange }: Props) => {
  const hasPin = latitude != null && longitude != null;
  const editable = Boolean(onChange);

  const markerHandlers = useMemo(
    () => ({
      dragend: (event: L.LeafletEvent) => {
        const { lat, lng } = (event.target as L.Marker).getLatLng();
        onChange?.(lat, lng);
      },
    }),
    [onChange],
  );

  const emptyText = editable ? 'No location set. Tap the map to place a pin.' : 'No location set.';

  return (
    <div className="mehfil-details-map">
      <MapContainer
        className="mehfil-details-map-canvas"
        center={hasPin ? [latitude, longitude] : DEFAULT_CENTER}
        zoom={hasPin ? PIN_ZOOM : DEFAULT_ZOOM}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ResizeWatcher />
        <PinFocuser focusToken={focusToken} latitude={latitude} longitude={longitude} />
        {onChange && <ClickHandler onPick={onChange} />}
        {hasPin && (
          <Marker
            draggable={editable}
            eventHandlers={markerHandlers}
            icon={pinIcon}
            position={[latitude, longitude]}
          />
        )}
      </MapContainer>
      <div className="mehfil-details-map-footer">
        <span className="mehfil-details-map-text">
          {hasPin ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` : emptyText}
        </span>
        {onChange && hasPin && (
          <Button fill="outline" size="mini" onClick={() => onChange(null, null)}>
            Clear pin
          </Button>
        )}
      </div>
    </div>
  );
};
