"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import { TextStyle } from "@tiptap/extension-text-style"
import { Extension } from "@tiptap/core"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
  Link as LinkIcon, AlignLeft, AlignCenter, AlignRight,
  ImagePlus, X, Send, FileText,
} from "lucide-react"
import { format } from "date-fns"
import TitlePage from "@/components/titlePage"

// ── Must be outside component ──
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType
      unsetFontSize: () => ReturnType
    }
  }
}

const FontSize = Extension.create({
  name: "fontSize",
  addOptions() {
    return { types: ["textStyle"] }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (el: HTMLElement) => el.style.fontSize || null,
            renderHTML: (attrs: Record<string, any>) => {
              if (!attrs.fontSize) return {}
              return { style: `font-size: ${attrs.fontSize}` }
            },
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setFontSize: (size: string) => ({ chain }: any) =>
        chain().setMark("textStyle", { fontSize: size }).run(),
      unsetFontSize: () => ({ chain }: any) =>
        chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run(),
    } as any
  },
})

// ── Constants ──
import { CATEGORIES, AUDIENCE } from "@/lib/constants/others"

const FONT_SIZES = ["12px","14px","16px","18px","20px","24px","28px","32px"]

// ── Toolbar components (outside to avoid re-render) ──
function TB({
  onClick, active, children, title: tip,
}: {
  onClick: () => void
  active?: boolean
  children: React.ReactNode
  title?: string
}) {
  return (
    <button
      type="button"
      title={tip}
      onClick={onClick}
      className={`p-1.5 rounded transition-colors cursor-pointer ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      }`}
    >
      {children}
    </button>
  )
}

function TBSelect({
  onChange, children, className = "",
}: {
  onChange: (v: string) => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <select
      onChange={(e) => onChange(e.target.value)}
      className={`h-7 px-1.5 rounded border border-border bg-background text-xs text-foreground cursor-pointer outline-none hover:border-primary/50 transition-colors ${className}`}
    >
      {children}
    </select>
  )
}

