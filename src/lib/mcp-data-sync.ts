import { PrismaClient, McpCategory, McpStatus } from '@prisma/client';
import { GitHubAPIClient, GitHubRepo } from './github-api';

const prisma = new PrismaClient();

interface McpAppData {
  name: string;
  fullName: string;
  description?: string;
  category: McpCategory;
  githubUrl: string;
  homepage?: string;
  author: string;
  stars: number;
  forks: number;
  issues: number;
  lastUpdated: Date;
  createdAt: Date;
  language?: string;
  license?: string;
  topics: string[];
  readme?: string;
  isOfficial: boolean;
  popularityScore: number;
  status: McpStatus;
}

class McpDataSync {
  private githubClient: GitHubAPIClient;

  constructor(githubToken: string) {
    this.githubClient = new GitHubAPIClient(githubToken);
  }

  // 从GitHub仓库数据转换为MCP应用数据
  private async convertToMcpApp(repo: GitHubRepo): Promise<McpAppData | null> {
    // 获取README内容
    const readme = await this.githubClient.getRepositoryReadme(
      repo.owner.login,
      repo.name
    );

    // 首先检查是否真正与MCP相关
    if (!this.isMcpRelated(repo, readme)) {
      console.log(`⚠️ Skipping non-MCP repository: ${repo.nameWithOwner}`);
      return null;
    }

    // 自动分类逻辑
    const category = this.categorizeRepository(repo, readme);
    
    // 计算热度分数
    const popularityScore = this.calculatePopularityScore(repo);
    
    // 检查是否为官方项目
    const isOfficial = this.isOfficialRepository(repo);

    return {
      name: repo.name,
      fullName: repo.nameWithOwner,
      description: repo.description || undefined,
      category,
      githubUrl: repo.url,
      homepage: repo.homepageUrl || undefined,
      author: repo.owner.login,
      stars: repo.stargazerCount,
      forks: repo.forkCount,
      issues: repo.issues.totalCount,
      lastUpdated: new Date(repo.updatedAt),
      createdAt: new Date(repo.createdAt),
      language: repo.primaryLanguage?.name || undefined,
      license: repo.licenseInfo?.name || undefined,
      topics: repo.repositoryTopics.nodes.map(node => node.topic.name),
      readme: readme || undefined,
      isOfficial,
      popularityScore,
      status: McpStatus.ACTIVE,
    };
  }

  // 自动分类逻辑
  private categorizeRepository(repo: GitHubRepo, readme?: string | null): McpCategory {
    const text = `${repo.name} ${repo.description || ''} ${readme || ''}`.toLowerCase();
    const topics = repo.repositoryTopics.nodes.map(node => node.topic.name.toLowerCase());

    // 基于关键词的分类规则
    const categoryRules: [McpCategory, string[]][] = [
      [McpCategory.DEVELOPMENT, ['github', 'git', 'vscode', 'ide', 'development', 'coding', 'programming']],
      [McpCategory.CLOUD_SERVICES, ['aws', 'azure', 'gcp', 'cloud', 'docker', 'kubernetes']],
      [McpCategory.DATABASE, ['postgres', 'mysql', 'mongodb', 'database', 'sql', 'redis']],
      [McpCategory.AI_ML, ['ai', 'ml', 'machine-learning', 'openai', 'claude', 'llm', 'gpt']],
      [McpCategory.WEB_SCRAPING, ['scraping', 'scraper', 'crawler', 'puppeteer', 'selenium']],
      [McpCategory.AUTOMATION, ['automation', 'workflow', 'ci', 'cd', 'deployment']],
      [McpCategory.SECURITY, ['security', 'auth', 'oauth', 'jwt', 'encryption', 'ssl']],
      [McpCategory.COMMUNICATION, ['slack', 'discord', 'telegram', 'email', 'notification']],
      [McpCategory.FINANCE, ['finance', 'crypto', 'blockchain', 'trading', 'payment']],
      [McpCategory.TESTING, ['test', 'testing', 'playwright', 'selenium', 'cypress']],
      [McpCategory.DATA_ANALYSIS, ['analytics', 'data', 'chart', 'visualization', 'metrics']],
      [McpCategory.PRODUCTIVITY, ['productivity', 'calendar', 'todo', 'note', 'document']],
      [McpCategory.CREATIVE, ['image', 'video', 'audio', 'design', 'creative', 'media']],
      [McpCategory.ENTERPRISE, ['enterprise', 'business', 'crm', 'erp', 'corporate']],
    ];

    // 检查每个分类规则
    for (const [category, keywords] of categoryRules) {
      const hasKeyword = keywords.some(keyword => 
        text.includes(keyword) || topics.includes(keyword)
      );
      if (hasKeyword) {
        return category;
      }
    }

    return McpCategory.OTHER;
  }

