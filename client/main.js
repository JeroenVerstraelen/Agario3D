import {
	Player
} from './player.js';
import {
	SphereModel
} from './sphereModel.js';
import {
	TiledGround
} from './tiledGround.js';

// Connection Stuff
var socket;
socket = io.connect('http://localhost:3000');

var players = {}
var player;
var foodBlobs = [];
var gameInitialized = false;

function Food(id, x, z, r, scene, adt, templateMesh) {
	this.id = id;
	this.x = x;
	this.z = z;
	this.r = r;
	var sphere = new SphereModel(x, z, r, scene, templateMesh);
	this.model = sphere;

	// NameText
	/*var textModel = new BABYLON.GUI.TextBlock();
	textModel.text = "Id: "+id;
	textModel.paddingTop = "2px";
	textModel.width = "500px";
	textModel.height = "40px";
	textModel.color = "green";
	textModel.cornerRadius = 10;
	textModel.fontSize = 20;
	textModel.fontFamily = "Verdana";
	//adt.addControl(textModel);
	textModel.linkWithMesh(this.model.model);   
	textModel.linkOffsetY = -(r * 10);
	this.textModel = textModel;*/
}

window.addEventListener('DOMContentLoaded', function () {
	// get the canvas DOM element
	var canvas = document.getElementById('renderCanvas');

	// load the 3D engine
	var engine = new BABYLON.Engine(canvas, true);
	var tiledGround;
	var foodTemplateMesh;

	// createScene function that creates and return the scene
	var createScene = function () {
		// create a basic BJS Scene object
		var scene = new BABYLON.Scene(engine);

		// create a basic light, aiming 0,1,0 - meaning, to the sky
		var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), scene);

		var adt = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

		// Populate
		var texture = new BABYLON.CubeTexture("/client/assets/textures/night.dds", scene);
		scene.createDefaultSkybox(texture, true, 5000);

		player = new Player(socket.id, 0, 0, 8, scene, adt);
		tiledGround = new TiledGround(scene);

		foodTemplateMesh = new Food(-1, 0, 0, 0, scene, adt, null).model.model;

		// Camera
		var camera = new BABYLON.ArcRotateCamera("arcCamera1", 0, 1, 20, player.model.model, scene);
		camera.attachControl(canvas, true);
		camera.maxZ = 600;
		scene.collisionsEnabled = true;
		camera.checkCollisions = true;
		tiledGround.model.checkCollisions = true;

		// Loading text
		var textModel = new BABYLON.GUI.TextBlock();
		textModel.paddingTop = "2px";
		textModel.width = "1000px";
		textModel.height = "100px";
		textModel.color = "green";
		textModel.cornerRadius = 10;
		textModel.fontSize = 50;
		textModel.fontFamily = "Verdana";


		// Environment
		scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
		scene.fogDensity = 0.006;
		scene.fogColor = new BABYLON.Color3(0.9, 0.9, 0.85);
		scene.ambientColor = new BABYLON.Color3(0.3, 0.3, 0.3);


		// Game/Render loop
		var timestep = 1000 / 60;
		var delta = 0;
		var lastFrameTimeMs = 0;
		var forward = new BABYLON.Vector3(0, 0, 0);
		var rollingAverage = new BABYLON.RollingAverage(60);
		scene.registerBeforeRender(() => {
			delta += engine.getDeltaTime();
			rollingAverage.add(scene.getAnimationRatio());
			if (!gameInitialized) {
				return;
			}
			var groundPoint = tiledGround.getMousePositionOnGround(scene);
			if (groundPoint !== null) {
				forward = groundPoint;
			}
			for (const id in players) {
				players[id].onTick(rollingAverage.average);
			}
			if (delta >= timestep) {
				// Send updates to the server at a locked 60 hz.
				socket.emit('update', forward);
				delta = 0;
			}

			camera.radius = Math.sqrt(player.model.getRadius()) * 50;
		})

		// Networking
		socket.on('connect', function () {
			player.setId(socket.id);
			players[socket.id] = player;
		});
		socket.emit('start', {
			...player.getMinimalData(),
			username: player.username
		});
		socket.on('init', function (blobs) {
			// NameText
			textModel.text = "Loading in " + blobs.length + " objects. Please wait.";
			adt.addControl(textModel);
			// Spawn all food in at once.
			setTimeout(() => {
				for (const index in blobs) {
					var blob = blobs[index];
					var food = new Food(blob.id, blob.x, blob.z, blob.r, scene, adt, foodTemplateMesh);
					foodBlobs.push(food);
				}
				adt.removeControl(textModel);
			}, 33);
			setTimeout(() => {
				gameInitialized = true;
			}, 800);
		});
		socket.on('foodCreated', function (foodCreated) {
			for (const index in foodCreated) {
				var foodBlob = foodCreated[index];
				var food = new Food(foodBlob.id, foodBlob.x, foodBlob.z, foodBlob.r, scene, adt, foodTemplateMesh);
				foodBlobs.push(food);
			}
		});
		socket.on('playerEaten', function (id) {
			if (id === player.id) {
				player.position = new BABYLON.Vector3(0, 0, 0);
				player.r = 1;
			}
		});
		socket.on('foodEaten', function (ids) {
			for (const i in ids) {
				var id = ids[i];
				for (const j in foodBlobs) {
					var food = foodBlobs[j];

					if (food.id == id) {
						/*console.log("Distance to player: " + food.model.getPosition().subtract(player.model.getPosition()).length());*/
						food.model.dispose();
						//food.textModel.dispose();
						delete food.model.model;
						//delete food.textModel;
						foodBlobs.splice(j, 1);
					}
				}
			}
		});

		socket.on('heartbeat', function (minimalPlayers) {
			// Update player directions and new connections.
			for (const id in minimalPlayers) {
				var minimalPlayer = minimalPlayers[id];
				var player = players[id];
				if (player !== undefined) {
					player.update(minimalPlayer);
					continue;
				}
				players[id] = new Player(id, minimalPlayer.x, minimalPlayer.z, minimalPlayer.r, scene, adt, minimalPlayer.username);
			}
			// Remove disconnected players.
			for (const id in players) {
				if (!(id in minimalPlayers) && id !== socket.id) {
					console.log("Deleting object");
					players[id].destroy();
					delete players[id];
				}
			}
		});

		// return the created scene
		return scene;
	};

	// call the createScene function
	var scene = createScene();

	// run the render loop
	engine.runRenderLoop(function () {
		scene.render();
	});

	// the canvas/window resize event handler
	window.addEventListener('resize', function () {
		engine.resize();
	});


});