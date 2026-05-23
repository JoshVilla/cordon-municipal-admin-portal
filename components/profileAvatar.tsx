import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

type ProfileAvatarProps = {
  name?: string
  imageUrl?: string | null
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizeClasses = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-lg",
  xl: "size-20 text-2xl",
}

function getInitials(name?: string) {
  if (!name) return "?"
  return name
    .trim()
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function ProfileAvatar({
  name,
  imageUrl,
  size = "md",
  className,
}: ProfileAvatarProps) {
  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src={imageUrl ?? undefined} alt={name ?? "User"} />
      <AvatarFallback
        className="bg-primary text-primary-foreground font-semibold"
      >
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  )
}