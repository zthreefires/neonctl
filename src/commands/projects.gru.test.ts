import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Api, Project, Branch } from '@neondatabase/api-client';
import * as projects from './projects.js';
import { writer } from '../writer.js';
import yargs from 'yargs';
import { AxiosHeaders } from 'axios';

vi.mock('../writer.js');
vi.mock('../log.js');
vi.mock('../utils/psql.js');
vi.mock('../context.js');

describe('projects commands', () => {
  const mockApiClient = {
    listProjects: vi.fn(),
    listSharedProjects: vi.fn(),
    createProject: vi.fn(),
    deleteProject: vi.fn(),
    updateProject: vi.fn(),
    getProject: vi.fn(),
  } as unknown as Api<unknown>;

  const mockWriter = {
    write: vi.fn().mockReturnThis(),
    text: vi.fn().mockReturnThis(),
    end: vi.fn(),
  };

  beforeEach(() => {
    vi.mocked(writer).mockReturnValue(mockWriter);
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('should list owned projects', async () => {
      const mockProjects = [
        {
          id: '1',
          name: 'test',
          platform_id: 'aws',
          region_id: 'us-east-1',
          provisioner: 'k8s-pod',
          pg_version: 14,
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
          proxy_host: 'proxy.host',
          branch_logical_size_limit: 0,
          branch_logical_size_limit_bytes: 0,
          store_passwords: true,
          owner_id: 'owner1',
          active_time: 0,
          active_time_seconds: 0,
          cpu_used_sec: 0,
          creation_source: 'console',
          data_storage_bytes_hour: 0,
          data_transfer_bytes: 0,
          written_data_bytes: 0,
          compute_time_seconds: 0,
          history_retention_seconds: 86400,
          consumption_period_start: '2023-01-01',
          consumption_period_end: '2023-01-02',
          default_endpoint_settings: {
            autoscaling_limit_min_cu: 0.25,
            autoscaling_limit_max_cu: 0.25,
          },
        },
      ];

      vi.mocked(mockApiClient.listProjects).mockResolvedValueOnce({
        data: {
          projects: mockProjects,
          pagination: undefined,
        },
        status: 200,
        statusText: 'OK',
        headers: new AxiosHeaders(),
        config: { headers: new AxiosHeaders() },
      } as any);

      vi.mocked(mockApiClient.listSharedProjects).mockResolvedValueOnce({
        data: {
          projects: [],
          pagination: undefined,
        },
        status: 200,
        statusText: 'OK',
        headers: new AxiosHeaders(),
        config: { headers: new AxiosHeaders() },
      } as any);

      await projects
        .builder(
          yargs().middleware((args) => {
            args.apiClient = mockApiClient;
          }),
        )
        .parse('list');

      expect(mockApiClient.listProjects).toHaveBeenCalledWith({
        limit: projects.PROJECTS_LIST_LIMIT,
        org_id: undefined,
        cursor: undefined,
      });
      expect(mockWriter.write).toHaveBeenCalledWith(
        mockProjects,
        expect.any(Object),
      );
    });
  });

  describe('create', () => {
    it('should create project with basic options', async () => {
      const branch: Branch = {
        id: 'branch-1',
        project_id: '1',
        name: 'main',
        current_state: 'ready',
        logical_size: 0,
        creation_source: 'console',
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
        primary: true,
        default: true,
        protected: false,
        cpu_used_sec: 0,
        compute_time_seconds: 0,
        written_data_bytes: 0,
        data_transfer_bytes: 0,
        active_time_seconds: 0,
        state_changed_at: '2023-01-01',
      };

      const projectData = {
        project: {
          id: '1',
          name: 'test-project',
          platform_id: 'aws',
          region_id: 'us-east-1',
          provisioner: 'k8s-pod',
          pg_version: 14,
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
          proxy_host: 'proxy.host',
          branch_logical_size_limit: 0,
          branch_logical_size_limit_bytes: 0,
          store_passwords: true,
          owner_id: 'owner1',
          active_time: 0,
          active_time_seconds: 0,
          cpu_used_sec: 0,
          creation_source: 'console',
          data_storage_bytes_hour: 0,
          data_transfer_bytes: 0,
          written_data_bytes: 0,
          compute_time_seconds: 0,
          history_retention_seconds: 86400,
          consumption_period_start: '2023-01-01',
          consumption_period_end: '2023-01-02',
          default_endpoint_settings: {
            autoscaling_limit_min_cu: 0.25,
            autoscaling_limit_max_cu: 0.25,
          },
        } as Project,
        connection_uris: [
          {
            connection_uri: 'postgres://...',
            connection_parameters: {
              database: 'neondb',
              host: 'host',
              password: 'pass',
              port: 5432,
              user: 'user',
              role: 'role',
              pooler_host: 'pooler.host',
            },
          },
        ],
        roles: [],
        databases: [],
        operations: [],
        branch: branch,
        endpoints: [],
      };

      vi.mocked(mockApiClient.createProject).mockResolvedValueOnce({
        data: projectData,
        status: 200,
        statusText: 'OK',
        headers: new AxiosHeaders(),
        config: { headers: new AxiosHeaders() },
      } as any);

      await projects
        .builder(
          yargs().middleware((args) => {
            args.apiClient = mockApiClient;
          }),
        )
        .parse('create --name test-project');

      expect(mockApiClient.createProject).toHaveBeenCalledWith({
        project: { name: 'test-project', branch: {} },
      });
    });
  });

  describe('update', () => {
    it('should update project settings', async () => {
      const projectData = {
        project: {
          id: '1',
          name: 'updated-project',
          platform_id: 'aws',
          region_id: 'us-east-1',
          provisioner: 'k8s-pod',
          pg_version: 14,
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
          proxy_host: 'proxy.host',
          branch_logical_size_limit: 0,
          branch_logical_size_limit_bytes: 0,
          store_passwords: true,
          owner_id: 'owner1',
          active_time: 0,
          active_time_seconds: 0,
          cpu_used_sec: 0,
          creation_source: 'console',
          data_storage_bytes_hour: 0,
          data_transfer_bytes: 0,
          written_data_bytes: 0,
          compute_time_seconds: 0,
          history_retention_seconds: 86400,
          consumption_period_start: '2023-01-01',
          consumption_period_end: '2023-01-02',
          default_endpoint_settings: {
            autoscaling_limit_min_cu: 0.25,
            autoscaling_limit_max_cu: 0.25,
          },
        } as Project,
        operations: [],
      };

      vi.mocked(mockApiClient.updateProject).mockResolvedValueOnce({
        data: projectData,
        status: 200,
        statusText: 'OK',
        headers: new AxiosHeaders(),
        config: { headers: new AxiosHeaders() },
      } as any);

      await projects
        .builder(
          yargs().middleware((args) => {
            args.apiClient = mockApiClient;
          }),
        )
        .parse(
          'update proj-1 --name updated-project --block-vpc-connections --block-public-connections=false',
        );

      expect(mockApiClient.updateProject).toHaveBeenCalledWith('proj-1', {
        project: {
          name: 'updated-project',
          settings: {
            block_vpc_connections: true,
            block_public_connections: false,
          },
        },
      });
    });
  });

  describe('delete', () => {
    it('should delete project', async () => {
      const projectData = {
        project: {
          id: '1',
          name: 'test-project',
          platform_id: 'aws',
          region_id: 'us-east-1',
          provisioner: 'k8s-pod',
          pg_version: 14,
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
          proxy_host: 'proxy.host',
          branch_logical_size_limit: 0,
          branch_logical_size_limit_bytes: 0,
          store_passwords: true,
          owner_id: 'owner1',
          active_time: 0,
          active_time_seconds: 0,
          cpu_used_sec: 0,
          creation_source: 'console',
          data_storage_bytes_hour: 0,
          data_transfer_bytes: 0,
          written_data_bytes: 0,
          compute_time_seconds: 0,
          history_retention_seconds: 86400,
          consumption_period_start: '2023-01-01',
          consumption_period_end: '2023-01-02',
          default_endpoint_settings: {
            autoscaling_limit_min_cu: 0.25,
            autoscaling_limit_max_cu: 0.25,
          },
        } as Project,
      };

      vi.mocked(mockApiClient.deleteProject).mockResolvedValueOnce({
        data: projectData,
        status: 200,
        statusText: 'OK',
        headers: new AxiosHeaders(),
        config: { headers: new AxiosHeaders() },
      } as any);

      await projects
        .builder(
          yargs().middleware((args) => {
            args.apiClient = mockApiClient;
          }),
        )
        .parse('delete proj-1');

      expect(mockApiClient.deleteProject).toHaveBeenCalledWith('proj-1');
      expect(mockWriter.end).toHaveBeenCalledWith(
        projectData.project,
        expect.any(Object),
      );
    });
  });

  describe('get', () => {
    it('should get project details', async () => {
      const projectData = {
        project: {
          id: '1',
          name: 'test-project',
          platform_id: 'aws',
          region_id: 'us-east-1',
          provisioner: 'k8s-pod',
          pg_version: 14,
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
          proxy_host: 'proxy.host',
          branch_logical_size_limit: 0,
          branch_logical_size_limit_bytes: 0,
          store_passwords: true,
          owner_id: 'owner1',
          active_time: 0,
          active_time_seconds: 0,
          cpu_used_sec: 0,
          creation_source: 'console',
          data_storage_bytes_hour: 0,
          data_transfer_bytes: 0,
          written_data_bytes: 0,
          compute_time_seconds: 0,
          history_retention_seconds: 86400,
          consumption_period_start: '2023-01-01',
          consumption_period_end: '2023-01-02',
          default_endpoint_settings: {
            autoscaling_limit_min_cu: 0.25,
            autoscaling_limit_max_cu: 0.25,
          },
        } as Project,
      };

      vi.mocked(mockApiClient.getProject).mockResolvedValueOnce({
        data: projectData,
        status: 200,
        statusText: 'OK',
        headers: new AxiosHeaders(),
        config: { headers: new AxiosHeaders() },
      } as any);

      await projects
        .builder(
          yargs().middleware((args) => {
            args.apiClient = mockApiClient;
          }),
        )
        .parse('get proj-1');

      expect(mockApiClient.getProject).toHaveBeenCalledWith('proj-1');
      expect(mockWriter.end).toHaveBeenCalledWith(
        projectData.project,
        expect.any(Object),
      );
    });
  });
});
