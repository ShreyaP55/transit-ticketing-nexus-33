
declare namespace google.maps {
  interface MapOptions {
    center?: LatLng | LatLngLiteral;
    zoom?: number;
    mapTypeId?: MapTypeId;
    fullscreenControl?: boolean;
    mapTypeControl?: boolean;
    streetViewControl?: boolean;
    disableDefaultUI?: boolean;
    zoomControl?: boolean;
    styles?: MapTypeStyle[];
  }

  type MapTypeId = 'roadmap' | 'satellite' | 'hybrid' | 'terrain';

  interface MapTypeStyle {
    elementType?: string;
    featureType?: string;
    stylers?: Array<{ [key: string]: any }>;
  }
}

// Add custom marker type definition to handle setIcon
declare module '@react-google-maps/api' {
  export interface MarkerProps {
    position: google.maps.LatLng | google.maps.LatLngLiteral;
    icon?: string | google.maps.Icon | google.maps.Symbol;
    label?: string | google.maps.MarkerLabel;
    clickable?: boolean;
    draggable?: boolean;
    visible?: boolean;
    zIndex?: number;
    animation?: google.maps.Animation;
    onClick?: (e: google.maps.MapMouseEvent) => void;
    onDblClick?: (e: google.maps.MapMouseEvent) => void;
    onDrag?: (e: google.maps.MapMouseEvent) => void;
    onDragStart?: (e: google.maps.MapMouseEvent) => void;
    onDragEnd?: (e: google.maps.MapMouseEvent) => void;
    onMouseOut?: (e: google.maps.MapMouseEvent) => void;
    onMouseOver?: (e: google.maps.MapMouseEvent) => void;
    onRightClick?: (e: google.maps.MapMouseEvent) => void;
    onLoad?: (marker: google.maps.Marker) => void;
    onUnmount?: (marker: google.maps.Marker) => void;
  }
}
