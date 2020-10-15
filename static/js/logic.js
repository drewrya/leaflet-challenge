// Store our API endpoint inside queryUrl
// Querying data for significant earthquakes in the past 30 days
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

function getRadius(mag) {
    return mag * 20000;
  };

function getColor(depth) {
    if (depth < 10) {
        return "green";
    } else if (depth < 30) {
        return "lightgreen";
    } else if (depth < 50) {
        return "Goldenrod";
    } else if (depth < 70) {
        return "orange";
    } else if (depth < 90) {
        return "chocolate";
    } else {
        return "red";
    };
  };

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
    console.log(data)
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: function(feature, layer) {
            layer.bindPopup("<h3>Magnitude: " + feature.properties.mag +"</h3><h3>Location: "+ feature.properties.place +
              "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
          },

          pointToLayer: function (feature, latlng) {
            return new L.circle(latlng,
              {radius: getRadius(feature.properties.mag),
              fillColor: getColor(feature.geometry.coordinates[2]),
              fillOpacity: .75,
              color: "black",
              stroke: true,
              weight: .8
          })
        }
        });
  
    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
  }
  function createMap(earthquakes) {

    // Define streetmap 
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/streets-v11",
      accessToken: API_KEY
    });
  
    // Define a baseMaps object to hold our base layer
    var baseMaps = {
      "Street Map": streetmap
    };
  
    // Create overlay object to hold our overlay layer
    var overlayMaps = {
      Earthquakes: earthquakes
    };
  
    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
      center: [
        // Coords for center of US  
        39.5, -98.35
      ],
      zoom: 5,
      layers: [streetmap, earthquakes]
    });
  
    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);
  

      // Create legend
      var legend = L.control({
        position: "bottomright",
    });

    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");
    
        var depth = ["-10", "10", "30", "50", "70", "90"];
        var colors = [
          "green",
          "lightgreen",
          "Goldenrod",
          "orange",
          "chocolate",
          "red"
        ];

    // Create html for legend
    for (var i = 0; i < depth.length; i++) {
        div.innerHTML +=
        '<i style="background:' + colors[i] + '"></i> ' + 
            depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
    }
    return div;
    };
    legend.addTo(myMap);
}



  