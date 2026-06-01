'use client'
import { useState, useRef, useCallback } from 'react'
import { Upload, Search, FolderOpen, Trash2, Tag, X, Image as ImageIcon, Video, File } from 'lucide-react'
import { MediaFile, MediaFolder } from '@/types'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { formatFileSize, formatDate } from '@/lib/utils'

const FOLDERS: { value: MediaFolder | ''; label: string }[] = [
  { value: '', label: 'Все файлы' },
  { value: 'posts-tg', label: 'Посты TG' },
  { value: 'posts-inst', label: 'Посты INST' },
  { value: 'templates', label: 'Шаблоны' },
  { value: 'branding', label: 'Брендинг' },
  { value: 'drafts', label: 'Черновики' },
  { value: 'archive', label: 'Архив' },
]

export function MediaClient({ initialFiles }: { initialFiles: MediaFile[] }) {
  const { toast } = useToast()
  const [files, setFiles] = useState(initialFiles)
  const [folder, setFolder] = useState<MediaFolder | ''>('')
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const [selected, setSelected] = useState<MediaFile | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filtered = files.filter(f => {
    if (folder && f.folder !== folder) return false
    if (search && !f.name.toLowerCase().includes(search.toLowerCase()) && !f.tags.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleUpload = useCallback(async (uploadFiles: FileList | null) => {
    if (!uploadFiles) return
    setUploading(true)
    for (const file of Array.from(uploadFiles)) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder || 'drafts')
      const res = await fetch('/api/media', { method: 'POST', body: formData })
      if (res.ok) {
        const created = await res.json()
        setFiles(prev => [created, ...prev])
      }
    }
    setUploading(false)
    toast('Файлы загружены')
  }, [folder, toast])

  async function deleteFile(id: string) {
    await fetch(`/api/media/${id}`, { method: 'DELETE' })
    setFiles(prev => prev.filter(f => f.id !== id))
    if (selected?.id === id) setSelected(null)
    toast('Файл удалён')
  }

  function FileIcon({ type }: { type: string }) {
    if (type === 'video') return <Video size={24} className="text-white/40" />
    if (type === 'image') return <ImageIcon size={24} className="text-white/40" />
    return <File size={24} className="text-white/40" />
  }

  const totalSize = files.reduce((s, f) => s + f.size, 0)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Медиатека</h1>
          <p className="text-white/40 text-sm mt-1">{files.length} файлов · {formatFileSize(totalSize)} из 5 ГБ</p>
        </div>
        <div>
          <input ref={fileInputRef} type="file" multiple accept="image/*,video/mp4,.gif" className="hidden" onChange={e => handleUpload(e.target.files)} />
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            <Upload size={15} />
            {uploading ? 'Загружаю...' : 'Загрузить'}
          </Button>
        </div>
      </div>

      {/* Storage bar */}
      <div className="bg-white/5 border border-white/5 rounded-2xl p-4 mb-6">
        <div className="flex justify-between text-xs text-white/40 mb-2">
          <span>Использовано: {formatFileSize(totalSize)}</span>
          <span>5 ГБ</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-[#2B5CE6] rounded-full" style={{ width: `${Math.min((totalSize / (5 * 1024 * 1024 * 1024)) * 100, 100)}%` }} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по имени и тегам..." className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#2B5CE6]/50 transition-colors" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {FOLDERS.map(f => (
            <button key={f.value} onClick={() => setFolder(f.value as MediaFolder | '')}
              className={`px-3 py-2 rounded-xl text-sm transition-colors ${folder === f.value ? 'bg-[#2B5CE6]/20 text-[#5B8AF8]' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Grid */}
        <div className="flex-1">
          {filtered.length === 0 ? (
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); handleUpload(e.dataTransfer.files) }}
              className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-white/10 rounded-2xl text-white/25 hover:border-white/20 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={32} className="mb-2" />
              <p>Перетащите файлы или нажмите для загрузки</p>
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-3">
              {filtered.map(file => (
                <div
                  key={file.id}
                  onClick={() => setSelected(file)}
                  className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border transition-all ${selected?.id === file.id ? 'border-[#2B5CE6] shadow-lg shadow-blue-500/20' : 'border-white/5 hover:border-white/20'}`}
                >
                  {file.type === 'image' ? (
                    <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex flex-col items-center justify-center">
                      <FileIcon type={file.type} />
                      <span className="text-xs text-white/30 mt-1 px-2 truncate w-full text-center">{file.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-64 bg-white/5 border border-white/5 rounded-2xl p-4 flex-shrink-0">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm font-medium text-white/80 truncate flex-1">{selected.name}</h3>
              <button onClick={() => setSelected(null)} className="text-white/30 hover:text-white ml-2"><X size={14} /></button>
            </div>
            {selected.type === 'image' && (
              <img src={selected.url} alt={selected.name} className="w-full rounded-xl mb-3 aspect-square object-cover" />
            )}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-white/40">Тип</span><span className="text-white/70 capitalize">{selected.type}</span></div>
              <div className="flex justify-between"><span className="text-white/40">Размер</span><span className="text-white/70">{formatFileSize(selected.size)}</span></div>
              <div className="flex justify-between"><span className="text-white/40">Папка</span><span className="text-white/70">{selected.folder}</span></div>
              <div className="flex justify-between"><span className="text-white/40">Дата</span><span className="text-white/70">{formatDate(selected.createdAt)}</span></div>
            </div>
            {selected.tags && (
              <div className="mt-3 flex flex-wrap gap-1">
                {selected.tags.split(',').filter(Boolean).map(tag => (
                  <Badge key={tag} className="bg-white/10 text-white/50 text-xs">{tag.trim()}</Badge>
                ))}
              </div>
            )}
            <button onClick={() => deleteFile(selected.id)} className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm">
              <Trash2 size={14} />Удалить
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
