import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class SocioiApi implements ICredentialType {
	name = 'socioiApi';

	displayName = 'Socioi API';

	documentationUrl = 'https://socioi.com/docs/public-api/authentication';

	icon = {
		light: 'file:socioi.svg',
		dark: 'file:socioi.dark.svg',
	} as const;

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description:
				'API key from Socioi Settings → Developers → Access (`si_live_…`). OAuth `pos_…` tokens also work.',
		},
		{
			displayName: 'Host',
			name: 'host',
			type: 'string',
			default: 'https://socioi.com/api',
			required: true,
			description:
				'API host without `/public/v1`. Production: `https://socioi.com/api`. Local: `http://localhost:4000`.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.host}}',
			url: '/public/v1/is-connected',
		},
	};
}
