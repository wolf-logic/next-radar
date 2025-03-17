import { graphConfig } from "@/lib/legacy/graphing/config";

export class Blip {
    constructor(id, name, ring, isNew, status, topic, description) {
        this._id = id;
        this._name = name;
        this._ring = ring;
        this.isNewFlag = isNew;
        this._status = status || "";
        this._topic = topic || "";
        this._description = description || "";
        this.isGroupFlag = false;
        this._blipText = "";
        this._groupIdInGraph = "";
        this.width = graphConfig.blipWidth;
    }

    name() {
        return this._name;
    }

    topic() {
        return this._topic;
    }

    description() {
        return this._description;
    }

    isNew() {
        if (this._status) {
            return this._status.toLowerCase() === "new";
        }
        return this.isNewFlag;
    }

    hasMovedIn() {
        return this._status.toLowerCase() === "moved in";
    }

    hasMovedOut() {
        return this._status.toLowerCase() === "moved out";
    }

    hasNoChange() {
        return this._status.toLowerCase() === "no change";
    }

    status() {
        return this._status.toLowerCase() || "";
    }

    isGroup() {
        return this.isGroupFlag;
    }

    groupIdInGraph() {
        return this._groupIdInGraph || "";
    }

    setGroupIdInGraph(groupId) {
        this._groupIdInGraph = groupId;
    }

    ring() {
        return this._ring;
    }

    blipText() {
        return this._blipText || "";
    }

    setBlipText(text) {
        this._blipText = text;
    }

    setIsGroup(isAGroupBlip) {
        this.isGroupFlag = isAGroupBlip;
    }

    id() {
        return this._id;
    }

    groupBlipWidth() {
        return this.isNew() ? graphConfig.newGroupBlipWidth : graphConfig.existingGroupBlipWidth;
    }
}

export default Blip;
