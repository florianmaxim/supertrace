  var ROTATION = {"x":0,
                  "y":0,
                  "z":0}

  var HEADING = {"x":0,
                 "y":0,
                 "z":0}

  var LOG = document.getElementById('log');
  var INFO = document.getElementById('info');

  var ZOOM = 20000;
  var MAP_WIDTH = 10
  var MAP_HEIGHT = 10;

       POSITION = new Location();
var MY_POSITION = {};

var POINTS =[];

var count=0;

var COMPASS;


var CITIES =[]; //for testing :)
(function(){
  CITIES.push({"name":"Home", "latitude":52.358853, "longitude":9.719908});
  CITIES.push({"name":"Markt", "latitude":52.367192, "longitude":9.714541});

  CITIES.push({"name":"Ritter Brüning", "latitude":52.359233, "longitude":9.722236});

  CITIES.push({"name":"Caramel", "latitude":52.358275, "longitude":9.722929});








  CITIES.push({"name":"Netto Engelbosteler Damm", "latitude":52.386394, "longitude":9.723987});




  CITIES.push({"name":"Berlin", "latitude":52.518611, "longitude":13.408333});
  CITIES.push({"name":"Stockholm", "latitude":59.325, "longitude":18.05});
  CITIES.push({"name":"Hong Kong", "latitude":22.28, "longitude":114});
  CITIES.push({"name":"Hamburg", "latitude":53.550556, "longitude":9.993333});
  CITIES.push({"name":"Antarktis", "latitude":-76.067497, "longitude":7.219809});
  CITIES.push({"name":"New York", "latitude":40.712778 ,"longitude":-74.005833});
  CITIES.push({"name":"Reykjavík", "latitude": 64.08, "longitude": 21.56})
  CITIES.push({"name":"California", "latitude": 37.20, "longitude": 121.53})
  CITIES.push({"name":"Montreal", "latitude": 45.30 ,"longitude": 73.34});})();

var PLANE_DISTANCE = -15;

var renderer, camera, scene, controls, gridHelper = false;

var containerGround, containerMap;

var cube1, cube2, pointMesh;;

var plane;



function init(){

  //general
  (function(){
    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio));
    renderer.setClearColor(0x000000);

    renderer.shadowMap.enabled = true;
    renderer.shadowMapSoft = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.domElement.id = 'renderer';

    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 65 , window.innerWidth / window.innerHeight, 0.01, 1000);
    camera.position.set(0,.001,0);
    scene.add(camera);

    var light = new THREE.AmbientLight(0xffffff, 1);
    scene.add(light);

    var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
    scene.add( light );

    //general events

    window.addEventListener('resize', function() {
       camera.aspect = window.innerWidth / window.innerHeight;
       camera.updateProjectionMatrix();

       renderer.setSize(window.innerWidth, window.innerHeight);
       renderer.setPixelRatio(window.devicePixelRatio);
   }, false);

  })();
  //elements
  (function(){

		//GROUND

    //container
		containerGround = new THREE.Group();

    var geometry = new THREE.PlaneGeometry(MAP_WIDTH, MAP_HEIGHT, 95, 95);

    for ( var i = 0; i < geometry.faces.length; i ++ ) {

      var face = geometry.faces[ i ];
      face.color.setHex( Math.random() * 0xffffff );

    }


    // this material causes a mesh to use colors assigned to vertices
  	//   different colors at face vertices create gradient effect
  	var material = new THREE.MeshBasicMaterial(
  	{ color: 0xffffff, vertexColors: THREE.VertexColors, depthWrite:false } );

  	var color, face, numberOfSides, vertexIndex;

  	// faces are indexed using characters
  	var faceIndices = [ 'a', 'b', 'c', 'd' ];

  	// randomly color cube
  	for ( var i = 0; i < geometry.faces.length; i++ )
  	{
  		face  = geometry.faces[ i ];
  		// determine if current face is a tri or a quad
  		numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;
  		// assign color to each vertex of current face
  		for( var j = 0; j < numberOfSides; j++ )
  		{
  			vertexIndex = face[ faceIndices[ j ] ];
  			// initialize color variable
  			color = new THREE.Color( 0xffffff );
  			color.setHex( Math.random() * 0xffffff );
  			face.vertexColors[ j ] = color;
  		}
  	}


    var plane = new THREE.Mesh( geometry, material );

		plane.material.side = THREE.DoubleSide;
		plane.receiveShadow = true;
    //DONT TOUCH THIS!
		plane.position.set(0,0,-.1);

    //IMPORTANT!
    containerGround.rotation.x = -Math.PI/2;
    containerGround.rotation.z = Math.PI/2;

    containerGround.add(plane);

		scene.add(containerGround);

    //MAP

    //Container element
		containerMap= new THREE.Group();

    cube1Material = new THREE.MeshLambertMaterial({color:0xff0000});
    cube1 = new THREE.Mesh(new THREE.CubeGeometry(.5,.5,.5), cube1Material);
    cube1.position.set(0,0,0);
    containerMap.add(cube1);

    //geometry
    var geometry = new THREE.PlaneGeometry(MAP_WIDTH, MAP_HEIGHT, 10, 10);

    for ( var i = 0; i < geometry.faces.length; i ++ ) {
      var face = geometry.faces[ i ];
      face.color.setHex( Math.random() * 0xffffff );
    }

    var plane = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { vertexColors: THREE.FaceColors, transparent: true, opacity: .3, depthWrite:false } ));

    plane.material.side = THREE.DoubleSide;
    containerMap.add(plane);

		//add containerMapto camera;
		containerMap.position.set(0,0,PLANE_DISTANCE);

		camera.add(containerMap);

  })();

  (function(){
    if(navigator.userAgent.match(/iPhone|iPad|iPod|Android/i)){
      controls = new THREE.DeviceOrientationControls(camera);
    }else{
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      camera.position.set(0,.2,.5);
      camera.lookAt(scene.position);
    }
  })();

	//init compass
  // Obtain a new *world-oriented* Full Tilt JS DeviceOrientation Promise
  COMPASS = FULLTILT.getDeviceOrientation({ 'type': 'world' });

}


