///<reference path="../../node_modules/babylonjs/babylon.module.d.ts" />

export class SphereModel {
    mesh: any;
    template: any;

    constructor(x: number, z: number, r: number, scene: any, templateMesh: any) {
        if (templateMesh === undefined) {
            this._createNormalMesh(x, z, r, scene);
            this.template = templateMesh;
        } else if (templateMesh === null) {
            this._createTemplateMesh(x, z, r, scene);
        } else {
            // Create instance from a given template.
            this._createInstanceMesh(x, z, r, scene, templateMesh);
        }
    }

    _createNormalMesh(x: number, z: number, r: number, scene: any): void {
        var sphere = BABYLON.Mesh.CreateSphere('sphere', 16, 1, scene);
        var material = new BABYLON.StandardMaterial("material", scene);

        // Material
        material.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
        material.backFaceCulling = false;
        material.freeze();
        sphere.material = material;

        // Transform
        sphere.scaling = new BABYLON.Vector3(r, r, r);
        sphere.position.x = x;
        sphere.position.z = z;
        sphere.position.y = 0
        sphere.rotation.x = -Math.PI / 2;

        this.mesh = sphere;
        this.template = sphere;
    }

    _createTemplateMesh(x: number, z: number, r: number, scene: any): void {
        var sphere = BABYLON.Mesh.CreateSphere('sphere', 16, 1, scene);

        // Material
        var material = new BABYLON.StandardMaterial("material", scene);
        material.backFaceCulling = false;
        sphere.material = material;

        // Transform
        sphere.position.x = x;
        sphere.position.z = z;
        sphere.position.y = 0
        sphere.rotation.x = -Math.PI / 2;

        // Instance Specific
        sphere.registerInstancedBuffer("color", 4);
        sphere.instancedBuffers.color = new BABYLON.Color4(Math.random(), Math.random(), Math.random(), 1);
        this.mesh = sphere;
    }

    _createInstanceMesh(x: number, z: number, r: number, scene: any, templateMesh: any): void {
        var instance = templateMesh.createInstance("food");
        instance.instancedBuffers.color = new BABYLON.Color3(Math.random(), Math.random(), Math.random());

        // Transform
        instance.scaling = instance.scaling.scale(r);
        instance.position = new BABYLON.Vector3(x, 0, z);

        // Optimization
        instance.material.freeze();
        instance.freezeWorldMatrix();
        instance.alwaysSelectAsActiveMesh = true;
        instance.isPickable = false;

        this.mesh = instance;
        this.template = templateMesh;
    }

    // Actions
    moveInDirection(direction: BABYLON.Vector3) {
        //this.model.lookAt(direction, 0, 0, 0);
        this.mesh.position.addInPlace(direction);
        this.mesh.position.x = Math.min(Math.max(this.mesh.position.x, -800), 800);
        this.mesh.position.z = Math.min(Math.max(this.mesh.position.z, -800), 800);
    }

    // Mutate
    setPosition(x: number, z: number): void {
        this.mesh.position.x = Math.min(Math.max(x, -800), 800);
        this.mesh.position.z = Math.min(Math.max(z, -800), 800);
    }

    increaseRadius(deltaR: number): void {
        this.mesh.scaling.addInPlace(new BABYLON.Vector3(deltaR, deltaR, deltaR));
    }

    setRadius(r: number): void {
        this.mesh.scaling = new BABYLON.Vector3(r, r, r);
    }

    // Access

    getPosition(): BABYLON.Vector3 {
        return this.mesh.position;
    }

    getRadius(): number {
        return this.mesh.scaling.x;
    }

    // Destruct
    dispose(): void {
        this.mesh.dispose();
    }
}