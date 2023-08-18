
async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 8000 } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(resource, {
    ...options,
    signal: controller.signal  
  });
  clearTimeout(id);

  return response;
}

class Ankiconnect {
    constructor() {
        this.version = 6;
    }

    async ankiInvoke(action, params = {}, timeout = 3000) {
        let version = this.version;
        let request = { action, version, params };

        let request_options = {
            method: 'POST',
            body: JSON.stringify(request),
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: timeout,
        }

        let response = await fetchWithTimeout("http://127.0.0.1:8765", request_options);
        response = await response.json();

        if (Object.getOwnPropertyNames(response).length != 2) {
            throw 'response has an unexpected number of fields';
        }
        if (!response.hasOwnProperty('error')) {
            throw 'response is missing required error field';
        }
        if (!response.hasOwnProperty('result')) {
            throw 'response is missing required result field';
        }
        if (response.error) {
            throw response.error;
        }

        return response.result;

        //return new Promise((resolve, reject) => {

            //$.ajax({
                //url: 'http://127.0.0.1:8765',
                //type: 'POST',
                //data: JSON.stringify(request),
                //timeout,
                //contentType: 'application/json; charset=utf-8',
                //dataType: 'json',
                //success: (response) => {
                    //try {
                        //if (Object.getOwnPropertyNames(response).length != 2) {
                            //throw 'response has an unexpected number of fields';
                        //}
                        //if (!response.hasOwnProperty('error')) {
                            //throw 'response is missing required error field';
                        //}
                        //if (!response.hasOwnProperty('result')) {
                            //throw 'response is missing required result field';
                        //}
                        //if (response.error) {
                            //throw response.error;
                        //}
                        //resolve(response.result);
                    //} catch (e) {
                        //reject(e);
                    //}
                //},
                //error: (xhr, status, err) => resolve(null),
            //});
        //});
    }

    async addNote(note) {
        if (note)
            return await this.ankiInvoke('addNote', { note });
        else
            return Promise.resolve(null);
    }

    async getDeckNames() {
        return await this.ankiInvoke('deckNames');
    }

    async getModelNames() {
        return await this.ankiInvoke('modelNames');
    }

    async getModelFieldNames(modelName) {
        return await this.ankiInvoke('modelFieldNames', { modelName });
    }

    async getVersion() {
        let version = await this.ankiInvoke('version', {}, 100);
        return version ? 'ver:' + version : null;
    }
}

export { Ankiconnect };