import { PrismaClient, AIAgentCategory, PricingType } from '@prisma/client';
import { GitHubAPIClient, GitHubRepo } from './github-api';

const prisma = new PrismaClient();

interface AIAgentData {
  name: string;
  description?: string;
  category: AIAgentCategory;
  website?: string;
  creator: string;
  users: number;
  rating: number;
  featured: boolean;
  capabilities: string[];
  tags: string[];
  verified: boolean;
  pricing: PricingType;
  popularityScore: number;
  lastUpdated: Date;
  syncedAt: Date;
}

class AIAgentDataSync {
  private githubClient: GitHubAPIClient;

  constructor(githubToken: string) {
    this.githubClient = new GitHubAPIClient(githubToken);
  }

  // 从GitHub仓库数据转换为AI Agent数据
  private async convertToAIAgent(repo: GitHubRepo): Promise<AIAgentData | null> {
    // 获取README内容
    const readme = await this.githubClient.getRepositoryReadme(
      repo.owner.login,
      repo.name
    );

    // 首先检查是否真正与AI Agent相关
    if (!this.isAIAgentRelated(repo, readme)) {
      console.log(`⚠️ Skipping non-AI-agent repository: ${repo.nameWithOwner}`);
      return null;
    }

    // 自动分类逻辑
    const category = this.categorizeRepository(repo, readme);
    
    // 计算热度分数
    const popularityScore = this.calculatePopularityScore(repo);
    
    // 检查是否为官方项目
    const verified = this.isOfficialRepository(repo);

    // 估算用户数 (基于stars的简单估算)
    const users = Math.floor(repo.stargazerCount * 10 + repo.forkCount * 5);

    // 基于热度计算评分
    const rating = Math.min(5.0, Math.max(1.0, popularityScore / 20));

    // 提取标签
    const tags = this.extractTags(repo, readme);

    // 提取功能
    const capabilities = this.extractCapabilities(repo, readme);

    // 判断是否为特色项目
    const featured = repo.stargazerCount > 1000 || verified;

    // 推断定价模式
    const pricing = this.inferPricing(repo, readme);

    return {
      name: repo.name.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: repo.description || undefined,
      category,
      website: repo.homepageUrl || repo.url,
      creator: repo.owner.login,
      users,
      rating,
      featured,
      capabilities,
      tags,
      verified,
      pricing,
      popularityScore,
      lastUpdated: new Date(repo.updatedAt),
      syncedAt: new Date(),
    };
  }

