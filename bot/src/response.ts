export class JSONResponse extends Response {
  constructor(body: any, init: ResponseInit = {}) {
    const jsonBody = JSON.stringify(body);
    if (!init) {
      init = {};
    }
    if (!init.headers) {
      init.headers = {};
    }

    // @ts-ignore
    init.headers["content-type"] = "application/json";

    super(jsonBody, init);
  }
}
