import {
  ProjectCreateRequest,
  ProjectListItem,
  ProjectUpdateRequest,
} from '@neondatabase/api-client';
import yargs from 'yargs';

import { log } from '../log.js';
import {
  projectCreateRequest,
  projectUpdateRequest,
} from '../parameters.gen.js';
import { CommonProps, IdOrNameProps } from '../types.js';
import { writer } from '../writer.js';
import { psql } from '../utils/psql.js';
import { updateContextFile } from '../context.js';
import { getComputeUnits } from '../utils/compute_units.js';

export const PROJECT_FIELDS = [
  'id',
  'name',
  'region_id',
  'created_at',
] as const;

export const REGIONS = [
  'aws-us-west-2',
  'aws-ap-southeast-1',
  'aws-ap-southeast-2',
  'aws-eu-central-1',
  'aws-us-east-2',
  'aws-us-east-1',
  'azure-eastus2',
];

const PROJECTS_LIST_LIMIT = 100;

export const command = 'projects';
export const describe = 'Manage projects';
export const aliases = ['project'];
export const builder = (argv: yargs.Argv) => {
  return argv
    .usage('$0 projects <sub-command> [options]')
    .middleware((args: any) => {
      // Provide alias for analytics
      args.projectId = args.id;
    })
    .command(
      'list',
      'List projects',
      (yargs) =>
        yargs.options({
          'org-id': {
            describe: 'List projects of a given organization',
            type: 'string',
          },
        }),
      async (args) => {
        await list(args as any);
      },
    )
    .command(
      'create',
      'Create a project',
      (yargs) =>
        yargs.options({
          name: {
            describe: projectCreateRequest['project.name'].description,
            type: 'string',
          },
          'region-id': {
            describe: `The region ID. Possible values: ${REGIONS.join(', ')}`,
            type: 'string',
          },
          'org-id': {
            describe: "The project's organization ID",
            type: 'string',
          },
          psql: {
            type: 'boolean',
            describe: 'Connect to a new project via psql',
            default: false,
          },
          database: {
            describe:
              projectCreateRequest['project.branch.database_name'].description,
            type: 'string',
          },
          role: {
            describe:
              projectCreateRequest['project.branch.role_name'].description,
            type: 'string',
          },
          'set-context': {
            type: 'boolean',
            describe: 'Set the current context to the new project',
            default: false,
          },
          cu: {
            describe:
              'The number of Compute Units. Could be a fixed size (e.g. "2") or a range delimited by a dash (e.g. "0.5-3").',
            type: 'string',
          },
        }),
      async (args) => {
        await create(args as any);
      },
    )
    .command(
      'update <id>',
      'Update a project',
      (yargs) =>
        yargs.options({
          'block-vpc-connections': {
            describe:
              projectUpdateRequest['project.settings.block_vpc_connections']
                .description +
              ' Use --block-vpc-connections=false to set the value to false.',
            type: 'boolean',
          },
          'block-public-connections': {
            describe:
              projectUpdateRequest['project.settings.block_public_connections']
                .description +
              ' Use --block-public-connections=false to set the value to false.',
            type: 'boolean',
          },
          cu: {
            describe:
              'The number of Compute Units. Could be a fixed size (e.g. "2") or a range delimited by a dash (e.g. "0.5-3").',
            type: 'string',
          },
          name: {
            describe: projectUpdateRequest['project.name'].description,
            type: 'string',
          },
        }),
      async (args) => {
        await update(args as any);
      },
    )
    .command(
      'delete <id>',
      'Delete a project',
      (yargs) => yargs,
      async (args) => {
        await deleteProject(args as any);
      },
    )
    .command(
      'get <id>',
      'Get a project',
      (yargs) => yargs,
      async (args) => {
        await get(args as any);
      },
    );
};
export const handler = (args: yargs.Argv) => {
  return args;
};

