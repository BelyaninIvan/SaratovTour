/* const query = new URLSearchParams({
    profile: 'car',
    point: '8.534317,47.400905',
    point_hint: 'string',
    snap_prevention: 'string',
    curbside: 'any',
    locale: 'en',
    elevation: 'false',
    details: 'string',
    optimize: 'false',
    instructions: 'true',
    calc_points: 'true',
    debug: 'false',
    points_encoded: 'true',
    'ch.disable': 'true',
    heading: '1',
    heading_penalty: '120',
    pass_through: 'false',
    algorithm: 'round_trip',
    'round_trip.distance': '10000',
    'round_trip.seed': '0',
    'alternative_route.max_paths': '2',
    'alternative_route.max_weight_factor': '1.4',
    'alternative_route.max_share_factor': '0.6',
    key: '0cdf8671-f0b8-4cb6-9702-1f73a10c9a4c'
  }).toString();

fetch (`https://graphhopper.com/api/1/route?${query}`)
.then((res) => {
    return res.json();
})
.then((data) => {
    console.log(data);
}) */

/* require('graphhopper-js-api-client');
 
window.onload = function() {
  let defaultKey = "0cdf8671-f0b8-4cb6-9702-1f73a10c9a4c";
  let ghRouting = new GraphHopper.Routing({key: defaultKey}, {profile:"car", elevation: false});

  ghRouting.doRequest({points:[[8.534317, 47.400905], [8.538265, 47.394108]]})
    .then(function(json){
       // Add your own result handling here
       console.log(json);
    })
    .catch(function(err){
       console.error(err.message);
    });
}; */