  // 计算热度分数
  private calculatePopularityScore(repo: GitHubRepo): number {
    const stars = repo.stargazerCount;
    const forks = repo.forkCount;
    const daysSinceUpdate = Math.max(1, 
      (Date.now() - new Date(repo.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // 热度计算公式：stars权重40%，forks权重20%，更新频率权重40%
    const freshnessFactor = Math.max(0.1, 1 / Math.log10(daysSinceUpdate + 1));
    return (stars * 0.4) + (forks * 0.2) + (freshnessFactor * 100 * 0.4);
  }

  // 检查仓库是否真正与MCP相关
  private isMcpRelated(repo: GitHubRepo, readme?: string | null): boolean {
    const text = `${repo.name} ${repo.description || ''} ${readme || ''}`.toLowerCase();
    const topics = repo.repositoryTopics.nodes.map(node => node.topic.name.toLowerCase());
    
    // 必须包含的MCP关键词
    const mcpKeywords = [
      'mcp',
      'model context protocol',
      'mcp-server',
      'mcp server',
      'mcp-client',
      'mcp client',
      'anthropic mcp',
    ];
    
    // 检查是否包含MCP相关关键词
    const hasMcpKeyword = mcpKeywords.some(keyword => 
      text.includes(keyword) || topics.includes(keyword.replace(/\s/g, '-'))
    );
    
    // 检查是否来自官方MCP组织
    const isOfficialMcp = [
      'modelcontextprotocol',
      'anthropics',
      'anthropic-ai'
    ].includes(repo.owner.login.toLowerCase());
    
    // 排除明显非MCP的项目
    const excludeKeywords = [
      'not mcp', 'non-mcp', 'fake mcp',
      'cryptocurrency', 'bitcoin', 'blockchain', 'crypto',
      'ecommerce', 'e-commerce', 'shopping',
      'game', 'gaming', 'minecraft',
      'music', 'audio', 'video',
      'mobile app', 'android', 'ios',
      'wordpress', 'cms', 'blog'
    ];
    
    const hasExcludeKeyword = excludeKeywords.some(keyword => 
      text.includes(keyword)
    );
    
    return (hasMcpKeyword || isOfficialMcp) && !hasExcludeKeyword;
  }

  // 检查是否为官方项目
  private isOfficialRepository(repo: GitHubRepo): boolean {
    const officialOwners = [
      'modelcontextprotocol',
      'anthropics',
      'anthropic-ai'
    ];
    
    return officialOwners.includes(repo.owner.login.toLowerCase());
  }

  // 同步单个查询的结果
  private async syncSearchQuery(query: string): Promise<number> {
    let totalSynced = 0;
    let hasNextPage = true;
    let after: string | undefined;

    console.log(`Starting sync for query: ${query}`);

    while (hasNextPage) {
      try {
        const result = await this.githubClient.searchMcpRepositories(query, 50, after);
        
        for (const repo of result.search.nodes) {
          try {
            const mcpApp = await this.convertToMcpApp(repo);
            
            // 如果返回null，说明这个仓库不是真正的MCP项目，跳过
            if (!mcpApp) {
              continue;
            }
            
            // 使用upsert避免重复
            await prisma.mcpApp.upsert({
              where: { githubUrl: mcpApp.githubUrl },
              update: {
                name: mcpApp.name,
                description: mcpApp.description,
                category: mcpApp.category,
                homepage: mcpApp.homepage,
                stars: mcpApp.stars,
                forks: mcpApp.forks,
                issues: mcpApp.issues,
                lastUpdated: mcpApp.lastUpdated,
                language: mcpApp.language,
                license: mcpApp.license,
                topics: mcpApp.topics,
                readme: mcpApp.readme,
                isOfficial: mcpApp.isOfficial,
                popularityScore: mcpApp.popularityScore,
                status: mcpApp.status,
                syncedAt: new Date(),
              },
              create: mcpApp,
            });
            
            totalSynced++;
            console.log(`✓ Synced: ${mcpApp.fullName} (${mcpApp.stars} stars)`);
          } catch (error) {
            console.error(`Failed to sync ${repo.nameWithOwner}:`, error);
          }
        }

        hasNextPage = result.search.pageInfo.hasNextPage;
        after = result.search.pageInfo.endCursor;
        
        // 避免API速率限制
        if (hasNextPage) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Error in search query "${query}":`, error);
        break;
      }
    }

    console.log(`Completed sync for query: ${query}, synced: ${totalSynced} repositories`);
    return totalSynced;
  }

  // 执行完整的MCP数据同步
  async syncAll(): Promise<{ totalSynced: number; queries: number }> {
    console.log('Starting MCP data synchronization...');
    
    const queries = GitHubAPIClient.buildMcpSearchQueries();
    let totalSynced = 0;

    for (const query of queries) {
      const synced = await this.syncSearchQuery(query);
      totalSynced += synced;
    }

    console.log(`MCP sync completed. Total repositories synced: ${totalSynced}`);
    
    return {
      totalSynced,
      queries: queries.length
    };
  }

  // 获取同步统计信息
  async getSyncStats() {
    const total = await prisma.mcpApp.count();
    const byCategory = await prisma.mcpApp.groupBy({
      by: ['category'],
      _count: { category: true },
      orderBy: { _count: { category: 'desc' } }
    });
    
    const topApps = await prisma.mcpApp.findMany({
      take: 10,
      orderBy: { popularityScore: 'desc' },
      select: {
        name: true,
        fullName: true,
        stars: true,
        popularityScore: true,
        category: true,
      }
    });

    return {
      total,
      byCategory,
      topApps,
      lastSync: await prisma.mcpApp.findFirst({
        orderBy: { syncedAt: 'desc' },
        select: { syncedAt: true }
      })
    };
  }
}

export { McpDataSync };