export class TiledGroundModel {
    xmin: number;
    zmin: number;
    xmax: number;
    zmax: number;
    precision: { w: number; h: number; };
    subdivisions: { h: number; w: number; };
    model: any;

    constructor(scene: any) {
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
        this._createMesh(scene);
    }

    _createMesh(scene: any): void {
        // Create the Model
        var tiledGround: BABYLON.Mesh = BABYLON.Mesh.CreateTiledGround(
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

        var tileIndices = tiledGround.getIndices();
        var tileIndicesLength = tileIndices !== null ? tileIndices.length : 0;
        tileIndicesLength /= (this.subdivisions.w * this.subdivisions.h);
        for (var row = 0; row < this.subdivisions.h; row++) {
            for (var col = 0; col < this.subdivisions.w; col++) {
                tiledGround.subMeshes.push(new BABYLON.SubMesh(row % 2 ^ col % 2, 0, verticesCount, base, tileIndicesLength, tiledGround));
                base += tileIndicesLength;
            }
        }
        tiledGround.material = multimat;
        (<any>tiledGround).backFaceCulling = false;
        this.model = tiledGround;
    }

    getMousePositionOnGround(scene: any): any {
        var model = this.model;
        var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh: BABYLON.Mesh) {
            return mesh == model;
        });
        if (pickinfo.hit) {
            return pickinfo.pickedPoint;
        }
        return null;
    }

}