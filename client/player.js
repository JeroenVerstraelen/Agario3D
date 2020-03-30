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
	constructor(id, x, z, r, scene, adt) {
		this.id = id;
		this.velocity = 1;
		this.model = new SphereModel(x, z, r, scene);

		// NameText
		var textModel = new BABYLON.GUI.TextBlock();
		textModel.text = "";
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


		this.targetDirection = new BABYLON.Vector3(5, 0, 4);
	}

	setId(id) {
		var username = getCookie("username");
		if (username !== "") {
			this.textModel.text = username;
		} else {
			this.textModel.text = id;
		}
		this.id = id;
	}

	getMinimalData() {
		return {
			x: this.model.getPosition().x,
			z: this.model.getPosition().z,
			r: this.model.getRadius()
		};
	}
	/*
	move(forward) {
		var direction = forward.subtract(this.model.getPosition());
		direction.normalize();
		direction.y = 0;
		direction.scaleInPlace(this.velocity)
		this.model.moveInDirection(direction);
		this.model.increaseRadius(0.05);
	}*/

	destroy() {
		this.model.dispose();
	}

	update(minimalData) {
		var target = new BABYLON.Vector3(minimalData.x, 0, minimalData.z)
		//if (target.subtract(this.model.getPosition()).length() > 20) {
		//	this.model.setPosition(target.x, target.z);
		//}
		var direction = target.subtract(this.model.getPosition());
		direction.normalize();
		direction.y = 0;
		direction.scaleInPlace(this.velocity);

		//if (this.targetDirection.subtract(direction).lengthSquared() > 0.8) {
		//	console.log(this.targetDirection.subtract(direction).lengthSquared());
		this.targetDirection = direction;
		//}
		this.model.setRadius(minimalData.r);
		this.textModel.linkOffsetY = -(Math.sqrt(minimalData.r) * 20);
	}

	onTick() {
		this.model.moveInDirection(this.targetDirection);
	}
}