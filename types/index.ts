export type Platform = 'tg' | 'inst' | 'vk' | 'shorts' | 'threads' | 'vc' | 'dzen'
export type PostStatus = 'idea' | 'draft' | 'ready' | 'scheduled' | 'published' | 'archive'
export type ContentPillar = 'expertise' | 'numbers' | 'bts' | 'personal'
export type TaskTag = 'urgent' | 'important' | 'idea' | ''
export type MediaFolder = 'posts-tg' | 'posts-inst' | 'templates' | 'branding' | 'drafts' | 'archive'

export interface Post {
  id: string
  title: string
  content: string
  status: PostStatus
  platform: Platform
  pillar: ContentPillar
  hashtags: string
  scheduledAt: string | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  userId: string
  versions?: PostVersion[]
  mediaFiles?: PostMedia[]
}

export interface PostVersion {
  id: string
  content: string
  createdAt: string
  postId: string
}

export interface PostMedia {
  id: string
  postId: string
  mediaFileId: string
  mediaFile?: MediaFile
}

export interface MediaFile {
  id: string
  name: string
  url: string
  type: string
  size: number
  folder: MediaFolder
  tags: string
  createdAt: string
  userId: string
}

export interface Task {
  id: string
  title: string
  done: boolean
  tag: TaskTag
  deadline: string | null
  createdAt: string
  userId: string
  postId?: string | null
  post?: Post
}

export interface Analytics {
  id: string
  platform: Platform
  date: string
  subscribers: number
  reach: number
  likes: number
  posts: number
  createdAt: string
  userId: string
}

export interface AiChat {
  id: string
  title: string
  createdAt: string
  userId: string
  messages?: AiMessage[]
}

export interface AiMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
  chatId: string
}

export interface Template {
  id: string
  title: string
  description: string
  content: string
  platform: Platform
  type: string
  isDefault: boolean
  createdAt: string
  userId?: string | null
}

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

export const PLATFORM_CONFIG: Record<Platform, { label: string; color: string; maxChars: number; icon: string }> = {
  tg: { label: 'Telegram', color: '#2AABEE', maxChars: 4096, icon: '✈️' },
  inst: { label: 'Instagram', color: '#E1306C', maxChars: 2200, icon: '📸' },
  vk: { label: 'ВКонтакте', color: '#4680C2', maxChars: 16000, icon: '🔵' },
  shorts: { label: 'YouTube Shorts', color: '#FF0000', maxChars: 500, icon: '🎬' },
  threads: { label: 'Threads', color: '#000000', maxChars: 500, icon: '🧵' },
  vc: { label: 'VC.ru', color: '#FF6B2B', maxChars: 50000, icon: '📰' },
  dzen: { label: 'Яндекс Дзен', color: '#FF6B00', maxChars: 50000, icon: '📖' },
}

export const STATUS_CONFIG: Record<PostStatus, { label: string; color: string }> = {
  idea: { label: 'Идея', color: 'bg-purple-500/20 text-purple-400' },
  draft: { label: 'Черновик', color: 'bg-yellow-500/20 text-yellow-400' },
  ready: { label: 'Готов', color: 'bg-green-500/20 text-green-400' },
  scheduled: { label: 'Запланирован', color: 'bg-blue-500/20 text-blue-400' },
  published: { label: 'Опубликован', color: 'bg-emerald-500/20 text-emerald-400' },
  archive: { label: 'Архив', color: 'bg-gray-500/20 text-gray-400' },
}

export const PILLAR_CONFIG: Record<ContentPillar, { label: string; color: string }> = {
  expertise: { label: 'Экспертиза', color: 'bg-blue-500/20 text-blue-400' },
  numbers: { label: 'Цифры', color: 'bg-yellow-500/20 text-yellow-400' },
  bts: { label: 'BTS', color: 'bg-pink-500/20 text-pink-400' },
  personal: { label: 'Личность', color: 'bg-purple-500/20 text-purple-400' },
}
