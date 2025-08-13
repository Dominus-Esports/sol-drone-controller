(function(){
	const DB_NAME = 'sol_telemetry';
	const STORE = 'events';
	const DB_VERSION = 1;

	function openDb(){
		return new Promise((resolve, reject) => {
			const req = indexedDB.open(DB_NAME, DB_VERSION);
			req.onupgradeneeded = () => {
				const db = req.result;
				if (!db.objectStoreNames.contains(STORE)) {
					db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
				}
			};
			req.onsuccess = () => resolve(req.result);
			req.onerror = () => reject(req.error);
		});
	}

	async function withStore(mode, fn){
		const db = await openDb();
		return new Promise((resolve, reject) => {
			const tx = db.transaction(STORE, mode);
			const store = tx.objectStore(STORE);
			Promise.resolve(fn(store))
				.then((res) => { tx.oncomplete = () => resolve(res); tx.onerror = () => reject(tx.error); })
				.catch(reject);
		});
	}

	function add(payload){
		return withStore('readwrite', (st) => st.add({ payload }));
	}
	function getBatch(limit){
		return withStore('readonly', (st) => new Promise((resolve) => {
			const out = [];
			const req = st.openCursor();
			req.onsuccess = () => {
				const cur = req.result;
				if (cur && out.length < limit){
					out.push({ id: cur.key, payload: cur.value.payload });
					cur.continue();
				} else {
					resolve(out);
				}
			};
		}));
	}
	function removeMany(ids){
		if (!ids || ids.length === 0) return Promise.resolve();
		return withStore('readwrite', async (st) => {
			for (const id of ids) st.delete(id);
		});
	}

	window.SOL_TelemetryStore = { add, getBatch, removeMany };
})();
