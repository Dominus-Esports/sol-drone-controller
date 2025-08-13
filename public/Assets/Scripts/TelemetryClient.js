(function(){
	function generateSessionId() {
		try { return crypto.randomUUID(); } catch(_){ return 'sess-' + Math.random().toString(36).slice(2); }
	}

	class SOL_TelemetryClient {
		constructor(options){
			const cfg = options || {};
			this.wsUrl = cfg.wsUrl || 'ws://localhost:8080/ws';
			this.sendIntervalMs = typeof cfg.sendIntervalMs === 'number' ? cfg.sendIntervalMs : 200;
			this.maxBatch = typeof cfg.maxBatch === 'number' ? cfg.maxBatch : 10;
			this.bufferLimit = typeof cfg.bufferLimit === 'number' ? cfg.bufferLimit : 500;
			this.sessionId = cfg.sessionId || generateSessionId();
			this.metadata = cfg.metadata || {};

			this.ws = null;
			this.connected = false;
			this.seq = 0;
			this.sensors = new Map(); // name -> { fn, lastAt, everyMs }
			this.buffer = [];
			this.timer = null;
			this.reconnectDelay = 500;
			this.reconnectMax = 8000;
		}

		setMetadata(meta){ this.metadata = Object.assign({}, this.metadata, meta || {}); }

		addSensor(name, fn, everyMs){
			if (!name || typeof fn !== 'function') return;
			this.sensors.set(name, { fn, lastAt: 0, everyMs: Math.max(0, everyMs || 0) });
		}

		removeSensor(name){ this.sensors.delete(name); }

		start(){
			this.connect();
			if (this.timer) clearInterval(this.timer);
			this.timer = setInterval(() => this.tick(), this.sendIntervalMs);
		}

		stop(){
			if (this.timer) { clearInterval(this.timer); this.timer = null; }
			if (this.ws){ try { this.ws.close(); } catch(_){} }
			this.ws = null; this.connected = false;
		}

		connect(){
			try {
				const ws = new WebSocket(this.wsUrl);
				this.ws = ws;
				ws.onopen = () => {
					this.connected = true;
					this.reconnectDelay = 500;
					// Flush any buffered payloads
					this.flush();
				};
				ws.onclose = () => { this.connected = false; this.scheduleReconnect(); };
				ws.onerror = () => { try { ws.close(); } catch(_){ } };
				ws.onmessage = (evt) => {
					// Future: handle server acks, clock sync, commands
					void evt;
				};
			} catch(_){ this.scheduleReconnect(); }
		}

		scheduleReconnect(){
			if (this.timer == null) return; // stopped
			setTimeout(() => this.connect(), this.reconnectDelay);
			this.reconnectDelay = Math.min(this.reconnectMax, this.reconnectDelay * 2);
		}

		collect(){
			const now = Date.now();
			const sensorsOut = {};
			for (const [name, s] of this.sensors.entries()) {
				if (s.everyMs > 0 && now - s.lastAt < s.everyMs) continue;
				try {
					const value = s.fn();
					if (value !== undefined) {
						sensorsOut[name] = value;
						s.lastAt = now;
					}
				} catch(_){ /* skip bad sensor read */ }
			}
			if (Object.keys(sensorsOut).length === 0) return null;
			const payload = {
				v: 1,
				ts: now,
				seq: this.seq++,
				sid: this.sessionId,
				meta: this.metadata,
				sensors: sensorsOut
			};
			return payload;
		}

		enqueue(payload){
			if (!payload) return;
			this.buffer.push(payload);
			if (this.buffer.length > this.bufferLimit) this.buffer.shift(); // drop oldest
		}

		flush(){
			// If offline, persist to IndexedDB store
			if (!this.connected || !this.ws || this.ws.readyState !== WebSocket.OPEN){
				if (window.SOL_TelemetryStore && this.buffer.length){
					try { for (const p of this.buffer) window.SOL_TelemetryStore.add(p); this.buffer.length = 0; } catch(_){ }
				}
				return;
			}
			const take = Math.min(this.buffer.length, this.maxBatch);
			const toSend = this.buffer.splice(0, take);
			// Drain any persisted items first
			if (window.SOL_TelemetryStore){
				try {
					window.SOL_TelemetryStore.getBatch(this.maxBatch).then((batch) => {
						const ids = [];
						for (const it of batch){
							try { this.ws.send(JSON.stringify(it.payload)); ids.push(it.id); } catch(_){}
						}
						if (ids.length) window.SOL_TelemetryStore.removeMany(ids);
					});
				} catch(_){ }
			}
			for (const item of toSend){
				try { this.ws.send(JSON.stringify(item)); } catch(_){ }
			}
		}

		tick(){
			const payload = this.collect();
			if (payload) this.enqueue(payload);
			this.flush();
		}
	}

	window.SOL_TelemetryClient = SOL_TelemetryClient;
})();
