import type { GroupBuyCardProps } from "../components/GroupBuyCard";

function getFirstImage(post: Record<string, unknown>): string {
  const images = post.images as unknown;
  const firstImage = Array.isArray(images) ? images[0] : undefined;
  return (
    (typeof firstImage === "string" ? firstImage : undefined) ||
    (firstImage as { imageUrl?: string })?.imageUrl ||
    (firstImage as { url?: string })?.url ||
    (post.image as string) ||
    "/placeholder.png"
  );
}

function mapStatus(raw: string | undefined): GroupBuyCardProps["status"] {
  if (!raw) return "recruiting";
  const recruiting = ["open", "recruiting", "RECRUITING", "AVAILABLE"];
  if (recruiting.includes(raw)) return "recruiting";
  if (raw === "closed" || raw === "RECRUIT_FULL" || raw === "SOLD_OUT") return "closed";
  if (raw === "completed" || raw === "COMPLETED") return "completed";
  if (raw === "in_progress" || raw === "PURCHASING" || raw === "DISTRIBUTING") return "in_progress";
  return "open";
}

/** API post 객체 → GroupBuyCard props */
export function mapApiPostToGroupBuyCard(post: Record<string, unknown>, onClick?: () => void): GroupBuyCardProps {
  return {
    id: String(post.id ?? ""),
    title: String(post.title ?? ""),
    price: `${Math.floor(Number(post.price ?? 0)).toLocaleString()}원`,
    image: getFirstImage(post),
    currentPeople: Number(post.currentQuantity ?? 0),
    maxPeople: Number(post.minParticipants ?? 2),
    location: String(post.pickupLocation ?? "명지대 캠퍼스"),
    status: mapStatus(post.status as string | undefined),
    onClick,
    groupBuyType: (post.type as GroupBuyCardProps["groupBuyType"]) ?? null,
    deadline: (post.deadline as string) ?? null,
    deadlineLabel: (post.deadlineLabel as string) ?? null,
    visualType: (post.visualType as GroupBuyCardProps["visualType"]) ?? "default",
    tags: post.tags as string[] | undefined,
    remainingQuantity: post.remainingQuantity != null ? Number(post.remainingQuantity) : null,
    isReceiptVerified: post.isReceiptVerified as boolean | null | undefined,
    isFavorite: post.isFavorite as boolean | null | undefined,
  };
}