const list = async (props: CommonProps & { orgId?: string }) => {
  const getList = async (
    fn:
      | typeof props.apiClient.listProjects
      | typeof props.apiClient.listSharedProjects,
  ) => {
    const result: ProjectListItem[] = [];
    let cursor: string | undefined;
    let end = false;
    while (!end) {
      const { data } = await fn({
        limit: PROJECTS_LIST_LIMIT,
        org_id: props.orgId,
        cursor,
      });
      result.push(...data.projects);
      cursor = data.pagination?.cursor;
      log.debug(
        'Got %d projects, with cursor: %s',
        data.projects.length,
        cursor,
      );
      if (data.projects.length < PROJECTS_LIST_LIMIT) {
        end = true;
      }
    }

    return result;
  };

  const ownedProjects = await getList(props.apiClient.listProjects);
  const sharedProjects = props.orgId
    ? []
    : await getList(props.apiClient.listSharedProjects);

  const out = writer(props);

  out.write(ownedProjects, {
    fields: PROJECT_FIELDS,
    title: 'Projects',
    emptyMessage:
      "You don't have any projects yet. See how to create a new project:\n> neonctl projects create --help",
  });

  if (!props.orgId) {
    out.write(sharedProjects, {
      fields: PROJECT_FIELDS,
      title: 'Shared with you',
      emptyMessage: 'No projects have been shared with you',
    });
  }

  out.end();
};

const create = async (
  props: CommonProps & {
    name?: string;
    regionId?: string;
    cu?: string;
    orgId?: string;
    database?: string;
    role?: string;
    psql: boolean;
    setContext: boolean;
    '--'?: string[];
  },
) => {
  const project: ProjectCreateRequest['project'] = {};
  if (props.name) {
    project.name = props.name;
  }
  if (props.regionId) {
    project.region_id = props.regionId;
  }
  if (props.orgId) {
    project.org_id = props.orgId;
  }
  project.branch = {};
  if (props.database) {
    project.branch.database_name = props.database;
  }
  if (props.role) {
    project.branch.role_name = props.role;
  }
  if (props.cu) {
    project.default_endpoint_settings = props.cu
      ? getComputeUnits(props.cu)
      : undefined;
  }
  const { data } = await props.apiClient.createProject({
    project,
  });

  if (props.setContext) {
    updateContextFile(props.contextFile, {
      projectId: data.project.id,
    });
  }

  const out = writer(props);
  out.write(data.project, { fields: PROJECT_FIELDS, title: 'Project' });
  out.write(data.connection_uris, {
    fields: ['connection_uri'],
    title: 'Connection URIs',
  });
  out.end();

  if (props.psql) {
    const connection_uri = data.connection_uris[0].connection_uri;
    const psqlArgs = props['--'];
    await psql(connection_uri, psqlArgs);
  }
};

const deleteProject = async (props: CommonProps & IdOrNameProps) => {
  const { data } = await props.apiClient.deleteProject(props.id);
  writer(props).end(data.project, {
    fields: PROJECT_FIELDS,
  });
};

const update = async (
  props: CommonProps &
    IdOrNameProps & {
      name?: string;
      cu?: string;
      blockVpcConnections?: boolean;
      blockPublicConnections?: boolean;
    },
) => {
  const project: ProjectUpdateRequest['project'] = {};
  if (props.blockPublicConnections !== undefined) {
    if (!project.settings) {
      project.settings = {};
    }
    project.settings.block_public_connections = props.blockPublicConnections;
  }
  if (props.blockVpcConnections !== undefined) {
    if (!project.settings) {
      project.settings = {};
    }
    project.settings.block_vpc_connections = props.blockVpcConnections;
  }
  if (props.name) {
    project.name = props.name;
  }
  if (props.cu) {
    project.default_endpoint_settings = props.cu
      ? getComputeUnits(props.cu)
      : undefined;
  }

  const { data } = await props.apiClient.updateProject(props.id, {
    project,
  });

  writer(props).end(data.project, { fields: PROJECT_FIELDS });
};

const get = async (props: CommonProps & IdOrNameProps) => {
  const { data } = await props.apiClient.getProject(props.id);
  writer(props).end(data.project, { fields: PROJECT_FIELDS });
};
