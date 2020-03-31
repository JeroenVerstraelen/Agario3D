export class SphereModel {
	constructor(x, z, r, scene) {
		var sphere = BABYLON.Mesh.CreateSphere('sphere', 16, 1, scene);

		var material = new BABYLON.StandardMaterial("material", scene);
		material.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
		material.backFaceCulling = false;
		sphere.material = material;
		sphere.scaling = new BABYLON.Vector3(r, r, r);

		sphere.position.x = x;
		sphere.position.z = z;
		sphere.position.y = 0

		sphere.rotation.x = -Math.PI / 2;
		this.model = sphere;
	}

	// Actions
	moveInDirection(direction) {
		//this.model.lookAt(direction, 0, 0, 0);
		this.model.position.addInPlace(direction);
		this.model.position.x = Math.min(Math.max(this.model.position.x, -800), 800);
		this.model.position.z = Math.min(Math.max(this.model.position.z, -800), 800);
	}

	// Set and Get
	setPosition(x, z) {
		/*this.model.position.x = x;
		this.model.position.z = z;*/
		this.model.position.x = Math.min(Math.max(x, -800), 800);
		this.model.position.z = Math.min(Math.max(z, -800), 800);
	}

	increaseRadius(deltaR) {
		this.model.scaling.addInPlace(new BABYLON.Vector3(deltaR, deltaR, deltaR));
	}

	setRadius(r) {
		this.model.scaling = new BABYLON.Vector3(r, r, r);
	}

	getPosition() {
		return this.model.position;
	}

	getRadius() {
		return this.model.scaling.x;
	}

	// Destruct
	dispose() {
		this.model.dispose();
	}
}