  // 自动分类逻辑
  private categorizeRepository(repo: GitHubRepo, readme?: string | null): AIAgentCategory {
    const text = `${repo.name} ${repo.description || ''} ${readme || ''}`.toLowerCase();
    const topics = repo.repositoryTopics.nodes.map(node => node.topic.name.toLowerCase());

    // 基于关键词的分类规则
    const categoryRules: [AIAgentCategory, string[]][] = [
      [AIAgentCategory.CODING, ['code', 'programming', 'github', 'copilot', 'ide', 'vscode', 'development', 'coding']],
      [AIAgentCategory.CONTENT, ['content', 'writing', 'blog', 'article', 'text', 'copywriting', 'marketing']],
      [AIAgentCategory.CREATIVE, ['image', 'art', 'design', 'creative', 'generate', 'midjourney', 'stable-diffusion']],
      [AIAgentCategory.RESEARCH, ['research', 'search', 'analysis', 'perplexity', 'web-search', 'knowledge']],
      [AIAgentCategory.CUSTOMER_SERVICE, ['customer', 'service', 'support', 'chatbot', 'helpdesk', 'chat']],
      [AIAgentCategory.AUTOMATION, ['automation', 'workflow', 'zapier', 'n8n', 'process', 'task']],
      [AIAgentCategory.ANALYTICS, ['analytics', 'data', 'metrics', 'dashboard', 'chart', 'visualization']],
      [AIAgentCategory.COMMUNICATION, ['communication', 'slack', 'discord', 'telegram', 'email', 'notification']],
      [AIAgentCategory.EDUCATION, ['education', 'learning', 'tutor', 'teaching', 'course', 'training']],
      [AIAgentCategory.FINANCE, ['finance', 'trading', 'crypto', 'investment', 'banking', 'money']],
      [AIAgentCategory.HEALTHCARE, ['health', 'medical', 'healthcare', 'diagnosis', 'therapy', 'wellness']],
      [AIAgentCategory.ENTERTAINMENT, ['game', 'entertainment', 'fun', 'music', 'video', 'media']],
      [AIAgentCategory.MARKETING, ['marketing', 'seo', 'social', 'advertising', 'campaign', 'brand']],
      [AIAgentCategory.PRODUCTIVITY, ['productivity', 'calendar', 'todo', 'note', 'document', 'organization']],
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

    return AIAgentCategory.OTHER;
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

  // 检查仓库是否真正与AI Agent相关
  private isAIAgentRelated(repo: GitHubRepo, readme?: string | null): boolean {
    const text = `${repo.name} ${repo.description || ''} ${readme || ''}`.toLowerCase();
    const topics = repo.repositoryTopics.nodes.map(node => node.topic.name.toLowerCase());
    
    // AI Agent相关关键词
    const aiAgentKeywords = [
      'ai agent', 'ai-agent', 'autonomous agent', 'intelligent agent',
      'chatbot', 'chat bot', 'ai bot', 'ai assistant', 'virtual assistant',
      'llm agent', 'gpt agent', 'claude agent', 'openai agent',
      'conversational ai', 'dialogue system', 'ai automation',
      'langchain', 'autogen', 'crewai', 'multi-agent',
      'agent framework', 'agent platform', 'ai workflow'
    ];
    
    // 检查是否包含AI Agent相关关键词
    const hasAIAgentKeyword = aiAgentKeywords.some(keyword => 
      text.includes(keyword) || topics.includes(keyword.replace(/\s/g, '-'))
    );
    
    // 检查是否来自知名AI公司
    const isFromAICompany = [
      'openai', 'anthropic', 'microsoft', 'google', 'meta',
      'langchain-ai', 'hwchase17', 'crewai-ai'
    ].includes(repo.owner.login.toLowerCase());
    
    // 排除明显非AI Agent的项目
    const excludeKeywords = [
      'cryptocurrency', 'bitcoin', 'blockchain', 'crypto',
      'ecommerce', 'e-commerce', 'shopping', 'store',
      'game engine', 'gaming platform', '3d engine',
      'operating system', 'kernel', 'driver',
      'hardware', 'firmware', 'embedded'
    ];
    
    const hasExcludeKeyword = excludeKeywords.some(keyword => 
      text.includes(keyword)
    );
    
    // 必须有AI相关关键词才被认为是相关的
    const hasAIKeywords = [
      'ai', 'artificial intelligence', 'machine learning', 'ml',
      'deep learning', 'neural network', 'llm', 'gpt', 'bert',
      'transformer', 'nlp', 'natural language'
    ].some(keyword => text.includes(keyword) || topics.includes(keyword));
    
    return (hasAIAgentKeyword || isFromAICompany) && hasAIKeywords && !hasExcludeKeyword;
  }

  // 检查是否为官方项目
  private isOfficialRepository(repo: GitHubRepo): boolean {
    const officialOwners = [
      'openai', 'anthropic', 'microsoft', 'google', 'meta',
      'langchain-ai', 'hwchase17', 'crewai-ai', 'autogen-ai',
      'guidance-ai', 'semantic-kernel', 'llamaindex'
    ];
    
    return officialOwners.includes(repo.owner.login.toLowerCase()) ||
           repo.stargazerCount > 5000; // 高star数也视为验证项目
  }

  // 提取标签
  private extractTags(repo: GitHubRepo, readme?: string | null): string[] {
    const tags = new Set<string>();
    
    // 从topics提取
    repo.repositoryTopics.nodes.forEach(node => {
      tags.add(node.topic.name);
    });
    
    // 从描述和README提取关键词
    const text = `${repo.description || ''} ${readme || ''}`.toLowerCase();
    const keywords = [
      'python', 'javascript', 'typescript', 'react', 'node.js',
      'openai', 'gpt', 'claude', 'llama', 'mistral',
      'langchain', 'vector-db', 'embeddings', 'rag',
      'streamlit', 'gradio', 'huggingface', 'transformers'
    ];
    
    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        tags.add(keyword);
      }
    });
    
