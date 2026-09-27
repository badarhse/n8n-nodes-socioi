import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import { socioiApiRequest } from './GenericFunctions';

export class Socioi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Socioi',
		name: 'socioi',
		icon: {
			light: 'file:socioi.svg',
			dark: 'file:socioi.dark.svg',
		},
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Schedule and publish social posts with Socioi',
		defaults: {
			name: 'Socioi',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'socioiApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Channel', value: 'channel' },
					{ name: 'Media', value: 'media' },
					{ name: 'Post', value: 'post' },
				],
				default: 'post',
			},

			// ── Channel ──────────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['channel'] } },
				options: [
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'List connected channels',
						action: 'List channels',
					},
					{
						name: 'Get Quota',
						value: 'getQuota',
						description: 'Get plan channel quota',
						action: 'Get channel quota',
					},
				],
				default: 'getAll',
			},

			// ── Post ─────────────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['post'] } },
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a draft, schedule, or publish now',
						action: 'Create a post',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a post by ID',
						action: 'Delete a post',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a post by ID',
						action: 'Get a post',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'List posts',
						action: 'List posts',
					},
					{
						name: 'Schedule',
						value: 'schedule',
						description: 'Set or update the schedule time for a post',
						action: 'Schedule a post',
					},
				],
				default: 'create',
			},

			// ── Media ────────────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['media'] } },
				options: [
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a media asset by ID',
						action: 'Delete media',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'List media assets',
						action: 'List media',
					},
					{
						name: 'Upload From URL',
						value: 'uploadFromUrl',
						description: 'Import a file from a public URL into the media library',
						action: 'Upload media from URL',
					},
				],
				default: 'uploadFromUrl',
			},

			// Post → Create
			{
				displayName: 'Type',
				name: 'type',
				type: 'options',
				displayOptions: { show: { resource: ['post'], operation: ['create'] } },
				options: [
					{ name: 'Draft', value: 'draft' },
					{ name: 'Schedule', value: 'schedule' },
					{ name: 'Now', value: 'now' },
				],
				default: 'now',
				required: true,
				description: 'Draft saves only; schedule needs a date; now queues for publishing',
			},
			{
				displayName: 'Content',
				name: 'content',
				type: 'string',
				typeOptions: { rows: 4 },
				displayOptions: { show: { resource: ['post'], operation: ['create'] } },
				default: '',
				required: true,
				description: 'Caption / post text (same content on all selected channels)',
			},
			{
				displayName: 'Channel IDs',
				name: 'channelIds',
				type: 'string',
				displayOptions: { show: { resource: ['post'], operation: ['create'] } },
				default: '',
				required: true,
				description:
					'Comma-separated channel IDs (from Channel → Get Many, or the Socioi UI)',
				placeholder: 'clx_abc,clx_def',
			},
			{
				displayName: 'Date',
				name: 'date',
				type: 'dateTime',
				displayOptions: {
					show: { resource: ['post'], operation: ['create'], type: ['schedule'] },
				},
				default: '',
				required: true,
				description: 'Schedule time (UTC ISO)',
			},
			{
				displayName: 'Media IDs',
				name: 'mediaIds',
				type: 'string',
				displayOptions: { show: { resource: ['post'], operation: ['create'] } },
				default: '',
				description: 'Optional comma-separated media IDs from Media → Upload From URL',
				placeholder: 'clx_media1,clx_media2',
			},
			{
				displayName: 'Settings (JSON)',
				name: 'settingsJson',
				type: 'json',
				displayOptions: { show: { resource: ['post'], operation: ['create'] } },
				default: '{}',
				description:
					'Optional provider settings (e.g. Pinterest `boardId`, YouTube `privacyStatus`)',
			},

			// Post → Get / Delete / Schedule
			{
				displayName: 'Post ID',
				name: 'postId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['get', 'delete', 'schedule'],
					},
				},
				default: '',
				required: true,
			},
			{
				displayName: 'Scheduled At',
				name: 'scheduledAt',
				type: 'dateTime',
				displayOptions: { show: { resource: ['post'], operation: ['schedule'] } },
				default: '',
				required: true,
				description: 'New schedule time (UTC ISO)',
			},

			// Post → Get Many
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				displayOptions: { show: { resource: ['post'], operation: ['getAll'] } },
				options: [
					{ name: 'All', value: '' },
					{ name: 'Draft', value: 'DRAFT' },
					{ name: 'Failed', value: 'FAILED' },
					{ name: 'Published', value: 'PUBLISHED' },
					{ name: 'Scheduled', value: 'SCHEDULED' },
				],
				default: '',
				description: 'Optional status filter',
			},

			// Media → Upload From URL
			{
				displayName: 'URL',
				name: 'mediaUrl',
				type: 'string',
				displayOptions: { show: { resource: ['media'], operation: ['uploadFromUrl'] } },
				default: '',
				required: true,
				description: 'Public URL of the image or video to import',
				placeholder: 'https://example.com/photo.jpg',
			},

			// Media → Delete
			{
				displayName: 'Media ID',
				name: 'mediaId',
				type: 'string',
				displayOptions: { show: { resource: ['media'], operation: ['delete'] } },
				default: '',
				required: true,
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;
				let responseData: unknown;

				if (resource === 'channel') {
					if (operation === 'getAll') {
						responseData = await socioiApiRequest.call(this, 'GET', '/channels');
					} else if (operation === 'getQuota') {
						responseData = await socioiApiRequest.call(this, 'GET', '/channels/quota');
					}
				}

				if (resource === 'post') {
					if (operation === 'create') {
						const type = this.getNodeParameter('type', i) as string;
						const content = this.getNodeParameter('content', i) as string;
						const channelIdsRaw = this.getNodeParameter('channelIds', i) as string;
						const mediaIdsRaw = this.getNodeParameter('mediaIds', i, '') as string;
						const settingsJson = this.getNodeParameter('settingsJson', i, '{}') as string;

						const channelIds = splitIds(channelIdsRaw);
						if (!channelIds.length) {
							throw new NodeOperationError(this.getNode(), 'At least one channel ID is required', {
								itemIndex: i,
							});
						}

						const body: IDataObject = {
							type,
							content,
							channelIds,
						};

						if (type === 'schedule') {
							body.date = this.getNodeParameter('date', i) as string;
						}

						const mediaIds = splitIds(mediaIdsRaw);
						if (mediaIds.length) {
							body.mediaIds = mediaIds;
						}

						let settings: IDataObject = {};
						if (settingsJson && String(settingsJson).trim()) {
							let parsed: unknown;
							try {
								parsed = JSON.parse(String(settingsJson));
							} catch {
								throw new NodeOperationError(this.getNode(), 'Settings (JSON): invalid JSON', {
									itemIndex: i,
								});
							}
							if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
								throw new NodeOperationError(
									this.getNode(),
									'Settings (JSON): must be a JSON object',
									{ itemIndex: i },
								);
							}
							settings = parsed as IDataObject;
						}
						if (Object.keys(settings).length) {
							body.settings = settings;
						}

						responseData = await socioiApiRequest.call(this, 'POST', '/posts', body);
					} else if (operation === 'get') {
						const postId = this.getNodeParameter('postId', i) as string;
						responseData = await socioiApiRequest.call(this, 'GET', `/posts/${postId}`);
					} else if (operation === 'getAll') {
						const status = this.getNodeParameter('status', i, '') as string;
						const query: IDataObject = {};
						if (status) {
							query.status = status;
						}
						responseData = await socioiApiRequest.call(this, 'GET', '/posts', {}, query);
					} else if (operation === 'delete') {
						const postId = this.getNodeParameter('postId', i) as string;
						responseData = await socioiApiRequest.call(this, 'DELETE', `/posts/${postId}`);
					} else if (operation === 'schedule') {
						const postId = this.getNodeParameter('postId', i) as string;
						const scheduledAt = this.getNodeParameter('scheduledAt', i) as string;
						responseData = await socioiApiRequest.call(this, 'POST', `/posts/${postId}/schedule`, {
							scheduledAt,
						});
					}
				}

				if (resource === 'media') {
					if (operation === 'getAll') {
						responseData = await socioiApiRequest.call(this, 'GET', '/media');
					} else if (operation === 'uploadFromUrl') {
						const url = this.getNodeParameter('mediaUrl', i) as string;
						responseData = await socioiApiRequest.call(this, 'POST', '/media/upload-from-url', {
							url,
						});
					} else if (operation === 'delete') {
						const mediaId = this.getNodeParameter('mediaId', i) as string;
						responseData = await socioiApiRequest.call(this, 'DELETE', `/media/${mediaId}`);
					}
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData as IDataObject | IDataObject[]),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const executionErrorData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({
							error: (error as Error)?.message || error,
						}),
						{ itemData: { item: i } },
					);
					returnData.push(...executionErrorData);
					continue;
				}
				throw new NodeApiError(this.getNode(), error as JsonObject);
			}
		}

		return [returnData];
	}
}

function splitIds(raw: string): string[] {
	return raw
		.split(/[,\s]+/)
		.map((id) => id.trim())
		.filter(Boolean);
}
