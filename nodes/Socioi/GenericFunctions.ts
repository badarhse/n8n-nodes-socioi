import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	IWebhookFunctions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

export async function socioiApiRequest(
	this: IExecuteFunctions | IWebhookFunctions | IHookFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	resource: string,
	body: IDataObject | IDataObject[] | FormData = {},
	query: IDataObject = {},
	option: IDataObject = {},
): Promise<unknown> {
	const credentials = await this.getCredentials('socioiApi');
	const host = String(credentials.host).replace(/\/$/, '');

	let options: IHttpRequestOptions = {
		baseURL: `${host}/public/v1`,
		method,
		body,
		qs: query,
		url: resource,
		json: true,
	};

	if (!Object.keys(query).length) {
		delete options.qs;
	}

	if (method === 'GET' || method === 'DELETE') {
		delete options.body;
	}

	options = Object.assign({}, options, option);

	try {
		return await this.helpers.httpRequestWithAuthentication.call(this, 'socioiApi', options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}