    return Array.from(tags).slice(0, 8); // 限制标签数量
  }

  // 提取功能
  private extractCapabilities(repo: GitHubRepo, readme?: string | null): string[] {
    const capabilities = new Set<string>();
    const text = `${repo.description || ''} ${readme || ''}`.toLowerCase();
    
    const capabilityKeywords = [
      ['对话交互', ['chat', 'conversation', 'dialogue', 'talk']],
      ['文本生成', ['generate text', 'text generation', 'writing', 'content creation']],
      ['代码生成', ['code generation', 'coding', 'programming', 'code completion']],
      ['图像生成', ['image generation', 'image creation', 'art generation', 'visual']],
      ['数据分析', ['data analysis', 'analytics', 'insights', 'statistics']],
      ['网络搜索', ['web search', 'search', 'web scraping', 'information retrieval']],
      ['任务自动化', ['automation', 'workflow', 'task scheduling', 'process']],
      ['多模态', ['multimodal', 'vision', 'audio', 'speech', 'voice']],
      ['知识问答', ['question answering', 'q&a', 'knowledge', 'information']],
      ['情感分析', ['sentiment analysis', 'emotion', 'mood', 'feeling']]
    ];
    
    capabilityKeywords.forEach(([capability, keywords]) => {
      if ((keywords as string[]).some(keyword => text.includes(keyword))) {
        capabilities.add(capability as string);
      }
    });
    
    return Array.from(capabilities).slice(0, 6);
  }

  // 推断定价模式
  private inferPricing(repo: GitHubRepo, readme?: string | null): PricingType {
    const text = `${repo.description || ''} ${readme || ''}`.toLowerCase();
    
    if (text.includes('free') || text.includes('open source') || text.includes('mit license')) {
      return PricingType.FREE;
    }
    
    if (text.includes('freemium') || text.includes('free trial') || text.includes('subscription')) {
      return PricingType.FREEMIUM;
    }
    
    if (text.includes('paid') || text.includes('premium') || text.includes('enterprise')) {
      return PricingType.PAID;
    }
    
    // 默认开源项目为免费
    return PricingType.FREE;
  }

  // 构建AI Agent搜索查询
  static buildAIAgentSearchQueries(): string[] {
    return [
      '"ai agent" OR "ai-agent" OR "autonomous agent" stars:>10',
      '"chatbot" OR "chat bot" OR "ai bot" stars:>10',
      '"llm agent" OR "gpt agent" OR "ai assistant" stars:>10',
      '"virtual assistant" OR "conversational ai" stars:>10',
      '"langchain" OR "autogen" OR "crewai" stars:>10',
      '"ai automation" OR "intelligent agent" stars:>10',
      'topic:chatbot OR topic:ai-agent OR topic:llm stars:>5',
      'topic:artificial-intelligence topic:agent stars:>5',
      'openai agent OR claude agent OR anthropic agent',
      'multi-agent OR agent-framework OR agent-platform stars:>5'
    ];
  }

  // 同步单个查询的结果
  private async syncSearchQuery(query: string): Promise<number> {
    let totalSynced = 0;
    let hasNextPage = true;
    let after: string | undefined;

    console.log(`Starting AI Agent sync for query: ${query}`);

    while (hasNextPage) {
      try {
        const result = await this.githubClient.searchMcpRepositories(query, 50, after);
        
        for (const repo of result.search.nodes) {
          try {
            const aiAgent = await this.convertToAIAgent(repo);
            
            // 如果返回null，说明这个仓库不是真正的AI Agent项目，跳过
            if (!aiAgent) {
              continue;
            }
            
            // 使用upsert避免重复 - 使用唯一的组合字段来避免重复
            const uniqueKey = `${aiAgent.creator}/${aiAgent.name}`;
            
            await prisma.aIAgent.upsert({
              where: { 
                id: uniqueKey, // 使用creator/name作为唯一标识
              },
              update: {
                description: aiAgent.description,
                category: aiAgent.category,
                website: aiAgent.website,
                users: aiAgent.users,
                rating: aiAgent.rating,
                featured: aiAgent.featured,
                capabilities: aiAgent.capabilities,
                tags: aiAgent.tags,
                verified: aiAgent.verified,
                pricing: aiAgent.pricing,
                popularityScore: aiAgent.popularityScore,
                lastUpdated: aiAgent.lastUpdated,
                syncedAt: new Date(),
              },
              create: {
                ...aiAgent,
                id: uniqueKey, // 设置唯一ID
              },
            });
            
            totalSynced++;
            console.log(`✓ Synced: ${aiAgent.name} by ${aiAgent.creator} (score: ${aiAgent.popularityScore.toFixed(1)})`);
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
        console.error(`Error in AI Agent search query "${query}":`, error);
        break;
      }
    }

    console.log(`Completed AI Agent sync for query: ${query}, synced: ${totalSynced} repositories`);
    return totalSynced;
  }

  // 执行完整的AI Agent数据同步
  async syncAll(): Promise<{ totalSynced: number; queries: number }> {
    console.log('Starting AI Agent data synchronization...');
    
    const queries = AIAgentDataSync.buildAIAgentSearchQueries();
    let totalSynced = 0;

    for (const query of queries) {
      const synced = await this.syncSearchQuery(query);
      totalSynced += synced;
    }

    console.log(`AI Agent sync completed. Total repositories synced: ${totalSynced}`);
    
    return {
      totalSynced,
      queries: queries.length
    };
  }

  // 获取同步统计信息
  async getSyncStats() {
    const total = await prisma.aIAgent.count();
    const byCategory = await prisma.aIAgent.groupBy({
      by: ['category'],
      _count: { category: true },
      orderBy: { _count: { category: 'desc' } }
    });
    
    const topAgents = await prisma.aIAgent.findMany({
      take: 10,
      orderBy: { popularityScore: 'desc' },
      select: {
        name: true,
        creator: true,
        users: true,
        popularityScore: true,
        category: true,
        rating: true,
      }
    });

    return {
      total,
      byCategory,
      topAgents,
      lastSync: await prisma.aIAgent.findFirst({
        orderBy: { syncedAt: 'desc' },
        select: { syncedAt: true }
      })
    };
  }
}

export { AIAgentDataSync };