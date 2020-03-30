export class TiledGround {
	constructor(scene) {
		this.xmin = -800;
		this.zmin = -800;
		this.xmax = 800;
		this.zmax = 800;
		this.precision = {
			"w": 2,
			"h": 2
		};
		this.subdivisions = {
			'h': 16,
			'w': 16
		};
		this.createModel(scene);
	}

	createModel(scene) {
		// Create the Model
		var tiledGround = new BABYLON.Mesh.CreateTiledGround(
			"Tiled Ground",
			this.xmin, this.zmin, this.xmax, this.zmax,
			this.subdivisions, this.precision, scene
		);

		// Create Multi Material
		var whiteMaterial = new BABYLON.StandardMaterial("White", scene);
		whiteMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);

		var blackMaterial = new BABYLON.StandardMaterial("Black", scene);
		blackMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);

		var multimat = new BABYLON.MultiMaterial("multi", scene);
		multimat.subMaterials.push(whiteMaterial);
		multimat.subMaterials.push(blackMaterial);
		multimat.backFaceCulling = false;

		tiledGround.subMeshes = [];
		var base = 0;
		var verticesCount = tiledGround.getTotalVertices();
		var tileIndicesLength = tiledGround.getIndices().length / (this.subdivisions.w * this.subdivisions.h);
		for (var row = 0; row < this.subdivisions.h; row++) {
			for (var col = 0; col < this.subdivisions.w; col++) {
				tiledGround.subMeshes.push(new BABYLON.SubMesh(row % 2 ^ col % 2, 0, verticesCount, base, tileIndicesLength, tiledGround));
				base += tileIndicesLength;
			}
		}
		tiledGround.material = multimat;
		tiledGround.backFaceCulling = false;
		this.model = tiledGround;
	}

	getMousePositionOnGround(scene, forward) {
		var model = this.model;
		var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) {
			return mesh == model;
		});
		if (pickinfo.hit) {
			return pickinfo.pickedPoint;
		}
		return null;
	}

}