import "./map.css";
import "leaflet/dist/leaflet.css";
import { Icon, divIcon, point } from "leaflet";
import { MapContainer, Marker, TileLayer, Popup, useMapEvents, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import { useEffect, useState } from "react";

export let MapRef;
const Map = () => {
  // important
  // button for location, if location exists in local storage dont show button, if not exists onclick getLoc
  // isloaded ? style = {} : style = {}
  // important

  const defaultMarkers = [
    { geocode: [48.14251611201301, 8.020554601665935], popUp: "Vlad" },
    { geocode: [45.786612, 24.144885], popUp: "Yarik" },
  ];

  // Default markers
  if (!JSON.parse(localStorage.getItem("markers"))) {
    localStorage.setItem("markers", JSON.stringify(defaultMarkers));
  }

  const [markers, setMarkers] = useState(JSON.parse(localStorage.getItem("markers")) || []);
  const [events] = useState(["storageMap", "storage"]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [centerCoords] = useState(
    JSON.parse(localStorage.getItem("location")) || [48.142513132254685, 8.020603345827292]
  );

  const getLoc = () => {
    if (navigator.geolocation && !JSON.parse(localStorage.getItem("location"))) {
      let q = prompt("Can we get your location (It's optional)? Y or N ");
      if (!q || q == "N") {
        localStorage.setItem("location", JSON.stringify([48.142513132254685, 8.020603345827292]));

        return;
      }
      while (q.length > 1 || q != "Y") {
        alert("Type Y or N");
        q = prompt("Can we get your location (It's optional)? Y or N ");
      }

      navigator.geolocation.getCurrentPosition(
        function (e) {
          localStorage.setItem("location", JSON.stringify([e.coords.latitude, e.coords.longitude]));
        },
        function () {
          alert("Could not get your position");
        }
      );
    }
  };

  useEffect(() => {
    localStorage.setItem("markers", JSON.stringify(markers));
    window.dispatchEvent(new Event("storageDetail"));
  }, [markers]);

  events.forEach((e) =>
    window.addEventListener(e, () => {
      setMarkers(JSON.parse(localStorage.getItem("markers")) || []);
    })
  );

  const customIcon = new Icon({
    iconUrl: "./placeholder.png",
    iconSize: [38, 38],
  });

  const createClusterCustomIcon = function (cluster) {
    return new divIcon({
      html: `<span class="cluster-icon">${cluster.getChildCount()}</span>`,
      className: "custom-marker-cluster",
      iconSize: point(33, 33, true),
    });
  };

  const LocationFinderDummy = () => {
    const map = useMapEvents({
      click(e) {
        let popUp = prompt("Enter description: ");
        if (!popUp) return;

        const newMarker = { geocode: [e.latlng.lat, e.latlng.lng], popUp };
        setMarkers((prev) => [...prev, newMarker]);
      },
    });
    return null;
  };

  const BoundMap = function () {
    if (!markers[0]) return null;

    const map = useMap();
    const markerArray = [...markers.map((m) => L.marker(m.geocode))];
    const group = L.featureGroup(markerArray);

    map.fitBounds(group.getBounds());

    return null;
  };

  return (
    <div className="map">
      <MapContainer
        center={centerCoords}
        zoom={16}
        zoomSnap={0.1}
        wheelDebounceTime={100}
        whenReady={(map) => {
          MapRef = map;
          getLoc();
          setIsLoaded(true);
        }}
      >
        {isLoaded && (
          <>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterCustomIcon}>
              {markers.map((m) => (
                <Marker
                  position={m.geocode}
                  icon={customIcon}
                  key={m.geocode.join("-")}
                  eventHandlers={{
                    // important
                    mouseover: (e) => e.target.openPopup(),
                  }}
                >
                  <Popup>
                    <h2>{m.popUp}</h2>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
            <LocationFinderDummy />
            <BoundMap />
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default Map;
