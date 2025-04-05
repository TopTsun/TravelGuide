import { useState } from "react";
import "./detail.css";
import { MapRef } from "../map/Map";

const Detail = () => {
  const [markers, setMarkers] = useState(JSON.parse(localStorage.getItem("markers")) || []);
  const [events] = useState(["storageDetail", "storage"]);
  const [input, setInput] = useState("");

  events.forEach((e) =>
    window.addEventListener(e, () => {
      setMarkers(JSON.parse(localStorage.getItem("markers")) || []);
    })
  );

  const handleRename = function (e) {
    const latlng = e.target.previousSibling.innerText.split(", ").map((c) => +c);
    const elIndex = markers.findIndex((e) => {
      return JSON.stringify(e.geocode) == JSON.stringify(latlng);
    });

    let popUp = prompt("Enter description: ", markers[elIndex].popUp);
    if (!popUp) return;

    const updatedArray = markers;
    updatedArray[elIndex].popUp = popUp;

    setMarkers(updatedArray);
    localStorage.setItem("markers", JSON.stringify(markers));
    window.dispatchEvent(new Event("storage"));
  };

  const handleDelete = function (e) {
    const latlng = e.target.previousSibling.previousSibling.innerText.split(", ").map((c) => +c);
    const elIndex = markers.findIndex((e) => {
      return JSON.stringify(e.geocode) == JSON.stringify(latlng);
    });

    let q = prompt("Do you want to delete that marker? Y/N", "Y");
    if (!q || q == "N") return;
    while (q.length > 1 || q != "Y") {
      alert("Type Y or N");
      q = prompt("Do you want to delete that marker? Y/N", "Y");
    }

    if (q == "Y") {
      const updatedArray = markers;
      if (elIndex > -1) {
        updatedArray.splice(elIndex, 1);
      }

      setMarkers(updatedArray);
      localStorage.setItem("markers", JSON.stringify(markers));
      window.dispatchEvent(new Event("storage"));
    }
  };

  const handleFlyTo = function (e) {
    const latlng = e.target.nextSibling.innerText.split(", ").map((c) => +c);

    MapRef.target.flyTo(latlng, 12, { duration: 2 });
  };

  const getLoc = () => {
    if (navigator.geolocation) {
      let q = prompt(
        "Can we get your location (show's your position if there are no markers, you only give it once)? Y or N"
      );
      if (!q || q == "N") return;

      while (q.length > 1 || q != "Y") {
        alert("Type Y or N");
        q = prompt("Can we get your location? Y or N ");
      }

      navigator.geolocation.getCurrentPosition(
        function (e) {
          localStorage.setItem("location", JSON.stringify([e.coords.latitude, e.coords.longitude]));
          window.location.reload();
        },
        function () {
          alert("Could not get your position");
        }
      );
    }
  };

  const changeStyle = () => {
    Object.values(MapRef.target._layers)[1]._url =
      Object.values(MapRef.target._layers)[1]._url == "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        : "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

    MapRef.target._resetView(MapRef.target.getBounds().getCenter(), MapRef.target._zoom, false);

    localStorage.setItem(
      "mapStyle",
      Object.values(MapRef.target._layers)[1]._url == "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        ? "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    );
  };

  const filteredMarkers = markers.filter((c) => c.popUp.toLowerCase().includes(input.toLowerCase()));

  return (
    <div className="detail">
      {markers[0] ? (
        <input type="text" onChange={(e) => setInput(e.target.value)} placeholder="Search for marker..." />
      ) : (
        ""
      )}
      {filteredMarkers.map((m) => (
        <div className="marker" key={m.geocode.join("-")}>
          <h2>{m.popUp}</h2>
          <p>
            <span onClick={handleFlyTo}>
              {m.geocode[0].toFixed(3)}, {m.geocode[1].toFixed(3)}
            </span>
            <span className="geocode">
              {m.geocode[0]}, {m.geocode[1]}
            </span>
            <img src="./Rename.png" alt="Rename" className="rename" onClick={handleRename} />
            <img src="./delete.png" alt="Delete" className="delete" onClick={handleDelete} />
          </p>
        </div>
      ))}
      {markers[0] ? <div className="separator"></div> : ""}
      {JSON.parse(localStorage.getItem("location")) ? (
        <button onClick={getLoc}>Update location</button>
      ) : (
        <button onClick={getLoc}>Add location</button>
      )}
      <button onClick={changeStyle} className="changeStyle">
        Change map style
      </button>
    </div>
  );
};

export default Detail;
