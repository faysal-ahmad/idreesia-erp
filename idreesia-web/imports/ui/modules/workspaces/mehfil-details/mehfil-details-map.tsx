import React, { useEffect, useMemo } from 'react';
import { Button, Typography } from 'antd';
import L from 'leaflet';
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';

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
// (tab switch, layout settling) leaves part of the map unrendered.
const ResizeWatcher = () => {
  const map = useMap();
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
};

/** Flies to the pin whenever the focus token changes. */
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
    if (focusToken && latitude != null && longitude != null) {
      map.setView([latitude, longitude], PIN_ZOOM);
    }
    // Only a new token should move the map, not every pin drag.
  }, [focusToken]);
  return null;
};

interface ClickHandlerProps {
  onPick(latitude: number, longitude: number): void;
}

const ClickHandler = ({ onPick }: ClickHandlerProps) => {
  useMapEvents({
    click: event => onPick(event.latlng.lat, event.latlng.lng),
  });
  return null;
};

interface Props {
  latitude?: number | null;
  longitude?: number | null;
  /** Change it to zoom the map onto the current pin. */
  focusToken?: number;
  /** Omit to show the map read-only. */
  onChange?(latitude: number | null, longitude: number | null): void;
}

const MehfilDetailsMap = ({ latitude, longitude, focusToken, onChange }: Props) => {
  const hasPin = latitude != null && longitude != null;
  const editable = !!onChange;

  const markerHandlers = useMemo(
    () => ({
      dragend: (event: L.LeafletEvent) => {
        const { lat, lng } = (event.target as L.Marker).getLatLng();
        onChange?.(lat, lng);
      },
    }),
    [onChange]
  );

  const emptyText = editable
    ? 'No location set. Click the map to place a pin.'
    : 'No location set.';

  return (
    <div className="mehfil-details-map">
      <MapContainer
        className="mehfil-details-map-canvas"
        center={hasPin ? [latitude, longitude] : DEFAULT_CENTER}
        zoom={hasPin ? PIN_ZOOM : DEFAULT_ZOOM}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ResizeWatcher />
        <PinFocuser
          latitude={latitude}
          longitude={longitude}
          focusToken={focusToken}
        />
        {editable && <ClickHandler onPick={onChange} />}
        {hasPin && (
          <Marker
            position={[latitude, longitude]}
            icon={pinIcon}
            draggable={editable}
            eventHandlers={markerHandlers}
          />
        )}
      </MapContainer>
      <div className="mehfil-details-map-footer">
        <Typography.Text type="secondary">
          {hasPin ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` : emptyText}
        </Typography.Text>
        {editable && hasPin && (
          <Button size="small" onClick={() => onChange(null, null)}>
            Clear pin
          </Button>
        )}
      </div>
    </div>
  );
};

export default MehfilDetailsMap;
