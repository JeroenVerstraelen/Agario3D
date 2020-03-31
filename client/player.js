import {
	SphereModel
} from './sphereModel.js';

function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}

export class Player {
	constructor(id, x, z, r, scene, adt, username) {
		this.id = id;
		if (username === undefined) {
			this.username = getCookie("username");
		} else {
			this.username = username;
		}
		this.velocity = 1;
		this.model = new SphereModel(x, z, r, scene);

		// NameText
		var textModel = new BABYLON.GUI.TextBlock();
		textModel.text = this.username;
		textModel.paddingTop = "2px";
		textModel.width = "500px";
		textModel.height = "40px";
		textModel.color = "green";
		textModel.cornerRadius = 10;
		textModel.fontSize = 20;
		textModel.fontFamily = "Verdana";
		adt.addControl(textModel);
		textModel.linkWithMesh(this.model.model);
		textModel.linkOffsetY = -(r * 10);
		this.textModel = textModel;


		this.targetDirection = new BABYLON.Vector3(0, 0, 0);
	}

	setId(id) {
		this.id = id;
	}

	getMinimalData() {
		return {
			x: this.model.getPosition().x,
			z: this.model.getPosition().z,
			r: this.model.getRadius()
		};
	}

	destroy() {
		this.model.dispose();
	}

	update(minimalData) {
		var target = new BABYLON.Vector3(minimalData.x, 0, minimalData.z)

		var direction = target.subtract(this.model.getPosition());
		if (target.subtract(this.model.getPosition()).length() > 10) {
			// Quickly catch back up to the server.
			direction.y = 0;
			direction.scaleInPlace(0.5);
		} else {
			direction.normalize();
			direction.y = 0;
			direction.scaleInPlace(this.velocity);
		}

		this.targetDirection = direction;
		this.model.setRadius(minimalData.r);
		this.textModel.linkOffsetY = -(Math.sqrt(minimalData.r) * 20);
	}

	onTick(deltaTime) {
		if (this.targetDirection.x === 0 && this.targetDirection.z === 0) {
			return;
		}
		//console.assert(this.targetDirection.length() === this.velocity, this.targetDirection.length());
		var scaledDirection = this.targetDirection.scale(deltaTime);

		//console.assert(scaledDirection.length() === this.velocity * deltaTime, scaledDirection.length());

		//console.log('scaledDirection :', scaledDirection);
		this.model.moveInDirection(scaledDirection);
	}
}