function updateCompass(){
  // Wait for Promise result
 COMPASS.then(function(deviceOrientation) { // Device Orientation Events are supported

   // Register a callback to run every time a new
   // deviceorientation event is fired by the browser.
   deviceOrientation.listen(function() {

     // Get the current *screen-adjusted* device orientation angles
     var currentOrientation = deviceOrientation.getScreenAdjustedEuler();

     // Calculate the current compass heading that the user is 'looking at' (in degrees)
     var compassHeading = 360 - currentOrientation.alpha;

     var radians = compassHeading * (Math.PI/180)

     //DONT TOUCH THIS! (its fine!)
     containerMap.rotation.z = radians;
     //DONT TOUCH THIS!
     containerGround.rotation.z = (containerMap.rotation.z)-(camera.rotation.y)*-1;

   });

 }).catch(function(errorMessage) { // Device Orientation Events are not supported

   console.log(errorMessage);

   // Implement some fallback controls here...

 });
}


addEventListener("touchend", function(){


  if(count!=1){
    //get current positions
    var position = POSITION.get();
  	//TEST WITH RITTER BRÜNING!
    //var position = CITIES[1];

    //create visual element for the map
    var material = new THREE.MeshLambertMaterial({color:0x0000ff, depthWrite:true});
        material.color.setHex( Math.random() * 0xffffff );
        material.side = THREE.DoubleSide;

    var element1 = new THREE.Mesh(new THREE.SphereGeometry(.5, 32, 32), material);
    element1.position.set(0,0,0);
  	element1.castShadow = true;
    containerMap.add(element1);

  	//create visual element for the ground
    var element2 = new THREE.Mesh(new THREE.SphereGeometry(.1, 32, 32), material);
    element2.position.set(0,0,0);
  	element2.castShadow = true;
    containerGround.add(element2);

    //add to points array
    POINTS.push([position, element1, element2]);

    console.log(POINTS);
  }

  document.getElementById('info').style.display = 'none';
  document.getElementById('info2').style.display = 'none';
  document.getElementById('info3').style.display = 'none';

  if(count===0){
   document.getElementById('info4').innerHTML = 'YOU ARE INSIDE YOUR FIRST BALL NOW! MOVE ON TO GET OUT.';
   document.getElementById('info4').style.top = '4vh';
   document.getElementById('info4').style.paddingLeft = '4vw';
   document.getElementById('info4').style.height = '100vh';
   document.getElementById('info4').style.textAlign = 'left';


   document.getElementById('info4').style.fontSize = '4vh';

   document.getElementById('info4').style.border = '0';
count++;
  }else{
   document.getElementById('info4').style.display='none';
   count++;
 }


});


function updateMyPosition(){

  MY_POSITION = POSITION.get();

  MY_POSITION.coords = POSITION.containerPosition(MY_POSITION.latitude, MY_POSITION.longitude, MAP_WIDTH, MAP_HEIGHT);

  //zoom
  MY_POSITION.coords.xCenter=MY_POSITION.coords.xCenter*ZOOM;
  MY_POSITION.coords.yCenter=MY_POSITION.coords.yCenter*ZOOM;

  //Set pos1 as center
  cube1.position.set(MY_POSITION.coords.xCenter-MY_POSITION.coords.xCenter,
                     MY_POSITION.coords.yCenter-MY_POSITION.coords.yCenter,
                     0);
}


function updatePoints(){
  //go through points array
  for(var i = 0; i<POINTS.length;i++){
    //calculate coords
    var position = POSITION.containerPosition(
                      POINTS[i][0].latitude,
                      POINTS[i][0].longitude,
                      MAP_WIDTH,
                      MAP_HEIGHT);

    //zoom
    position.xCenter=position.xCenter*ZOOM;
    position.yCenter=position.yCenter*ZOOM;

    //console.log('*UPDATED POINTS:'+position.xCenter+', '+position.yCenter)

    //reposition elements

		//map
    POINTS[i][1].position.set(position.xCenter-MY_POSITION.coords.xCenter,
															position.yCenter-MY_POSITION.coords.yCenter,
															POINTS[i][1].position.z);
		//ground
		POINTS[i][2].position.set(position.xCenter-MY_POSITION.coords.xCenter,
															position.yCenter-MY_POSITION.coords.yCenter,
															0);


	}
}



function render(){

  updateMyPosition();

  updatePoints();

  updateCompass();

  requestAnimationFrame(render);

  if(controls)
    controls.update();
	  renderer.render( scene, camera );
	}

init();
render();
