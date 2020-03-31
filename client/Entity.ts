import { Component } from './component.js';

export class Entity {
    entityID: number;
    components: Array<Component>;

    constructor(entityID: number) {
        this.entityID = entityID;
        this.components = []
    }

}