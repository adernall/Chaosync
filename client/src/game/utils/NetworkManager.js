/**
 * NetworkManager — Colyseus client singleton.
 * Manages room connection, state sync, and message dispatch.
 */

import * as Colyseus from "colyseus.js";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "ws://localhost:2567";

class NetworkManager {
  constructor() {
    this.client = new Colyseus.Client(SERVER_URL);
    this.room = null;
    this.sessionId = null;
    this.listeners = new Map();
  }

  async createRoom(options = {}) {
    try {
      this.room = await this.client.create("game_room", options);
      this.sessionId = this.room.sessionId;
      this._setupRoom();
      return { success: true, roomId: this.room.id };
    } catch (e) {
      console.error("Failed to create room:", e);
      return { success: false, error: e.message };
    }
  }

  async joinRoom(roomId, options = {}) {
    try {
      this.room = await this.client.joinById(roomId, options);
      this.sessionId = this.room.sessionId;
      this._setupRoom();
      return { success: true };
    } catch (e) {
      console.error("Failed to join room:", e);
      return { success: false, error: e.message || "Room not found" };
    }
  }

  async leaveRoom() {
    if (this.room) {
      await this.room.leave();
      this.room = null;
      this.sessionId = null;
    }
  }

  send(type, data = {}) {
    if (this.room) {
      this.room.send(type, data);
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const list = this.listeners.get(event).filter((cb) => cb !== callback);
      this.listeners.set(event, list);
    }
  }

  _emit(event, ...args) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach((cb) => cb(...args));
  }

  _setupRoom() {
    const room = this.room;

    room.onStateChange((state) => {
      this._emit("stateChange", state);
    });

    room.onMessage("level_clear", (data) => {
      this._emit("levelClear", data);
    });

    room.onError((code, message) => {
      console.error(`Room error ${code}: ${message}`);
      this._emit("error", { code, message });
    });

    room.onLeave((code) => {
      console.log("Left room, code:", code);
      this._emit("leave", code);
    });
  }

  get state() {
    return this.room?.state || null;
  }

  get isConnected() {
    return !!this.room;
  }
}

export const Network = new NetworkManager();
