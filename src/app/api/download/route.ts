import { NextRequest, NextResponse } from 'next/server'

const GITHUB_OWNER = 'quantumiodb'
const GITHUB_REPO = 'ccode'
const GITHUB_API = 'https://api.github.com'

interface GitHubAsset {
  name: string
  browser_download_url: string
  url: string
  size: number
  content_type: string
}

interface GitHubRelease {
  tag_name: string
  name: string
  assets: GitHubAsset[]
  published_at: string
}

function getGitHubToken(): string {
  const token = process.env.GITHUB_TOKEN
  if (!token) throw new Error('GITHUB_TOKEN not configured')
  return token
}

async function githubFetch(url: string): Promise<Response> {
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${getGitHubToken()}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    next: { revalidate: 300 }, // cache 5 minutes
  })
}

function matchAsset(assets: GitHubAsset[], platform: string, arch: string): GitHubAsset | undefined {
  const p = platform.toLowerCase()
  const a = arch.toLowerCase()

  // Normalize arch names
  const archAliases: Record<string, string[]> = {
    x64: ['x64', 'x86_64', 'amd64'],
    arm64: ['arm64', 'aarch64'],
  }
  const archNames = archAliases[a] || [a]

  return assets.find((asset) => {
    const name = asset.name.toLowerCase()
    // Skip checksums and signatures
    if (name.endsWith('.sha256') || name.endsWith('.sig') || name.endsWith('.md')) return false
    const matchesPlatform = name.includes(p)
    const matchesArch = archNames.some((alias) => name.includes(alias))
    return matchesPlatform && matchesArch
  })
}

// GET /api/download?version=latest&platform=darwin&arch=arm64
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const version = searchParams.get('version') || 'latest'
  const platform = searchParams.get('platform')
  const arch = searchParams.get('arch')

  // List releases mode: no platform/arch specified
  if (!platform && !arch) {
    return handleListReleases(version)
  }

  if (!platform || !arch) {
    return NextResponse.json(
      { error: 'Missing required params: platform, arch' },
      { status: 400 }
    )
  }

  try {
    // Fetch release info
    const releaseUrl =
      version === 'latest'
        ? `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`
        : `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/tags/${version}`

    const releaseRes = await githubFetch(releaseUrl)
    if (!releaseRes.ok) {
      if (releaseRes.status === 404) {
        return NextResponse.json({ error: `Release ${version} not found` }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch release' }, { status: 502 })
    }

    const release: GitHubRelease = await releaseRes.json()
    const asset = matchAsset(release.assets, platform, arch)

    if (!asset) {
      return NextResponse.json(
        {
          error: `No asset found for ${platform}/${arch}`,
          available: release.assets.map((a) => a.name),
        },
        { status: 404 }
      )
    }

    // Download the asset via GitHub API (private repo needs token)
    const assetRes = await fetch(asset.url, {
      headers: {
        Authorization: `Bearer ${getGitHubToken()}`,
        Accept: 'application/octet-stream',
      },
      redirect: 'follow',
    })

    if (!assetRes.ok || !assetRes.body) {
      return NextResponse.json({ error: 'Failed to download asset' }, { status: 502 })
    }

    // Stream the binary to the client
    return new NextResponse(assetRes.body, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${asset.name}"`,
        'Content-Length': String(asset.size),
        'X-Release-Version': release.tag_name,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

async function handleListReleases(version: string) {
  try {
    let releases: GitHubRelease[]

    if (version === 'latest') {
      const res = await githubFetch(
        `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases?per_page=10`
      )
      if (!res.ok) {
        return NextResponse.json({ error: 'Failed to fetch releases' }, { status: 502 })
      }
      releases = await res.json()
    } else {
      const res = await githubFetch(
        `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/tags/${version}`
      )
      if (!res.ok) {
        return NextResponse.json({ error: `Release ${version} not found` }, { status: 404 })
      }
      releases = [await res.json()]
    }

    return NextResponse.json({
      releases: releases.map((r) => ({
        version: r.tag_name,
        name: r.name,
        published_at: r.published_at,
        assets: r.assets.map((a) => ({
          name: a.name,
          size: a.size,
          download_url: `/api/download?version=${r.tag_name}&platform=PLATFORM&arch=ARCH`,
        })),
      })),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