// ── Component ──
export default function CreateAnnouncementPage() {
  const router   = useRouter()
  const userData = useSelector((state: any) => state.auth.user)

  const [title, setTitle]                   = useState("")
  const [category, setCategory]             = useState("")
  const [targetAudience, setTargetAudience] = useState("all")
  const [visibility, setVisibility]         = useState(true)
  const [startDate, setStartDate]           = useState("")
  const [endDate, setEndDate]               = useState("")
  const [coverImage, setCoverImage]         = useState<File | null>(null)
  const [coverPreview, setCoverPreview]     = useState<string | null>(null)
  const [loading, setLoading]               = useState(false)
  const [error, setError]                   = useState("")

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontSize,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Write your announcement message here..." }),
    ],
    editorProps: {
      attributes: {
        class: "min-h-[220px] px-4 py-3 text-sm outline-none prose prose-sm max-w-none",
      },
    },
  })

  const handleCoverImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverImage(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  const removeCoverImage = () => {
    setCoverImage(null)
    setCoverPreview(null)
  }

  const handleSubmit = async (status: "draft" | "published") => {
    if (!title.trim()) return setError("Announcement title is required.")
    if (!editor?.getText().trim()) return setError("Announcement content is required.")

    setLoading(true)
    setError("")

    try {
      const supabase = createClient()
      let coverUrl = null

      if (coverImage) {
        const ext = coverImage.name.split(".").pop()
        const fileName = `covers/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from("announcements_images")
          .upload(fileName, coverImage, { upsert: true })
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from("announcements_images").getPublicUrl(fileName)
        coverUrl = urlData.publicUrl
      }

      const { error: insertError } = await supabase.from("announcements").insert({
        title:           title.trim(),
        content:         editor?.getHTML(),
        category,
        target_audience: targetAudience,
        visibility,
        start_date:      startDate ? new Date(startDate).toISOString() : null,
        end_date:        endDate   ? new Date(endDate).toISOString()   : null,
        cover_image:     coverUrl,
        status,
        created_by:      userData?.id ?? null,
        published_at:    status === "published" ? new Date().toISOString() : null,
      })

      if (insertError) throw insertError
      router.push("/dashboard/announcement")

    } catch (err: any) {
      setError(err.message ?? "Failed to save announcement.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 mt-6 max-w-5xl">

      <TitlePage
        title="Create New Announcement"
        description="Draft and schedule public notices for the Cordon community."
        hasBackButton
      />

      {/* Action buttons */}
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/announcement")}>
          Cancel
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={loading}
          onClick={() => handleSubmit("draft")}
        >
          <FileText size={14} />
          Save as Draft
        </Button>
        <Button
          size="sm"
          className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
          disabled={loading}
          onClick={() => handleSubmit("published")}
        >
          {loading
            ? <span className="size-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            : <Send size={14} />
          }
          Publish Announcement
        </Button>
      </div>

      {error && (
        <p className="mb-4 text-xs text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      <div className="grid grid-cols-3 gap-5">

        {/* ── Left ── */}
        <div className="col-span-2 space-y-4">

          <div className="bg-card border border-border rounded-xl p-5 space-y-4">

            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Announcement Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Annual Municipal Town Hall Meeting 2026"
                className="text-sm"
              />
            </div>

            {/* Editor */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Detailed Content</Label>
              <div className="border border-border rounded-lg overflow-hidden">

                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-border bg-muted">

                  <TBSelect onChange={(val) => {
                    if (val === "p") editor?.chain().focus().setParagraph().run()
                    else editor?.chain().focus().toggleHeading({ level: Number(val) as 1 | 2 | 3 }).run()
                  }} className="w-28">
                    <option value="p">Paragraph</option>
                    <option value="1">Heading 1</option>
                    <option value="2">Heading 2</option>
                    <option value="3">Heading 3</option>
                  </TBSelect>

                  <div className="w-px h-5 bg-border mx-1" />

                  <TBSelect onChange={(val) => {
                    if (val === "default") editor?.chain().focus().unsetFontSize().run()
                    else editor?.chain().focus().setFontSize(val).run()
                  }} className="w-16">
                    <option value="default">Size</option>
                    {FONT_SIZES.map((s) => (
                      <option key={s} value={s}>{s.replace("px", "")}</option>
                    ))}
                  </TBSelect>

                  <div className="w-px h-5 bg-border mx-1" />

                  <TB onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive("bold")} title="Bold">
                    <Bold size={14} />
                  </TB>
                  <TB onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive("italic")} title="Italic">
                    <Italic size={14} />
                  </TB>
                  <TB onClick={() => editor?.chain().focus().toggleUnderline().run()} active={editor?.isActive("underline")} title="Underline">
                    <UnderlineIcon size={14} />
                  </TB>

                  <div className="w-px h-5 bg-border mx-1" />

                  <TB onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive("bulletList")} title="Bullet list">
                    <List size={14} />
                  </TB>
                  <TB onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive("orderedList")} title="Numbered list">
                    <ListOrdered size={14} />
                  </TB>

                  <div className="w-px h-5 bg-border mx-1" />

                  <TB onClick={() => editor?.chain().focus().setTextAlign("left").run()} active={editor?.isActive({ textAlign: "left" })} title="Align left">
                    <AlignLeft size={14} />
                  </TB>
                  <TB onClick={() => editor?.chain().focus().setTextAlign("center").run()} active={editor?.isActive({ textAlign: "center" })} title="Align center">
                    <AlignCenter size={14} />
                  </TB>
                  <TB onClick={() => editor?.chain().focus().setTextAlign("right").run()} active={editor?.isActive({ textAlign: "right" })} title="Align right">
                    <AlignRight size={14} />
                  </TB>

                  <div className="w-px h-5 bg-border mx-1" />

                  <TB
                    title="Add link"
                    active={editor?.isActive("link")}
                    onClick={() => {
                      const url = window.prompt("Enter URL:")
                      if (url) editor?.chain().focus().setLink({ href: url }).run()
                      else editor?.chain().focus().unsetLink().run()
                    }}
                  >
                    <LinkIcon size={14} />
                  </TB>

                </div>

                <EditorContent editor={editor} />
              </div>
            </div>
          </div>

          {/* Cover image */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-xs font-medium">Cover Image</Label>
              <span className="text-[11px] text-muted-foreground">Max 10MB</span>
            </div>

            {coverPreview ? (
              <div className="relative rounded-lg overflow-hidden border border-border">
                <img src={coverPreview} alt="Cover" className="w-full h-48 object-cover" />
                <button
                  type="button"
                  onClick={removeCoverImage}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors cursor-pointer"
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/40 hover:bg-muted/50 transition-colors">
                <ImagePlus size={22} className="text-muted-foreground mb-2" />
                <span className="text-xs text-muted-foreground">Click to upload cover image</span>
                <span className="text-[11px] text-muted-foreground mt-0.5">PNG, JPG, WEBP</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleCoverImage} />
              </label>
            )}
          </div>

        </div>

        {/* ── Right ── */}
        <div className="col-span-1 space-y-4">

          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold">Display Settings</h2>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium">Visibility Status</p>
                <p className="text-[11px] text-muted-foreground">
                  {visibility ? "Currently Visible" : "Currently Hidden"}
                </p>
              </div>
              <Switch checked={visibility} onCheckedChange={setVisibility} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Start Date & Time</Label>
              <Input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-9 text-sm" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">End Date & Time</Label>
              <Input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-9 text-sm" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Target Audience</Label>
              <div className="flex flex-wrap gap-2">
                {AUDIENCE.map((a) => (
                  <button
                    key={a.value}
                    type="button"
                    onClick={() => setTargetAudience(a.value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                      targetAudience === a.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:border-primary/40"
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-sm font-semibold mb-3">Audit Log</h2>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium">Draft initialized</p>
                <p className="text-[11px] text-muted-foreground">
                  {format(new Date(), "MMM d, hh:mm aa")} by {userData?.name ?? "Admin"}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}