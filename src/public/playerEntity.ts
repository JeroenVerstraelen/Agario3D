import { SphereModel } from "./sphereModel.js";
import { getCookie } from './utils.js';

export class PlayerEntity {
    id: string;
    username: string;
    velocity: number;
    model: SphereModel;
    textModel: BABYLON.GUI.TextBlock;
    targetDirection: BABYLON.Vector3;

    constructor(id: string, x: number, z: number, r: number, scene: BABYLON.Scene, adt: BABYLON.GUI.AdvancedDynamicTexture, username: string) {
        this.id = id;
        if (username === "") {
            this.username = getCookie("username");
        } else {
            this.username = username;
        }
        this.velocity = 1;
        this.model = new SphereModel(x, z, r, scene, undefined);

        // NameText
        var textModel = new BABYLON.GUI.TextBlock();
        textModel.text = this.username;
        textModel.paddingTop = "2px";
        textModel.width = "500px";
        textModel.height = "40px";
        textModel.color = "green";
        textModel.fontSize = 20;
        textModel.fontFamily = "Verdana";
        adt.addControl(textModel);
        textModel.linkWithMesh(this.model.mesh);
        textModel.linkOffsetY = -(r * 10);
        this.textModel = textModel;


        this.targetDirection = new BABYLON.Vector3(0, 0, 0);
    }

    setId(id: any): void {
        this.id = id;
    }

    getMinimalData(): any {
        return {
            x: this.model.getPosition().x,
            z: this.model.getPosition().z,
            r: this.model.getRadius()
        };
    }

    destroy(): void {
        this.model.dispose();
    }

    update(minimalData: any): void {
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

    onTick(deltaTime: number): void {
        if (this.targetDirection.x === 0 && this.targetDirection.z === 0) {
            return;
        }
        //console.assert(this.targetDirection.length() === this.velocity, this.targetDirection.length());
        var scaledDirection = this.targetDirection.scale(deltaTime);
        //console.assert(scaledDirection.length() === this.velocity * deltaTime, scaledDirection.length());
        this.model.moveInDirection(scaledDirection);
    }
}