interface GitHubRepo {
  name: string;
  nameWithOwner: string;
  description?: string;
  url: string;
  homepageUrl?: string;
  stargazerCount: number;
  forkCount: number;
  issues: {
    totalCount: number;
  };
  updatedAt: string;
  createdAt: string;
  primaryLanguage?: {
    name: string;
  };
  licenseInfo?: {
    name: string;
  };
  repositoryTopics: {
    nodes: Array<{
      topic: {
        name: string;
      };
    }>;
  };
  owner: {
    login: string;
  };
  readme?: string;
}

interface GitHubSearchResult {
  search: {
    nodes: GitHubRepo[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string;
    };
  };
}

class GitHubAPIClient {
  private baseURL = 'https://api.github.com/graphql';
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async makeRequest<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    return data.data;
  }

  async searchMcpRepositories(
    query: string,
    first: number = 50,
    after?: string
  ): Promise<GitHubSearchResult> {
    const searchQuery = `
      query SearchMcpRepos($query: String!, $first: Int!, $after: String) {
        search(query: $query, type: REPOSITORY, first: $first, after: $after) {
          nodes {
            ... on Repository {
              name
              nameWithOwner
              description
              url
              homepageUrl
              stargazerCount
              forkCount
              issues(states: OPEN) {
                totalCount
              }
              updatedAt
              createdAt
              primaryLanguage {
                name
              }
              licenseInfo {
                name
              }
              repositoryTopics(first: 20) {
                nodes {
                  topic {
                    name
                  }
                }
              }
              owner {
                login
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;

    return this.makeRequest<GitHubSearchResult>(searchQuery, {
      query,
      first,
      after,
    });
  }

  async getRepositoryReadme(owner: string, name: string): Promise<string | null> {
    const query = `
      query GetReadme($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          readme: object(expression: "HEAD:README.md") {
            ... on Blob {
              text
            }
          }
        }
      }
    `;

    try {
      const data = await this.makeRequest<{
        repository: {
          readme?: { text: string };
        };
      }>(query, { owner, name });

      return data.repository.readme?.text || null;
    } catch (error) {
      console.warn(`Failed to fetch README for ${owner}/${name}:`, error);
      return null;
    }
  }

  // 构建不同的搜索查询
  static buildMcpSearchQueries(): string[] {
    const baseQueries = [
      'mcp-server in:name,description',
      '"model context protocol" in:name,description,readme',
      'mcp server in:name,description',
      'anthropic mcp in:name,description',
      'topic:mcp',
      'topic:model-context-protocol',
    ];

    // 添加时间和质量过滤器
    const timeFilter = 'created:>2024-01-01';
    const qualityFilter = 'stars:>5';
    
    return baseQueries.map(query => 
      `${query} ${timeFilter} ${qualityFilter} sort:updated-desc`
    );
  }
}

export { GitHubAPIClient, type GitHubRepo, type GitHubSearchResult };